# Verification — 2026-11-12

Environment: Windows, Node 24.18.0, npm 11.16.0, installed Microsoft Edge via
Playwright. Final combined run exited successfully.

| Check | Result |
| --- | --- |
| Unit tests | 7 passed |
| Browser tests | 11 passed in 15.5 seconds |
| Browser console warnings/errors, page errors, HTTP failures | None in tested flows |
| Production build | Passed; 26 modules transformed |
| Git whitespace check | Passed; LF-to-CRLF conversion warnings only |
| Local audio sample | 252 Hz generated tone; 0.7-second mono WAV; decoded and playback clock advanced |

The browser suite covers the seven pads, physical keyboard codes, ignored
repeats/editable regions, focus/native buttons, mixed pointer/keyboard input,
cancellation, blur/hidden cleanup, controls, history order/limit/unique IDs,
meter signal/reduced motion/cleanup, failure reporting, and emulated touch.
See `README.md` for commands and the full coverage list.

The first nine-test browser run passed its assertions but stalled during automatic
server teardown in this restricted environment and was interrupted. The final
11-test run used a separately managed server on port 5174 with
`TEST_BASE_URL=http://127.0.0.1:5174`; all tests passed and the runner exited with
code 0. The test server was stopped afterward. The manual server on port 5173
was left running, and `/test/manual.html` returned HTTP 200.

No audible playback or sound quality was claimed from automated checks. Physical
touch/pen devices, real screen-reader announcements, other browser engines,
Lighthouse scores, and complete WCAG compliance remain outside this run.
