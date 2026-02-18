import * as Tone from "tone";
import { song } from "../state/song.js";
import { engine } from "./engine.js";
import { highlightStep } from "../ui/grid.js";

let step = 0;
let eventId = null;
let arrIndex = 0;

export function startTransport() {
  if (eventId) Tone.Transport.clear(eventId);

  const cur = song.patterns[song.current];
  Tone.Transport.bpm.value = Math.max(30, Math.min(300, cur.bpm));
  Tone.Transport.timeSignature = cur.timeSig;

  eventId = Tone.Transport.scheduleRepeat((time) => {
    const patternName = song.playMode === "song"
      ? song.arrangement[arrIndex]?.pattern || song.current
      : song.current;

    const pattern = song.patterns[patternName];

    // Apply per-pattern tempo & time sig when switching
    if (step === 0) {
      Tone.Transport.bpm.value = Math.max(30, Math.min(300, pattern.bpm));
      Tone.Transport.timeSignature = pattern.timeSig;
    }

    for (const id in pattern.lanes) {
      const lane = pattern.lanes[id];
      const st = lane.steps[step];
      if (st?.on && !lane.mute) {
        engine.players[id].volume.value = Tone.gainToDb((st.vel || 1) * 0.9);
        engine.players[id].start(time);
      }
    }

    highlightStep(step);

    step++;
    if (step >= pattern.steps) {
      step = 0;

      if (song.playMode === "song") {
        arrIndex = (arrIndex + 1) % song.arrangement.length;
      } else {
        arrIndex = 0;
      }
    }
  }, cur.resolution);

  Tone.Transport.start();
}

export function stopTransport() {
  Tone.Transport.stop();
  step = 0;
  arrIndex = 0;
}
