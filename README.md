# quartz-tts

A [Quartz](https://quartz.jzhao.xyz) component plugin that adds a toolbar
button to read the current page's article aloud, using the browser's built-in
[Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
(`SpeechSynthesis`). No server, no API keys, no network requests — everything
runs client-side in the reader's browser.

## Installation

```shell
npx quartz plugin add github:gulerburak/quartz-tts
```

## Usage

Add it to your `quartz.config.yaml`, typically alongside `darkmode`/`reader-mode`
in the same toolbar group:

```yaml
plugins:
  - source: github:gulerburak/quartz-tts
    enabled: true
    options:
      rate: 1
      pitch: 1
    layout:
      position: left
      priority: 36
      group: toolbar
```

Clicking the button starts reading the page's `<article>` content from the
top. Clicking again pauses; clicking once more resumes. A stop button appears
next to it while reading or paused. Pressing <kbd>Escape</kbd> also stops.

"Pause" doesn't use the browser's native `speechSynthesis.pause()` — that API
is unreliable across engines (e.g. a no-op on Firefox with `espeak-ng` via
`speech-dispatcher` on Linux, where it flips state but audio keeps playing).
Instead, pausing cancels playback and remembers which block was interrupted;
resuming re-speaks that block from its start. This trades exact-word resume
precision for working consistently everywhere.

### Read-along highlighting and click-to-seek

While reading, the word currently being spoken is highlighted, and clicking
any other word jumps playback there immediately (works while playing or
paused). This relies on the browser firing `SpeechSynthesisUtterance`
`boundary` events; where it doesn't (e.g. Firefox with espeak-ng via
speech-dispatcher on Linux — the same engine this plugin already works around
for pause/resume), highlighting instead advances on an estimated per-word
timer. That's an approximation — it can drift over long sentences — but it
still tracks progress roughly, and click-to-seek is unaffected either way
since it doesn't depend on timing.

### Voice selection

A voice-picker button next to the toggle lists the voices available for the
page's language, plus an "Automatic" option. Automatic doesn't just take
whatever the browser calls its "default" — it prefers network/cloud voices
(usually neural and much more natural) over local ones, and avoids
well-known robotic local engines by name (`espeak`, `pico`, `festival`) when
a better-sounding local voice is also installed. Manually picking a voice
overrides that heuristic and is remembered (via `localStorage`) for next
time. If only one voice is available for the page's language, there's
nothing better for either the picker or the heuristic to offer — see the
Linux note below.

## Configuration

| Option  | Type   | Default | Description                                               |
| ------- | ------ | ------- | --------------------------------------------------------- |
| `rate`  | number | `1`     | Speech rate, passed to `SpeechSynthesisUtterance.rate`.   |
| `pitch` | number | `1`     | Speech pitch, passed to `SpeechSynthesisUtterance.pitch`. |

The voice's language is taken automatically from the page's `<html lang>`
attribute (as set by Quartz's `locale` configuration). The specific voice
within that language is chosen via the picker described above, not a
YAML option — it's a per-reader preference, not a per-site one.

## What gets read

The plugin walks the article's rendered DOM and reads block-level text (paragraphs,
list items, headings, blockquotes, table cells) in document order. It skips:

- Code blocks (`pre`) and their copy buttons
- Rendered math (`.katex`)
- Footnote reference markers and heading permalink icons
- Mermaid diagrams and other inline SVGs

Images are read using their `alt` text, if present (spoken in place, but not
visibly highlighted since there's no rendered text to highlight); link text
is read without the URL.

## Known limitations (v1)

- Resuming from pause restarts the current block from its beginning, not the
  exact word — clicking a specific word is the way to resume mid-block.
- Highlighting is exact when the browser fires `boundary` events, and an
  estimate (based on word length and rate) when it doesn't — see "Read-along
  highlighting" above. It can drift on long sentences in the estimated case.
- The button hides itself entirely in browsers without `window.speechSynthesis`.
- On Linux, `speechSynthesis` depends on `speech-dispatcher` having a working
  output module configured (e.g. `espeak-ng`) — some distros ship it with
  every module commented out by default. If the button does nothing, check
  `/etc/speech-dispatcher/speechd.conf` for an active `AddModule`/`DefaultModule`
  line, and fully restart the browser after fixing it (it may cache a stale
  connection from before the fix).
- If `espeak-ng` is the _only_ voice speech-dispatcher exposes, the automatic
  voice-quality preference above has nothing better to switch to — espeak-ng
  itself sounds robotic no matter which of its voices is picked. Installing
  an MBROLA voice for it (`espeak-ng --voices=mb` lists available ones) or a
  different local engine (e.g. `festival`) can help; browsers on Windows/macOS,
  or Chrome (which offers Google network voices), typically already expose
  much more natural-sounding options that this plugin will now prefer on its own.

## License

MIT
