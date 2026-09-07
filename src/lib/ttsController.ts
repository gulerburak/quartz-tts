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
  // Native speechSynthesis.pause()/resume() is unreliable across browsers
  // (notably a no-op on Firefox with some engines, e.g. espeak-ng via
  // speech-dispatcher on Linux — it flips the API's internal flag but never
  // actually pauses audio). So "pause" is emulated instead: cancel outright
  // and remember which chunk was playing; "resume" re-speaks starting from
  // that chunk. This only depends on cancel()/speak(), which are reliable
  // everywhere, at the cost of restarting the current chunk from its
  // beginning rather than the exact word.
  let chunks: string[] = [];
  let currentChunkIndex = 0;

  // Voice quality varies wildly by engine, and the browser's own "default"
  // pick is often the harshest available option (e.g. Linux via espeak-ng
  // through speech-dispatcher). getVoices() can also return an empty list
  // until the async "voiceschanged" event fires, so cache whatever's
  // available and keep refreshing it in the background.
  let cachedVoices: SpeechSynthesisVoice[] = [];
  function refreshVoices() {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) cachedVoices = voices;
  }
  refreshVoices();
  window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);

  const ROBOTIC_VOICE_NAME = /espeak|pico|festival/i;

  function pickVoice(lang: string | undefined): SpeechSynthesisVoice | undefined {
    if (cachedVoices.length === 0) return undefined;
    const wanted = (lang ?? "").toLowerCase();
    const prefix = wanted.split("-")[0];
    const matching = wanted
      ? cachedVoices.filter((v) => {
          const vLang = v.lang.toLowerCase();
          return vLang === wanted || vLang === prefix || vLang.startsWith(`${prefix}-`);
        })
      : cachedVoices;
    const pool = matching.length > 0 ? matching : cachedVoices;

    // Network/cloud voices are typically neural and far more natural than
    // local formant synthesizers, so prefer them; among local voices, avoid
    // well-known robotic engines by name when a better-sounding one exists.
    function score(v: SpeechSynthesisVoice): number {
      let s = 0;
      if (!v.localService) s += 2;
      if (!ROBOTIC_VOICE_NAME.test(v.name)) s += 1;
      if (v.default) s += 1;
      return s;
    }
    return [...pool].sort((a, b) => score(b) - score(a))[0];
  }

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
    currentChunkIndex = 0;
    render();
  }

  function speakFrom(startIndex: number) {
    window.speechSynthesis.cancel();
    const mySession = ++sessionId;
    const rate = Number(wrapper!.dataset.ttsRate ?? "1") || 1;
    const pitch = Number(wrapper!.dataset.ttsPitch ?? "1") || 1;
    const lang = document.documentElement.lang || undefined;
    const voice = pickVoice(lang);

    chunks.slice(startIndex).forEach((text, relIndex) => {
      const absIndex = startIndex + relIndex;
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rate;
      utter.pitch = pitch;
      if (lang) utter.lang = lang;
      if (voice) utter.voice = voice;
      utter.addEventListener("start", () => {
        if (mySession === sessionId) currentChunkIndex = absIndex;
      });
      if (absIndex === chunks.length - 1) {
        const finish = () => {
          // A pause cancels the in-flight utterance too, which fires this
          // same "error" event — skip the idle reset when that's why we're
          // here, so pausing on the last chunk doesn't look like it finished.
          if (mySession === sessionId && state !== "paused") {
            state = "idle";
            currentChunkIndex = 0;
            render();
          }
        };
        // "error" fires for our own cancel()-triggered interruptions too;
        // that's fine, it just means we reset to idle either way (unless
        // we're pausing, see above).
        utter.addEventListener("end", finish);
        utter.addEventListener("error", finish);
      }
      window.speechSynthesis.speak(utter);
    });

    state = "playing";
    render();
  }

  function speak() {
    const article =
      document.querySelector(".center > article") ?? document.querySelector("article");
    if (!article) return;
    chunks = getReadableChunks(article);
    if (chunks.length === 0) return;
    currentChunkIndex = 0;
    speakFrom(0);
  }

  const onToggle = () => {
    if (state === "idle") {
      speak();
    } else if (state === "playing") {
      window.speechSynthesis.cancel();
      state = "paused";
      render();
    } else {
      speakFrom(currentChunkIndex);
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
    window.speechSynthesis.removeEventListener("voiceschanged", refreshVoices);
  };
}

export function teardownTTS(): void {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
