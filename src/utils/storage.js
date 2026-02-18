// src/utils/storage.js
import { song } from "../state/song.js";

export function serializeSong() {
  const tempoMap = song.arrangement.map((patternId) => {
    const pattern = song.patterns[patternId];
    if (!pattern) return null;

    return {
      pattern: patternId,
      bpm: pattern.bpm,
      steps: pattern.steps,
      resolution: pattern.resolution,
      timeSig: pattern.timeSig
    };
  }).filter(Boolean);

  return JSON.stringify(
    {
      version: 1,
      song,
      tempoMap
    },
    null,
    2
  );
}

export function loadSongFromJSON(json) {
  const data = JSON.parse(json);

  song.patterns = data.song.patterns;
  song.patternOrder = data.song.patternOrder;
  song.current = data.song.current;
  song.arrangement = data.song.arrangement || [];
  song.lanes = data.song.lanes || {};

  return data;
}
