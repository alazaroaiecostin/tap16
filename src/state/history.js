import { song } from "./song.js";

const history = [];
let index = -1;
const MAX = 50;

export function pushHistory() {
  history.splice(index + 1);
  history.push(structuredClone(song));
  if (history.length > MAX) history.shift();
  index = history.length - 1;
}

export function undo() {
  if (index <= 0) return;
  index--;
  restore(history[index]);
}

export function redo() {
  if (index >= history.length - 1) return;
  index++;
  restore(history[index]);
}

export function canUndo() {
  return index > 0;
}

export function canRedo() {
  return index < history.length - 1;
}

function restore(snapshot) {
  Object.keys(song).forEach((k) => delete song[k]);
  Object.assign(song, structuredClone(snapshot));
}
