# Drum studio checks

Run commands from `Homework 1` using Node 24 and npm. Browser tests use installed
Microsoft Edge and `@playwright/test` from the development dependencies.

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run build
```

Run a subset with `npm.cmd run test:unit` or `npm.cmd run test:browser`.
To watch browser tests, run `npm.cmd run test:browser -- --headed`.
If Edge is unavailable, install a supported browser and select its channel using
`PLAYWRIGHT_CHANNEL`; for Playwright Chromium, use `chromium` and run
`npx.cmd playwright install chromium` first.

Browser tests start their own Vite server on port 5174 and close it afterward.
They do not reuse or modify your manual session on port 5173. Test failures retain
traces and screenshots in ignored `test-results/`. No microphone, external audio
service, API key, or downloaded drum sample is used.

If process-tree shutdown is restricted by your environment, start a separate
server yourself and point the tests at it:

```powershell
# In one terminal:
npm.cmd run dev -- --host 127.0.0.1 --port 5174 --strictPort
# In another terminal:
$env:TEST_BASE_URL = 'http://127.0.0.1:5174'
npm.cmd test
Remove-Item Env:TEST_BASE_URL
```

In this mode the suite leaves server shutdown to you (Ctrl+C in its terminal).

## Coverage

- Configuration: seven stable IDs/codes, distinct voice kinds, parameter bounds.
- Audio engine: lazy initialization, overlapping voices, master gain, completed
  node cleanup, failure/retry, disposal races, repeated disposal, fresh lifecycle.
- Signal calculation: silence, RMS, polarity, invalid samples, overload clamping.
- Browser checks: fail on console warnings/errors, uncaught exceptions, or HTTP
  failures in every tested flow; seven native pads, keyboard focus, 375px layout.
- Input: seven physical codes, held repeats, editable/nested regions, native
  Tab/Enter/Space, pointer capture/cancellation, mixed inputs, blur/hidden cleanup.
- Controls: label associations, mute/max volume, master gain, shortcut toggling.
- History: one entry per accepted input, newest-first ordering, timestamps,
  20-event cap, separate live announcement, clear without audio stop/close.
- Meter: actual overlapping audio, silence, reduced motion, React Profiler commit
  count, polling cleanup, analyser disconnection and context closure on unmount.
- Failure reporting: simulated audio-device initialization failure appears inline.
- Reference audio: local WAV decodes and advances playback after user interaction.

## Manual listening

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

Open <http://127.0.0.1:5173/test/manual.html> and play the short reference tone.
It is a locally generated 0.7-second WAV with a randomly selected frequency;
it is separate from the application's synthesized drum sounds. Regenerate it with
`npm.cmd run test:audio` if desired (this changes the fixture file).

Open <http://127.0.0.1:5173/> and listen to all seven pads. Try overlapping hits,
volume/mute, shortcuts on/off, pointer input, and focused-pad Enter/Space.
Use physical touch/pen devices and a screen reader for checks automation cannot
establish. A decoded waveform or progressing playback clock does not prove that
sound is audible through your speakers. Actual sound quality, screen-reader
announcements, Lighthouse scores, and full WCAG conformance are not asserted by
this suite. The suite currently runs Edge only.
