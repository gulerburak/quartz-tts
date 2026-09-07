// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attachTTS, teardownTTS } from "../src/lib/ttsController";

class FakeUtterance {
  text: string;
  rate = 1;
  pitch = 1;
  lang = "";
  voice: SpeechSynthesisVoice | null = null;
  private listeners: Record<string, Array<(event?: unknown) => void>> = {};
  constructor(text: string) {
    this.text = text;
  }
  addEventListener(type: string, cb: (event?: unknown) => void) {
    (this.listeners[type] ??= []).push(cb);
  }
  removeEventListener(type: string, cb: (event?: unknown) => void) {
    this.listeners[type] = (this.listeners[type] ?? []).filter((fn) => fn !== cb);
  }
  dispatch(type: string, event?: unknown) {
    (this.listeners[type] ?? []).forEach((cb) => cb(event));
  }
}

function createFakeSynthesis(voices: SpeechSynthesisVoice[] = []) {
  const spoken: FakeUtterance[] = [];
  return {
    spoken,
    speak: vi.fn((u: FakeUtterance) => spoken.push(u)),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => voices),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
}

function makeVoice(
  overrides: Partial<SpeechSynthesisVoice> & { name: string },
): SpeechSynthesisVoice {
  return {
    voiceURI: overrides.name,
    lang: "en-US",
    localService: true,
    default: false,
    ...overrides,
  } as SpeechSynthesisVoice;
}

type FakeSynthesis = ReturnType<typeof createFakeSynthesis>;
let fakeSynthesis: FakeSynthesis;
// attachTTS() attaches a document-level keydown listener; since jsdom's
// `document` (unlike `document.body.innerHTML`) is NOT reset between tests,
// a controller left attached from a previous test would still react to
// events dispatched by a later one. Every test that calls attachTTS() must
// go through this helper so afterEach can tear it down.
let activeCleanup: (() => void) | undefined;

function attach(): (() => void) | undefined {
  activeCleanup = attachTTS();
  return activeCleanup;
}

function toggle(): HTMLButtonElement {
  return document.querySelector(".tts-toggle") as HTMLButtonElement;
}
function stopBtn(): HTMLButtonElement {
  return document.querySelector(".tts-stop") as HTMLButtonElement;
}
function voiceBtn(): HTMLButtonElement {
  return document.querySelector(".tts-voice") as HTMLButtonElement;
}
function voiceMenu(): HTMLElement {
  return document.querySelector(".tts-voice-menu") as HTMLElement;
}
function voiceOptions(): HTMLButtonElement[] {
  return Array.from(voiceMenu().querySelectorAll<HTMLButtonElement>(".tts-voice-option"));
}
function wrapper(): HTMLElement {
  return document.querySelector(".tts") as HTMLElement;
}
function article(): HTMLElement {
  return document.querySelector("article") as HTMLElement;
}

// jsdom (at least under this Node/vitest combination) doesn't wire up a real
// window.localStorage, so stub a minimal in-memory one for these tests —
// production code always runs in a real browser, which always has one.
function installFakeLocalStorage() {
  const store = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, String(value)),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    },
  });
}

beforeEach(() => {
  installFakeLocalStorage();
  document.documentElement.lang = "";
  document.body.innerHTML = `
    <span class="tts" data-tts-state="idle" data-tts-rate="1" data-tts-pitch="1">
      <button class="tts-toggle" type="button" aria-label="Play"
        data-label-play="Play" data-label-pause="Pause" data-label-resume="Resume"></button>
      <button class="tts-voice" type="button" aria-label="Choose voice" aria-expanded="false"></button>
      <div class="tts-voice-menu" data-automatic-label="Automatic" hidden></div>
      <button class="tts-stop" type="button" aria-label="Stop"></button>
    </span>
    <div class="center"><article><p>First.</p><p>Second.</p></article></div>
  `;
  fakeSynthesis = createFakeSynthesis();
  (globalThis as unknown as { speechSynthesis: FakeSynthesis }).speechSynthesis = fakeSynthesis;
  (
    globalThis as unknown as { SpeechSynthesisUtterance: typeof FakeUtterance }
  ).SpeechSynthesisUtterance = FakeUtterance;
});

