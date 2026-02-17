// TTS wrapper using speechSynthesis with Web Audio API beep fallback.
// Includes a silent oscillator keepalive for iOS background audio.

let audioCtx = null;
let ttsAvailable = "speechSynthesis" in window;
let keepAliveOsc = null;
let keepAliveGain = null;

const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export function unlock() {
  // Must be called from a user gesture to enable audio.
  if (ttsAvailable) {
    const utterance = new SpeechSynthesisUtterance("");
    utterance.volume = 0;
    speechSynthesis.speak(utterance);
  }
  // Init AudioContext (needed for beep fallback and iOS keepalive)
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

// Start a silent oscillator to keep the iOS audio pipeline alive
// while the screen is locked. Must be called from a user gesture context
// (after unlock() has already initialized the AudioContext).
export function startKeepAlive() {
  if (!isIOS || !audioCtx) return;
  stopKeepAlive();
  keepAliveOsc = audioCtx.createOscillator();
  keepAliveGain = audioCtx.createGain();
  keepAliveGain.gain.value = 0;
  keepAliveOsc.connect(keepAliveGain);
  keepAliveGain.connect(audioCtx.destination);
  keepAliveOsc.start();
}

// Stop the silent oscillator and close the AudioContext to save battery.
export function stopKeepAlive() {
  if (keepAliveOsc) {
    try { keepAliveOsc.stop(); } catch {}
    keepAliveOsc.disconnect();
    keepAliveOsc = null;
  }
  if (keepAliveGain) {
    keepAliveGain.disconnect();
    keepAliveGain = null;
  }
}

// Bump keepalive gain to near-silent if zero gain isn't enough.
// Call this if testing reveals TTS doesn't fire with gain=0.
export function setKeepAliveGain(value) {
  if (keepAliveGain) {
    keepAliveGain.gain.value = value;
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
