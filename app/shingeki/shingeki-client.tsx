'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Heart, RefreshCw, Share2 } from 'lucide-react';
import { getQuestions, calculateResult } from '../actions/shingeki';
import { Question, Character, Option, CHARACTERS, SHINGEKI_VERSION } from '../actions/shingekiData';

type Step = 'home' | 'testing' | 'analyzing' | 'result';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

function ShingekiTestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Helper to match character from param
  const getMatchedCharacter = (name: string | null): Character | null => {
    if (!name) return null;
    let char = CHARACTERS[name as keyof typeof CHARACTERS];
    if (!char) {
      const normalized = name.replace(/\s/g, "");
      const entry = Object.entries(CHARACTERS).find(([key]) => key.replace(/\s/g, "") === normalized);
      if (entry) char = entry[1];
    }
    return char || null;
  };

  const initialCharParam = searchParams?.get('c');
  const initialChar = getMatchedCharacter(initialCharParam);

  const [step, setStep] = useState<Step>(initialChar ? 'result' : 'home');
  const [result, setResult] = useState<{ character: Character; scores: Record<string, number> } | null>(
    initialChar ? { character: initialChar, scores: {} } : null
  );

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; answer: 'A' | 'B' | 'C' | 'D' }[]>([]);
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // 현재 화면에 표시되고 있는 캐릭터의 이름을 추적 (공유 링크용)
  const shownCharNameRef = useRef<string | null>(initialChar ? initialCharParam : null);
  const isProcessingRef = useRef(false);

  // 모든 상태를 초기화하는 공통 함수
  const resetAllData = (clearUrl = true) => {
    console.log('[DEBUG] resetAllData triggered');
    
    // 1. URL 파라미터 제거
    if (clearUrl && searchParams.toString()) {
      router.replace('/shingeki', { scroll: false });
    }
    
    // 2. 상태 초기화
    setResult(null);
    setAnswers([]);
    setCurrentIdx(0);
    setQuestions([]);
    setStep('home');
    setIsStarting(false);
    isProcessingRef.current = false;
  };

  // Handle share‑link query parameter
  useEffect(() => {
    const rawParam = searchParams?.get('c');
    const charParam = rawParam ? decodeURIComponent(rawParam) : null;
    
    // URL에 파라미터가 없으면 추적 중인 캐릭터 이름을 초기화하고 종료
    if (!charParam) {
      // 홈 화면일 때만 Ref를 초기화하여, 분석 중(analyzing)에 파라미터가 없어서 결과가 취소되는 현상 방지
      if (step === 'home') {
        shownCharNameRef.current = null;
      }
      return;
    }

    // 무시 조건:
    // 1. 현재 테스트 진행 중이거나 분석 중임
    // 2. 현재 이미 해당 캐릭터의 결과가 화면에 표시되고 있음 (Ref로 판단)
    if (step === 'testing' || step === 'analyzing' || shownCharNameRef.current === charParam) {
      return;
    }

    const character = getMatchedCharacter(charParam);
    
    if (character) {
      shownCharNameRef.current = charParam;
      setTimeout(() => {
        setResult({ character, scores: {} });
        setStep('result');
      }, 0);
    }
  }, [searchParams, step]);

  const handleStart = async () => {
    console.log('[DEBUG] --- handleStart Started ---');
    if (isStarting) return;
    
    // 이미 질문이 로드되어 있다면 바로 시작, 아니면 로드 후 시작
    if (questions.length > 0) {
      console.log('[DEBUG] Using pre-loaded questions.');
      shownCharNameRef.current = "TEST_IN_PROGRESS";
      setStep('testing');
      return;
    }

    setIsStarting(true);
    isProcessingRef.current = true;

    try {
      console.log('[DEBUG] Fetching fresh questions from server...');
      const raw = await getQuestions();
      console.log(`[DEBUG] Received ${raw.length} questions. Preparing test...`);
      
      const enriched = raw.map((q) => {
        return { ...q, options: shuffleArray([...q.options]) };
      });
      
      setQuestions(enriched);
      shownCharNameRef.current = "TEST_IN_PROGRESS";
      setStep('testing');
      console.log('[DEBUG] --- Test Started Successfully ---');
    } catch (err) {
      console.error("[DEBUG] Loading failed:", err);
      resetAllData(false);
    } finally {
      setIsStarting(false);
      isProcessingRef.current = false;
    }
  };

  const handleAnswerSelect = (key: 'A' | 'B' | 'C' | 'D') => {
    console.log(`[DEBUG] handleAnswerSelect: QuestionIdx ${currentIdx}, Key ${key}`);
    if (isProcessingRef.current || step !== 'testing' || currentIdx >= questions.length) {
      console.warn('[DEBUG] Selection ignored. processing:', isProcessingRef.current, 'step:', step);
      return;
    }
    isProcessingRef.current = true;

    const activeQuestion = questions[currentIdx];
    const newAnswers = [...answers, { questionId: activeQuestion.id, answer: key }];
    setAnswers(newAnswers);

    if (currentIdx < questions.length - 1) {
      console.log('[DEBUG] Moving to next question');
      setCurrentIdx((prev) => prev + 1);
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 300);
    } else {
      console.log('[DEBUG] All questions answered. Transitioning to: analyzing');
      setStep('analyzing');
      
      // 분석 연출 후 결과 계산 실행
      setTimeout(async () => {
        try {
          console.log('[DEBUG] Requesting result calculation...');
          const finalResult = await calculateResult(newAnswers);
          
          // 사용자가 도중에 '다시 하기'를 눌렀다면 결과 적용 중단
          if (shownCharNameRef.current === null) {
            console.log('[DEBUG] Test aborted during analysis. Skipping result update.');
            return;
          }

          if (finalResult?.character?.name) {
            console.log('[DEBUG] Calculation success. Winner:', finalResult.character.name);
            shownCharNameRef.current = finalResult.character.name;
          }
          
          setResult(finalResult);
          setStep('result');
          console.log('[DEBUG] State transitioned to: result');
        } catch (error) {
          console.error("[DEBUG] Result calculation failed:", error);
          resetAllData(false);
        } finally {
          console.log('[DEBUG] Resetting isProcessingRef to false');
          isProcessingRef.current = false; 
        }
      }, 3500);
    }
  };

  const handleRetry = async () => {
    // 모든 데이터 초기화
    resetAllData(true);

    // 다음 테스트를 위해 질문 미리 로딩
    setIsStarting(true);
    try {
      const raw = await getQuestions();
      const enriched = raw.map((q) => {
        return { ...q, options: shuffleArray([...q.options]) };
      });
      setQuestions(enriched);
    } catch (err) {
      console.error("Failed to pre-load questions:", err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCopyLink = () => {
    const base = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
    const link = result?.character?.name ? `${base}?c=${encodeURIComponent(result.character.name)}` : window.location.href;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col items-center justify-between font-sans selection:bg-[#8B0000] selection:text-white relative overflow-hidden px-4 py-8">
      <AnimatePresence>
        {step === 'home' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 pointer-events-none"
          >
            <Image
              src="/images/shingeki/main.png"
              alt="Background"
              fill
              className="object-cover"
            />
          </motion.div>
        )}
        {step === 'analyzing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <Image
              src="/images/shingeki/main.png"
              alt="Background"
              fill
              className="object-cover blur-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8B000022,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#120000,transparent_80%)] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,#00000099_100%)] pointer-events-none" />

      <header className="z-10 w-full max-w-lg flex justify-between items-center border-b border-neutral-800 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#8B0000] drop-shadow-[0_0_8px_#8B0000]" />
          <span className="text-xs font-bold tracking-[0.2em] text-neutral-400">조사병단 입단 테스트</span>
        </div>
        <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">버전 {SHINGEKI_VERSION}</span>
      </header>

      <main className="z-10 w-full max-w-lg flex-1 flex flex-col justify-center my-auto relative">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-6"
            >
              <div className="relative w-full aspect-[16/9] mb-8 rounded-2xl overflow-hidden border border-neutral-800 shadow-[0_0_40px_rgba(139,0,0,0.4)] group cursor-pointer">
                <Image
                  src="/images/shingeki/main.png"
                  alt="진격의 거인 메인 비주얼"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-transparent transition-colors duration-500" />
              </div>

              <h1 className="text-5xl md:text-6xl font-black tracking-wider text-[#8B0000] mb-2 font-mono drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                心臓を捧げよ！
              </h1>
              <p className="text-lg md:text-xl font-black tracking-[0.1em] text-white mb-8 drop-shadow-[0_0_8px_#8B0000]">
                심장을 바쳐라!
              </p>

              <div className="p-5 rounded-2xl bg-neutral-900/60 backdrop-blur-md border border-neutral-800 shadow-2xl mb-8 text-left space-y-3">
                <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                  혹시 내가 진격의 거인 세계관 속에 떨어진다면? 평화가 깨진 세상에서 당신은 어떤 선택을 하게 될까요?
                </p>
                <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                  당신의 사소한 선택들이 모여, 20명의 캐릭터 중 당신과 가장 닮은 영혼을 찾아냅니다. 지금 바로 당신의 심장을 바쳐보세요!
                </p>
              </div>

              <button
                onClick={handleStart}
                disabled={isStarting}
                className="w-full py-4 px-8 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#b30000] hover:from-[#a60000] hover:to-[#e60000] text-white font-bold tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(139,0,0,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-sm cursor-pointer border border-[#ff3e3e]/20"
              >
                <span>{isStarting ? '거인 분석 중...' : '나와 닮은 캐릭터 확인하기'}</span>
                <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              </button>

              <div className="mt-8 text-neutral-500 text-[11px] font-semibold flex justify-center items-center gap-4">
                <span>소요시간 약 1분</span>
              </div>
            </motion.div>
          )}

          {step === 'testing' && questions.length > 0 && (
            <motion.div
              key={`testing-${currentIdx}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full space-y-6"
            >
              <div className="flex justify-between items-center text-xs font-bold text-neutral-400">
                <span className="text-[#ff3e3e] font-black drop-shadow-[0_0_6px_#8B0000]">질문 {currentIdx + 1} / 12</span>
                <span className="bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded text-[10px] text-neutral-400">대분류: {questions[currentIdx]?.category}</span>
              </div>

              <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-850">
                <div
                  className="h-full bg-gradient-to-r from-[#8B0000] via-[#d60000] to-[#ff3e3e] shadow-[0_0_8px_#ff3e3e]"
                  style={{ width: `${((currentIdx + 1) / 12) * 100}%` }}
                />
              </div>

              <div className="min-h-[130px] flex items-center justify-center py-6 px-5 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-2xl text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8B00000a] to-transparent pointer-events-none" />
                <h2 className="text-lg md:text-xl font-extrabold leading-relaxed text-neutral-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {questions[currentIdx]?.question}
                </h2>
              </div>

              <div className="space-y-3">
                {questions[currentIdx]?.options.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleAnswerSelect(opt.key)}
                    className="w-full text-left py-4 px-5 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-[#8B0000]/80 transition-all active:scale-[0.99] flex gap-3 text-xs leading-relaxed group shadow-lg cursor-pointer"
                  >
                    <span className="text-neutral-300 font-semibold group-hover:text-white transition-colors">
                      {opt.text}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 flex flex-col items-center space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full border border-[#ff3e3e]/30 animate-ping opacity-75" />
                <div className="p-8 rounded-full bg-neutral-900 border border-neutral-800 relative shadow-[0_0_40px_rgba(139,0,0,0.3)]">
                  <Heart className="w-16 h-16 text-[#8B0000] fill-[#8B0000] animate-bounce drop-shadow-[0_0_15px_#8B0000]" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-white tracking-widest uppercase drop-shadow-[0_0_8px_#ff3e3e]">
                  영혼과 심장 분석 중...
                </h3>
                <p className="text-xs text-neutral-400 font-medium">
                  거인의 격동치는 증기 속에서 당신의 영혼을 매칭하고 있습니다.
                </p>
              </div>
              <div className="flex gap-1.5 justify-center">
                <span className="w-2.5 h-2.5 bg-[#8B0000] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 bg-[#8B0000] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 bg-[#8B0000] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}

          {step === 'result' && result && result.character && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-6 pb-8"
            >
              <div className="relative rounded-3xl overflow-hidden bg-neutral-900/90 backdrop-blur-md border border-neutral-800 p-6 shadow-[0_0_50px_rgba(139,0,0,0.25)] text-center">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#8B0000] to-transparent shadow-[0_0_10px_#8B0000]" />

                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-[#ff3e3e] bg-red-950/40 py-1 px-3 rounded-full border border-red-900/30 inline-block mb-2">
                  일치하는 캐릭터
                </span>

                <div className="relative w-full max-w-[200px] aspect-[3/4] mx-auto my-5 rounded-2xl overflow-hidden border border-neutral-800 shadow-[0_0_20px_rgba(0,0,0,0.8)] bg-neutral-950 group">
                  <Image
                    src={result.character.imageUrl}
                    alt={result.character.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-w-768px) 100vw, 200px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                </div>

                <h2 className="text-3xl font-black text-white tracking-wider font-mono drop-shadow-[0_2px_6px_black]">
                  {result.character.name}
                </h2>
                <p className="text-xs font-black text-amber-500 mt-1 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]">
                  {result.character.title}
                </p>

                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {result.character.keywords.map((kw, i) => (
                    <span key={i} className="text-[10px] bg-neutral-950 text-neutral-300 px-2 py-0.5 rounded-md border border-neutral-800 font-bold">
                      #{kw}
                    </span>
                  ))}
                </div>

                <div className="mt-5 p-4 rounded-xl bg-neutral-950/80 border border-neutral-850 text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#8B0000]" />
                  <p className="text-xs text-neutral-300 leading-relaxed font-medium pl-2">
                    {result.character.description}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-left flex items-center gap-3">
                    {CHARACTERS[result.character.chemistry.best] && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-emerald-800 bg-neutral-950 shrink-0">
                        <Image
                          src={CHARACTERS[result.character.chemistry.best].imageUrl}
                          alt={result.character.chemistry.best}
                          fill
                          className="object-cover animate-pulse"
                          sizes="40px"
                        />
                      </div>
                    )}
                    <div>
                      <span className="text-[9px] text-emerald-400 uppercase tracking-wider block font-black mb-0.5">
                        최고의 동반자
                      </span>
                      <span className="text-xs font-bold text-neutral-200">
                        {result.character.chemistry.best}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-left flex items-center gap-3">
                    {CHARACTERS[result.character.chemistry.worst] && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-red-900/40 bg-neutral-950 shrink-0">
                        <Image
                          src={CHARACTERS[result.character.chemistry.worst].imageUrl}
                          alt={result.character.chemistry.worst}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    )}
                    <div>
                      <span className="text-[9px] text-red-400 uppercase tracking-wider block font-black mb-0.5">
                        상극의 인물
                      </span>
                      <span className="text-xs font-bold text-neutral-200">
                        {result.character.chemistry.worst}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 font-bold text-xs tracking-wider active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-neutral-400" />
                  <span>{copied ? '링크가 클립보드에 복사되었습니다!' : '내 결과 링크 공유하기'}</span>
                </button>

                <button
                  onClick={handleRetry}
                  className="w-full py-3.5 rounded-xl bg-[#8B0000] text-white font-bold text-xs tracking-wider hover:bg-[#a60000] hover:shadow-[0_0_20px_rgba(139,0,0,0.5)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer border border-red-700/30"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>심장을 다시 바치기 (다시 하기)</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function ShingekiClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Heart className="w-12 h-12 text-[#8B0000] animate-pulse" />
      </div>
    }>
      <ShingekiTestContent />
    </Suspense>
  );
}
