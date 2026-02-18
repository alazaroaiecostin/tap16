import { stepsPerBar } from "../utils/patternMath.js";

export const song = {
  patterns: {},
  patternOrder: [],
  current: null,
  arrangement: [],
  lanes: {} // 👈 GLOBAL instruments
};

export function ensureFirstPattern() {
  if (!song.current) {
    addPattern();
  }
}

export function addPattern() {
  const id = "P" + (song.patternOrder.length + 1);

  song.patterns[id] = {
    id,
    bpm: 120,
    timeSig: "4/4",
    resolution: "16n",
    steps: stepsPerBar("4/4", "16n"),
    stepsByLane: {}
  };

  // init steps for existing lanes
  Object.keys(song.lanes).forEach((laneId) => {
    song.patterns[id].stepsByLane[laneId] =
      new Array(song.patterns[id].steps).fill(0).map(() => ({
        on: false,
        vel: 0.8
      }));
  });

  song.patternOrder.push(id);
  song.current = id;
  return id;
}

export function createLane(name, sampleUrl, originalName = null) {
  const id = crypto.randomUUID();

  song.lanes[id] = {
    id,
    name,
    sampleUrl,
    originalName: originalName || name,
    mute: false
  };

  Object.values(song.patterns).forEach((pattern) => {
    pattern.stepsByLane[id] =
      new Array(pattern.steps).fill(0).map(() => ({
        on: false,
        vel: 0.8
      }));
  });

  return song.lanes[id];
}


export function resizePattern(pattern, newSteps) {
  Object.values(pattern.stepsByLane).forEach((steps) => {
    if (steps.length < newSteps) {
      while (steps.length < newSteps) {
        steps.push({ on: false, vel: 0.8 });
      }
    } else {
      steps.length = newSteps;
    }
  });

  pattern.steps = newSteps;
}

export function duplicatePattern(sourceId = song.current) {
  const src = song.patterns[sourceId];
  if (!src) return;

  const id = "P" + (song.patternOrder.length + 1);

  const clone = {
    id,
    bpm: src.bpm,
    timeSig: src.timeSig,
    resolution: src.resolution,
    steps: src.steps,
    stepsByLane: {}
  };

  Object.entries(src.stepsByLane).forEach(([laneId, steps]) => {
    clone.stepsByLane[laneId] = steps.map((s) => ({ ...s }));
  });

  song.patterns[id] = clone;
  song.patternOrder.push(id);
  song.current = id;

  return id;
}

export function addToArrangement(id = song.current) {
  if (!id) return;
  song.arrangement.push(id);
}

export function removeFromArrangement(index) {
  song.arrangement.splice(index, 1);
}

export function moveInArrangement(from, to) {
  const [item] = song.arrangement.splice(from, 1);
  song.arrangement.splice(to, 0, item);
}

export function getCurrentPattern() {
  return song.patterns[song.current];
}