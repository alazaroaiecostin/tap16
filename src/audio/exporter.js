import { audioBufferToWav } from "./audioBufferToWav.js";

export function downloadWav(buffer, filename = "tap16-export.wav") {
  if (!buffer) {
    throw new Error("No AudioBuffer provided to downloadWav()");
  }

  const wav = audioBufferToWav(buffer);
  const blob = new Blob([wav], { type: "audio/wav" });
  downloadBlob(blob, filename);
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
