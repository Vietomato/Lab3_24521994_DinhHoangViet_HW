const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3,
});

/**
 * @param {{ history: import('../types.js').HitEvent[], onClear: () => void }} props
 */
export default function HitHistory({ history, onClear }) {
  const latest = history[0];
  return (
    <section aria-labelledby="history-heading">
      <h2 id="history-heading">Hit history</h2>
      <output className="latest-hit" aria-live="polite" aria-atomic="true">
        {latest ? (
          <span key={latest.id}>Latest hit: {latest.label} at {timeFormat.format(latest.timestampMs)}</span>
        ) : 'No hits recorded.'}
      </output>
      <p>Most recent first. Keeping up to 20 hits.</p>
      <button className="clear-history" type="button" onClick={onClear} disabled={!history.length}>
        Clear history
      </button>
      {history.length > 0 && (
        <ol className="hit-history" aria-label="Recent drum hits">
          {history.map((event) => (
            <li key={event.id}>
              <span>{event.label}</span>
              <time dateTime={new Date(event.timestampMs).toISOString()}>
                {timeFormat.format(event.timestampMs)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
