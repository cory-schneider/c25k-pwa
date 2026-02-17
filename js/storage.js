// localStorage abstraction for workout progress.

const STORAGE_KEY = "c25k_progress";

const defaults = {
  lastCompletedIndex: -1,
  completedWorkouts: [],
  lastActiveDate: null,
};

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...defaults, ...JSON.parse(raw) };
    }
  } catch {
    // Corrupted data — start fresh
  }
  return { ...defaults };
}

export function save(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markComplete(workoutIndex) {
  const progress = load();
  if (!progress.completedWorkouts.includes(workoutIndex)) {
    progress.completedWorkouts.push(workoutIndex);
  }
  progress.lastCompletedIndex = workoutIndex;
  progress.lastActiveDate = new Date().toISOString().slice(0, 10);
  save(progress);
  return progress;
}

export function reset() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getNextWorkoutIndex(totalWorkouts) {
  const progress = load();
  // Find first uncompleted workout
  for (let i = 0; i < totalWorkouts; i++) {
    if (!progress.completedWorkouts.includes(i)) {
      return i;
    }
  }
  return totalWorkouts - 1; // All done, show last
}
