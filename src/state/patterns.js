export function createPattern(name = "A") {
  return {
    name,
    bpm: 120,
    timeSig: [4, 4],
    resolution: "16n",
    steps: 16,
    lanes: {}
  };
}
