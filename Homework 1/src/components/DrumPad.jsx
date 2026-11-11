/**
 * A native pad button; the parent owns its momentary active state.
 * @param {import('../types.js').DrumPadProps} props
 */
export default function DrumPad({ pad, isActive, onActivate, onRelease }) {
  const releasePointer = (event) => onRelease(pad.id, 'pointer', `pointer:${event.pointerId}`);
  return (
    <button
      type="button"
      className="drum-pad"
      aria-pressed={isActive}
      aria-describedby="pad-instructions"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        onActivate(pad, 'pointer', `pointer:${event.pointerId}`);
      }}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onLostPointerCapture={releasePointer}
      onClick={(event) => {
        // Pointer-down already activated. Native keyboard/assistive clicks have detail 0.
        if (event.detail !== 0) return;
        onActivate(pad, 'native', `native:${pad.id}`);
        onRelease(pad.id, 'native', `native:${pad.id}`);
      }}
    >
      <kbd className="drum-pad__shortcut">{pad.code.slice(3)}</kbd>
      <span className="drum-pad__name">{pad.label}</span>
      <span className="drum-pad__status" aria-hidden="true">
        {isActive ? '● Active' : '○ Ready'}
      </span>
    </button>
  );
}
