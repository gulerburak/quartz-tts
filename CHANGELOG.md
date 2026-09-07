# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Read-along word highlighting: the word currently being spoken is
  highlighted live. Uses native `boundary` events where the engine fires
  them, falling back to an estimated per-word timer where it doesn't (e.g.
  Firefox + espeak-ng/speech-dispatcher on Linux).
- Click-to-seek: click any word (while playing or paused) to jump playback
  there immediately.
- A voice-picker button lists the voices available for the page's language
  plus an "Automatic" option, letting a reader override the automatic
  voice-quality heuristic. The choice is remembered via `localStorage`.

### Fixed

- Voice selection now automatically prefers higher-quality voices for the
  page's language — network/cloud voices (usually neural) over local ones,
  and known robotic local engines (`espeak`, `pico`, `festival`) are avoided
  when a better-sounding local voice is also installed — instead of leaving
  the browser's own "default" pick, which is often the harshest option.
- Pause/resume no longer relies on the native `speechSynthesis.pause()`/`.resume()`,
  which is a no-op on some engines (e.g. Firefox + espeak-ng/speech-dispatcher
  on Linux). Pausing now cancels and remembers the interrupted block; resuming
  re-speaks that block from its start.

### Added

- Initial release: a toolbar button that reads the current page's article
  aloud using the browser's native `SpeechSynthesis` API. Play/pause/resume/stop,
  `rate`/`pitch` options, automatic voice/language via the page's `<html lang>`,
  and graceful hide when speech synthesis isn't supported.
