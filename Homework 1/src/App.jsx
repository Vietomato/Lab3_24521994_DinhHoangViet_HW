/** Minimal application shell; drum studio features are planned separately. */
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
          <h2 id="studio-heading">Your drum studio</h2>
          <p>Drum pads and audio controls are coming in the next steps.</p>
        </section>
      </main>
    </>
  );
}
