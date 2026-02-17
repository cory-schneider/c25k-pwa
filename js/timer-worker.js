// Timer Web Worker
// Runs on a separate thread to avoid main-thread throttling when backgrounded.
// Uses absolute timestamps to prevent drift.

let intervalId = null;
let startTime = 0;
let bankedTime = 0;

function tick() {
  const elapsed = Date.now() - startTime + bankedTime;
  self.postMessage({ type: "tick", elapsed });
}

self.onmessage = function (e) {
  const { command } = e.data;

  switch (command) {
    case "start":
      bankedTime = 0;
      startTime = Date.now();
      intervalId = setInterval(tick, 250);
      self.postMessage({ type: "state", state: "running" });
      tick();
      break;

    case "pause":
      if (intervalId !== null) {
        bankedTime += Date.now() - startTime;
        clearInterval(intervalId);
        intervalId = null;
        self.postMessage({ type: "state", state: "paused" });
      }
      break;

    case "resume":
      startTime = Date.now();
      intervalId = setInterval(tick, 250);
      self.postMessage({ type: "state", state: "running" });
      tick();
      break;

    case "reset":
      clearInterval(intervalId);
      intervalId = null;
      bankedTime = 0;
      startTime = 0;
      self.postMessage({ type: "state", state: "stopped" });
      break;
  }
};
