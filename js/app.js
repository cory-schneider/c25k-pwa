import { program } from "./program.js";
import { unlock, speak, startKeepAlive, stopKeepAlive } from "./tts.js";
import * as storage from "./storage.js";

// --- State ---
let currentWorkoutIndex = 0;
let currentIntervalIndex = 0;
let timerState = "stopped"; // stopped | running | paused
let worker = null;
let currentScreen = "home"; // home | workout | complete

// --- DOM refs (set in init) ---
const $ = (id) => document.getElementById(id);

// --- Formatting ---
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function totalWorkoutDuration(workout) {
  return workout.intervals.reduce((sum, iv) => sum + iv.duration, 0);
}

function elapsedBeforeInterval(workout, intervalIndex) {
  let sum = 0;
  for (let i = 0; i < intervalIndex; i++) {
    sum += workout.intervals[i].duration;
  }
  return sum;
}

// --- Screen management ---
function showScreen(name) {
  currentScreen = name;
  document.querySelectorAll(".screen").forEach((el) => {
    el.classList.toggle("active", el.id === `screen-${name}`);
  });
  // Show back button only on workout/complete screens
  const homeBtn = $("btn-home");
  if (homeBtn) {
    homeBtn.style.display = (name === "workout" || name === "complete") ? "flex" : "none";
  }
}

// --- Home screen ---
function renderHome() {
  const progress = storage.load();
  const nextIndex = storage.getNextWorkoutIndex(program.length);
  currentWorkoutIndex = nextIndex;

  const nextWorkout = program[nextIndex];
  $("home-current").textContent = nextWorkout.label;
  $("home-duration").textContent = formatTime(totalWorkoutDuration(nextWorkout));

  const list = $("workout-list");
  list.innerHTML = "";

  let expandedIndex = null;

  program.forEach((w, i) => {
    const li = document.createElement("li");
    const done = progress.completedWorkouts.includes(i);
    const isNext = i === nextIndex;

    li.className = "workout-item";
    if (done) li.classList.add("completed");
    if (isNext) li.classList.add("next");

    const header = document.createElement("div");
    header.className = "workout-item-header";
    header.innerHTML = `
      <span class="workout-label">${w.label}</span>
      <span class="workout-time">${formatTime(totalWorkoutDuration(w))}</span>
      ${done ? '<span class="checkmark">\u2713</span>' : ""}
    `;

    const detail = document.createElement("div");
    detail.className = "workout-detail";

    const intervalList = document.createElement("ul");
    intervalList.className = "interval-list";
    w.intervals.forEach((iv) => {
      const row = document.createElement("li");
      row.className = `interval-row interval-row-${iv.type}`;
      row.innerHTML = `
        <span class="interval-row-type">${iv.type.toUpperCase()}</span>
        <span class="interval-row-time">${formatTime(iv.duration)}</span>
      `;
      intervalList.appendChild(row);
    });
    detail.appendChild(intervalList);

    const goBtn = document.createElement("button");
    goBtn.className = "btn-primary btn-go";
    goBtn.textContent = "Go";
    goBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentWorkoutIndex = i;
      startWorkout();
    });
    detail.appendChild(goBtn);

    li.appendChild(header);
    li.appendChild(detail);

    header.addEventListener("click", () => {
      const isExpanded = li.classList.contains("expanded");
      // Collapse previously expanded item
      if (expandedIndex !== null) {
        const prev = list.children[expandedIndex];
        if (prev) prev.classList.remove("expanded");
      }
      if (isExpanded) {
        expandedIndex = null;
      } else {
        li.classList.add("expanded");
        expandedIndex = i;
      }
    });

    list.appendChild(li);
  });

  // Last active date
  const lastDate = progress.lastActiveDate;
  $("last-active").textContent = lastDate
    ? `Last run: ${lastDate}`
    : "No workouts yet";

  showScreen("home");
}

// --- Workout screen ---
function startWorkout() {
  currentIntervalIndex = 0;
  timerState = "stopped";

  const workout = program[currentWorkoutIndex];
  $("workout-title").textContent = workout.label;

  // Unlock audio on user gesture and start iOS keepalive
  unlock();
  startKeepAlive();

  // Init worker
  if (worker) worker.terminate();
  worker = new Worker("js/timer-worker.js");
  worker.onmessage = onWorkerMessage;

  updateWorkoutDisplay(0);
  showScreen("workout");

  // Start the timer
  worker.postMessage({ command: "start" });
  timerState = "running";
  $("btn-pause").textContent = "Pause";

  // Speak first cue
  speak("Workout starting. " + workout.intervals[0].cue);
}

