# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Pause/resume no longer relies on the native `speechSynthesis.pause()`/`.resume()`,
  which is a no-op on some engines (e.g. Firefox + espeak-ng/speech-dispatcher
  on Linux). Pausing now cancels and remembers the interrupted block; resuming
  re-speaks that block from its start.

### Added

- Initial release: a toolbar button that reads the current page's article
  aloud using the browser's native `SpeechSynthesis` API. Play/pause/resume/stop,
  `rate`/`pitch` options, automatic voice/language via the page's `<html lang>`,
  and graceful hide when speech synthesis isn't supported.
