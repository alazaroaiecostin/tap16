import * as Tone from "tone";
import { song } from "../state/song.js";
import { renderGrid } from "../ui/grid.js";
import { startTransport, stopTransport } from "./scheduler.js";

let isPlaying = false;
let stepIndex = 0;
let loopId = null;

export async function startTransport() {
  await Tone.start(); // unlock AudioContext (must be after user gesture)
  Tone.Transport.bpm.value = song.patterns[song.current].bpm;

  if (loopId) return;

  const pattern = song.patterns[song.current];
  const interval = Tone.Time(pattern.resolution).toSeconds();

  loopId = Tone.Transport.scheduleRepeat((time) => {
    stepIndex = (stepIndex + 1) % pattern.steps;
    renderGrid(stepIndex);
  }, interval);

  Tone.Transport.start();
  isPlaying = true;
}

export function stopTransport() {
  if (loopId) {
    Tone.Transport.clear(loopId);
    loopId = null;
  }

  Tone.Transport.stop();
  stepIndex = 0;
  isPlaying = false;
  renderGrid(-1);
}

export function toggleTransport() {
  if (isPlaying) stopTransport();
  else startTransport();
}
