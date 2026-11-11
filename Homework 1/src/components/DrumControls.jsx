import { useId } from 'react';

/** Controlled volume and shortcut settings. */
export default function DrumControls({ volume, onVolumeChange, shortcutsEnabled, onShortcutsChange }) {
  const volumeId = useId();
  const shortcutsId = useId();
  return (
    <section className="studio-controls" aria-labelledby="controls-heading">
      <h2 id="controls-heading">Studio controls</h2>
      <div className="volume-control">
        <label htmlFor={volumeId}>Volume</label>
        <input id={volumeId} type="range" min="0" max="1" step="0.01"
          value={volume} aria-valuetext={`${Math.round(volume * 100)} percent`}
          onChange={(event) => onVolumeChange(Number(event.target.value))} />
        <output htmlFor={volumeId}>{Math.round(volume * 100)}%</output>
      </div>
      <div className="shortcut-control">
        <input id={shortcutsId} type="checkbox" checked={shortcutsEnabled}
          onChange={(event) => onShortcutsChange(event.target.checked)} />
        <label htmlFor={shortcutsId}>Enable keyboard shortcuts</label>
      </div>
      <p>Click, tap, and focused-pad Enter/Space activation stay available when shortcuts are off.</p>
    </section>
  );
}
