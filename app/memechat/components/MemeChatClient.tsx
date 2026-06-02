'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMotionDetection } from '../hooks/useMotionDetection';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useAudioVolume } from '../hooks/useAudioVolume';
import { getMemeByGesture, MemeInfo } from '../utils/memeMapper';
import MemeCard from './MemeCard';
import { Mic, MicOff, Video, VideoOff, Activity, ShieldCheck } from 'lucide-react';

export default function MemeChatClient() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentGesture, setCurrentGesture] = useState<string>('None');
  const [currentMeme, setCurrentMeme] = useState<MemeInfo | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [isFinal, setIsFinal] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // 1. 카메라 & 마이크 스트림 획득 및 렌더링
  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalInfo = console.info;
    const originalError = console.error;

    const shouldSuppress = (args: unknown[]) => {
      return args.some(arg => {
        if (typeof arg === 'string') {
          return (
            arg.includes('gl_context.cc') ||
            arg.includes('OpenGL') ||
            arg.includes('XNNPACK') ||
            arg.includes('face_landmarker_graph') ||
            arg.includes('Sets FaceBlendshapesGraph acceleration') ||
            arg.includes('Created TensorFlow Lite XNNPACK delegate')
          );
        }
        return false;
      });
    };

    console.log = (...args) => {
      if (!shouldSuppress(args)) originalLog(...args);
    };
    console.warn = (...args) => {
      if (!shouldSuppress(args)) originalWarn(...args);
    };
    console.info = (...args) => {
      if (!shouldSuppress(args)) originalInfo(...args);
    };
    console.error = (...args) => {
      if (!shouldSuppress(args)) originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.info = originalInfo;
      console.error = originalError;
    };
  }, []);

  // 2. 카메라 & 마이크 스트림 획득 및 렌더링
  useEffect(() => {
    async function startCamera() {
      if (!cameraActive) {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
        return;
      }

      try {
        setCameraError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 15 },
          },
          audio: true,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: unknown) {
        console.error('미디어 권한 획득 실패:', err);
        setCameraError('카메라/마이크를 시작할 수 없습니다. 권한을 확인해주세요.');
        setCameraActive(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraActive]);

  // 2. 모션 감지 엔진 연동 (useMotionDetection)
  const { isInitializing: isModelLoading, error: modelError } = useMotionDetection(
    videoRef,
    canvasRef,
    (gesture) => {
      if (gesture !== currentGesture) {
        setCurrentGesture(gesture);
        const matchedMeme = getMemeByGesture(gesture);
        if (matchedMeme) {
          setCurrentMeme(matchedMeme);
        }
      }
    }
  );

  // 3. STT 엔진 연동 (useSpeechToText)
  const { isListening, toggleListening, isSupported: isSttSupported } = useSpeechToText(
    (text, finalState) => {
      setTranscript(text);
      setIsFinal(finalState);

      // 자막이 완성된 후 4초 뒤에 자막 초기화 연출
      if (finalState) {
        setTimeout(() => {
          setTranscript((current) => (current === text ? '' : current));
        }, 4000);
      }
    }
  );

  // 4. 실시간 마이크 데시벨/볼륨 측정
  const { volume } = useAudioVolume(isListening ? stream : null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex flex-col p-4 md:p-8">
      {/* 헤더 섹션 */}
      <header className="max-w-6xl w-full mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            Phase 3: Local Playground
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            밈챗 (MemeChat) 1인 테스트룸
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            카메라와 마이크를 켜고 나에게 매핑되는 밈 이미지와 실시간 텍스트 자막을 테스트해 보세요.
          </p>
        </div>

        {/* 제어 버튼 그룹 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCameraActive(!cameraActive)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              cameraActive
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-rose-500 hover:bg-rose-600 text-white'
            }`}
          >
            {cameraActive ? <Video size={16} /> : <VideoOff size={16} />}
            {cameraActive ? '카메라 끄기' : '카메라 켜기'}
          </button>

          <button
            onClick={() => toggleListening()}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isListening
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-rose-500 hover:bg-rose-600 text-white'
            }`}
          >
            {isListening ? <Mic size={16} /> : <MicOff size={16} />}
            {isListening ? '마이크 끄기' : '마이크 켜기'}
          </button>
        </div>
      </header>

      {/* 메인 레이아웃 */}
      <section className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start flex-1">
        {/* 왼쪽: 1인용 실시간 밈 플레이어 (MemeCard) */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-bold text-slate-300 self-start flex items-center gap-2">
            <Activity size={18} className="text-indigo-400" /> 상대방 화면에 비춰질 내 밈 모습
          </h2>
          <MemeCard
            meme={currentMeme}
            transcript={transcript}
            isFinal={isFinal}
            isListening={isListening}
          />
        </div>

        {/* 오른쪽: 모니터링 및 상태 패널 */}
        <div className="space-y-6">
          {/* 내 카메라 로컬 프리뷰 */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              내 쌩얼 프리뷰 (나에게만 보임)
            </div>
            
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 relative border border-slate-800">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                  <VideoOff size={32} />
                  <p className="text-sm font-semibold">카메라 비활성화됨</p>
                </div>
              )}

              {/* 디버그 자막 오버레이 */}
              {currentGesture !== 'None' && (
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs flex items-center justify-between text-indigo-300 font-mono">
                  <span>DETECTED GESTURE:</span>
                  <span className="font-bold text-white bg-indigo-600/80 px-2 py-0.5 rounded">
                    {currentGesture}
                  </span>
                </div>
              )}
            </div>

            {cameraError && (
              <p className="text-rose-400 text-xs mt-3 text-center">{cameraError}</p>
            )}

            {/* 마이크 입력 볼륨 레벨 게이지 바 */}
            {isListening && (
              <div className="mt-4 bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                <span className="text-xs font-semibold text-slate-400 shrink-0">마이크 감도</span>
                <div className="flex-1 h-3 bg-slate-800/80 rounded-full overflow-hidden relative border border-slate-700/30">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 rounded-full transition-all duration-75"
                    style={{ width: `${volume}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-indigo-300 w-10 text-right font-mono">{volume}%</span>
              </div>
            )}
          </div>

          {/* 모션 / 음성 인식 안내 및 모델 로딩 디버거 */}
          <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-300 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" /> 시스템 진단 및 상태
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
                <span className="text-xs text-slate-500 block">모션 인식 엔진 (MediaPipe)</span>
                <span className={`font-semibold mt-1 block ${isModelLoading ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {isModelLoading ? '모델 로딩 중...' : '준비 완료'}
                </span>
                {modelError && <span className="text-[10px] text-rose-400 block mt-1">{modelError}</span>}
              </div>

              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/60">
                <span className="text-xs text-slate-500 block">실시간 번역 엔진 (Web Speech)</span>
                <span className={`font-semibold mt-1 block ${isListening ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {isListening ? '활성화됨 (STT)' : '대기 중'}
                </span>
                {!isSttSupported && (
                  <span className="text-[10px] text-rose-400 block mt-1">이 브라우저는 STT를 지원하지 않습니다.</span>
                )}
              </div>
            </div>

            <div className="bg-slate-950/30 rounded-2xl p-4 border border-slate-800/40 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400">💡 로컬 매핑 액션 가이드</h4>
              <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
                <li>카메라 앞에서 <strong className="text-slate-300">엄지 손가락을 척 올리면 (Thumbs_Up)</strong> 👍 <strong className="text-indigo-400">따봉 도치</strong> 밈으로 전환됩니다.</li>
                <li>카메라 앞에서 <strong className="text-slate-300">V자를 만들면 (Peace)</strong> ✌️ <strong className="text-indigo-400">묻고 더블로 가!</strong> 밈으로 전환됩니다.</li>
                <li>양손으로 <strong className="text-slate-300">머리 위로 만세를 부르면 (Bongsun)</strong> 🙌 <strong className="text-indigo-400">상상도 못한 정체</strong> 밈으로 전환됩니다.</li>
                <li>마이크를 켜고 말하면 실시간 말풍선에 텍스트가 노출되며, 말이 끝나면 부드럽게 팝업 연출이 종료됩니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
