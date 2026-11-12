# Arena verification

Environment: Windows, Node 24.18.0, React 19, Vite 8.3.8, headless Microsoft
Edge. Checks use local demo data only.

| Check | Status | Actual evidence |
| --- | --- | --- |
| Existing automated suite | PASS | `npm.cmd test`: 52 passed, 0 failed. |
| Production build | PASS | `npm.cmd run build`: 28 modules transformed, exit 0. |
| Production browser integration | PASS | `npm.cmd run test:browser` against preview port 4177, exit 0. |
| Countdown and visible-event resync | PASS | Hook/jsdom controlled clock, target/offset changes and visibility event tests. |
| Real background-tab throttling | NOT VERIFIED | Controlled events do not reproduce actual browser suspension. |
| Four phase boundaries/precedence | PASS | Pure tests cover exact opening/expiry and stock precedence; browser exercises live, sellout and expiry. |
| VND format | PASS | Browser compares displayed price with vi-VN Intl currency output. |
| Optimistic claims/reconciliation | PASS | Hook and browser cover pending, success, 409, network retry and confirmed-vs-speculative zero. |
| Double clicks/idempotency/last item | PASS | Same-tick browser clicks, service duplicate IDs/contention, browser final-item claim. |
| Expiry pending/reset races | PASS | Service/hook tests plus production browser; obsolete responses/finally ownership tested. |
| Leaderboard selectors | PASS | All metrics/directions, ties, trim/case/empty search and frozen-source immutability tests. |
| Virtual window/DOM bounds | PASS | Pure bounds tests; browser end/filter/reset/PageDown checks with <=12 rows. |
| StrictMode/resource cleanup | PASS | React/jsdom effect lifecycle and tracked service timers/abort listeners. |
| Keyboard/labels/focus | PASS | Edge Tab/Enter skip link, Space claim, PageDown feed, associated labels and 3px focus outline. |
| Status markup | PASS | Polite claim/reset feedback; countdown remains outside live regions. |
| Screen-reader speech/full WCAG | NOT VERIFIED | Requires manual assistive-technology review. |
| Contrast/automated accessibility | PASS | Lighthouse 13.6.0 Accessibility 100/100, no failed scored audits. |
| Mobile page overflow | PASS | Edge 375x812 document scrollWidth <= innerWidth. |
| Lint | NOT VERIFIED | No lint script/configuration exists. |
| Other engines/audible review | NOT VERIFIED | Edge only; this project has no audio feature. |

Lighthouse ran against the production preview with `--only-categories=accessibility`
and installed Edge. Reports are local ignored files under
`.npm-cache/arena-accessibility.report.{json,html}`. A slow-CPU warning was
reported; no performance score is claimed. Accessibility 100 is not proof of
complete WCAG compliance. No functional defect was confirmed in this review;
stale README descriptions were corrected. Failure audit files are excluded
from this final commit as requested.

History: ten actual implementation commits preceded the final verification
commit. Use `git log --oneline Homework-2..Homework-3` to inspect them. No empty
commit, history rewrite or forced push is needed.
