# PianoKey render isolation — 2026-11-12

`PianoKey` already used `React.memo` with default shallow comparison. Review
confirmed primitive note props, one per-key `isPressed` boolean, and stable
`useCallback` handlers from the input hook. No pressed collection or inline
parent callback crosses the key boundary. Handlers created inside PianoKey do
not defeat its parent-facing memoization.

This task retained those boundaries, cached grid-slot style objects outside
rendering, and preserved the pressed-set state reference when engine ownership
changes without changing active pitches.

## Measured browser execution

The repeatable `renderIsolation.spec.js` test uses CDP precise JavaScript coverage
to count actual `PianoKey` function-body calls in Edge. Each measurement resets
the execution counters, separating initial mounting from updates. The fixture
also collects real root React `<Profiler>` callback data. Neither mechanism is
the React DevTools Profiler UI, which was unavailable in this session.

| Measurement | StrictMode off | StrictMode on |
| --- | ---: | ---: |
| Initial mount, all 88 keys | 88 | 176 |
| One note pressed | 1 | 2 |
| That note released | 1 | 2 |
| Add a second owner to the same pitch | 0 | 0 |
| Eight-note chord | 8 | 16 |
| Ninth note steals oldest: old/new keys change | 2 | 4 |
| Release remaining chord | 8 | 16 |

The tests also assert the corresponding controlled DOM state. StrictMode doubles
development component-body invocations here; it does not mean unrelated keys
updated. Initial mount counts are not update-render evidence.

An initial test incorrectly expected zero root Profiler commits when a second
owner was added. A root commit occurred while key-body calls remained zero.
Removed that overbroad assertion: the requirement is key isolation, not zero root
commits. Root commit callbacks alone do not identify which key bodies executed.

Final verification: 16 Node tests, 12 browser tests (including both isolation
variants), and production build passed. Browser run: 11.4 seconds; build: 116ms.
These durations describe this run, not general performance guarantees.

## Manual React DevTools follow-up

Open the app with the React DevTools Profiler extension. Enable recording why
components rendered if available. After mount, record an isolated press/release,
then a ninth distinct held pitch. Inspect PianoKey updates: one affected key for
normal press/release, and the stolen/new keys for stealing. Account for development
StrictMode. This UI-based capture remains **NOT VERIFIED**; no DevTools screenshot
or exported DevTools profile is claimed.

Run `npm.cmd run test:browser -- --grep "key-body isolation"` to repeat the CDP
checks. Use the `TEST_BASE_URL` workflow in `test/README.md` for an existing server.
