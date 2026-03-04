import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock AudioContext for BeatMaker (jsdom doesn't provide it)
class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  destination = {};

  createOscillator() {
    return {
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }

  createGain() {
    return {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
  }

  createBuffer() {
    return {
      getChannelData: () => new Float32Array(100),
    };
  }

  createBufferSource() {
    return {
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }

  createBiquadFilter() {
    return {
      type: '',
      frequency: { value: 0 },
      connect: vi.fn(),
    };
  }
}

vi.stubGlobal('AudioContext', MockAudioContext);
vi.stubGlobal('webkitAudioContext', MockAudioContext);
