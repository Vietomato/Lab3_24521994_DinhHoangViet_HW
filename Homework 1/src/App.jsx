import DrumPad from './components/DrumPad.jsx';
import { drumPads } from './config/drumPads.js';

/** Pad interface preview; audio and input integration are planned separately. */
export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="page-header">
        <h1>Production Studio Drum Kit</h1>
        <p>A space for rhythm.</p>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section aria-labelledby="studio-heading">
          <h2 id="studio-heading">Drum pads</h2>
          <p id="pad-instructions">
            Interface preview: sound and keyboard shortcuts are not connected yet.
            Pads will light up only while pressed, rather than stay toggled on.
          </p>
          <ul className="pad-grid" aria-label="Seven drum sounds">
            {drumPads.map((pad) => (
              <li key={pad.id}>
                <DrumPad pad={pad} isActive={false} />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
