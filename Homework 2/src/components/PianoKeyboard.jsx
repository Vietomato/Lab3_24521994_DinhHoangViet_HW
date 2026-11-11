import { useId } from 'react';
import PianoKey from './PianoKey.jsx';
import { pianoNotes } from '../music/notes.js';

// Two half-width columns per white key. A black key straddles the preceding
// white key's right boundary; no black slots are inserted between B/C or E/F.
let whiteCount = 0;
const positionedNotes = pianoNotes.map((note) => {
  const column = note.isBlack ? whiteCount * 2 : whiteCount++ * 2 + 1;
  return { note, style: Object.freeze({ gridColumn: `${column} / span 2` }) };
});

/**
 * @param {{ pressedMidi: ReadonlySet<number>, onNoteOn: import('../types.js').NoteOnCallback,
 * onNoteOff: import('../types.js').NoteOffCallback }} props
 */
export default function PianoKeyboard({ pressedMidi, onNoteOn, onNoteOff, disabled = false }) {
  const instructionsId = useId();
  return (
    <>
      <p id={instructionsId}>
        Use Tab and Shift+Tab to reach every note in pitch order, from A0 to C8.
        Focused keys scroll into view. Focus the piano region and use Left/Right
        to scroll, or use the scrollbar or swipe. Hold a key with mouse, touch,
        pen, Enter, or Space. Up to eight pitches can sound at once; the oldest
        is stolen at capacity and stays silent until released and pressed again.
        Live keys are disabled during replay.
      </p>
      <div className="piano-viewport" role="region" aria-label="88-key piano, A0 to C8"
        aria-describedby={instructionsId} tabIndex={0}>
        <div className="piano-keyboard">
          {positionedNotes.map(({ note, style }) => (
            <div key={note.midi} className={`piano-key-slot ${note.isBlack ? 'piano-key-slot--black' : ''}`}
              style={style}>
              <PianoKey midi={note.midi} noteName={note.noteName} isBlack={note.isBlack}
                isPressed={pressedMidi.has(note.midi)} onNoteOn={onNoteOn} onNoteOff={onNoteOff} disabled={disabled} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
