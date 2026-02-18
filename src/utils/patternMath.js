export function stepsPerBar(timeSig, resolution) {
  const [beatsStr] = timeSig.split("/");   // ✅ FIX
  const beats = Number(beatsStr);

  const base = {
    "4n": beats,
    "4t": beats * 3 / 2,
    "8n": beats * 2,
    "8t": beats * 3,
    "16n": beats * 4,
    "16t": beats * 6,
    "32n": beats * 8,
    "32t": beats * 12,
    "64n": beats * 16
  };

  return Math.round(base[resolution] || beats * 4);
}
