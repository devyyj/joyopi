'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

// ─────────────────────────────────────────────────────────
// 상수 및 타입
// ─────────────────────────────────────────────────────────

const CANVAS_H       = 640;
const HIT_ZONE_Y     = 530;
const HIT_BTN_R      = 44;
const NOTE_R         = 32;

const PERFECT_MS     = 70;
const GOOD_MS        = 150;
const AUTO_MISS_MS   = 190;
const TOTAL_PLAY_MS  = 60000; // 60초

const SCORE_PERFECT  = 10;
const SCORE_GOOD     = 5;
const SCORE_MISS_PEN = 3;

const SYS_FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
const F = (w: string, px: number) => `${w} ${px}px ${SYS_FONT}`;

const C_BG      = '#F7F9FF';
const C_SCORE   = '#0F172A';
const C_MUTED   = '#94A3B8';
const C_ACCENT  = '#6366F1';
const C_PERFECT = '#F59E0B';
const C_GOOD    = '#10B981';
const C_MISS    = '#EF4444';

interface Note { id: number; time: number; judged: boolean }
interface JudgeEffect { id: number; text: string; color: string; alpha: number; offsetY: number; createdAt: number }
interface HitPulse { createdAt: number; color: string }

interface GS {
  phase: 'idle' | 'playing' | 'result';
  startTime: number;
  elapsed: number;
  score: number;
  combo: number;
  maxCombo: number;
  perfectCnt: number;
  goodCnt: number;
  missCnt: number;
  notes: Note[];
  effects: JudgeEffect[];
  effectId: number;
  hitPulses: HitPulse[];
  pressed: boolean;
  canvasW: number;
  rafId: number;
  comboDisplay: { count: number; shownAt: number } | null;
}

function initGS(): GS {
  return {
    phase: 'idle', startTime: 0, elapsed: 0,
    score: 0, combo: 0, maxCombo: 0,
    perfectCnt: 0, goodCnt: 0, missCnt: 0,
    notes: [], effects: [], effectId: 0,
    hitPulses: [], pressed: false, canvasW: 400, rafId: 0,
    comboDisplay: null,
  };
}

// ─────────────────────────────────────────────────────────
// 유틸리티 함수
// ─────────────────────────────────────────────────────────

function getBPM(elapsed: number): number {
  if (elapsed < 20000) return 50;
  if (elapsed < 40000) return 60;
  return 70;
}

function getNoteSpeed(bpm: number): number {
  // 1박자 동안 이동하는 거리
  return (HIT_ZONE_Y - 60); 
}

let _noteId = 0;

function generateAllNotes(): Note[] {
  const notes: Note[] = [];
  const leadIn = 2000;
  let currentTime = leadIn;

  // 60초 분량의 노트를 생성 (연주/휴식 마디 패턴 적용)
  while (currentTime < leadIn + TOTAL_PLAY_MS) {
    const elapsed = currentTime - leadIn;
    const bpm = getBPM(elapsed);
    const beat = 60000 / bpm;
    const measure = beat * 4;

    // 연주 마디 (16분음표 단위로 생성 시도)
    for (let i = 0; i < 16; i++) {
      const noteT = currentTime + (beat / 4) * i;
      if (noteT >= leadIn + TOTAL_PLAY_MS) break;

      // 상향 조정된 생성 확률
      let spawnChance = 0.75;
      if (bpm === 60) spawnChance = 0.85;
      if (bpm === 70) spawnChance = 0.95;

      let canSpawn = false;
      if (bpm === 70) canSpawn = true; // 모든 16분음표 위치
      else if (bpm === 60) {
        // 8분음표 기본 + 가끔 16분음표
        if (i % 2 === 0) canSpawn = true;
        else if (Math.random() < 0.3) canSpawn = true; 
      }
      else if (bpm === 50) {
        // 4분음표 기본 + 8분음표까지 허용
        if (i % 4 === 0) canSpawn = true;
        else if (i % 2 === 0) canSpawn = true;
      }

      if (canSpawn && Math.random() < spawnChance) {
        // 최소 간격 제한을 줄여서 연타 유도 (스테이지 4 수준)
        const minGap = bpm === 70 ? (beat / 6) : (beat / 4.5);
        if (notes.length > 0 && noteT - notes[notes.length-1].time < minGap) continue;
        
        notes.push({ id: _noteId++, time: noteT, judged: false });
      }
    }

    // 다음 연주 마디 시작점으로 이동 (연주 마디 1 + 휴식 마디 1)
    currentTime += measure * 2;
  }
  return notes;
}

// ─────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────

