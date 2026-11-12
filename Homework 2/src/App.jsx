import PianoKeyboard from './components/PianoKeyboard.jsx';
import { usePianoAudio } from './hooks/usePianoAudio.js';
import { usePianoInput } from './hooks/usePianoInput.js';
import { useRecorder } from './hooks/useRecorder.js';
import TransportControls from './components/TransportControls.jsx';
import { usePlayback } from './hooks/usePlayback.js';

/** Live piano, immutable FIFO recording and mutually exclusive replay. */
export default function App() {
  const { initialize, isReady, error, noteOn, noteOff, getActiveVoices, subscribeVoiceEnd, waitForVoice } = usePianoAudio();
  const recording = useRecorder();
  const input = usePianoInput({ noteOn, noteOff, getActiveVoices, subscribeVoiceEnd,
    onLiveNoteOn: recording.onLiveNoteOn, onLiveNoteOff: recording.onLiveNoteOff, canPlayLive: recording.canPlayLive });
  const playback = usePlayback({ initialize, noteOn, noteOff, waitForVoice, events: recording.events,
    clearHeld: input.clearHeld, beginPlayback: recording.beginPlayback, endPlayback: recording.endPlayback,
    refreshPressed: input.refreshPressed });
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="page-header">
        <h1>88-Key Polyphonic Piano</h1>
        <p>A space to play and explore.</p>
      </header>
      <main id="main-content" tabIndex={-1}>
        <TransportControls state={recording.state} events={recording.events} error={recording.error || playback.error}
          onRecord={() => { input.clearHeld(); recording.startRecording(); }}
          onStopRecording={() => { recording.stopRecording(); input.clearHeld(); }}
          onClear={recording.clearRecording} onPlay={playback.play} speed={playback.speed} onSpeedChange={playback.setSpeed} />
        <section aria-labelledby="audio-heading">
          <h2 id="audio-heading">Audio setup</h2>
          <button className="audio-enable" type="button" onClick={initialize}>Enable audio</button>
          <p role="status" aria-live="polite">
            {error || (isReady ? 'Audio ready. Hold a piano key to play.' : 'Enable audio or press a piano key to start.')}
          </p>
        </section>
        <section aria-labelledby="piano-heading">
          <h2 id="piano-heading">Your piano</h2>
          <PianoKeyboard pressedMidi={input.pressedMidi} onNoteOn={input.onNoteOn} onNoteOff={input.onNoteOff} disabled={recording.state === 'playing'} />
        </section>
      </main>
    </>
  );
}
