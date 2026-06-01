'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Heart, RefreshCw, Share2, Swords } from 'lucide-react';
import { getQuestions, calculateResult, getParticipantCount } from '../actions/shingeki';
import { Question, Character, Option, CHARACTERS, SHINGEKI_VERSION } from '../actions/shingekiData';

type Step = 'home' | 'testing' | 'analyzing' | 'result';

export default function ShingekiTestPage() {
  const [step, setStep] = useState<Step>('home');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; answer: 'A' | 'B' | 'C' | 'D' }[]>([]);
  const [result, setResult] = useState<{ character: Character; scores: Record<string, number> } | null>(null);
  const [totalParticipants, setTotalParticipants] = useState(0); // DB 조회 전 0으로 초기화
  const [copied, setCopied] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const searchParams = useSearchParams();

  // 인트로 페이즈 진입 시 사전에 질문 로딩 및 실시간 카운트 조회
  useEffect(() => {
    // Hide global header for this page
    document.body.setAttribute('data-hide-header', 'true');
    return () => {
      document.body.removeAttribute('data-hide-header');
    };
  }, []);

  // Load only participant count on mount; questions will be loaded on start with augmentation
  useEffect(() => {
    async function load() {
      const realCount = await getParticipantCount();
      setTotalParticipants(realCount);
    }
    load();
  }, []);

  // Handle share‑link query parameter
  useEffect(() => {
    const charParam = searchParams?.get('c');
    if (charParam && !result) {
      // 디코딩된 파라미터(예: "에런 예거")와 정확히 일치하는 키가 없을 경우
      // 공백을 제거한 뒤 비교해 유사 매칭을 시도합니다.
      let character: Character | undefined = CHARACTERS[charParam as keyof typeof CHARACTERS];
      if (!character) {
        const normalizedParam = charParam.replace(/\s/g, "");
        const entry = Object.entries(CHARACTERS).find(([key]) => key.replace(/\s/g, "") === normalizedParam);
        if (entry) character = entry[1];
      }
      if (character) {
        // Defer state updates to avoid synchronous setState inside the effect body
        setTimeout(() => {
          setResult({ character, scores: {} });
          setStep('result');
        }, 0);
      }
    }
  }, [searchParams, result]);

  const handleStart = async () => {
    if (isStarting) return;
    setIsStarting(true);
    // 언제나 새 질문을 받아오고 옵션을 보강·섞음
    const raw = await getQuestions();
    const enriched = raw.map((q) => {
      const opts = [...q.options];
      const optMap: Record<string, Option> = {};
      opts.forEach((o) => (optMap[o.key] = o));
      if (!optMap['C']) {
        const base = optMap['A'];
        opts.push({ key: 'C', text: base?.text ?? '옵션 C', scores: base?.scores ?? {} });
      }
      if (!optMap['D']) {
        const base = optMap['B'];
        opts.push({ key: 'D', text: base?.text ?? '옵션 D', scores: base?.scores ?? {} });
      }
      const shuffled = opts.sort(() => Math.random() - 0.5);
      return { ...q, options: shuffled };
    });
    setQuestions(enriched);
    setAnswers([]);
    setCurrentIdx(0);
    setIsStarting(false);
    setStep('testing');
  };

  const handleAnswerSelect = (key: 'A' | 'B' | 'C' | 'D') => {
    const activeQuestion = questions[currentIdx];
    const newAnswers = [...answers, { questionId: activeQuestion.id, answer: key }];
    setAnswers(newAnswers);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // 분석 로딩 단계로 이동
      setStep('analyzing');
      setTimeout(async () => {
        const finalResult = await calculateResult(newAnswers);
        setResult(finalResult);
        setStep('result');
      }, 3500); // 3.5초 몰입 로딩 연출
    }
  };

  const handleRetry = async () => {
    setResult(null);
    const raw = await getQuestions();
    const enriched = raw.map((q) => {
      const opts = [...q.options];
      const optMap: Record<string, Option> = {};
      opts.forEach((o) => (optMap[o.key] = o));
      if (!optMap['C']) {
        const base = optMap['A'];
        opts.push({ key: 'C', text: base?.text ?? '옵션 C', scores: base?.scores ?? {} });
      }
      if (!optMap['D']) {
        const base = optMap['B'];
        opts.push({ key: 'D', text: base?.text ?? '옵션 D', scores: base?.scores ?? {} });
      }
      const shuffled = opts.sort(() => Math.random() - 0.5);
      return { ...q, options: shuffled };
    });
    setQuestions(enriched);
    setCurrentIdx(0);
    setAnswers([]);
    setStep('home');
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
      {/* 웅장하고 몰입감 있는 붉은 그라데이션 및 Smoky/Particle 배경 연출 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8B000022,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#120000,transparent_80%)] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,#00000099_100%)] pointer-events-none" />

      {/* 헤더 */}
      <header className="z-10 w-full max-w-lg flex justify-between items-center border-b border-neutral-800 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#8B0000] drop-shadow-[0_0_8px_#8B0000]" />
          <span className="text-xs font-bold tracking-[0.2em] text-neutral-400">조사병단 입단 테스트</span>
        </div>
        <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">Version {SHINGEKI_VERSION}</span>
      </header>

      {/* 메인 콘텐츠 영역 (AnimatePresence 활용 슬라이드 효과) */}
      <main className="z-10 w-full max-w-lg flex-1 flex flex-col justify-center my-auto relative">
        <AnimatePresence mode="wait">
          {/* 1. 홈/인트로 화면 */}
          {step === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-6"
            >
              <div className="flex justify-center mb-6">
                <div className="relative p-6 rounded-full bg-neutral-900 border border-neutral-800/80 shadow-[0_0_30px_rgba(139,0,0,0.15)] group cursor-pointer">
                  <div className="absolute inset-0 rounded-full bg-[#8B0000]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                  <Swords className="w-16 h-16 text-[#8B0000] animate-pulse drop-shadow-[0_0_12px_#8B0000]" />
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-black tracking-wider text-white mb-2 font-mono drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                심장을 바쳐라!
              </h1>
              <p className="text-xs uppercase tracking-[0.2em] text-[#ff2e2e] font-black mb-8 font-mono tracking-widest drop-shadow-[0_0_8px_#8B0000]">
                心臓を捧げよ！ (Shinzou wo Sasageyo!)
              </p>

              <div className="p-5 rounded-2xl bg-neutral-900/60 backdrop-blur-md border border-neutral-800 shadow-2xl mb-8 text-left space-y-3">
                <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                  벽 내부의 평화가 깨지고 초대형 거인의 위협이 인류를 옥죄어 옵니다. 당신은 혹독하고 잔혹한 운명의 세계관 속에 던져졌습니다.
                </p>
                <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                  매 순간 극단적인 생존 위기 속에서 당신이 내리는 피의 결정은 어떤 인물의 영혼과 공명할까요? 당신의 숨겨진 투지와 본능을 도출합니다.
                </p>
              </div>

              <button
                onClick={handleStart}
                disabled={isStarting}
                className="w-full py-4 px-8 rounded-xl bg-gradient-to-r from-[#8B0000] to-[#b30000] hover:from-[#a60000] hover:to-[#e60000] text-white font-bold tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(139,0,0,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-sm cursor-pointer border border-[#ff3e3e]/20"
              >
                <span>{isStarting ? '전장으로 출격 중...' : '인류의 날개를 펼쳐 입단하기'}</span>
                <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              </button>

              <div className="mt-8 text-neutral-500 text-[11px] font-semibold flex justify-center items-center gap-4">
                <span>총 참전자 <b className="text-neutral-300">{totalParticipants.toLocaleString()}</b>명</span>
                <span className="w-1 h-1 bg-neutral-700 rounded-full" />
                <span>소요시간 약 1분</span>
              </div>
            </motion.div>
          )}

          {/* 2. 질문 진행 화면 */}
          {step === 'testing' && questions.length > 0 && (
            <motion.div
              key={`testing-${currentIdx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full space-y-6"
            >
              {/* 상단 인디케이터 */}
              <div className="flex justify-between items-center text-xs font-bold text-neutral-400">
                <span className="text-[#ff3e3e] font-black drop-shadow-[0_0_6px_#8B0000]">QUESTION {currentIdx + 1} / 12</span>
                <span className="bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded text-[10px] text-neutral-400">대분류: {questions[currentIdx].category}</span>
              </div>

              {/* 진행률 게이지 바 */}
              <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-850">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#8B0000] via-[#d60000] to-[#ff3e3e] shadow-[0_0_8px_#ff3e3e]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIdx + 1) / 12) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* 질문 박스 */}
              <div className="min-h-[130px] flex items-center justify-center py-6 px-5 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-2xl text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#8B00000a] to-transparent pointer-events-none" />
                <h2 className="text-lg md:text-xl font-extrabold leading-relaxed text-neutral-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                  {questions[currentIdx].question}
                </h2>
              </div>

              {/* 선택지 목록 */}
              <div className="space-y-3">
                {questions[currentIdx].options.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleAnswerSelect(opt.key)}
                    className="w-full text-left py-4 px-5 rounded-xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-[#8B0000]/80 transition-all active:scale-[0.99] flex gap-3 text-xs leading-relaxed group shadow-lg cursor-pointer"
                  >
                    <span className="font-mono font-black text-[#ff3e3e] group-hover:text-red-400 shrink-0">
                      [{opt.key}]
                    </span>
                    <span className="text-neutral-300 font-semibold group-hover:text-white transition-colors">
                      {opt.text}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* 3. 분석 / 로딩 화면 */}
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

          {/* 4. 결과 화면 */}
          {step === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-6 pb-8"
            >
              {/* 캐릭터 결과 카드 */}
              <div className="relative rounded-3xl overflow-hidden bg-neutral-900/90 backdrop-blur-md border border-neutral-800 p-6 shadow-[0_0_50px_rgba(139,0,0,0.25)] text-center">
                {/* 장식적 탑 배너 */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#8B0000] to-transparent shadow-[0_0_10px_#8B0000]" />

                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-[#ff3e3e] bg-red-950/40 py-1 px-3 rounded-full border border-red-900/30 inline-block mb-2">
                  MATCHING CHARACTER
                </span>

                {/* 캐릭터 일러스트 카드 */}
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

                {/* 성향 키워드 */}
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {result.character.keywords.map((kw, i) => (
                    <span key={i} className="text-[10px] bg-neutral-950 text-neutral-300 px-2 py-0.5 rounded-md border border-neutral-800 font-bold">
                      #{kw}
                    </span>
                  ))}
                </div>

                {/* 상세 설명 */}
                <div className="mt-5 p-4 rounded-xl bg-neutral-950/80 border border-neutral-850 text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#8B0000]" />
                  <p className="text-xs text-neutral-300 leading-relaxed font-medium pl-2">
                    {result.character.description}
                  </p>
                </div>

                {/* 케미스트리 궁합 */}
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

              {/* 액션 버튼 */}
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

      {/* 푸터 */}
      <footer className="z-10 w-full max-w-lg text-center border-t border-neutral-900 pt-4 mt-4">
        <p className="text-[10px] text-neutral-500 font-medium leading-normal">
          본 서비스는 팬 메이드 콘텐츠로, 원작사 및 저작권자 소유의 모든 저작권을 존중합니다.<br />
          &copy; 2026 Dedicate Your Heart Team. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
