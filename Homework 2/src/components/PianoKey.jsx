import { memo } from 'react';

/**
 * Native input handlers; audio and ownership remain in the hooks/engine.
 * @param {import('../types.js').PianoKeyProps} props
 */
function PianoKey({ midi, noteName, isBlack, isPressed, onNoteOn, onNoteOff, disabled = false }) {
  const nativeOwner = key => `native:${midi}:${key}`;
  const releasePointer = event => onNoteOff(midi, `pointer:${event.pointerId}`);
  return (
    <button
      type="button"
      className={`piano-key ${isBlack ? 'piano-key--black' : 'piano-key--white'}`}
      aria-label={`${noteName.replace('#', ' sharp ')} piano key`}
      aria-pressed={isPressed}
      disabled={disabled}
      data-midi={midi}
      onPointerDown={event => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        onNoteOn(midi, `pointer:${event.pointerId}`);
      }}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onLostPointerCapture={releasePointer}
      onKeyDown={event => {
        if (!['Enter', ' '].includes(event.key)) return;
        // Replace only this key's activation default, avoiding repeat clicks/scroll.
        event.preventDefault();
        if (!event.repeat) onNoteOn(midi, nativeOwner(event.key));
      }}
      onKeyUp={event => {
        if (!['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        onNoteOff(midi, nativeOwner(event.key));
      }}
      onBlur={() => {
        onNoteOff(midi, nativeOwner('Enter'));
        onNoteOff(midi, nativeOwner(' '));
      }}
      onClick={event => {
        // Pointer paths already started; native key defaults were handled above.
        if (event.detail === 0) onNoteOn(midi, `assistive:${midi}`, 120);
      }}
    >
      <span className="piano-key__name">{noteName}</span>
      <span className="piano-key__state" aria-hidden="true">{isPressed ? '▼ Held' : '○'}</span>
    </button>
  );
}

// Default shallow comparison is intentional: callbacks must never be ignored.
// Internal event handlers are created only when this key itself renders.
export default memo(PianoKey);
