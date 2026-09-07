import type {
  QuartzComponent,
  QuartzComponentProps,
  QuartzComponentConstructor,
} from "@quartz-community/types";
import { classNames } from "@quartz-community/utils/lang";
import { i18n } from "../i18n";
import { getOptions } from "./options";
import style from "./styles/textToSpeech.scss";
// @ts-expect-error - inline script import handled by Quartz bundler
import script from "./scripts/textToSpeech.inline.ts";

const TextToSpeech: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
  const t = i18n(cfg?.locale ?? "en-US").components.textToSpeech;
  const { rate, pitch } = getOptions();

  return (
    <span
      class={classNames(displayClass, "tts")}
      data-tts-state="idle"
      data-tts-rate={rate}
      data-tts-pitch={pitch}
    >
      <button
        class="tts-toggle"
        type="button"
        aria-label={t.play}
        aria-pressed="false"
        data-label-play={t.play}
        data-label-pause={t.pause}
        data-label-resume={t.resume}
      >
        <svg class="tts-icon-play" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg class="tts-icon-pause" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
        </svg>
      </button>
      <button class="tts-stop" type="button" aria-label={t.stop}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6h12v12H6z" />
        </svg>
      </button>
    </span>
  );
};

TextToSpeech.css = style;
TextToSpeech.afterDOMLoaded = script;

export default (() => TextToSpeech) satisfies QuartzComponentConstructor;