function onWorkerMessage(e) {
  const { type, elapsed, state } = e.data;

  if (type === "tick") {
    const workout = program[currentWorkoutIndex];
    const elapsedSec = elapsed / 1000;

    // Determine which interval we're in
    let accumulated = 0;
    let newIntervalIndex = 0;
    for (let i = 0; i < workout.intervals.length; i++) {
      accumulated += workout.intervals[i].duration;
      if (elapsedSec < accumulated) {
        newIntervalIndex = i;
        break;
      }
      if (i === workout.intervals.length - 1) {
        // Past last interval — workout complete
        workoutComplete();
        return;
      }
    }

    // Interval transition
    if (newIntervalIndex !== currentIntervalIndex) {
      currentIntervalIndex = newIntervalIndex;
      const interval = workout.intervals[currentIntervalIndex];

      // Special cue for last run
      const isLastRun =
        interval.type === "run" &&
        !workout.intervals
          .slice(currentIntervalIndex + 1)
          .some((iv) => iv.type === "run");

      if (isLastRun) {
        speak("Last run. Finish strong.");
      } else {
        speak(interval.cue);
      }
    }

    // Update display
    const intervalStart = elapsedBeforeInterval(workout, currentIntervalIndex);
    const intervalDuration = workout.intervals[currentIntervalIndex].duration;
    const intervalElapsed = elapsedSec - intervalStart;
    const remaining = Math.max(0, intervalDuration - intervalElapsed);

    updateWorkoutDisplay(elapsedSec, remaining);
  }

  if (type === "state") {
    timerState = state;
  }
}

function updateWorkoutDisplay(totalElapsedSec, remainingSec) {
  const workout = program[currentWorkoutIndex];
  const interval = workout.intervals[currentIntervalIndex];
  const total = totalWorkoutDuration(workout);

  // Interval type label
  const typeLabel = $("interval-type");
  typeLabel.textContent = interval.type.toUpperCase();

  // Background color
  const workoutScreen = $("screen-workout");
  workoutScreen.className = `screen active interval-${interval.type}`;

  // Timer
  if (remainingSec !== undefined) {
    $("timer-display").textContent = formatTime(Math.ceil(remainingSec));
  } else {
    $("timer-display").textContent = formatTime(interval.duration);
  }

  // Progress bar
  const pct = Math.min(100, (totalElapsedSec / total) * 100);
  $("progress-fill").style.width = `${pct}%`;

  // Interval counter (exclude warmup/cooldown from count display)
  const activeIntervals = workout.intervals.filter(
    (iv) => iv.type === "run" || iv.type === "walk"
  );
  const activeIndex = activeIntervals.indexOf(interval);
  if (activeIndex >= 0) {
    $("interval-counter").textContent = `Interval ${activeIndex + 1} of ${activeIntervals.length}`;
  } else {
    $("interval-counter").textContent =
      interval.type === "warmup" ? "Warm-up" : "Cool-down";
  }

  // Total elapsed
  $("total-elapsed").textContent = formatTime(Math.floor(totalElapsedSec));
}

function workoutComplete() {
  if (worker) {
    worker.postMessage({ command: "reset" });
    worker.terminate();
    worker = null;
  }
  timerState = "stopped";
  stopKeepAlive();

  speak("Workout complete. Great job.");

  const workout = program[currentWorkoutIndex];
  const progress = storage.markComplete(currentWorkoutIndex);

  $("complete-title").textContent = workout.label;
  $("complete-time").textContent = formatTime(totalWorkoutDuration(workout));

  // Next workout preview
  const nextIndex = storage.getNextWorkoutIndex(program.length);
  const allDone = progress.completedWorkouts.length >= program.length;
  if (allDone) {
    $("next-preview").textContent = "You've completed the entire program!";
  } else {
    $("next-preview").textContent = `Next: ${program[nextIndex].label}`;
  }

  showScreen("complete");
}

// --- Controls ---
function togglePause() {
  if (timerState === "running") {
    worker.postMessage({ command: "pause" });
    $("btn-pause").textContent = "Resume";
  } else if (timerState === "paused") {
    worker.postMessage({ command: "resume" });
    $("btn-pause").textContent = "Pause";
  }
}

function stopWorkout() {
  if (!confirm("Stop this workout? Progress won't be saved.")) return;
  if (worker) {
    worker.postMessage({ command: "reset" });
    worker.terminate();
    worker = null;
  }
  timerState = "stopped";
  stopKeepAlive();
  renderHome();
}

function resetProgress() {
  if (!confirm("Reset all progress? This cannot be undone.")) return;
  storage.reset();
  renderHome();
}

// --- Safari detection ---
function isSafariIOS() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  return isIOS && isSafari;
}

// --- Install prompt ---
let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const banner = $("install-banner");
  if (banner) banner.classList.add("visible");
});

function installApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(() => {
      deferredInstallPrompt = null;
      const banner = $("install-banner");
      if (banner) banner.classList.remove("visible");
    });
  }
}

function dismissInstall() {
  const banner = $("install-banner");
  if (banner) banner.classList.remove("visible");
}

// --- Init ---
function init() {
  // Safari block
  if (isSafariIOS()) {
    showScreen("safari");
    return;
  }

  // Register service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js");
  }

  // Event listeners
  $("btn-start").addEventListener("click", startWorkout);
  $("btn-pause").addEventListener("click", togglePause);
  $("btn-stop").addEventListener("click", stopWorkout);
  $("btn-home").addEventListener("click", renderHome);
  $("btn-complete-home").addEventListener("click", renderHome);
  $("btn-reset").addEventListener("click", resetProgress);
  $("btn-install").addEventListener("click", installApp);
  $("btn-dismiss-install").addEventListener("click", dismissInstall);

  renderHome();
}

document.addEventListener("DOMContentLoaded", init);
