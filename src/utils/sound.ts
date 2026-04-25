/**
 * sound.ts — Retro modem handshake synthesiser using the Web Audio API.
 * Every sound is generated algorithmically; no audio files are loaded or required.
 */

/** Create and schedule a simple sine-wave tone burst. */
function scheduleOscillator(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  endTime: number,
  gainValue = 0.28,
  type: OscillatorType = 'sine',
): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g);
  g.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(gainValue, startTime + 0.01);
  g.gain.setValueAtTime(gainValue, Math.max(startTime + 0.01, endTime - 0.01));
  g.gain.linearRampToValueAtTime(0, endTime);
  osc.start(startTime);
  osc.stop(endTime + 0.05);
}

/** North-American dial tone: 350 Hz + 440 Hz. */
export function scheduleDialTone(ctx: AudioContext, t: number, duration: number): void {
  scheduleOscillator(ctx, 350, t, t + duration, 0.22);
  scheduleOscillator(ctx, 440, t, t + duration, 0.22);
}

/** DTMF frequency table (ITU-T Q.23). */
const DTMF: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '0': [941, 1336],
  '*': [941, 1209],
  '#': [941, 1477],
};

function scheduleDTMFDigit(ctx: AudioContext, digit: string, t: number, dur: number): void {
  const freqs = DTMF[digit];
  if (!freqs) return;
  scheduleOscillator(ctx, freqs[0], t, t + dur, 0.28);
  scheduleOscillator(ctx, freqs[1], t, t + dur, 0.28);
}

/** Dial a sequence of DTMF digits; returns the time after the last digit + gap. */
export function scheduleDTMFSequence(
  ctx: AudioContext,
  digits: string,
  startTime: number,
  digitDur = 0.09,
  gapDur = 0.07,
): number {
  let t = startTime;
  for (const d of digits) {
    scheduleDTMFDigit(ctx, d, t, digitDur);
    t += digitDur + gapDur;
  }
  return t;
}

/** Ring-back tone: 440 Hz + 480 Hz (North-American standard). */
export function scheduleRingback(ctx: AudioContext, t: number, duration: number): void {
  scheduleOscillator(ctx, 440, t, t + duration, 0.18);
  scheduleOscillator(ctx, 480, t, t + duration, 0.18);
}

/** V.25 answer tone: 2100 Hz CED. */
export function scheduleAnswerTone(ctx: AudioContext, t: number, duration = 0.55): void {
  scheduleOscillator(ctx, 2100, t, t + duration, 0.26);
}

/**
 * Modem handshake squeal.
 * Simulates the characteristic sequence of frequency bursts heard during
 * V.90/V.92 negotiation — purely synthesised, no real protocol encoding.
 */
export function scheduleHandshakeSqueal(
  ctx: AudioContext,
  startTime: number,
  duration: number,
): void {
  const segments: Array<[number, number, number, number]> = [
    [1080, 1080, 0.0, 0.18],
    [1750, 1750, 0.18, 0.36],
    [2400, 1200, 0.36, 0.54],
    [1200, 3429, 0.54, 0.72],
    [3429, 1800, 0.72, 0.9],
    [1800, 2400, 0.9, 1.08],
    [2400, 2400, 1.08, 1.26],
    [1200, 1200, 1.26, 1.44],
    [2400, 1200, 1.44, 1.62],
    [1800, 3000, 1.62, 1.8],
    [3000, 2400, 1.8, 1.98],
    [2400, 2400, 1.98, 2.2],
    [1200, 3429, 2.2, 2.4],
    [2400, 2400, 2.4, 2.6],
  ];

  for (const [fStart, fEnd, relStart, relEnd] of segments) {
    if (relStart >= duration) break;
    const t0 = startTime + relStart;
    const t1 = startTime + Math.min(relEnd, duration);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g);
    g.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(fStart, t0);
    if (fStart !== fEnd) osc.frequency.linearRampToValueAtTime(fEnd, t1);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.22, t0 + 0.015);
    g.gain.setValueAtTime(0.22, Math.max(t0 + 0.015, t1 - 0.015));
    g.gain.linearRampToValueAtTime(0, t1);
    osc.start(t0);
    osc.stop(t1 + 0.05);
  }

  const noiseBuffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.04), ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i += 1) {
    noiseData[i] = (Math.random() * 2 - 1) * 0.06;
  }

  const burstCount = Math.min(10, Math.floor(duration / 0.25));
  for (let i = 0; i < burstCount; i += 1) {
    const bt = startTime + (duration / burstCount) * i;
    const ns = ctx.createBufferSource();
    ns.buffer = noiseBuffer;
    const ng = ctx.createGain();
    ng.gain.value = 0.04;
    ns.connect(ng);
    ng.connect(ctx.destination);
    ns.start(bt);
  }
}

/**
 * Three ascending beeps played on successful connection.
 * @param ts - time-scale factor (1/speed); pass 1 for default timing.
 */
export function scheduleConnectedBeeps(ctx: AudioContext, t: number, ts = 1): number {
  scheduleOscillator(ctx, 880,  t,              t + 0.10 * ts, 0.22);
  scheduleOscillator(ctx, 1100, t + 0.14 * ts,  t + 0.24 * ts, 0.22);
  scheduleOscillator(ctx, 1320, t + 0.28 * ts,  t + 0.44 * ts, 0.26);
  return t + 0.55 * ts;
}
