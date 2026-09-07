import { setOptions } from "./components/options";

export { default as TextToSpeech } from "./components/TextToSpeech";
export type { TextToSpeechOptions } from "./components/options";

export function init(options?: Record<string, unknown>): void {
  setOptions(options);
}

// Re-export shared types from @quartz-community/types
export type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
  StringResource,
} from "@quartz-community/types";
