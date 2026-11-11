import PianoKeyboard from './components/PianoKeyboard.jsx';

/** Piano layout preview; audio and transport are implemented in later tasks. */
export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="page-header">
        <h1>88-Key Polyphonic Piano</h1>
        <p>A space to play and explore.</p>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section aria-labelledby="piano-heading">
          <h2 id="piano-heading">Your piano</h2>
          <PianoKeyboard />
        </section>
      </main>
    </>
  );
}
