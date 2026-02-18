import * as Tone from "tone";
import { song } from "../state/song.js";
import { renderArranger } from "../ui/arranger.js";
import { renderGrid } from "../ui/grid.js";

export class Engine {
  constructor() {
    this.players = new Map();
    this.isPlaying = false;
    this.loopSong = false;
  }

  async init() {
    await Tone.start();
  }

  rebuildPlayers() {
    this.dispose();

    Object.values(song.lanes).forEach((lane) => {
      if (!lane.sampleUrl) return;
      const player = new Tone.Player(lane.sampleUrl).toDestination();
      this.players.set(lane.id, player);
    });
  }

  play(playMode = "pattern") {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    this.rebuildPlayers();

    if (playMode === "song") {
      this.playSongChain();
    } else {
      this.playPattern(song.current);
    }

    Tone.Transport.start();
    this.isPlaying = true;
  }

  playPattern(patternId) {
    const pattern = song.patterns[patternId];
    if (!pattern) return;

    Tone.Transport.bpm.value = pattern.bpm;

    let step = 0;
    Tone.Transport.scheduleRepeat((time) => {
      Object.values(song.lanes).forEach((lane) => {
        if (lane.mute) return;
        const s = pattern.stepsByLane[lane.id]?.[step];
        if (s?.on) {
          this.players.get(lane.id)?.start(time);
        }
      });
      step = (step + 1) % pattern.steps;
    }, pattern.resolution);
  }

  playSongChain() {
    if (!song.arrangement.length) return;

    let chain = song.arrangement.map((id) => song.patterns[id]).filter(Boolean);
    let patternIndex = 0;
    let step = 0;

    const scheduleNextPattern = () => {
      const pattern = chain[patternIndex];
      if (!pattern) return;

      Tone.Transport.bpm.rampTo(pattern.bpm, 0.05); // 🔥 smooth transition
      song.current = pattern.id;
      renderArranger(patternIndex);
      renderGrid();

      const resolution = pattern.resolution;
      const totalSteps = pattern.steps;

      Tone.Transport.scheduleRepeat((time) => {
        Object.values(song.lanes).forEach((lane) => {
          if (lane.mute) return;
          const s = pattern.stepsByLane[lane.id]?.[step];
          if (s?.on) {
            this.players.get(lane.id)?.start(time);
          }
        });

        step++;

        if (step >= totalSteps) {
          step = 0;
          patternIndex++;

          if (patternIndex >= chain.length) {
            if (this.loopSong) {
              patternIndex = 0;
            } else {
              this.stop();
              return;
            }
          }

          Tone.Transport.cancel();
          scheduleNextPattern();   // 🔁 seamless pattern switch
        }
      }, resolution);
    };

    scheduleNextPattern();
  }

  stop() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    this.isPlaying = false;
  }

  dispose() {
    this.players.forEach((p) => p.dispose());
    this.players.clear();
  }
}
