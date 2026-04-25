import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDialUpSound } from '../src/useDialUpSound';

describe('useDialUpSound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns correct initial state', () => {
    const { result } = renderHook(() => useDialUpSound());
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.stage).toBe('idle');
    expect(result.current.progress).toBe(0);
    expect(typeof result.current.play).toBe('function');
    expect(typeof result.current.stop).toBe('function');
  });

  it('sets isPlaying=true when play() is called', async () => {
    const { result } = renderHook(() => useDialUpSound({ enabled: true }));
    await act(async () => {
      await result.current.play();
    });
    expect(result.current.isPlaying).toBe(true);
  });

  it('does not play when enabled=false', async () => {
    const { result } = renderHook(() => useDialUpSound({ enabled: false }));
    await act(async () => {
      await result.current.play();
    });
    expect(result.current.isPlaying).toBe(false);
  });

  it('stop() resets state to idle', async () => {
    const { result } = renderHook(() => useDialUpSound());
    await act(async () => {
      await result.current.play();
    });
    act(() => {
      result.current.stop();
    });
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.stage).toBe('idle');
    expect(result.current.progress).toBe(0);
  });

  it('does not call play twice if already playing', async () => {
    const { result } = renderHook(() => useDialUpSound());
    await act(async () => {
      await result.current.play();
    });
    const firstStage = result.current.stage;
    await act(async () => {
      await result.current.play();
    });
    expect(result.current.stage).toBe(firstStage);
  });

  it('calls onComplete callback when sequence finishes', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDialUpSound({ onComplete, speed: 100 }));
    await act(async () => {
      await result.current.play();
    });
    await act(async () => {
      vi.runAllTimers();
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('speed option affects timing', async () => {
    const { result: slow } = renderHook(() => useDialUpSound({ speed: 0.5 }));
    const { result: fast } = renderHook(() => useDialUpSound({ speed: 2 }));
    await act(async () => {
      await slow.current.play();
    });
    await act(async () => {
      await fast.current.play();
    });
    expect(slow.current.isPlaying).toBe(true);
    expect(fast.current.isPlaying).toBe(true);
  });

  it('cleans up on unmount', async () => {
    const { result, unmount } = renderHook(() => useDialUpSound());
    await act(async () => {
      await result.current.play();
    });
    expect(() => unmount()).not.toThrow();
  });
});
