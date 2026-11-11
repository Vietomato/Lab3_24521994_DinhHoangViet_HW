import PianoKeyboard from './components/PianoKeyboard.jsx';
import { usePianoAudio } from './hooks/usePianoAudio.js';

/** Piano layout preview; audio and transport are implemented in later tasks. */
export default function App() {
  const { initialize, isReady, error } = usePianoAudio();
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
            {error || (isReady ? 'Audio initialized. Piano keys are not connected yet.' : 'Enable audio to initialize the local synthesizer.')}
          </p>
        </section>
        <section aria-labelledby="piano-heading">
          <h2 id="piano-heading">Your piano</h2>
          <PianoKeyboard />
        </section>
      </main>
    </>
  );
}
