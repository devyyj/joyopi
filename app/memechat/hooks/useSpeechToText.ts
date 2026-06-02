import { useEffect, useRef, useState, useCallback } from 'react';

export function useSpeechToText(onTranscriptChange: (text: string, isFinal: boolean) => void) {
  // AGENTS.md 6.6: 초기값은 무조건 false → SSR/클라이언트 첫 프레임 일치 보장
  // isSupported는 ref로 관리하여 useEffect 내 setState 직접 호출 제거
  const isSupportedRef = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<unknown>(null);
  const shouldRestartRef = useRef(false);
  // onTranscriptChange를 ref로 유지 → useEffect deps에서 제거하여 재생성 방지
  const onTranscriptChangeRef = useRef(onTranscriptChange);
  // 마운트 후 isSupported 상태를 UI에 반영하기 위한 상태
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange;
  }, [onTranscriptChange]);

  // 마운트 후에만 브라우저 API 가용 여부 체크 (SSR 안전)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supported = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    isSupportedRef.current = supported;
    // 이 setState는 마운트 직후 단 1회, 외부 시스템(브라우저 API) 탐지 결과를 React 상태에 동기화하는 정상 패턴
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSupported(supported);
  }, []);

  // recognition 인스턴스 생성 팩토리 (재시작 가능하도록 분리)
  const createRecognition = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ko-KR';

    recognition.onresult = (event: {
      resultIndex: number;
      results: { isFinal: boolean; [key: number]: { transcript: string } }[];
    }) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      const isFinal = !!finalTranscript;
      onTranscriptChangeRef.current(text, isFinal);
    };

    recognition.onerror = (event: { error: string }) => {
      if (event.error === 'no-speech') {
        // no-speech는 정상 타임아웃 → 자동 재시작 허용
        return;
      }

      if (event.error === 'aborted') {
        // aborted: 수동 stop() 또는 외부 중단 → 재시작 플래그 확인 후 결정
        if (!shouldRestartRef.current) {
          setIsListening(false);
        }
        return;
      }

      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'network') {
        shouldRestartRef.current = false;
        setIsListening(false);
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      if (shouldRestartRef.current) {
        // 자동 재시작: 300ms 딜레이로 플리커링 방지
        setTimeout(() => {
          if (!shouldRestartRef.current) {
            setIsListening(false);
            return;
          }
          try {
            (recognitionRef.current as { start: () => void } | null)?.start();
          } catch {
            // 이미 실행 중인 경우 무시
          }
        }, 300);
      } else {
        setIsListening(false);
      }
    };

    return recognition;
  }, []);

  const toggleListening = useCallback(() => {
    if (!isSupported) return;

    if (isListening) {
      // 마이크 끄기
      shouldRestartRef.current = false;
      try {
        (recognitionRef.current as { stop: () => void } | null)?.stop();
      } catch {
        // 무시
      }
      setIsListening(false);
    } else {
      // 마이크 켜기: 새 인스턴스 생성하여 aborted 후에도 재시작 가능
      shouldRestartRef.current = true;
      const recognition = createRecognition();
      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch {
        // 무시
      }
    }
  }, [isListening, isSupported, createRecognition]);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      try {
        (recognitionRef.current as { stop: () => void } | null)?.stop();
      } catch {
        // 무시
      }
    };
  }, []);

  return { isSupported, isListening, toggleListening };
}
