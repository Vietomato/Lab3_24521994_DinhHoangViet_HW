# Production Studio Drum Kit

A React 19 drum studio with seven locally synthesized sounds, physical keyboard
shortcuts, volume controls, a 20-hit history, and a digital signal meter.

## Setup and commands

Use Node.js 24 and npm. All application commands run from `Homework 1`:

```powershell
cd "Homework 1"
npm.cmd ci
npm.cmd run dev -- --host 127.0.0.1
```

Open the URL printed by Vite (normally <http://127.0.0.1:5173/>).
`npm.cmd` avoids this machine's PowerShell restriction on `npm.ps1`.
In other shells, `npm` works with the same arguments.

```powershell
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1
npm.cmd test
```

The build writes ignored `dist/`. Preview serves that production build.
`npm test` runs unit and Edge browser tests; Edge must be installed.
Use `npm.cmd run test:unit` or `npm.cmd run test:browser` for subsets.
There is no lint script. See [test/README.md](test/README.md) for browser setup,
the restricted-process environment workaround, and test coverage.

## Controls

| Physical code | Key hint | Sound |
| --- | --- | --- |
| KeyW | W | Kick Drum |
| KeyA | A | Snare Drum |
| KeyS | S | Closed Hi-Hat |
| KeyD | D | Open Hi-Hat |
| KeyJ | J | Low Tom |
| KeyK | K | Hand Clap |
| KeyL | L | Rim Shot |

Shortcuts use physical key locations through `event.code`; printed letters can
differ on non-QWERTY layouts. Repeated keydowns, modified browser shortcuts,
and events in editable controls are ignored. Tab moves focus; Enter and Space
activate a focused pad. Mouse, touch, and pen use pointer events.

Volume ranges from mute to 100%, with headroom in the master gain. Turning off
letter shortcuts releases keyboard-held pads while pointer/native-button input
stays available. Clear history removes records without stopping sound.

## Architecture

- `src/config/drumPads.js`: one React-independent configuration array.
- `src/types.js`: shared JSDoc data and callback contracts.
- `src/App.jsx`: composes controls, pads, history, and meter.
- `src/components/`: native controls, accessible feedback, responsive markup.
- `src/hooks/useDrumActivation.js`: shared activation path, immutable held-input
  ownership by source, and bounded hit history.
- `src/hooks/useDrumKeyboard.js`: guarded global keydown/keyup listeners with
  current callbacks, disabling/blur/hidden cleanup, and listener removal.
- `src/hooks/useDrumAudio.js`: one lazy engine per effect lifecycle, volume, and
  playback errors. StrictMode setup after cleanup creates a fresh engine.
- `src/audio/DrumAudioEngine.js`: synthesis, master routing, analyser access,
  voice release, and idempotent disposal.
- `src/components/AudioMeter.jsx` and `src/audio/signalLevel.js`: RMS measurement
  from actual post-volume audio samples. Meter updates use DOM refs, not per-frame
  React state; reduced motion uses slower polling.
- `test/`: unit tests, browser regression tests, fixtures, and verification results.

## Local synthesis and cleanup

The first user activation creates/resumes Web Audio. Kick and tom use falling
sine oscillators; snare combines filtered generated noise and a triangle tone;
hats use filtered noise with different decay times; clap uses three noise pulses;
rim combines square and triangle oscillators. Each hit has its own envelope,
allowing overlapping voices. No service, API key, microphone, or downloaded drum
sample is needed.

Audio routes through master gain, analyser, and destination. Completed sources
release their nodes and noise buffers. Disposal stops remaining sources,
disconnects the graph, and closes the owned context. Meter cleanup stops its
frames/timers/listeners; the audio owner disposes the borrowed analyser.
Input listeners and native held states also clear on lifecycle cleanup.

## Verification results

On 2026-11-12, 7 unit tests and 12 Edge browser tests passed, along with the
production build. Tested flows produced no browser console warnings/errors,
uncaught page errors, or failed HTTP requests. A 375px production screenshot was
inspected; responsive overflow and visible focus checks passed.

Lighthouse 13.6.0 scored production Accessibility **100/100** with 375px mobile
emulation in headless Edge. Reports and the screenshot are local artifacts in
ignored `test-results/`; [test/RESULTS.md](test/RESULTS.md) records their scope.
This score does not establish full WCAG 2.2 AA compliance.

## Manual verification

1. Start Vite and use comfortable speaker volume. Listen to each pad and rapid,
   overlapping hits; confirm distinct sounds and smooth volume/mute changes.
2. Hold each shortcut and native Enter/Space: one hit per press, active feedback
   until release. Mix pointer and keyboard holds; release each source separately.
3. Tab through the skip link, controls, pads, and clear button. Confirm visible
   focus and meaningful names. Edit volume/shortcut controls without drum hits.
4. Disable shortcuts during a held letter. Pointer/native activation must remain
   available. Switch tabs, blur the window, cancel/drag pointers, and return;
   verify no stuck pads. Repeat on physical touch and pen devices.
5. Generate more than 20 hits; check newest-first history, latest-hit announcement,
   and clearing during playback. With a screen reader, verify polite announcements
   for repeated labels and that the full list/meter does not flood announcements.
6. Inspect at 375px, desktop widths, zoom, and reduced-motion settings. Verify
   the meter reacts to actual audio, returns to silence, and updates less often
   with reduced motion. Check contrast and assistive technology beyond Lighthouse.

For an independent speaker check, open `/test/manual.html`. Its random local WAV
is a test fixture only and is not used by the drum engine.

## Known limitations

- Audible sound quality, physical touch/pen, and actual screen-reader behavior
  still need manual verification. Automated signal measurements do not prove
  speaker output. Automated browser coverage is currently Edge only.
- Reduced-motion polling can miss very short transients. The meter shows RMS
  digital amplitude relative to full scale, not environmental loudness or dB SPL.
- History represents accepted inputs, including inputs followed by playback
  failure; accessible inline messages report audio errors. History/settings are
  in memory and reset on reload. No recording/export or persistence is provided.
- Headroom reduces clipping for the configured sounds but does not guarantee
  clipping-free playback under unlimited rapid overlapping hits.
- `crypto.randomUUID()` and Web Audio require a supported modern browser; use
  localhost for development and HTTPS when hosting. No hosting was performed.
- Automatic browser-test server teardown stalled in this restricted execution
  environment. The documented `TEST_BASE_URL` workflow completed successfully.
- The prompt log is updated locally but intentionally ignored by the existing
  `.gitignore` rule. No files are committed automatically.
