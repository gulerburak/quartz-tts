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

- No voice picker — the browser's default voice for the page's language is used.
- No word/sentence highlighting while reading.
- Pause/resume relies on the browser's native `speechSynthesis.pause()`/`.resume()`,
  which is well-supported in Chrome/Edge/Safari but historically flaky in
  Firefox — if it gets stuck, stop and start again.
- The button hides itself entirely in browsers without `window.speechSynthesis`.

Both a voice picker and read-along highlighting are natural v2 additions.

## License

MIT
