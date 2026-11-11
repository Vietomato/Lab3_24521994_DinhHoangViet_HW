/** Native transport controls; saved events change only on stop/clear. */
export default function TransportControls({ state, events, error, onRecord, onStopRecording, onClear }) {
  return (
    <section aria-labelledby="transport-heading">
      <h2 id="transport-heading">Recording</h2>
      <div className="transport-actions">
        <button type="button" onClick={onRecord} disabled={state !== 'idle'}>Record</button>
        <button type="button" onClick={onStopRecording} disabled={state !== 'recording'}>Stop Recording</button>
        <button type="button" onClick={onClear} disabled={state !== 'idle' || !events.length}>Clear</button>
      </div>
      <p role="status" aria-live="polite">{error || (state === 'recording' ? 'Recording live notes.' : `Idle. ${events.length} recorded notes.`)}</p>
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
