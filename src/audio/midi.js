import { song } from "../state/song.js";
import { engine } from "./engine.js";
import { pushHistory } from "../state/history.js";
import { renderGrid } from "../ui/grid.js";

const noteToLane = {}; // map MIDI notes to lane ids

export function mapLaneToMidi(laneId, midiNote) {
  noteToLane[midiNote] = laneId;
}

export async function initMIDI() {
  if (!navigator.requestMIDIAccess) return;

  const access = await navigator.requestMIDIAccess();
  for (const input of access.inputs.values()) {
    input.onmidimessage = onMidiMessage;
  }
}

function onMidiMessage(e) {
  const [status, note, vel] = e.data;
  const isNoteOn = status === 144 && vel > 0;

  if (!isNoteOn) return;

  const pattern = song.patterns[song.current];
  const laneId = noteToLane[note];
  if (!laneId) return;

  engine.players[laneId]?.start();

  const step = window.__playheadStep ?? 0;
  const st = pattern.lanes[laneId].steps[step];
  st.on = true;
  st.vel = vel / 127;

  pushHistory();
  renderGrid();
}
