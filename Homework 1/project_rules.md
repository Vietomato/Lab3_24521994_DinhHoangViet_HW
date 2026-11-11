# LLM IDE: Codex - GPT 6.1 Sol Medium Level.
# Production Studio Drum Kit — Project Rules

## 1. Scope and stack

Build a seven-pad drum studio with React 19, Vite, and modern JavaScript. Use function components, Hooks, and JSDoc contracts. Reuse an existing working project and its package manager. Keep code small, readable, and easy to explain.

Map the seven pads to physical codes KeyW, KeyA, KeyS, KeyD, KeyJ, KeyK, and KeyL. Generate the interface from one configuration array with unique stable IDs. Name the physical-code field `code`.

Use the browser's built-in Web Audio API to synthesize sounds locally. No API keys, external audio services, paid services, or downloaded samples are required.

## 2. Required documents

- `project_rules.md`: implementation constraints; read before each task.
- `task_decomposition.md`: task scope, contracts, acceptance criteria, and commit plan.
- `PROMPT_LOG.md`: actual prompts received, changes made, checks performed, and limitations.
- `AI_FAILURE_AUDIT.md`: actual defects, reproduction steps, causes, fixes, and verification evidence. Target at least three verified defects; explicitly report a shortfall instead of inventing defects.
- `README.md`: setup, commands, controls, architecture, manual checks, and known limitations.

Do not claim that planned tasks, tests, or commits have already been completed.

## 3. React and state

- Do not use class-based React components, ReactDOM.render, component defaultProps, KeyboardEvent.keyCode, or window.alert.
- Use immutable state updates and functional setters when updates depend on previous state.
- Use stable IDs as list keys; never array indexes for event history or pads.
- Derive values during rendering instead of synchronizing redundant state with effects.
- Keep audio objects and mutable input tracking in refs or dedicated engine objects, outside render-time construction.
- Use stable callbacks and configuration where they prevent stale closures or unnecessary listener registration. Do not add memoization without a reason.
- Separate configuration, components, hooks, and audio behavior. Do not create unnecessary abstractions.

## 4. Input behavior

- Pads must be native `button type="button"` elements.
- Support mouse, touch, pen, and native Enter/Space activation.
- Use one shared activation path for sound, visual feedback, and hit recording. One intended activation creates exactly one hit.
- Avoid duplicate pointer/click activation. Handle pointerup, pointercancel, and lost pointer capture.
- Use keydown/keyup and event.code for global letter shortcuts. Ignore event.repeat.
- Ignore shortcuts originating in input, textarea, select, or contenteditable regions, including nested editable descendants.
- Call preventDefault only when handling a valid shortcut. Preserve Tab, Enter, Space, and browser behavior elsewhere.
- Clear keyboard-held states on blur, document hidden, and shortcut disabling. Handle overlapping input sources without stuck pads.
- Keep pointer activation available when keyboard shortcuts are disabled.

## 5. Audio lifecycle

- Create or resume AudioContext only after user interaction. Handle suspended contexts and rejected initialization gracefully.
- Support overlapping sounds through a master GainNode with sensible levels to reduce clipping.
- Expose trigger, setVolume, meter access, and idempotent disposal through the engine contract.
- Release finished nodes and disconnect remaining nodes on disposal. Stop animation frames and timers.
- Make effect setup/cleanup robust under React StrictMode: cleanup must not leave later setup with an unusable disposed engine.
- Present errors through accessible inline messages, never alerts or fabricated playback success.

## 6. Accessibility and visual feedback

- Prefer main, header, section, headings, lists, output, and other meaningful HTML. Use generic containers only where appropriate.
- Give every pad a readable accessible name. Reflect its actual active state with aria-pressed; explain momentary behavior in the interface.
- Show focus-visible indicators. Never communicate active state solely through color.
- Associate volume and shortcut controls with labels using useId.
- Announce the latest hit through output with aria-live="polite". Keep full history outside the live region.
- Keep at most 20 history events with stable event IDs and timestamps. Clearing history must not interrupt audio.
- Use AnalyserNode for the visual meter. Avoid whole-app updates on every frame and do not announce every frame.
- Label any decibel display as relative digital dBFS, not environmental dB SPL. Handle silence without invalid numeric output.
- Respect prefers-reduced-motion with simplified or less frequent visual updates.
- Target WCAG 2.2 AA and Lighthouse Accessibility 100. A Lighthouse result alone does not prove WCAG compliance.

## 7. Responsive layout

At 375px viewport width, all controls and pads must remain usable with no page-level horizontal overflow. Maintain readable labels, adequate spacing, visible focus, and meaningful hit feedback on narrow screens.

## 8. Verification and security

- Run the production build after implementation changes. Run lint and relevant tests when scripts exist.
- Add focused behavioral tests where valuable for shortcut guards, cleanup, and duplicate-hit prevention; avoid tests that merely repeat implementation details.
- Manually verify sound, simultaneous hits, keyboard navigation, focus isolation, blur, tab switching, volume, and responsive behavior.
- Report exactly which checks ran and which remain manual. Never fabricate Lighthouse scores, screenshots, Profiler results, or heard audio.
- Render text safely; avoid dangerouslySetInnerHTML and untrusted HTML.
- Never commit node_modules, dist, environment secrets, credentials, or temporary output. Preserve unrelated work.

## 9. Development and Git workflow

Follow contract-first development: define the task and acceptance criteria, implement one small change, verify, review the diff, and commit.

The implementation requires at least 10 meaningful atomic commits. The task plan proposes 12. Do not create empty commits, reconstruct fictional history, or redo completed work just to reach a count.

Do not commit automatically: the user reviews and commits each step unless explicitly requesting automatic commits. Do not push, force-push, reset, or rewrite history without authorization.

Before committing, inspect git status, git diff, and git diff --cached. Stage only the current task's files. Include truthful prompt-log updates with the corresponding change.
