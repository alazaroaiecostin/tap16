import { song } from "../state/song.js";

export function renderGrid() {
  const gridEl = document.getElementById("grid");
  if (!gridEl) return;

  gridEl.innerHTML = "";

  const pattern = song.patterns[song.current];
  if (!pattern) return;

  Object.values(song.lanes).forEach((lane) => {
    const row = document.createElement("div");
    row.className = "grid-row";

    const label = document.createElement("div");
    label.className = "lane-label";
    label.textContent = lane.name;
    row.appendChild(label);

    const steps = pattern.stepsByLane[lane.id];
    if (!steps) return;

    steps.forEach((step) => {
      const cell = document.createElement("div");
      cell.className = "step" + (step.on ? " on" : "");

      const vel = document.createElement("div");
      vel.className = "velocity";
      vel.style.height = `${Math.floor(step.vel * 100)}%`;
      cell.appendChild(vel);

      cell.onclick = () => {
        step.on = !step.on;
        renderGrid();
      };

      let dragging = false;

      cell.onmousedown = (e) => {
        if (!step.on) return;
        dragging = true;
        updateVel(e);
      };

      window.onmouseup = () => (dragging = false);

      window.onmousemove = (e) => {
        if (dragging) updateVel(e);
      };

      function updateVel(e) {
        const rect = cell.getBoundingClientRect();
        const y = rect.bottom - e.clientY;
        step.vel = Math.min(1, Math.max(0.05, y / rect.height));
        vel.style.height = `${Math.floor(step.vel * 100)}%`;
      }

      row.appendChild(cell);
    });

    gridEl.appendChild(row);
  });
}
