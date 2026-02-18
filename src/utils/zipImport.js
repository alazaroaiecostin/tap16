// src/utils/zipImport.js
import JSZip from "jszip";
import { loadSongFromJSON } from "./storage.js";
import { song } from "../state/song.js";

export async function importZipProject(file) {
  const zip = await JSZip.loadAsync(file);

  // Load project.json
  const json = await zip.file("project.json").async("string");
  loadSongFromJSON(json);

  // Restore samples
  const samples = zip.folder("samples");
  const entries = Object.values(samples.files);

  for (const entry of entries) {
    const blob = await entry.async("blob");
    const url = URL.createObjectURL(blob);

    const laneId = entry.name.split("/").pop().replace(".wav", "");
    if (song.lanes[laneId]) {
      song.lanes[laneId].sampleUrl = url;
    }
  }
}
