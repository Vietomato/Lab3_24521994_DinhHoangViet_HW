import { useEffect, useId, useRef } from 'react';
import { measureSignalLevel } from '../audio/signalLevel.js';

/** @param {{ getAnalyser: () => AnalyserNode|null }} props */
export default function AudioMeter({ getAnalyser }) {
  const meterId = useId();
  const descriptionId = useId();
  const meterRef = useRef(null);
  const readoutRef = useRef(null);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = null;
    let timer = null;
    let samples = null;
    let lastUpdate = -Infinity;
    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      if (timer !== null) clearTimeout(timer);
      frame = timer = null;
    };
    const update = () => {
      const analyser = getAnalyser();
      let level = 0;
      if (analyser) {
        if (!samples || samples.length !== analyser.fftSize) samples = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(samples);
        level = measureSignalLevel(samples);
      }
      const text = level === 0 ? 'Silence' : `${Math.max(1, Math.round(level * 100))}% digital signal`;
      // Only these DOM nodes change; no React state or application rerenders per frame.
      meterRef.current.value = level;
      meterRef.current.setAttribute('aria-valuetext', text);
      readoutRef.current.textContent = text;
    };
    const tick = (now) => {
      if (document.hidden) return;
      if (motion.matches || now - lastUpdate >= 1000 / 30) {
        update();
        lastUpdate = now;
      }
      if (motion.matches) timer = setTimeout(() => tick(performance.now()), 250);
      else frame = requestAnimationFrame(tick);
    };
    const restart = () => {
      stop();
      lastUpdate = -Infinity;
      if (!document.hidden) tick(performance.now());
    };
    motion.addEventListener('change', restart);
    document.addEventListener('visibilitychange', restart);
    restart();
    return () => {
      stop();
      motion.removeEventListener('change', restart);
      document.removeEventListener('visibilitychange', restart);
      samples = null;
      // The analyser is borrowed; useDrumAudio owns/disconnects it on disposal.
    };
  }, [getAnalyser]);

  return (
    <section aria-labelledby={`${meterId}-heading`}>
      <h2 id={`${meterId}-heading`}>Audio signal</h2>
      <p id={descriptionId}>
        Digital signal level after master volume, relative to full scale. This measures
        the generated audio signal, not environmental loudness. Updates slow down with reduced motion.
      </p>
      <div className="audio-meter" aria-live="off">
        <label htmlFor={meterId}>Digital audio level</label>
        <meter ref={meterRef} id={meterId} min="0" max="1"
          aria-describedby={descriptionId} aria-valuetext="Silence" />
        <span ref={readoutRef}>Silence</span>
      </div>
    </section>
  );
}
