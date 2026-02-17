// TTS wrapper using speechSynthesis with Web Audio API beep fallback.

let audioCtx = null;
let ttsAvailable = "speechSynthesis" in window;

export function unlock() {
  // Must be called from a user gesture to enable audio.
  if (ttsAvailable) {
    const utterance = new SpeechSynthesisUtterance("");
    utterance.volume = 0;
    speechSynthesis.speak(utterance);
  }
  // Also init AudioContext for beep fallback
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }
}

export function speak(text) {
  if (ttsAvailable) {
    // Cancel any queued speech to avoid pileup
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    speechSynthesis.speak(utterance);
  } else {
    beepFallback(text);
  }
}

function beepFallback(text) {
  if (!audioCtx) return;
  // Single beep for walk, double for run, triple for done
  let count = 1;
  if (text.toLowerCase().includes("run")) count = 2;
  if (
    text.toLowerCase().includes("complete") ||
    text.toLowerCase().includes("cool down")
  )
    count = 3;

  for (let i = 0; i < count; i++) {
    playBeep(audioCtx.currentTime + i * 0.3);
  }
}

function playBeep(time) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = 880;
  gain.gain.value = 0.3;
  osc.start(time);
  osc.stop(time + 0.15);
}
