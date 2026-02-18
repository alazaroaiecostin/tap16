import JSZip from "jszip";
import { offlineRenderSongChain } from "../audio/offlineRender.js";
import { serializeSong } from "./storage.js";
import { downloadBlob } from "../audio/exporter.js";
import { audioBufferToWav } from "../audio/audioBufferToWav.js";
import { song } from "../state/song.js";

export async function exportZipProject() {
  const zip = new JSZip();

  // 1. Project JSON
  zip.file("project.json", serializeSong());

  // 2. Samples
  const samplesFolder = zip.folder("samples");
  for (const lane of Object.values(song.lanes)) {
    if (!lane.sampleUrl) continue;

    const res = await fetch(lane.sampleUrl);
    const blob = await res.blob();
    samplesFolder.file(lane.id + ".wav", blob);
  }

  // 3. Rendered WAV
  const buffer = await offlineRenderSongChain();
  const wav = audioBufferToWav(buffer);
  zip.file("render.wav", wav);

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, "tap16-project.zip");
}
