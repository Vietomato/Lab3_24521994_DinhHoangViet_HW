import PianoKeyboard from './components/PianoKeyboard.jsx';
import { usePianoAudio } from './hooks/usePianoAudio.js';
import { usePianoInput } from './hooks/usePianoInput.js';

/** Live piano input; recording and replay transport are added in later tasks. */
export default function App() {
  const { initialize, isReady, error, noteOn, noteOff, getActiveVoices, subscribeVoiceEnd } = usePianoAudio();
  const input = usePianoInput({ noteOn, noteOff, getActiveVoices, subscribeVoiceEnd });
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="page-header">
        <h1>88-Key Polyphonic Piano</h1>
        <p>A space to play and explore.</p>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section aria-labelledby="audio-heading">
          <h2 id="audio-heading">Audio setup</h2>
          <button className="audio-enable" type="button" onClick={initialize}>Enable audio</button>
          <p role="status" aria-live="polite">
            {error || (isReady ? 'Audio ready. Hold a piano key to play.' : 'Enable audio or press a piano key to start.')}
          </p>
        </section>
        <section aria-labelledby="piano-heading">
          <h2 id="piano-heading">Your piano</h2>
          <PianoKeyboard {...input} />
        </section>
      </main>
    </>
  );
}
