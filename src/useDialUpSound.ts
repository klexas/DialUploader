import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ConnectionStage,
  UseDialUpSoundOptions,
  UseDialUpSoundReturn,
} from './types';
import {
  scheduleAnswerTone,
  scheduleConnectedBeeps,
  scheduleDialTone,
  scheduleDTMFSequence,
  scheduleHandshakeSqueal,
  scheduleRingback,
} from './utils/sound';

const DIAL_DIGITS = '18005551234';

export function useDialUpSound(options: UseDialUpSoundOptions = {}): UseDialUpSoundReturn {
  const { enabled = true, speed = 1, onComplete } = options;
  const onCompleteRef = useRef(onComplete);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [stage, setStage] = useState<ConnectionStage>('idle');
  const [progress, setProgress] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const stoppedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const clearTimeouts = () => {
    for (const timeout of timeoutRefs.current) {
      clearTimeout(timeout);
    }
    timeoutRefs.current = [];
  };

  const stop = useCallback(() => {
    stoppedRef.current = true;
    clearTimer();
    clearTimeouts();
    try {
      ctxRef.current?.close();
    } catch {
      /* ignore */
    }
    ctxRef.current = null;
    setIsPlaying(false);
    setStage('idle');
    setProgress(0);
  }, []);

  useEffect(() => stop, [stop]);

  const play = useCallback(async (): Promise<void> => {
    if (!enabled || isPlaying) return;

    stoppedRef.current = false;
    clearTimeouts();

    const ACtx =
      typeof window !== 'undefined'
        ? window.AudioContext ??
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        : undefined;

    if (!ACtx) return;

    let ctx: AudioContext;
    try {
      ctx = new ACtx();
      ctxRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume();
    } catch {
      return;
    }

    setIsPlaying(true);
    setProgress(0);
    setStage('dialing');

    const ts = 1 / Math.max(0.1, speed);
    const now = ctx.currentTime;

    let t = now;

    const dialDur = 0.8 * ts;
    scheduleDialTone(ctx, t, dialDur);
    t += dialDur;

    t = scheduleDTMFSequence(ctx, DIAL_DIGITS, t, 0.09 * ts, 0.07 * ts);

    const ringDur = 1.6 * ts;
    scheduleRingback(ctx, t, ringDur);
    const ringingAt = (t - now) * 1000;
    t += ringDur;

    const ansDur = 0.55 * ts;
    scheduleAnswerTone(ctx, t, ansDur);
    const negotiatingAt = (t - now) * 1000;
    t += ansDur + 0.1 * ts;

    const squealDur = 2.6 * ts;
    scheduleHandshakeSqueal(ctx, t, squealDur);
    t += squealDur;

    const connectedAt = (t - now) * 1000;
    const afterBeeps = scheduleConnectedBeeps(ctx, t, ts);
    const totalMs = (afterBeeps - now) * 1000;

    const scheduleStage = (delayMs: number, s: ConnectionStage, p: number) => {
      const timeout = setTimeout(() => {
        if (!stoppedRef.current) {
          setStage(s);
          setProgress(p);
        }
      }, delayMs);
      timeoutRefs.current.push(timeout);
    };

    scheduleStage(0, 'dialing', 5);
    scheduleStage(ringingAt, 'ringing', 35);
    scheduleStage(negotiatingAt, 'negotiating', 55);
    scheduleStage(connectedAt, 'connected', 100);

    const startWall = Date.now();
    intervalRef.current = setInterval(() => {
      if (stoppedRef.current) {
        clearTimer();
        return;
      }
      const raw = Math.min(98, ((Date.now() - startWall) / totalMs) * 100);
      setProgress((prev) => Math.max(prev, raw));
    }, 80);

    const completionTimeout = setTimeout(() => {
      if (stoppedRef.current) return;
      clearTimer();
      setProgress(100);
      setIsPlaying(false);
      onCompleteRef.current?.();
      ctx.close().catch(() => {
        /* ignore */
      });
      ctxRef.current = null;
    }, totalMs + 150);
    timeoutRefs.current.push(completionTimeout);
  }, [enabled, isPlaying, speed]);

  return { play, stop, isPlaying, stage, progress };
}
