import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';
import { resetStyleInjection } from '../src/utils/styles';

class MockGainNode {
  gain = {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  };

  connect = vi.fn();
  disconnect = vi.fn();
}

class MockOscillatorNode {
  type: OscillatorType = 'sine';
  frequency = {
    value: 440,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  };

  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockBufferSource {
  buffer: AudioBuffer | null = null;
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockAudioBuffer {
  sampleRate = 44100;
  length: number;

  constructor(_channels: number, length: number, _rate: number) {
    this.length = length;
  }

  getChannelData(): Float32Array {
    return new Float32Array(this.length);
  }
}

class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  state: AudioContextState = 'running';
  destination = {};
  createOscillator = vi.fn(() => new MockOscillatorNode());
  createGain = vi.fn(() => new MockGainNode());
  createBuffer = vi.fn((c: number, l: number, r: number) => new MockAudioBuffer(c, l, r));
  createBufferSource = vi.fn(() => new MockBufferSource());
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
}

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: MockAudioContext,
});

beforeEach(() => {
  resetStyleInjection();
});
