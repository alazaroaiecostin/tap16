import { song } from "../state/song.js";

export function renderGrid() {
  const gridEl = document.getElementById("grid");
  if (!gridEl) {
    console.warn("[grid] #grid element not found");
    return;
  }

  gridEl.innerHTML = "";

  const pattern = song.patterns[song.current];
  if (!pattern) {
    console.warn("[grid] no current pattern");
    return;
  }

  Object.values(song.lanes).forEach((lane) => {
    const row = document.createElement("div");
    row.className = "grid-row";

    const label = document.createElement("div");
    label.className = "lane-label";
    label.textContent = lane.name;
    row.appendChild(label);

    const steps = pattern.stepsByLane[lane.id];

    if (!steps) {
      console.warn("[grid] missing steps for lane", lane.id);
      return; // skip this lane, but don't break the grid
    }

    for (let i = 0; i < pattern.steps; i++) {
      const step = steps[i];

      const cell = document.createElement("div");
      cell.className = "cell" + (step?.on ? " on" : "");

      cell.onclick = () => {
        step.on = !step.on;
        renderGrid();
      };

      row.appendChild(cell);
    }

    gridEl.appendChild(row);
  });
}
