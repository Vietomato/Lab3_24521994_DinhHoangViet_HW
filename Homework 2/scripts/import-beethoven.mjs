import fs from 'node:fs';
import { parseMidi } from 'midi-file';

const midi = parseMidi(fs.readFileSync(new URL('../assets/pathetique-3.mid', import.meta.url)));
const events = midi.tracks.flatMap((track, trackIndex) => {
  let tick = 0;
  return track.map((event, order) => ({ ...event, tick: tick += event.deltaTime, trackIndex, order }));
}).sort((a, b) => a.tick - b.tick || a.trackIndex - b.trackIndex || a.order - b.order);
let lastTick = 0, ms = 0, tempo = 500000;
const held = new Map(), notes = [];
for (const event of events) {
  ms += (event.tick - lastTick) * tempo / midi.header.ticksPerBeat / 1000;
  lastTick = event.tick;
  if (event.type === 'setTempo') tempo = event.microsecondsPerBeat;
  const key = `${event.trackIndex}:${event.channel}:${event.noteNumber}`;
  if (event.type === 'noteOn' && event.velocity > 0) {
    const note = { midi: event.noteNumber, onset: ms, duration: 0 };
    notes.push(note);
    const queue = held.get(key) ?? []; queue.push(note); held.set(key, queue);
  } else if (event.type === 'noteOff' || (event.type === 'noteOn' && event.velocity === 0)) {
    const note = held.get(key)?.shift();
    if (note) note.duration = ms - note.onset;
  }
}
if ([...held.values()].some((queue) => queue.length)) throw new Error('Unreleased source notes');
notes.sort((a, b) => a.onset - b.onset);
const tuples = notes.map((note) => [note.midi, +note.onset.toFixed(3), +note.duration.toFixed(3)]);
fs.writeFileSync(new URL('../src/music/beethoven-notes.json', import.meta.url), JSON.stringify(tuples));
console.log(`Imported ${tuples.length} notes; ${(ms / 1000).toFixed(1)} seconds.`);
