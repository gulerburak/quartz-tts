export { TextToSpeech } from './components/index.js';
export { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps, StringResource } from '@quartz-community/types';

interface TextToSpeechOptions {
    rate: number;
    pitch: number;
}

declare function init(options?: Record<string, unknown>): void;

export { type TextToSpeechOptions, init };
