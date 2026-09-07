/* eslint-disable no-restricted-syntax -- listeners are torn down via the
   returned cleanup function, which the caller (textToSpeech.inline.ts)
   registers with window.addCleanup. Kept free of that Quartz-runtime global
   here so this module can be unit-tested in isolation. */
import { getReadableChunks } from "./extractText";

type TTSState = "idle" | "playing" | "paused";

/**
 * Binds the play/pause/stop toolbar control to the current document's
 * article. Returns a cleanup function to remove its listeners (for
 * window.addCleanup), or undefined if there's no control to bind (missing
 * markup, or the browser lacks speechSynthesis).
 */
export function attachTTS(): (() => void) | undefined {
  const wrapper = document.querySelector<HTMLElement>(".tts");
  if (!wrapper) return undefined;
  const toggleBtn = wrapper.querySelector<HTMLButtonElement>(".tts-toggle");
  const stopBtn = wrapper.querySelector<HTMLButtonElement>(".tts-stop");
  if (!toggleBtn || !stopBtn) return undefined;

  if (!("speechSynthesis" in window)) {
    wrapper.dataset.ttsSupported = "false";
    return undefined;
  }
  wrapper.dataset.ttsSupported = "true";

  let state: TTSState = "idle";
  let sessionId = 0;

  const labels = {
    play: toggleBtn.dataset.labelPlay ?? toggleBtn.getAttribute("aria-label") ?? "Play",
    pause: toggleBtn.dataset.labelPause ?? "Pause",
    resume: toggleBtn.dataset.labelResume ?? "Resume",
  };

  function render() {
    wrapper!.dataset.ttsState = state;
    toggleBtn!.setAttribute("aria-pressed", state === "idle" ? "false" : "true");
    toggleBtn!.setAttribute(
      "aria-label",
      state === "playing" ? labels.pause : state === "paused" ? labels.resume : labels.play,
    );
  }

  function stop() {
    window.speechSynthesis.cancel();
    state = "idle";
    render();
  }

  function speak() {
    const article =
      document.querySelector(".center > article") ?? document.querySelector("article");
    if (!article) return;
    const chunks = getReadableChunks(article);
    if (chunks.length === 0) return;

    window.speechSynthesis.cancel();
    const mySession = ++sessionId;
    const rate = Number(wrapper!.dataset.ttsRate ?? "1") || 1;
    const pitch = Number(wrapper!.dataset.ttsPitch ?? "1") || 1;
    const lang = document.documentElement.lang || undefined;

    chunks.forEach((text, i) => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rate;
      utter.pitch = pitch;
      if (lang) utter.lang = lang;
      if (i === chunks.length - 1) {
        const finish = () => {
          if (mySession === sessionId) {
            state = "idle";
            render();
          }
        };
        // "error" fires for our own cancel()-triggered interruptions too;
        // that's fine, it just means we reset to idle either way.
        utter.addEventListener("end", finish);
        utter.addEventListener("error", finish);
      }
      window.speechSynthesis.speak(utter);
    });

    state = "playing";
    render();
  }

  const onToggle = () => {
    if (state === "idle") {
      speak();
    } else if (state === "playing") {
      window.speechSynthesis.pause();
      state = "paused";
      render();
    } else {
      window.speechSynthesis.resume();
      state = "playing";
      render();
    }
  };
  const onStop = () => stop();
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && state !== "idle") stop();
  };

  toggleBtn.addEventListener("click", onToggle);
  stopBtn.addEventListener("click", onStop);
  document.addEventListener("keydown", onKeydown);

  state = "idle";
  render();

  return () => {
    toggleBtn.removeEventListener("click", onToggle);
    stopBtn.removeEventListener("click", onStop);
    document.removeEventListener("keydown", onKeydown);
  };
}

export function teardownTTS(): void {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
