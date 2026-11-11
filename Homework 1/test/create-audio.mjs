import { randomInt } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

// A locally generated listening reference, independent of the drum engine.
const rate = 44100;
const duration = 0.7;
const frequency = randomInt(180, 441);
const frames = Math.floor(rate * duration);
const wav = Buffer.alloc(44 + frames * 2);
wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28);
wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
wav.write('data', 36); wav.writeUInt32LE(frames * 2, 40);
for (let i = 0; i < frames; i++) {
  const time = i / rate;
  const envelope = Math.min(1, time / 0.005) * Math.exp(-time * 9) * Math.min(1, (duration - time) / 0.01);
  wav.writeInt16LE(Math.round(Math.sin(2 * Math.PI * frequency * time) * envelope * 0.25 * 32767), 44 + i * 2);
}
await mkdir(new URL('./fixtures/', import.meta.url), { recursive: true });
await writeFile(new URL('./fixtures/random-tone.wav', import.meta.url), wav);
console.log(`Created local ${frequency} Hz test audio: 0.7s mono WAV. No downloaded sample.`);
