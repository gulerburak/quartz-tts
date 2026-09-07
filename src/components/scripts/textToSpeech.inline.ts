import { attachTTS, teardownTTS } from "../../lib/ttsController";

function setupTTS() {
  const cleanup = attachTTS();
  if (cleanup) window.addCleanup(cleanup);
}

document.addEventListener("nav", setupTTS);
document.addEventListener("render", setupTTS);
document.addEventListener("prenav", teardownTTS);
