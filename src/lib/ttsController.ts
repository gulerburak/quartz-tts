/* eslint-disable no-restricted-syntax -- listeners are torn down via the
   returned cleanup function, which the caller (textToSpeech.inline.ts)
   registers with window.addCleanup. Kept free of that Quartz-runtime global
   here so this module can be unit-tested in isolation. */
import { wrapArticleWords, unwrapArticleWords } from "./articleWords";
import { computeWordOffsets, findActiveWordIndex, estimateWordDurationsMs } from "./highlighter";

type TTSState = "idle" | "playing" | "paused";

interface Segment {
  chunkIndex: number;
  words: HTMLElement[];
}

const VOICE_STORAGE_KEY = "quartz-tts:voice";
const ACTIVE_WORD_CLASS = "tts-word-active";
// If no "boundary" event arrives this long after an utterance starts, the
// engine likely doesn't fire them at all (a real gap observed on Firefox
// with espeak-ng/speech-dispatcher) — fall back to simulated timing instead
// of leaving the highlight frozen for the rest of the read.
const BOUNDARY_PROBE_MS = 350;

function loadVoiceOverride(): string | undefined {
  try {
    return window.localStorage.getItem(VOICE_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function saveVoiceOverride(voiceURI: string | undefined): void {
  try {
    if (voiceURI) window.localStorage.setItem(VOICE_STORAGE_KEY, voiceURI);
    else window.localStorage.removeItem(VOICE_STORAGE_KEY);
  } catch {
    // Private browsing / storage disabled — the override just won't persist.
  }
}

/**
 * Binds the play/pause/stop/voice toolbar control to the current document's
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

  const voiceBtn = wrapper.querySelector<HTMLButtonElement>(".tts-voice");
  const voiceMenu = wrapper.querySelector<HTMLElement>(".tts-voice-menu");

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
  let chunkWords: HTMLElement[][] = [];
  let currentChunkIndex = 0;
  let articleEl: Element | undefined;
  let activeWordSpan: HTMLElement | undefined;
  let highlightTimers: ReturnType<typeof setTimeout>[] = [];
  // undefined = not yet known this session; true/false once a "boundary"
  // event has (or, after the probe window, hasn't) arrived.
  let boundarySupported: boolean | undefined;

  // Voice quality varies wildly by engine, and the browser's own "default"
  // pick is often the harshest available option (e.g. Linux via espeak-ng
  // through speech-dispatcher). getVoices() can also return an empty list
  // until the async "voiceschanged" event fires, so cache whatever's
  // available and keep refreshing it in the background.
  let cachedVoices: SpeechSynthesisVoice[] = [];
  let voiceOverrideURI: string | undefined = loadVoiceOverride();
  function refreshVoices() {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) cachedVoices = voices;
  }
  refreshVoices();
  window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);

  const ROBOTIC_VOICE_NAME = /espeak|pico|festival/i;

  function voicesForLang(lang: string | undefined): SpeechSynthesisVoice[] {
    const wanted = (lang ?? "").toLowerCase();
    if (!wanted) return cachedVoices;
    const prefix = wanted.split("-")[0];
    const matching = cachedVoices.filter((v) => {
      const vLang = v.lang.toLowerCase();
      return vLang === wanted || vLang === prefix || vLang.startsWith(`${prefix}-`);
    });
    return matching.length > 0 ? matching : cachedVoices;
  }

  function pickVoice(lang: string | undefined): SpeechSynthesisVoice | undefined {
    if (cachedVoices.length === 0) return undefined;
    if (voiceOverrideURI) {
      const chosen = cachedVoices.find((v) => v.voiceURI === voiceOverrideURI);
      if (chosen) return chosen;
    }
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
    return [...voicesForLang(lang)].sort((a, b) => score(b) - score(a))[0];
  }

  const labels = {
    play: toggleBtn.dataset.labelPlay ?? toggleBtn.getAttribute("aria-label") ?? "Play",
    pause: toggleBtn.dataset.labelPause ?? "Pause",
    resume: toggleBtn.dataset.labelResume ?? "Resume",
    automaticVoice: voiceMenu?.dataset.automaticLabel ?? "Automatic",
  };

  function render() {
    wrapper!.dataset.ttsState = state;
    toggleBtn!.setAttribute("aria-pressed", state === "idle" ? "false" : "true");
    toggleBtn!.setAttribute(
      "aria-label",
      state === "playing" ? labels.pause : state === "paused" ? labels.resume : labels.play,
    );
  }

  function setActiveWord(span: HTMLElement | undefined) {
    if (activeWordSpan === span) return;
    activeWordSpan?.classList.remove(ACTIVE_WORD_CLASS);
    activeWordSpan = span;
    activeWordSpan?.classList.add(ACTIVE_WORD_CLASS);
  }

  function clearHighlightTimers() {
    highlightTimers.forEach(clearTimeout);
    highlightTimers = [];
  }

  function simulateHighlight(segment: Segment, rate: number, mySession: number) {
    const words = segment.words.map((w) => w.textContent ?? "");
    const durations = estimateWordDurationsMs(words, rate);
    let elapsed = 0;
    segment.words.forEach((span, i) => {
      const timer = setTimeout(() => {
        if (mySession === sessionId && boundarySupported === false) setActiveWord(span);
      }, elapsed);
      highlightTimers.push(timer);
      elapsed += durations[i] ?? 0;
    });
  }

  function unwrapWords() {
    if (articleEl) {
      articleEl.removeEventListener("click", onWordClick);
      unwrapArticleWords(articleEl);
    }
    articleEl = undefined;
    chunkWords = [];
    setActiveWord(undefined);
  }

  function stop() {
    window.speechSynthesis.cancel();
    clearHighlightTimers();
    state = "idle";
    currentChunkIndex = 0;
    unwrapWords();
    render();
  }

  function segmentsFrom(chunkIndex: number, wordStart: number): Segment[] {
    const segments: Segment[] = [];
    const first = chunkWords[chunkIndex];
    if (first) {
      const words = first.slice(wordStart);
      if (words.length > 0) segments.push({ chunkIndex, words });
    }
    for (let i = chunkIndex + 1; i < chunkWords.length; i++) {
      segments.push({ chunkIndex: i, words: chunkWords[i]! });
    }
    return segments;
  }

  function speakSegments(segments: Segment[]) {
    window.speechSynthesis.cancel();
    clearHighlightTimers();
    const mySession = ++sessionId;
    const rate = Number(wrapper!.dataset.ttsRate ?? "1") || 1;
    const pitch = Number(wrapper!.dataset.ttsPitch ?? "1") || 1;
    const lang = document.documentElement.lang || undefined;
    const voice = pickVoice(lang);

    segments.forEach((segment, relIndex) => {
      const words = segment.words.map((w) => w.textContent ?? "");
      const offsets = computeWordOffsets(words);
      const utter = new SpeechSynthesisUtterance(words.join(" "));
      utter.rate = rate;
      utter.pitch = pitch;
      if (lang) utter.lang = lang;
      if (voice) utter.voice = voice;

      utter.addEventListener("start", () => {
        if (mySession !== sessionId) return;
        currentChunkIndex = segment.chunkIndex;
        if (boundarySupported === false) {
          simulateHighlight(segment, rate, mySession);
        } else if (boundarySupported === undefined) {
          const probe = setTimeout(() => {
            if (mySession === sessionId && boundarySupported === undefined) {
              boundarySupported = false;
              simulateHighlight(segment, rate, mySession);
            }
          }, BOUNDARY_PROBE_MS);
          highlightTimers.push(probe);
        }
      });

      utter.addEventListener("boundary", (e: SpeechSynthesisEvent) => {
        if (mySession !== sessionId) return;
        if (e.name && e.name !== "word") return;
        if (boundarySupported !== true) {
          boundarySupported = true;
          clearHighlightTimers(); // real events take over from any simulation in flight
        }
        setActiveWord(segment.words[findActiveWordIndex(offsets, e.charIndex)]);
      });

      if (relIndex === segments.length - 1) {
        const finish = () => {
          // A pause cancels the in-flight utterance too, which fires this
          // same "error" event — skip the idle reset when that's why we're
          // here, so pausing on the last chunk doesn't look like it finished.
          if (mySession === sessionId && state !== "paused") {
            state = "idle";
            currentChunkIndex = 0;
            clearHighlightTimers();
            unwrapWords();
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

  const onWordClick = (e: Event) => {
    if (state === "idle") return;
    const target = (e.target as Element).closest?.(".tts-word") as HTMLElement | null;
    if (!target) return;
    const chunkIndex = Number(target.dataset.ttsChunk);
    const wordIndex = Number(target.dataset.ttsWord);
    if (Number.isNaN(chunkIndex) || Number.isNaN(wordIndex)) return;
    speakSegments(segmentsFrom(chunkIndex, wordIndex));
  };

  function speak() {
    const article =
      document.querySelector(".center > article") ?? document.querySelector("article");
    if (!article) return;
    chunkWords = wrapArticleWords(article);
    if (chunkWords.length === 0) return;
    articleEl = article;
    articleEl.addEventListener("click", onWordClick);
    boundarySupported = undefined;
    currentChunkIndex = 0;
    speakSegments(segmentsFrom(0, 0));
  }

  function renderVoiceMenu() {
    if (!voiceMenu) return;
    const lang = document.documentElement.lang || undefined;
    voiceMenu.textContent = "";

    const autoOpt = document.createElement("button");
    autoOpt.type = "button";
    autoOpt.className = "tts-voice-option";
    autoOpt.setAttribute("role", "option");
    autoOpt.setAttribute("aria-selected", voiceOverrideURI ? "false" : "true");
    autoOpt.textContent = labels.automaticVoice;
    autoOpt.addEventListener("click", () => selectVoice(undefined));
    voiceMenu.appendChild(autoOpt);

    voicesForLang(lang).forEach((v) => {
      const opt = document.createElement("button");
      opt.type = "button";
      opt.className = "tts-voice-option";
      opt.setAttribute("role", "option");
      opt.setAttribute("aria-selected", v.voiceURI === voiceOverrideURI ? "true" : "false");
      opt.textContent = `${v.name} (${v.lang})`;
      opt.addEventListener("click", () => selectVoice(v.voiceURI));
      voiceMenu.appendChild(opt);
    });
  }

  function selectVoice(voiceURI: string | undefined) {
    voiceOverrideURI = voiceURI;
    saveVoiceOverride(voiceURI);
    closeVoiceMenu();
    if (state !== "idle") speakSegments(segmentsFrom(currentChunkIndex, 0));
  }

  const onDocClickCloseMenu = (e: Event) => {
    const target = e.target as Node;
    if (!wrapper!.contains(target) && !voiceMenu?.contains(target)) closeVoiceMenu();
  };
  function openVoiceMenu() {
    if (!voiceMenu || !voiceBtn) return;
    renderVoiceMenu();
    // Moved to <body> with fixed positioning rather than left as an
    // absolutely-positioned child of the toolbar: a toolbar/sidebar
    // container clipping overflow (common in this kind of layout) or
    // stacking above it would otherwise render the menu, just invisibly.
    document.body.appendChild(voiceMenu);
    const rect = voiceBtn.getBoundingClientRect();
    voiceMenu.style.position = "fixed";
    voiceMenu.style.top = `${rect.bottom + 4}px`;
    voiceMenu.style.left = `${rect.left}px`;
    voiceMenu.hidden = false;
    voiceBtn.setAttribute("aria-expanded", "true");
    document.addEventListener("click", onDocClickCloseMenu, { capture: true });
  }
  function closeVoiceMenu() {
    if (!voiceMenu || !voiceBtn) return;
    voiceMenu.hidden = true;
    voiceBtn.setAttribute("aria-expanded", "false");
    wrapper!.appendChild(voiceMenu); // restore to its normal place in the toolbar
    document.removeEventListener("click", onDocClickCloseMenu, { capture: true });
  }
  const onVoiceToggle = () => {
    if (!voiceMenu) return;
    if (voiceMenu.hidden) openVoiceMenu();
    else closeVoiceMenu();
  };

  const onToggle = () => {
    if (state === "idle") {
      speak();
    } else if (state === "playing") {
      window.speechSynthesis.cancel();
      clearHighlightTimers();
      state = "paused";
      render();
    } else {
      speakSegments(segmentsFrom(currentChunkIndex, 0));
    }
  };
  const onStop = () => stop();
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key !== "Escape") return;
    if (voiceMenu && !voiceMenu.hidden) {
      closeVoiceMenu();
      return;
    }
    if (state !== "idle") stop();
  };

  toggleBtn.addEventListener("click", onToggle);
  stopBtn.addEventListener("click", onStop);
  voiceBtn?.addEventListener("click", onVoiceToggle);
  document.addEventListener("keydown", onKeydown);

  state = "idle";
  render();

  return () => {
    toggleBtn.removeEventListener("click", onToggle);
    stopBtn.removeEventListener("click", onStop);
    voiceBtn?.removeEventListener("click", onVoiceToggle);
    document.removeEventListener("keydown", onKeydown);
    document.removeEventListener("click", onDocClickCloseMenu, { capture: true });
    window.speechSynthesis.removeEventListener("voiceschanged", refreshVoices);
    clearHighlightTimers();
    unwrapWords();
    // If the menu was left open (and thus moved to <body>) when this page
    // is torn down, it won't be cleaned up by the normal DOM swap — remove
    // it explicitly rather than leaking a floating, orphaned menu.
    voiceMenu?.remove();
  };
}

export function teardownTTS(): void {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
