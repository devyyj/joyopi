import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAudioVolume } from './useAudioVolume';

describe('useAudioVolume 훅 테스트', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAudioContext: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockMediaStream: any;

  beforeEach(() => {
    mockAudioContext = {
      createMediaStreamSource: vi.fn().mockReturnValue({
        connect: vi.fn(),
      }),
      createAnalyser: vi.fn().mockReturnValue({
        fftSize: 0,
        frequencyBinCount: 256,
        connect: vi.fn(),
        getByteFrequencyData: vi.fn().mockImplementation((array) => {
          array[0] = 50; // 임의의 가상 오디오 데이터 주입
        }),
      }),
      close: vi.fn().mockResolvedValue(undefined),
    };

    mockMediaStream = {
      getAudioTracks: vi.fn().mockReturnValue([{
        enabled: true,
        stop: vi.fn(),
      }]),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MockAudioContext = vi.fn().mockImplementation(function(this: any) {
      this.createMediaStreamSource = mockAudioContext.createMediaStreamSource;
      this.createAnalyser = mockAudioContext.createAnalyser;
      this.close = mockAudioContext.close;
    });

    vi.stubGlobal('AudioContext', MockAudioContext);
    vi.stubGlobal('webkitAudioContext', MockAudioContext);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('AudioContext 및 AnalyserNode를 생성하고 분석 루프가 정상 시작해야 함', () => {
    const { result } = renderHook(() => useAudioVolume(mockMediaStream));
    expect(result.current).toBeDefined();
    expect(typeof result.current.volume).toBe('number');
  });
});
