export interface TextToSpeechOptions {
  rate: number;
  pitch: number;
}

const defaultOptions: TextToSpeechOptions = { rate: 1, pitch: 1 };

// `index.ts` (init()) and `components/index.ts` (the component reading these
// options) are bundled as two separate tsup entry points with no shared
// chunks (splitting is disabled), so each gets its own copy of this module's
// closure. A plain module-scoped variable would NOT be shared between them.
// Stashing state on `globalThis` under a namespaced Symbol.for key is the
// pattern Quartz itself documents for this exact cross-bundle-singleton
// problem (see the ViewRegistry example in "Making your own plugins").
const OPTIONS_KEY = Symbol.for("quartz-tts:options");

type GlobalWithOptions = typeof globalThis & { [OPTIONS_KEY]?: TextToSpeechOptions };

export function setOptions(options?: Record<string, unknown>): void {
  (globalThis as GlobalWithOptions)[OPTIONS_KEY] = {
    rate: typeof options?.rate === "number" ? options.rate : defaultOptions.rate,
    pitch: typeof options?.pitch === "number" ? options.pitch : defaultOptions.pitch,
  };
}

export function getOptions(): TextToSpeechOptions {
  return (globalThis as GlobalWithOptions)[OPTIONS_KEY] ?? defaultOptions;
}