export default function RhythmGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const gs        = useRef<GS>(initGS());
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const gameLoopRef = useRef<() => void>();

  const [phase, setPhase] = useState<'idle' | 'playing' | 'result'>('idle');
  const [result, setResult] = useState<any>(null);
  const [, setTick] = useState(0); 

  useEffect(() => {
    const img = new Image();
    img.src = '/ginani.png';
    img.onload = () => { imgRef.current = img; };
  }, []);

  const drawCircle = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    if (imgRef.current) ctx.drawImage(imgRef.current, x - r, y - r, r * 2, r * 2);
    else { ctx.fillStyle = C_ACCENT; ctx.fill(); }
    ctx.restore();
  }, []);

  const applyScore = useCallback((absDelta: number) => {
    const s = gs.current;
    const isPerfect = absDelta <= PERFECT_MS;
    const points = isPerfect ? SCORE_PERFECT : SCORE_GOOD;
    const text = isPerfect ? 'PERFECT' : 'GOOD';
    const color = isPerfect ? C_PERFECT : C_GOOD;

    s.score += points;
    s.combo++;
    if (isPerfect) s.perfectCnt++; else s.goodCnt++;
    if (s.combo > s.maxCombo) s.maxCombo = s.combo;
    
    s.comboDisplay = { count: s.combo, shownAt: s.elapsed };
    s.effects.push({ id: s.effectId++, text, color, alpha: 1, offsetY: 0, createdAt: s.elapsed });
    s.hitPulses.push({ createdAt: s.elapsed, color });
  }, []);

  const applyMiss = useCallback(() => {
    const s = gs.current;
    s.combo = 0;
    s.comboDisplay = null;
    s.score = Math.max(0, s.score - SCORE_MISS_PEN);
    s.missCnt++;
    s.effects.push({ id: s.effectId++, text: 'MISS', color: C_MISS, alpha: 1, offsetY: 0, createdAt: s.elapsed });
    s.hitPulses.push({ createdAt: s.elapsed, color: C_MISS });
  }, []);

  const pressNote = useCallback(() => {
    const s = gs.current;
    if (s.phase !== 'playing') return;
    s.pressed = true;

    let best: Note | null = null, bestDelta = Infinity;
    for (const n of s.notes) {
      if (n.judged) continue;
      const delta = s.elapsed - n.time;
      if (delta < -GOOD_MS || delta > AUTO_MISS_MS) continue;
      if (Math.abs(delta) < Math.abs(bestDelta)) { bestDelta = delta; best = n; }
    }
    if (best) {
      applyScore(Math.abs(bestDelta));
      const targetId = best.id;
      s.notes = s.notes.map(n => n.id === targetId ? { ...n, judged: true } : n);
    }
  }, [applyScore]);

  const endGame = useCallback(() => {
    const s = gs.current;
    setResult({ score: s.score, maxCombo: s.maxCombo, perfectCnt: s.perfectCnt, goodCnt: s.goodCnt, missCnt: s.missCnt });
    s.phase = 'result';
    setPhase('result');
  }, []);

  const startGame = useCallback(() => {
    const s = gs.current;
    Object.assign(s, initGS(), { phase: 'playing' });
    s.notes = generateAllNotes();
    s.startTime = performance.now();
    setPhase('playing');
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = gs.current;
    const W = s.canvasW;
    const cx = W / 2;

    ctx.fillStyle = C_BG;
    ctx.fillRect(0, 0, W, CANVAS_H);

    if (s.phase === 'idle') return;

    const leadIn = 2000;
    const rawElapsed = Math.max(0, s.elapsed - leadIn);
    const bpm = getBPM(rawElapsed);
    const beat = 60000 / bpm;
    const timeLeft = Math.max(0, (TOTAL_PLAY_MS - rawElapsed) / 1000);

    // 상단 진행 바
    const progress = Math.min(1, rawElapsed / TOTAL_PLAY_MS);
    ctx.fillStyle = 'rgba(226,232,240,0.8)';
    ctx.fillRect(0, 0, W, 6);
    ctx.fillStyle = C_ACCENT;
    ctx.fillRect(0, 0, W * progress, 6);

    // 타이머 및 BPM
    ctx.textAlign = 'center';
    ctx.font = F('900', 28);
    ctx.fillStyle = C_SCORE;
    ctx.fillText(`${timeLeft.toFixed(1)}s`, cx, 50);
    ctx.font = F('700', 14);
    ctx.fillStyle = C_MUTED;
    ctx.fillText(`BPM ${bpm}`, cx, 75);

    // 트랙
    ctx.fillStyle = 'rgba(99,102,241,0.05)';
    ctx.fillRect(cx - 40, 100, 80, HIT_ZONE_Y - 100);

    // 노트
    const spd = getNoteSpeed(bpm);
    for (const n of s.notes) {
      if (n.judged) continue;
      const y = HIT_ZONE_Y - (n.time - s.elapsed) * spd / beat;
      if (y < -50 || y > CANVAS_H + 50) continue;
      drawCircle(ctx, cx, y, NOTE_R, 1);
    }

    // 히트 구역
    drawCircle(ctx, cx, HIT_ZONE_Y, HIT_BTN_R, s.pressed ? 1 : 0.4);
    for (const p of s.hitPulses) {
      const age = s.elapsed - p.createdAt;
      if (age < 0 || age > 400) continue;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, HIT_ZONE_Y, Math.max(0, HIT_BTN_R + (age / 400) * 30), 0, Math.PI * 2);
      ctx.stroke();
    }

    // 효과
    for (const e of s.effects) {
      ctx.save();
      ctx.globalAlpha = e.alpha;
      ctx.font = F('900', 42);
      ctx.fillStyle = e.color;
      ctx.fillText(e.text, cx, HIT_ZONE_Y - 100 - e.offsetY);
      ctx.restore();
    }

    if (s.combo > 1 && s.comboDisplay && (s.elapsed - s.comboDisplay.shownAt < 800)) {
      ctx.font = F('900', 70);
      ctx.fillStyle = 'rgba(99,102,241,0.1)';
      ctx.fillText(`${s.combo}`, cx, 320);
    }

    // 점수
    ctx.textAlign = 'right';
    ctx.font = F('900', 36);
    ctx.fillStyle = C_SCORE;
    ctx.fillText(s.score.toLocaleString(), W - 25, 50);
  }, [drawCircle]);

  const gameLoop = useCallback(() => {
    const s = gs.current;
    const now = performance.now();

    if (s.phase === 'playing') {
      s.elapsed = now - s.startTime;
      
      s.notes = s.notes.map(n => {
        if (!n.judged && s.elapsed - n.time > AUTO_MISS_MS) {
          applyMiss();
          return { ...n, judged: true };
        }
        return n;
      });

      if (s.elapsed >= 2000 + TOTAL_PLAY_MS) {
        endGame();
      }
      
      s.effects = s.effects.map(e => {
        const age = s.elapsed - e.createdAt;
        return { ...e, alpha: Math.max(0, 1 - age / 600), offsetY: age * 0.08 };
      }).filter(e => e.alpha > 0);
      
      setTick(now); 
    }

    draw();
    s.rafId = requestAnimationFrame(() => gameLoopRef.current?.());
  }, [draw, applyMiss, endGame]);

  useEffect(() => { gameLoopRef.current = gameLoop; }, [gameLoop]);

  useEffect(() => {
    const s = gs.current;
    const updateSize = () => {
      s.canvasW = Math.min(wrapRef.current?.clientWidth || 400, 400);
      if (canvasRef.current) {
        canvasRef.current.width = s.canvasW;
        canvasRef.current.height = CANVAS_H;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    s.rafId = requestAnimationFrame(() => gameLoopRef.current?.());
    return () => {
      window.removeEventListener('resize', updateSize);
      if (s.rafId) cancelAnimationFrame(s.rafId);
    };
  }, []);

  useEffect(() => {
    const onDown = (e: any) => { if (e.type === 'keydown' || (e.target as HTMLElement).tagName !== 'BUTTON') pressNote(); };
    const onUp = () => { gs.current.pressed = false; };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchend', onUp);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchstart', onDown);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [pressNote]);

  return (
    <div ref={wrapRef} className="relative w-full max-w-[400px] mx-auto select-none overflow-hidden rounded-3xl shadow-2xl bg-white" style={{ height: CANVAS_H }}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {phase === 'playing' && (
        <button onClick={endGame} className="absolute top-[85px] left-5 z-20 text-[10px] font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded-lg bg-white/50 backdrop-blur-sm hover:bg-white transition-colors">QUIT</button>
      )}

      {phase === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-[#F7F9FF]/95 backdrop-blur-md px-10">
          <div className="w-24 h-24 mb-8 bg-white rounded-[32px] shadow-xl flex items-center justify-center border-4 border-white overflow-hidden animate-pulse">
            <img src="/ginani.png" alt="logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tighter">Rhythm Me</h1>
          <p className="text-sm text-slate-500 text-center mb-12 leading-relaxed font-medium">
            60초 동안 점진적으로 빨라지는 비트!<br/>20초마다 BPM이 상승합니다.
          </p>
          <button onClick={startGame} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-transform text-lg">시작하기</button>
        </div>
      )}

      {phase === 'result' && result && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#F7F9FF]/98 backdrop-blur-xl px-8">
          <p className="text-sm font-black text-indigo-500 mb-2 uppercase tracking-[0.2em]">Game Results</p>
          <div className="bg-white p-8 rounded-[48px] shadow-2xl border border-white flex flex-col items-center w-full">
            <div className="mb-6 flex flex-col items-center">
              <p className="text-[80px] font-black text-slate-900 leading-none tabular-nums tracking-tighter">{result.score.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-widest uppercase">Total Ginani Score</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 w-full mb-8 pb-6 border-b border-slate-50">
              {[
                { label: 'PERFECT', value: result.perfectCnt, color: 'text-amber-500' },
                { label: 'GOOD', value: result.goodCnt, color: 'text-emerald-500' },
                { label: 'MISS', value: result.missCnt, color: 'text-red-400' },
              ].map(r => (
                <div key={r.label} className="text-center">
                  <p className={`text-xl font-black ${r.color}`}>{r.value}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{r.label}</p>
                </div>
              ))}
            </div>

            <div className="w-full text-center mb-8">
               <p className="text-xs font-bold text-slate-300 mb-1 uppercase">Max Combo</p>
               <p className="text-2xl font-black text-slate-700">{result.maxCombo}</p>
            </div>

            <button onClick={startGame} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-transform">다시 도전하기</button>
          </div>
        </div>
      )}
    </div>
  );
}
