import { exportSong } from "../audio/exporter.js";

export function bindExportUI() {
  const btn = document.getElementById("export");
  const fmt = document.getElementById("exportFormat");

  btn.onclick = async () => {
    btn.disabled = true;
    btn.textContent = "Rendering…";

    try {
      await exportSong(fmt.value);
    } finally {
      btn.disabled = false;
      btn.textContent = "Export";
    }
  };
}
