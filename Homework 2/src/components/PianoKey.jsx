import { memo } from 'react';

/**
 * Controlled presentation only; input/audio ownership is added in a later task.
 * @param {Pick<import('../types.js').PianoKeyProps, 'midi'|'noteName'|'isBlack'|'isPressed'>} props
 */
function PianoKey({ midi, noteName, isBlack, isPressed }) {
  return (
    <button
      type="button"
      className={`piano-key ${isBlack ? 'piano-key--black' : 'piano-key--white'}`}
      aria-label={`${noteName.replace('#', ' sharp ')} piano key`}
      aria-pressed={isPressed}
      data-midi={midi}
    >
      <span className="piano-key__name">{noteName}</span>
      <span className="piano-key__state" aria-hidden="true">{isPressed ? '▼ Held' : '○'}</span>
    </button>
  );
}

export default memo(PianoKey);
