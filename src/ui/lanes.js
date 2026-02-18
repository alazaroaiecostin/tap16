import { song, createLane } from "../state/song.js";
import { renderGrid } from "./grid.js";

export function bindLanesUI() {
  const lanesEl = document.getElementById("lanes");
  const addBtn = document.getElementById("addLane");

  if (!lanesEl || !addBtn) return;

  addBtn.onclick = () => {
    const pattern = song.patterns[song.current];
    const name = "Lane " + (Object.keys(pattern.lanes).length + 1);
    pattern.lanes[name] = createLane(name, pattern.steps);
    renderGrid();
  };
}
