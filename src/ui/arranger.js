import { song, removeFromArrangement, moveInArrangement } from "../state/song.js";
import { renderGrid } from "./grid.js";

export function renderArranger(activeIndex = null) {
  const el = document.getElementById("arrangerTimeline");
  if (!el) return;

  el.innerHTML = "";

  song.arrangement.forEach((id, i) => {
    const block = document.createElement("div");
    block.className = "arranger-block";
    block.textContent = id;

    // active playhead highlight
    if (i === activeIndex) {
      block.classList.add("active");
    }

    // click = jump to pattern
    block.onclick = () => {
      song.current = id;
      renderArranger(i);
      renderGrid();
    };

    // right click = remove from song chain
    block.oncontextmenu = (e) => {
      e.preventDefault();
      removeFromArrangement(i);
      renderArranger();
      renderGrid();
    };

    el.appendChild(block);
  });
}
