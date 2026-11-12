# Piano verification

Run commands from `Homework 2`:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run test:browser
npm.cmd run build
```

`AudioTaskQueue.test.js` uses a deterministic monotonic fake clock to check replay
onset targets, independent releases, 0.5x/1x/2x timing, immutable snapshots,
validation, cleanup, and completion after release tails. `playback.spec.js` checks
the real-browser Record/Play flow, replay visuals, live-input/transport gates,
next-run speed selection, unchanged saved notes and 375px layout. Automated signal
and state checks do not establish audible quality. The explicit Stop Sequence
button and AbortController race tests belong to the following stage.

`npm test` runs the Node metadata/audio tests. `test:browser` runs the input suite
using installed Microsoft Edge, starting its own Vite server on port 5176.
Set `PLAYWRIGHT_CHANNEL` to select another installed compatible browser channel.

When a server is already running, or automatic process shutdown is restricted,
use a separate terminal for tests:

```powershell
# First terminal
npm.cmd run dev -- --host 127.0.0.1 --port 5175 --strictPort
# Second terminal
$env:TEST_BASE_URL = 'http://127.0.0.1:5175'
npm.cmd run test:browser
Remove-Item Env:TEST_BASE_URL
```

Browser tests use independent browser contexts. Failed-test traces are saved in
ignored `test-results/`. Add `-- --headed` to watch the browser suite.

The input suite checks mouse capture outside keys, cancellation/lost capture,
held Enter/Space and repeat suppression, mixed owners, Tab navigation, blur and
hidden-document cleanup, externally ended voices, pending initialization release,
assistive-click pulses, 375px overflow, emulated pen/touch chords, FIFO stolen-key
visuals, and StrictMode unmount/remount. It rejects browser console warnings/errors
and uncaught page exceptions. Native oscillator creation is counted to detect
duplicate activation; tests do not claim that a person heard the sound.

Physical touch/pen, actual tab switching, audible chord/release quality, screen
readers, other browser engines, and React DevTools render profiling remain manual.
The visibility test dispatches visibilitychange with a hidden document property;
it is not evidence of operating-system tab behavior.

Render isolation also has repeatable browser tests in `renderIsolation.spec.js`.
They count actual key-function executions via CDP, separately with and without
StrictMode, and collect root React Profiler callback data. See
[render-results.md](render-results.md) for measured counts and limitations. This
is not a capture from the React DevTools Profiler extension UI.
