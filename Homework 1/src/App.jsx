import DrumPad from './components/DrumPad.jsx';
import { useState } from 'react';
import DrumControls from './components/DrumControls.jsx';
import HitHistory from './components/HitHistory.jsx';
import AudioMeter from './components/AudioMeter.jsx';
import { drumPads } from './config/drumPads.js';
import { useDrumAudio } from './hooks/useDrumAudio.js';
import { useDrumActivation } from './hooks/useDrumActivation.js';
import { useDrumKeyboard } from './hooks/useDrumKeyboard.js';

const padMap = new Map(drumPads.map((pad) => [pad.code, pad]));

/** Drum interface with shared audio activation and independently held inputs. */
export default function App() {
  const { trigger, error, volume, setVolume, getAnalyser } = useDrumAudio();
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);
  const { activePadIds, onActivate, onRelease, history, clearHistory } = useDrumActivation(trigger);
  useDrumKeyboard({ padMap, isEnabled: shortcutsEnabled, onActivate, onRelease });
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="page-header">
        <h1>Production Studio Drum Kit</h1>
        <p>A space for rhythm.</p>
      </header>
      <main id="main-content" tabIndex={-1}>
        <DrumControls volume={volume} onVolumeChange={setVolume}
          shortcutsEnabled={shortcutsEnabled} onShortcutsChange={setShortcutsEnabled} />
        <section aria-labelledby="studio-heading">
          <h2 id="studio-heading">Drum pads</h2>
          <p id="pad-instructions">
            Click or tap a pad, or use W, A, S, D, J, K, L. You can also focus a
            pad and use Enter or Space. Pads light up while held, rather than stay toggled on.
          </p>
          {error && <p role="alert">{error}</p>}
          <ul className="pad-grid" aria-label="Seven drum sounds">
            {drumPads.map((pad) => (
              <li key={pad.id}>
                <DrumPad pad={pad} isActive={activePadIds.has(pad.id)}
                  onActivate={onActivate} onRelease={onRelease} />
              </li>
            ))}
          </ul>
        </section>
        <HitHistory history={history} onClear={clearHistory} />
        <AudioMeter getAnalyser={getAnalyser} />
      </main>
    </>
  );
}
