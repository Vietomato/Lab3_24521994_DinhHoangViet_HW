/**
 * A presentational pad; the parent owns its momentary active state.
 * @param {import('../types.js').DrumPadProps} props
 */
export default function DrumPad({ pad, isActive }) {
  return (
    <button
      type="button"
      className="drum-pad"
      aria-pressed={isActive}
      aria-describedby="pad-instructions"
    >
      <kbd className="drum-pad__shortcut">{pad.code.slice(3)}</kbd>
      <span className="drum-pad__name">{pad.label}</span>
      <span className="drum-pad__status" aria-hidden="true">
        {isActive ? '● Active' : '○ Ready'}
      </span>
    </button>
  );
}
