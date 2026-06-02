import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechToText } from './useSpeechToText';

interface MockSpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  addEventListener: () => void;
  removeEventListener: () => void;
  onresult?: (event: unknown) => void;
  onerror?: (event: unknown) => void;
  onstart?: () => void;
  onend?: () => void;
}

describe('useSpeechToText 훅 테스트', () => {
  let mockRecognition: MockSpeechRecognitionInstance;
  let mockInstances: MockSpeechRecognitionInstance[] = [];

  beforeEach(() => {
    mockInstances = [];
    mockRecognition = {
      continuous: false,
      interimResults: false,
      lang: '',
      start: vi.fn(),
      stop: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MockSpeechRecognition = vi.fn().mockImplementation(function(this: any) {
      this.continuous = false;
      this.interimResults = false;
      this.lang = '';
      this.start = () => {
        mockRecognition.start();
        if (this.onstart) this.onstart();
      };
      this.stop = () => {
        mockRecognition.stop();
        if (this.onend) this.onend();
      };
      this.addEventListener = mockRecognition.addEventListener;
      this.removeEventListener = mockRecognition.removeEventListener;
      mockInstances.push(this);
    });

    // window.webkitSpeechRecognition 글로벌 모킹
    vi.stubGlobal('webkitSpeechRecognition', MockSpeechRecognition);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('SpeechRecognition 지원 시 toggleListening을 통해 객체를 생성하고 시작해야 함', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useSpeechToText(callback));

    expect(result.current.isSupported).toBe(true);
    expect(result.current.isListening).toBe(false);

    act(() => {
      result.current.toggleListening();
    });

    expect(mockRecognition.start).toHaveBeenCalled();
    expect(result.current.isListening).toBe(true);
  });

  it('network 에러 발생 시 자동 재시작이 중지되고 수동 재시작 가능 상태가 되어야 함', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useSpeechToText(callback));

    act(() => {
      result.current.toggleListening();
    });

    expect(result.current.isListening).toBe(true);

    // 에러 발생 모사
    const instance = mockInstances[0];
    expect(instance).toBeDefined();

    act(() => {
      if (instance.onerror) {
        instance.onerror({ error: 'network' });
      }
    });

    expect(result.current.isListening).toBe(false);
  });
});
