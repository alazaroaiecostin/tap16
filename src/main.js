import "./styles.css";

import * as Tone from "tone";
import { Engine } from "./audio/engine.js";
import { renderGrid } from "./ui/gridRender.js";
import { renderArranger } from "./ui/arranger.js";

import {
  song,
  ensureFirstPattern,
  addPattern,
  createLane,
  duplicatePattern,
  addToArrangement
} from "./state/song.js";

import { stepsPerBar } from "./utils/patternMath.js";
import { offlineRenderSongChain } from "./audio/offlineRender.js";
import { downloadWav } from "./audio/exporter.js";
import { serializeSong, loadSongFromJSON } from "./utils/storage.js";
import { pushHistory, undo, redo } from "./state/history.js";
import { exportZipProject } from "./utils/zipExport.js";
import { importZipProject } from "./utils/zipImport.js";

const engine = new Engine();

/* -------------------- DOM -------------------- */

const addLaneBtn = document.getElementById("addLane");
const newPatternBtn = document.getElementById("newPattern");
const dupPatternBtn = document.getElementById("dupPattern");

const playBtn = document.getElementById("play");
const stopBtn = document.getElementById("stop");

const sampleInput = document.getElementById("sampleInput");
const lanesEl = document.getElementById("lanes");
const patternsEl = document.getElementById("arranger");

const bpmInput = document.getElementById("bpm");
const resolutionSelect = document.getElementById("resolution");
const timeSigSelect = document.getElementById("timeSig");
const playModeSelect = document.getElementById("playMode");

const exportBtn = document.getElementById("export");
const exportFormatSelect = document.getElementById("exportFormat");
const saveBtn = document.getElementById("save");
const loadBtn = document.getElementById("load");
const loadInput = document.getElementById("loadInput");

const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");

const importZipBtn = document.getElementById("importZipBtn");
const importZipInput = document.getElementById("importZip");

const loopSongCheckbox = document.getElementById("loopSong");

/* -------------------- State bootstrap -------------------- */

ensureFirstPattern();
pushHistory();

/* -------------------- UI Renderers -------------------- */

function refreshPatternsUI() {
  patternsEl.innerHTML = "";

  song.patternOrder.forEach((id) => {
    const chip = document.createElement("div");
    chip.className = "pattern-chip" + (song.current === id ? " active" : "");
    chip.textContent = id;

    chip.onclick = () => {
      song.current = id;
      refreshPatternsUI();
      renderGrid(song);
    };

    chip.ondblclick = () => {
      addToArrangement(id);
      renderArranger();
      pushHistory();
    };

    patternsEl.appendChild(chip);
  });
}

function renderLanesUI() {
  lanesEl.innerHTML = "";

  Object.values(song.lanes).forEach((lane) => {
    const el = document.createElement("div");
    el.className = "lane";
    el.textContent = lane.name;
    lanesEl.appendChild(el);
  });
}

/* -------------------- Lanes -------------------- */

addLaneBtn.onclick = () => sampleInput.click();

sampleInput.onchange = (e) => {
  const files = Array.from(e.target.files);

  files.forEach((file) => {
    const url = URL.createObjectURL(file);
    createLane(file.name, url);   // 👈 this is the upload handler
  });

  renderLanesUI();
  renderGrid();
  sampleInput.value = "";
};

/* -------------------- Patterns -------------------- */

newPatternBtn.onclick = () => {
  addPattern();
  pushHistory();
  refreshPatternsUI();
  renderGrid(song);
};

dupPatternBtn.onclick = () => {
  duplicatePattern(song.current);
  pushHistory();
  refreshPatternsUI();
  renderGrid(song);
};

/* -------------------- Transport -------------------- */

playBtn.onclick = async () => {
  await Tone.start();

  const mode = playModeSelect.value;
  engine.play(mode);
};

stopBtn.onclick = () => engine.stop();

/* -------------------- Pattern Controls -------------------- */

bpmInput.oninput = () => {
  const pattern = song.patterns[song.current];
  if (!pattern) return;

  pattern.bpm = Number(bpmInput.value);
  Tone.Transport.bpm.value = pattern.bpm;

  pushHistory();
};

resolutionSelect.onchange = () => {
  const pattern = song.patterns[song.current];
  if (!pattern) return;

  pattern.resolution = resolutionSelect.value;

  const newSteps = stepsPerBar(pattern.timeSig, pattern.resolution);
  pattern.steps = newSteps;

  Object.values(pattern.stepsByLane).forEach((steps) => {
    if (steps.length < newSteps) {
      while (steps.length < newSteps) {
        steps.push({ on: false, vel: 0.8 });
      }
    } else {
      steps.length = newSteps;
    }
  });

  pushHistory();
  renderGrid(song);
};

timeSigSelect.onchange = () => {
  const pattern = song.patterns[song.current];
  if (!pattern) return;

  pattern.timeSig = timeSigSelect.value;

  const newSteps = stepsPerBar(pattern.timeSig, pattern.resolution);
  pattern.steps = newSteps;

  Object.values(pattern.stepsByLane).forEach((steps) => {
    if (steps.length < newSteps) {
      while (steps.length < newSteps) {
        steps.push({ on: false, vel: 0.8 });
      }
    } else {
      steps.length = newSteps;
    }
  });

  pushHistory();
  renderGrid(song);
};

/* -------------------- Export -------------------- */

exportBtn.onclick = async () => {
  const format = document.getElementById("exportFormat").value;

  exportBtn.disabled = true;

  try {
    if (format === "wav") {
      const buffer = await offlineRenderSongChain();
      downloadWav(buffer);
    } else if (format === "zip") {
      await exportZipProject();
    }
  } catch (err) {
    console.error(err);
    alert("Export failed: " + err.message);
  } finally {
    exportBtn.disabled = false;
  }
};

/* -------------------- Save / Load -------------------- */

saveBtn.onclick = () => {
  const json = serializeSong();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tap16-project.json";
  a.click();

  URL.revokeObjectURL(url);
};

loadBtn.onclick = () => loadInput.click();

loadInput.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.name.endsWith(".zip")) {
    await importZipProject(file);
  } else {
    const json = await file.text();
    loadSongFromJSON(json);
  }

  refreshPatternsUI();
  renderLanesUI();
  renderArranger();
  renderGrid();
};

/* -------------------- Undo / Redo -------------------- */

undoBtn.onclick = () => {
  undo();
  refreshPatternsUI();
  renderLanesUI();
  renderArranger();
  renderGrid(song);
};

redoBtn.onclick = () => {
  redo();
  refreshPatternsUI();
  renderLanesUI();
  renderArranger();
  renderGrid(song);
};

importZipBtn.onclick = () => importZipInput.click();

importZipInput.onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  await importZipProject(file);

  refreshPatternsUI();
  renderLanesUI();
  renderArranger();
  renderGrid(song);
};

loopSongCheckbox.onchange = () => {
  engine.loopSong = loopSongCheckbox.checked;
};

/* -------------------- Boot -------------------- */

refreshPatternsUI();
renderLanesUI();
renderArranger();
renderGrid(song);

console.log("main.js booted ✔");
