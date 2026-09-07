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

### Voice selection

The plugin doesn't offer a voice picker (see limitations below), but it also
doesn't just take whatever the browser calls its "default" — for the page's
language, it automatically prefers network/cloud voices (usually neural and
much more natural) over local ones, and avoids well-known robotic local
engines by name (`espeak`, `pico`, `festival`) when a better-sounding local
voice is also installed. If only one voice is available for that language,
this can't do anything about its quality — see the Linux note below.

## Configuration

| Option  | Type   | Default | Description                                               |
| ------- | ------ | ------- | --------------------------------------------------------- |
| `rate`  | number | `1`     | Speech rate, passed to `SpeechSynthesisUtterance.rate`.   |
| `pitch` | number | `1`     | Speech pitch, passed to `SpeechSynthesisUtterance.pitch`. |

The voice's language is taken automatically from the page's `<html lang>`
attribute (as set by Quartz's `locale` configuration) — there's no separate
voice option in v1.

## What gets read

The plugin walks the article's rendered DOM and reads block-level text (paragraphs,
list items, headings, blockquotes, table cells) in document order. It skips:

- Code blocks (`pre`) and their copy buttons
- Rendered math (`.katex`)
- Footnote reference markers and heading permalink icons
- Mermaid diagrams and other inline SVGs

Images are read using their `alt` text, if present; link text is read without
the URL.

## Known limitations (v1)

- No voice picker — voice is chosen automatically (see "Voice selection" above),
  with no way to override it manually.
- No word/sentence highlighting while reading, and no click-to-seek to a
  specific word.
- Resuming from pause restarts the current block from its beginning, not the
  exact word (see above).
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

A voice picker and read-along word highlighting (with click-to-seek) are
natural v2 additions.

## License

MIT
