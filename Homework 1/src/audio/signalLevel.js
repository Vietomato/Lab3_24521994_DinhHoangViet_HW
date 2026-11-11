/** RMS amplitude relative to digital full scale, clamped to the meter's [0, 1]. */
export function measureSignalLevel(samples) {
  if (!samples.length) return 0;
  let sum = 0;
  for (const sample of samples) sum += sample * sample;
  const rms = Math.sqrt(sum / samples.length);
  return Number.isFinite(rms) && rms >= 0.00001 ? Math.min(1, rms) : 0;
}
