import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMotionDetection } from './useMotionDetection';

// MediaPipe 모킹
vi.mock('@mediapipe/tasks-vision', () => {
  const mockGestureRecognizer = {
    recognizeForVideo: vi.fn(),
  };
  const mockFaceLandmarker = {
    detectForVideo: vi.fn(),
  };

  return {
    FilesetResolver: {
      forVisionTasks: vi.fn().mockResolvedValue('mock-vision-resolver'),
    },
    GestureRecognizer: {
      createFromOptions: vi.fn().mockResolvedValue(mockGestureRecognizer),
    },
    FaceLandmarker: {
      createFromOptions: vi.fn().mockResolvedValue(mockFaceLandmarker),
    },
  };
});

describe('useMotionDetection 훅 테스트', () => {
  it('MediaPipe GestureRecognizer가 마운트 시 정상 초기화되어야 함', async () => {
    const videoRef = { current: document.createElement('video') };
    const { result } = renderHook(() => useMotionDetection(videoRef as unknown as React.RefObject<HTMLVideoElement | null>, () => {}));

    // 초기값은 아직 비동기 초기화 전이므로 null일 수 있음
    expect(result.current.isInitializing).toBe(true);
  });
});
