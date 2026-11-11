import { useId } from 'react';

/** Native controls; saved data and speed are snapshotted for each replay. */
export default function TransportControls({ state, events, error, onRecord, onStopRecording, onClear, onPlay, speed, onSpeedChange }) {
  const speedId = useId();
  return (
    <section aria-labelledby="transport-heading">
      <h2 id="transport-heading">Recording and replay</h2>
      <div className="transport-actions">
        <button type="button" onClick={onRecord} disabled={state !== 'idle'}>Record</button>
        <button type="button" onClick={onStopRecording} disabled={state !== 'recording'}>Stop Recording</button>
        <button type="button" onClick={onClear} disabled={state !== 'idle' || !events.length}>Clear</button>
        <button type="button" onClick={onPlay} disabled={state !== 'idle' || !events.length}>Play Sequence</button>
      </div>
      <div className="transport-speed">
        <label htmlFor={speedId}>Replay speed</label>
        <select id={speedId} value={speed} onChange={event => onSpeedChange(Number(event.target.value))}>
          <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option>
        </select>
      </div>
      <p>Speed changes apply to the next replay. Live keys and recording are disabled while playing.</p>
      <p role="status" aria-live="polite">{error || (state === 'recording' ? 'Recording live notes.'
        : state === 'playing' ? 'Playing recorded sequence.' : `Idle. ${events.length} recorded notes.`)}</p>
      {events.length > 0 && (
        <details><summary>Recorded notes, in onset order</summary>
          <ol className="recorded-notes">
            {events.map(event => <li key={event.id}>
              MIDI {event.midi}: gap {event.deltaMs.toFixed(1)} ms, duration {event.durationMs.toFixed(1)} ms
            </li>)}
          </ol>
        </details>
      )}
    </section>
  );
}
