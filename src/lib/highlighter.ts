/**
 * Character offset of each word within the single-space-joined text of a
 * chunk (i.e. what's actually passed to `SpeechSynthesisUtterance`).
 */
export function computeWordOffsets(words: string[]): number[] {
  const offsets: number[] = [];
  let pos = 0;
  for (const word of words) {
    offsets.push(pos);
    pos += word.length + 1; // +1 for the joining space
  }
  return offsets;
}

/** The index of the last word whose offset is at or before `charIndex`. */
export function findActiveWordIndex(offsets: number[], charIndex: number): number {
  let lo = 0;
  let hi = offsets.length - 1;
  let result = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (offsets[mid]! <= charIndex) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}

// Rough average speaking pace (~150 wpm at rate 1, ~6 chars/word incl. the
// trailing space) used only when the engine never fires "boundary" events
// (e.g. Firefox with espeak-ng/speech-dispatcher on Linux) — an approximate
// read-along highlight beats none at all, but it will drift over long chunks.
const BASE_MS_PER_CHAR = 60;
const MIN_WORD_MS = 120;

/** Estimated on-screen duration of each word, for the no-boundary-events fallback. */
export function estimateWordDurationsMs(words: string[], rate: number): number[] {
  const perChar = BASE_MS_PER_CHAR / (rate > 0 ? rate : 1);
  return words.map((word) => Math.max(MIN_WORD_MS, word.length * perChar));
}