afterEach(() => {
  activeCleanup?.();
  activeCleanup = undefined;
  vi.useRealTimers();
  delete (globalThis as { speechSynthesis?: unknown }).speechSynthesis;
  delete (globalThis as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance;
});

describe("attachTTS", () => {
  it("hides the control when speechSynthesis is unsupported", () => {
    delete (globalThis as { speechSynthesis?: unknown }).speechSynthesis;
    expect(attach()).toBeUndefined();
    expect(wrapper().dataset.ttsSupported).toBe("false");
  });

  it("speaks each block as a separate utterance with the configured rate/pitch/lang", () => {
    wrapper().dataset.ttsRate = "1.5";
    wrapper().dataset.ttsPitch = "0.8";
    document.documentElement.lang = "de-DE";
    attach();
    toggle().click();

    expect(wrapper().dataset.ttsState).toBe("playing");
    expect(toggle().getAttribute("aria-pressed")).toBe("true");
    expect(fakeSynthesis.spoken.map((u) => u.text)).toEqual(["First.", "Second."]);
    expect(fakeSynthesis.spoken[0]?.rate).toBe(1.5);
    expect(fakeSynthesis.spoken[0]?.pitch).toBe(0.8);
    expect(fakeSynthesis.spoken[0]?.lang).toBe("de-DE");
  });

  it("pauses by cancelling (not native pause/resume) and resumes from the paused chunk", () => {
    // Native speechSynthesis.pause()/resume() is unreliable (e.g. a no-op on
    // Firefox with espeak-ng/speech-dispatcher) — pause must cancel outright
    // and resume must re-speak from the chunk that was interrupted.
    attach();
    toggle().click(); // play -> queues "First." and "Second."
    fakeSynthesis.spoken[0]?.dispatch("start"); // "First." is the one actually playing
    fakeSynthesis.cancel.mockClear(); // speakSegments() itself cancels defensively on every call

    toggle().click(); // pause
    expect(fakeSynthesis.cancel).toHaveBeenCalledTimes(1);
    expect(fakeSynthesis.pause).not.toHaveBeenCalled();
    expect(wrapper().dataset.ttsState).toBe("paused");

    const spokenBeforeResume = fakeSynthesis.spoken.length;
    toggle().click(); // resume
    expect(fakeSynthesis.resume).not.toHaveBeenCalled();
    expect(wrapper().dataset.ttsState).toBe("playing");
    const resumedTexts = fakeSynthesis.spoken.slice(spokenBeforeResume).map((u) => u.text);
    expect(resumedTexts).toEqual(["First.", "Second."]); // restarts the interrupted chunk
  });

  it("pausing during the last chunk isn't mistaken for finishing", () => {
    attach();
    toggle().click();
    const last = fakeSynthesis.spoken[fakeSynthesis.spoken.length - 1];
    last?.dispatch("start");

    toggle().click(); // pause cancels the last utterance...
    last?.dispatch("error"); // ...which fires "error" in real browsers

    expect(wrapper().dataset.ttsState).toBe("paused"); // must not flip to idle
  });

  it("prefers a network/cloud voice over a local one for the same language", () => {
    const local = makeVoice({
      name: "eSpeak NG",
      lang: "en-US",
      localService: true,
      default: true,
    });
    const cloud = makeVoice({ name: "Google US English", lang: "en-US", localService: false });
    fakeSynthesis = createFakeSynthesis([local, cloud]);
    (globalThis as unknown as { speechSynthesis: FakeSynthesis }).speechSynthesis = fakeSynthesis;
    document.documentElement.lang = "en-US";

    attach();
    toggle().click();

    expect(fakeSynthesis.spoken[0]?.voice).toBe(cloud);
  });

  it("avoids a known robotic local engine when a nicer local voice is available", () => {
    const robotic = makeVoice({ name: "espeak-ng", lang: "en-GB", localService: true });
    const nicer = makeVoice({ name: "Karen", lang: "en-GB", localService: true });
    fakeSynthesis = createFakeSynthesis([robotic, nicer]);
    (globalThis as unknown as { speechSynthesis: FakeSynthesis }).speechSynthesis = fakeSynthesis;
    document.documentElement.lang = "en-GB";

    attach();
    toggle().click();

    expect(fakeSynthesis.spoken[0]?.voice).toBe(nicer);
  });

  it("falls back to any available voice when none match the page language", () => {
    const other = makeVoice({ name: "Google Deutsch", lang: "de-DE", localService: false });
    fakeSynthesis = createFakeSynthesis([other]);
    (globalThis as unknown as { speechSynthesis: FakeSynthesis }).speechSynthesis = fakeSynthesis;
    document.documentElement.lang = "en-US";

    attach();
    toggle().click();

    expect(fakeSynthesis.spoken[0]?.voice).toBe(other);
  });

  it("picks up voices that finish loading asynchronously after attach", () => {
    fakeSynthesis = createFakeSynthesis([]); // not loaded yet, as in some browsers on first call
    (globalThis as unknown as { speechSynthesis: FakeSynthesis }).speechSynthesis = fakeSynthesis;
    document.documentElement.lang = "en-US";
    attach();

    const voice = makeVoice({ name: "Google US English", lang: "en-US", localService: false });
    fakeSynthesis.getVoices.mockReturnValue([voice]);
    const onVoicesChanged = fakeSynthesis.addEventListener.mock.calls.find(
      ([type]) => type === "voiceschanged",
    )?.[1] as (() => void) | undefined;
    onVoicesChanged?.();

    toggle().click();
    expect(fakeSynthesis.spoken[0]?.voice).toBe(voice);
  });

  it("stops and resets to idle via the stop button", () => {
    attach();
    toggle().click();
    stopBtn().click();
    expect(fakeSynthesis.cancel).toHaveBeenCalled();
    expect(wrapper().dataset.ttsState).toBe("idle");
  });

  it("stops on Escape while playing, but not while idle", () => {
    attach();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(fakeSynthesis.cancel).not.toHaveBeenCalled();

    toggle().click();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(fakeSynthesis.cancel).toHaveBeenCalled();
    expect(wrapper().dataset.ttsState).toBe("idle");
  });

  it("resets to idle when the last utterance finishes naturally", () => {
    attach();
    toggle().click();
    fakeSynthesis.spoken[fakeSynthesis.spoken.length - 1]?.dispatch("end");
    expect(wrapper().dataset.ttsState).toBe("idle");
  });

  it("ignores a stale finish event once a newer read has already started", () => {
    attach();
    toggle().click(); // read #1
    const staleLast = fakeSynthesis.spoken[fakeSynthesis.spoken.length - 1];
    stopBtn().click(); // back to idle
    toggle().click(); // read #2 (new session)

    staleLast?.dispatch("end"); // stale "end" from read #1
    expect(wrapper().dataset.ttsState).toBe("playing");
  });

  it("teardownTTS cancels any in-flight speech", () => {
    attach();
    toggle().click();
    teardownTTS();
    expect(fakeSynthesis.cancel).toHaveBeenCalled();
  });

  it("the returned cleanup function detaches all listeners", () => {
    const cleanup = attach();
    cleanup?.();
    activeCleanup = undefined;
    toggle().click();
    expect(fakeSynthesis.speak).not.toHaveBeenCalled();
  });

  it("wraps and unwraps the article's words around a read session", () => {
    attach();
    expect(article().querySelectorAll(".tts-word")).toHaveLength(0);

    toggle().click();
    expect(article().querySelectorAll(".tts-word").length).toBeGreaterThan(0);

    stopBtn().click();
    expect(article().querySelectorAll(".tts-word")).toHaveLength(0);
    expect(article().textContent).toBe("First.Second.");
  });

  describe("word highlighting", () => {
    beforeEach(() => {
      article().innerHTML = "<p>One two three.</p>";
    });

    it("highlights the word reported by a boundary event", () => {
      attach();
      toggle().click();
      const utter = fakeSynthesis.spoken[0];
      utter?.dispatch("start");
      // "two" starts at char index 4 in "One two three."
      utter?.dispatch("boundary", { name: "word", charIndex: 4 });

      expect(document.querySelector(".tts-word-active")?.textContent).toBe("two");
    });

    it("ignores non-word boundary events (e.g. sentence boundaries)", () => {
      attach();
      toggle().click();
      const utter = fakeSynthesis.spoken[0];
      utter?.dispatch("start");
      utter?.dispatch("boundary", { name: "sentence", charIndex: 4 });

      expect(document.querySelector(".tts-word-active")).toBeNull();
    });

    it("falls back to simulated timing when the engine never fires boundary events", () => {
      vi.useFakeTimers();
      attach();
      toggle().click();
      fakeSynthesis.spoken[0]?.dispatch("start");

      // Past the internal boundary-support probe window (350ms) with no
      // boundary event seen — the first word should light up on its own.
      vi.advanceTimersByTime(360);
      expect(document.querySelector(".tts-word-active")?.textContent).toBe("One");

      // Past "two"'s estimated duration too (word length based, well under 200ms more).
      vi.advanceTimersByTime(200);
      expect(document.querySelector(".tts-word-active")?.textContent).toBe("two");
    });
  });

  describe("click-to-seek", () => {
    beforeEach(() => {
      article().innerHTML = "<p>One two three.</p>";
    });

    it("clicking a word jumps playback to start reading from there", () => {
      attach();
      toggle().click();
      const spokenBeforeClick = fakeSynthesis.spoken.length;

      const words = article().querySelectorAll<HTMLElement>(".tts-word");
      expect(words).toHaveLength(3);
      words[2]!.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      const newTexts = fakeSynthesis.spoken.slice(spokenBeforeClick).map((u) => u.text);
      expect(newTexts).toEqual(["three."]);
    });

    it("does nothing when clicking a word while idle (words aren't wrapped yet)", () => {
      attach();
      expect(article().querySelectorAll(".tts-word")).toHaveLength(0);
      article().dispatchEvent(new MouseEvent("click", { bubbles: true }));
      expect(fakeSynthesis.speak).not.toHaveBeenCalled();
    });
  });

  describe("voice picker", () => {
    it("lists voices matching the page language, with Automatic selected by default", () => {
      const en = makeVoice({ name: "English Voice", lang: "en-US" });
      const de = makeVoice({ name: "German Voice", lang: "de-DE" });
      fakeSynthesis = createFakeSynthesis([en, de]);
      (globalThis as unknown as { speechSynthesis: FakeSynthesis }).speechSynthesis = fakeSynthesis;
      document.documentElement.lang = "en-US";
      attach();

      voiceBtn().click();
      expect(voiceOptions().map((o) => o.textContent)).toEqual([
        "Automatic",
        "English Voice (en-US)",
      ]);
      expect(voiceOptions()[0]!.getAttribute("aria-selected")).toBe("true");
    });

    it("selecting a voice overrides the automatic pick and persists it", () => {
      const local = makeVoice({
        name: "eSpeak NG",
        lang: "en-US",
        localService: true,
        default: true,
      });
      const cloud = makeVoice({ name: "Nice Cloud Voice", lang: "en-US", localService: false });
      fakeSynthesis = createFakeSynthesis([local, cloud]);
      (globalThis as unknown as { speechSynthesis: FakeSynthesis }).speechSynthesis = fakeSynthesis;
      document.documentElement.lang = "en-US";
      attach();

      voiceBtn().click();
      const localOption = voiceOptions().find((o) => o.textContent === "eSpeak NG (en-US)");
      localOption?.click();

      expect(window.localStorage.getItem("quartz-tts:voice")).toBe(local.voiceURI);

      toggle().click();
      expect(fakeSynthesis.spoken[0]?.voice).toBe(local); // overrides the cloud-preferring heuristic
    });

    it("switches the voice mid-read when a new one is picked while playing", () => {
      const local = makeVoice({ name: "eSpeak NG", lang: "en-US", localService: true });
      const cloud = makeVoice({ name: "Nice Cloud Voice", lang: "en-US", localService: false });
      fakeSynthesis = createFakeSynthesis([local, cloud]);
      (globalThis as unknown as { speechSynthesis: FakeSynthesis }).speechSynthesis = fakeSynthesis;
      document.documentElement.lang = "en-US";
      attach();
      toggle().click();
      expect(fakeSynthesis.spoken[0]?.voice).toBe(cloud);

      voiceBtn().click();
      const localOption = voiceOptions().find((o) => o.textContent === "eSpeak NG (en-US)");
      localOption?.click();

      expect(fakeSynthesis.spoken[fakeSynthesis.spoken.length - 1]?.voice).toBe(local);
      expect(wrapper().dataset.ttsState).toBe("playing");
    });

    it("Automatic clears a stored override", () => {
      window.localStorage.setItem("quartz-tts:voice", "some-voice-uri");
      const cloud = makeVoice({ name: "Nice Cloud Voice", lang: "en-US", localService: false });
      fakeSynthesis = createFakeSynthesis([cloud]);
      (globalThis as unknown as { speechSynthesis: FakeSynthesis }).speechSynthesis = fakeSynthesis;
      document.documentElement.lang = "en-US";
      attach();

      voiceBtn().click();
      voiceOptions()[0]?.click(); // "Automatic" is always first

      expect(window.localStorage.getItem("quartz-tts:voice")).toBeNull();
    });

    it("closes on Escape without stopping playback", () => {
      attach();
      toggle().click();
      voiceBtn().click();
      expect(voiceMenu().hidden).toBe(false);

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(voiceMenu().hidden).toBe(true);
      expect(wrapper().dataset.ttsState).toBe("playing");
    });
  });
});
