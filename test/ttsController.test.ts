// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attachTTS, teardownTTS } from "../src/lib/ttsController";

class FakeUtterance {
  text: string;
  rate = 1;
  pitch = 1;
  lang = "";
  private listeners: Record<string, Array<() => void>> = {};
  constructor(text: string) {
    this.text = text;
  }
  addEventListener(type: string, cb: () => void) {
    (this.listeners[type] ??= []).push(cb);
  }
  removeEventListener(type: string, cb: () => void) {
    this.listeners[type] = (this.listeners[type] ?? []).filter((fn) => fn !== cb);
  }
  dispatch(type: string) {
    (this.listeners[type] ?? []).forEach((cb) => cb());
  }
}

function createFakeSynthesis() {
  const spoken: FakeUtterance[] = [];
  return {
    spoken,
    speak: vi.fn((u: FakeUtterance) => spoken.push(u)),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  };
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
function wrapper(): HTMLElement {
  return document.querySelector(".tts") as HTMLElement;
}

beforeEach(() => {
  document.documentElement.lang = "";
  document.body.innerHTML = `
    <span class="tts" data-tts-state="idle" data-tts-rate="1" data-tts-pitch="1">
      <button class="tts-toggle" type="button" aria-label="Play"
        data-label-play="Play" data-label-pause="Pause" data-label-resume="Resume"></button>
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
    fakeSynthesis.cancel.mockClear(); // speakFrom() itself cancels defensively on every call

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
});
