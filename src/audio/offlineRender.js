// src/audio/offlineRender.js
import * as Tone from "tone";
import { song } from "../state/song.js";

export async function offlineRenderSongChain() {
  const patterns = song.arrangement.length
    ? song.arrangement.map(id => song.patterns[id])
    : [song.patterns[song.current]];

  let totalSeconds = 0;
  patterns.forEach(p => {
    const stepSec = Tone.Time(p.resolution).toSeconds();
    totalSeconds += p.steps * stepSec;
  });

  const buffer = await Tone.Offline(async ({ transport }) => {
    const players = new Map();

    Object.values(song.lanes).forEach(lane => {
      const p = new Tone.Player().toDestination();
      players.set(lane.id, p);
    });

    for (const [id, player] of players) {
      const url = song.lanes[id].sampleUrl;
      if (url) await player.load(url);
    }

    let t = 0;

    for (const pattern of patterns) {
      transport.bpm.value = pattern.bpm;

      const stepSec = Tone.Time(pattern.resolution).toSeconds();

      for (let i = 0; i < pattern.steps; i++) {
        Object.values(song.lanes).forEach(lane => {
          const s = pattern.stepsByLane[lane.id]?.[i];
          if (s?.on) players.get(lane.id)?.start(t);
        });

        t += stepSec;
      }
    }

    transport.start(0);
  }, totalSeconds + 0.5);

  return buffer;
}
