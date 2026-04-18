'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

// ── 레이아웃 상수 ──────────────────────────────────────────
const CANVAS_H   = 640;
const HIT_ZONE_Y = 570;
const HIT_BTN_R  = 34;
const NOTE_R     = 27;

// ── 판정 허용 오차 (ms) ──────────────────────────────────
const PERFECT_MS   = 70;
const GOOD_MS      = 150;
const AUTO_MISS_MS = 190;

// ── 게임 타임라인 ─────────────────────────────────────────
const LEAD_IN_MS  = 2_000;   // 노트 없는 준비 구간
const STAGE_MS    = 30_000;  // 스테이지 길이
const TRANS_MS    = 3_000;   // 스테이지 전환 (노트 없음)
const CYCLE_MS    = STAGE_MS + TRANS_MS;
const MAX_STAGES  = 20;      // 사전 생성 최대 스테이지

// ── BPM / 점수 ────────────────────────────────────────────
const BASE_BPM       = 50;
const BPM_INC        = 5;
const SCORE_PERFECT  = 10;
const SCORE_GOOD     = 5;
const SCORE_MISS_PEN = 5;

// ── 색상 ─────────────────────────────────────────────────
const C_BG      = '#F5F6FA';
const C_TEXT    = '#1C1917';
const C_MUTED   = '#94A3B8';
const C_DANGER  = '#EF4444';
const C_PERFECT = '#F59E0B';
const C_GOOD    = '#10B981';
const C_MISS    = '#EF4444';
const C_ACCENT  = '#64748B';
const C_RGB     = '100,116,139';

const SYS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
const F = (w: string, px: number) => `${w} ${px}px ${SYS}`;

// ── 스테이지 정보 계산 ────────────────────────────────────
function stageInfo(elapsed: number) {
  if (elapsed < LEAD_IN_MS) {
    return { stageNum: 1, bpm: BASE_BPM, inTrans: false, stageLeft: STAGE_MS, progress: 0, transLeft: 0 };
  }
  const ge = elapsed - LEAD_IN_MS;
  const si = Math.floor(ge / CYCLE_MS);
  const ce = ge - si * CYCLE_MS;
  const inTrans  = ce >= STAGE_MS;
  const bpm      = BASE_BPM + si * BPM_INC;
  const stageLeft = inTrans ? 0 : Math.max(0, STAGE_MS - ce);
  const progress  = inTrans ? 1 : ce / STAGE_MS;
  const transLeft = inTrans ? Math.max(0, TRANS_MS - (ce - STAGE_MS)) : 0;
  return { stageNum: si + 1, bpm, inTrans, stageLeft, progress, transLeft };
}

// ── 타입 ─────────────────────────────────────────────────
interface Note     { id: number; time: number; lane: 0|1|2; judged: boolean }
interface Effect   { id: number; text: string; color: string; alpha: number; oy: number; at: number; lane: number }
interface Pulse    { at: number; color: string; lane: number }
interface ComboAnim { count: number; at: number }
interface GameResult { score: number; maxCombo: number; perfectCnt: number; goodCnt: number; missCnt: number; stageReached: number }

interface GS {
  phase: 'idle' | 'playing' | 'result';
  startTime: number; elapsed: number;
  score: number; combo: number; maxCombo: number;
  perfectCnt: number; goodCnt: number; missCnt: number;
  notes: Note[]; effects: Effect[]; eid: number;
  pulses: Pulse[]; comboAnim: ComboAnim | null;
  lanes: boolean[]; canvasW: number; rafId: number; stageReached: number;
}

function initGS(): GS {
  return {
    phase: 'idle', startTime: 0, elapsed: 0,
    score: 0, combo: 0, maxCombo: 0,
    perfectCnt: 0, goodCnt: 0, missCnt: 0,
    notes: [], effects: [], eid: 0,
    pulses: [], comboAnim: null,
    lanes: [false, false, false], canvasW: 400, rafId: 0, stageReached: 1,
  };
}

// ── 노트 사전 생성 ────────────────────────────────────────
let _nid = 0;
function generateNotes(): Note[] {
  const SPAWN = 0.58;
  const notes: Note[] = [];

  for (let si = 0; si < MAX_STAGES; si++) {
    const bpm   = BASE_BPM + si * BPM_INC;
    const beat  = 60_000 / bpm;
    const iv    = beat / 4;           // 16분음표 간격
    const start = LEAD_IN_MS + si * CYCLE_MS;
    const end   = start + STAGE_MS;
    let streak = 0;
    let lastT  = -Infinity;

    for (let t = start; t < end; t += iv) {
      if (streak >= 4 || Math.random() >= SPAWN || t - lastT < iv * 0.75) {
        streak = streak >= 4 ? 0 : streak;
        continue;
      }
      const lane = Math.floor(Math.random() * 3) as 0|1|2;
      notes.push({ id: _nid++, time: t, lane, judged: false });
      lastT = t; streak++;
    }
  }
  return notes;
}

// ─────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────
export default function RhythmGame() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);
  const gs          = useRef<GS>(initGS());
  const powImgs     = useRef<(HTMLImageElement | null)[]>([null, null, null]);
  const gameLoopRef = useRef<() => void>(undefined);
  const meowRefs    = useRef<HTMLAudioElement[]>([]);
  const purrRef     = useRef<HTMLAudioElement | null>(null);

  const [phase, setPhase]   = useState<'idle' | 'playing' | 'result'>('idle');
  const [result, setResult] = useState<GameResult | null>(null);
  const [, tick]            = useState(0);

  // ── 에셋 로드 ────────────────────────────────────────────
  useEffect(() => {
    ['/cat/pow1.png', '/cat/pow2.png', '/cat/pow3.png'].forEach((src, i) => {
      const img = new Image(); img.src = src;
      img.onload = () => { powImgs.current[i] = img; };
    });
    meowRefs.current = [new Audio('/cat/meow1.mp3'), new Audio('/cat/meow2.mp3')];
    purrRef.current  = new Audio('/cat/purr.mp3');
  }, []);

  // ── 레인 X 좌표 ──────────────────────────────────────────
  const laneX = useCallback((lane: number) => {
    const lw = gs.current.canvasW / 3;
    return lw * lane + lw / 2;
  }, []);

  // ── 효과음 ───────────────────────────────────────────────
  const playMeow = useCallback(() => {
    const a = meowRefs.current[Math.floor(Math.random() * 2)];
    if (!a) return;
    a.currentTime = 0; a.play().catch(() => {});
  }, []);

  const playPurr = useCallback(() => {
    const a = purrRef.current;
    if (!a) return;
    a.currentTime = 0; a.play().catch(() => {});
  }, []);

  // ── 이미지 그리기 ─────────────────────────────────────────
  const drawPow = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, r: number, lane: number, alpha: number) => {
    const img = powImgs.current[lane];
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    if (img) ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
    else { ctx.fillStyle = C_ACCENT; ctx.fill(); }
    ctx.restore();
  }, []);

  // ── 판정 처리 ─────────────────────────────────────────────
  const applyScore = useCallback((delta: number, lane: number) => {
    const s = gs.current;
    const perfect = delta <= PERFECT_MS;
    s.combo++;
    s.score += (perfect ? SCORE_PERFECT : SCORE_GOOD) + s.combo;
    if (perfect) s.perfectCnt++; else s.goodCnt++;
    if (s.combo > s.maxCombo) s.maxCombo = s.combo;
    s.comboAnim = { count: s.combo, at: s.elapsed };
    const text  = perfect ? '퍼펙냥!' : '좋아옹!';
    const color = perfect ? C_PERFECT : C_GOOD;
    s.effects.push({ id: s.eid++, text, color, alpha: 1, oy: 0, at: s.elapsed, lane });
    s.pulses.push({ at: s.elapsed, color, lane });
    playMeow();
  }, [playMeow]);

  const applyMiss = useCallback((lane: number) => {
    const s = gs.current;
    s.combo = 0; s.comboAnim = null;
    s.score = Math.max(0, s.score - SCORE_MISS_PEN);
    s.missCnt++;
    s.effects.push({ id: s.eid++, text: '놓쳤냥', color: C_MISS, alpha: 1, oy: 0, at: s.elapsed, lane });
    s.pulses.push({ at: s.elapsed, color: C_MISS, lane });
    playPurr();
  }, [playPurr]);

  // ── 입력 처리 ─────────────────────────────────────────────
  const pressLane = useCallback((lane: 0|1|2) => {
    const s = gs.current;
    if (s.phase !== 'playing') return;
    const info = stageInfo(s.elapsed);
    if (info.inTrans || s.elapsed < LEAD_IN_MS) return;

    s.lanes[lane] = true;
    let best: Note | null = null;
    let bestDelta = Infinity;

    for (const n of s.notes) {
      if (n.judged || n.lane !== lane) continue;
      const d = s.elapsed - n.time;
      if (d < -GOOD_MS || d > AUTO_MISS_MS) continue;
      if (Math.abs(d) < Math.abs(bestDelta)) { bestDelta = d; best = n; }
    }

    if (best) {
      applyScore(Math.abs(bestDelta), lane);
      const id = best.id;
      s.notes = s.notes.map(n => n.id === id ? { ...n, judged: true } : n);
    } else {
      applyMiss(lane); // 빈 레인 클릭 = 미스
    }
  }, [applyScore, applyMiss]);

  // ── 게임 흐름 ─────────────────────────────────────────────
  const endGame = useCallback(() => {
    const s = gs.current;
    if (s.phase !== 'playing') return;
    setResult({ score: s.score, maxCombo: s.maxCombo, perfectCnt: s.perfectCnt, goodCnt: s.goodCnt, missCnt: s.missCnt, stageReached: s.stageReached });
    s.phase = 'result'; setPhase('result');
  }, []);

  const startGame = useCallback(() => {
    const s = gs.current;
    const w = s.canvasW;
    Object.assign(s, initGS(), { phase: 'playing', canvasW: w });
    s.notes = generateNotes();
    s.startTime = performance.now();
    setPhase('playing');
  }, []);

  // ── 캔버스 렌더링 ─────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const s = gs.current;
    const W = s.canvasW;
    const lw = W / 3;
    const cx = W / 2;

    ctx.fillStyle = C_BG; ctx.fillRect(0, 0, W, CANVAS_H);
    if (s.phase === 'idle') return;

    const info = stageInfo(s.elapsed);
    const { stageNum, bpm, inTrans, stageLeft, progress, transLeft } = info;
    if (stageNum > s.stageReached) s.stageReached = stageNum;

    const beat     = 60_000 / bpm;
    const isDanger = stageLeft <= 10_000 && stageLeft > 0 && !inTrans;

    // ── 진행 바 ──
    ctx.fillStyle = `rgba(${C_RGB},0.1)`;
    ctx.fillRect(0, 0, W, 8);
    if (progress > 0) {
      const g = ctx.createLinearGradient(0, 0, W * progress, 0);
      g.addColorStop(0, `rgba(${C_RGB},0.45)`); g.addColorStop(1, C_ACCENT);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W * progress, 8);
    }

    // ── 레인 구분선 ──
    ctx.strokeStyle = `rgba(${C_RGB},0.08)`; ctx.lineWidth = 1;
    for (let l = 1; l < 3; l++) {
      ctx.beginPath(); ctx.moveTo(l * lw, 8); ctx.lineTo(l * lw, CANVAS_H); ctx.stroke();
    }

    // ── 스테이지 번호 (좌측) ──
    ctx.textAlign = 'left';
    ctx.font = F('700', 13); ctx.fillStyle = C_MUTED;
    ctx.fillText('STAGE', 14, 30);
    ctx.font = F('900', 48); ctx.fillStyle = inTrans ? C_ACCENT : C_TEXT;
    ctx.fillText(`${stageNum}`, 12, 76);

    // ── BPM (좌측) ──
    ctx.font = F('800', 16); ctx.fillStyle = C_ACCENT;
    ctx.fillText(`${bpm} BPM`, 14, 97);

    // ── 타이머 (중앙) ──
    ctx.textAlign = 'center';
    if (!inTrans) {
      ctx.font = F('900', 72);
      ctx.fillStyle = isDanger ? C_DANGER : C_TEXT;
      if (isDanger) { ctx.shadowColor = C_DANGER; ctx.shadowBlur = 22; }
      ctx.fillText(`${Math.ceil(stageLeft / 1000)}`, cx, 82);
      ctx.shadowBlur = 0;
    } else {
      // 전환 카운트다운
      const nextBpm = bpm + BPM_INC;
      ctx.font = F('900', 22); ctx.fillStyle = C_ACCENT;
      ctx.fillText(`STAGE ${stageNum + 1}`, cx, 34);
      ctx.font = F('700', 16); ctx.fillStyle = C_MUTED;
      ctx.fillText(`${nextBpm} BPM`, cx, 55);
      ctx.font = F('900', 64); ctx.fillStyle = C_DANGER;
      ctx.shadowColor = C_DANGER; ctx.shadowBlur = 20;
      ctx.fillText(`${Math.ceil(transLeft / 1000)}`, cx, 110);
      ctx.shadowBlur = 0;
    }

    // ── 점수 (우측) ──
    ctx.textAlign = 'right';
    ctx.font = F('900', 48); ctx.fillStyle = C_TEXT;
    ctx.fillText(s.score.toLocaleString(), W - 12, 70);
    ctx.font = F('700', 13); ctx.fillStyle = C_MUTED;
    ctx.fillText('점수', W - 14, 89);

    // ── 노트 ──
    const spd = HIT_ZONE_Y - 110;
    for (const n of s.notes) {
      if (n.judged) continue;
      const nx = laneX(n.lane);
      const y  = HIT_ZONE_Y - (n.time - s.elapsed) * spd / beat;
      if (y < -60 || y > CANVAS_H + 60) continue;
      const prox = Math.max(0, 1 - Math.abs(y - HIT_ZONE_Y) / 260);
      ctx.beginPath(); ctx.arc(nx, y, NOTE_R + 5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${C_RGB},${prox * 0.5})`; ctx.lineWidth = 2.5; ctx.stroke();
      drawPow(ctx, nx, y, NOTE_R, n.lane, 0.38 + prox * 0.62);
    }

    // ── 히트존 ──
    for (let l = 0; l < 3; l++) {
      const nx  = laneX(l);
      const pressed = s.lanes[l];
      const pulse   = Math.sin(s.elapsed / 360 + l * 2.1) * 0.5 + 0.5;

      ctx.beginPath(); ctx.arc(nx, HIT_ZONE_Y, HIT_BTN_R + 12 + pulse * 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${C_RGB},${0.06 + pulse * 0.06})`; ctx.lineWidth = 2; ctx.stroke();

      ctx.beginPath(); ctx.arc(nx, HIT_ZONE_Y, HIT_BTN_R, 0, Math.PI * 2);
      ctx.strokeStyle = pressed ? C_ACCENT : `rgba(${C_RGB},0.3)`;
      ctx.lineWidth = pressed ? 4.5 : 2;
      if (pressed) { ctx.shadowColor = C_ACCENT; ctx.shadowBlur = 20; }
      ctx.stroke(); ctx.shadowBlur = 0;

      drawPow(ctx, nx, HIT_ZONE_Y, HIT_BTN_R - 4, l, pressed ? 0.9 : 0.2);
    }

    // ── 히트 펄스 ──
    for (const p of s.pulses) {
      const age = s.elapsed - p.at;
      if (age < 0 || age > 500) continue;
      const t = age / 500;
      ctx.beginPath(); ctx.arc(laneX(p.lane), HIT_ZONE_Y, HIT_BTN_R + t * 50, 0, Math.PI * 2);
      ctx.strokeStyle = p.color; ctx.lineWidth = 3;
      ctx.globalAlpha = (1 - t) * 0.7; ctx.stroke(); ctx.globalAlpha = 1;
    }

    // ── 판정 텍스트 ──
    for (const e of s.effects) {
      ctx.save();
      ctx.globalAlpha = e.alpha;
      ctx.font = F('900', 44); ctx.fillStyle = e.color;
      ctx.textAlign = 'center'; ctx.shadowColor = e.color; ctx.shadowBlur = 14;
      ctx.fillText(e.text, laneX(e.lane), HIT_ZONE_Y - 85 - e.oy);
      ctx.restore();
    }

    // ── 콤보 팝업 ──
    if (s.comboAnim && s.combo > 1) {
      const age = s.elapsed - s.comboAnim.at;
      if (age >= 0 && age < 900) {
        let sc = 1, al = 1;
        if (age < 150)      sc = 0.4 + (age / 150) * 0.9;
        else if (age < 280) sc = 1.3 - ((age - 150) / 130) * 0.3;
        if (age > 550)      al = 1 - (age - 550) / 350;
        ctx.save();
        ctx.globalAlpha = al * 0.88;
        ctx.font = F('800', Math.round(22 * Math.min(1, sc)));
        ctx.fillStyle = C_ACCENT; ctx.textAlign = 'center';
        ctx.shadowColor = C_ACCENT; ctx.shadowBlur = 8;
        ctx.fillText(`${s.comboAnim.count} 콤보`, cx, CANVAS_H / 2 + 20);
        ctx.restore();
      }
    }
  }, [drawPow, laneX]);

  // ── 게임 루프 ─────────────────────────────────────────────
  const gameLoop = useCallback(() => {
    const s   = gs.current;
    const now = performance.now();
    if (s.phase !== 'idle') s.elapsed = now - s.startTime;

    if (s.phase === 'playing') {
      const info = stageInfo(s.elapsed);
      if (!info.inTrans && s.elapsed >= LEAD_IN_MS) {
        s.notes = s.notes.map(n => {
          if (!n.judged && s.elapsed - n.time > AUTO_MISS_MS) {
            applyMiss(n.lane);
            return { ...n, judged: true };
          }
          return n;
        });
      } else if (info.inTrans) {
        s.lanes = [false, false, false];
      }
      tick(now);
    }

    s.effects = s.effects
      .map(e => ({ ...e, alpha: Math.max(0, 1 - (s.elapsed - e.at) / 500), oy: (s.elapsed - e.at) * 0.1 }))
      .filter(e => e.alpha > 0);
    s.pulses = s.pulses.filter(p => s.elapsed - p.at < 500);

    draw();
    s.rafId = requestAnimationFrame(() => gameLoopRef.current?.());
  }, [draw, applyMiss, tick]);

  useEffect(() => { gameLoopRef.current = gameLoop; }, [gameLoop]);

  useEffect(() => {
    const s = gs.current;
    const resize = () => {
      s.canvasW = Math.min(wrapRef.current?.clientWidth || 400, 400);
      if (canvasRef.current) {
        canvasRef.current.width  = s.canvasW;
        canvasRef.current.height = CANVAS_H;
      }
    };
    resize();
    window.addEventListener('resize', resize);
    s.rafId = requestAnimationFrame(() => gameLoopRef.current?.());
    return () => { window.removeEventListener('resize', resize); if (s.rafId) cancelAnimationFrame(s.rafId); };
  }, []);

  // ── 입력 이벤트 등록 ─────────────────────────────────────
  useEffect(() => {
    const getLane = (clientX: number): 0|1|2 => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return 1;
      const x = clientX - rect.left;
      return Math.min(2, Math.floor(x / (rect.width / 3))) as 0|1|2;
    };

    const onMouse = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      pressLane(getLane(e.clientX));
    };
    const onTouch = (e: TouchEvent) => {
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      Array.from(e.changedTouches).forEach(t => pressLane(getLane(t.clientX)));
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      const lane: 0|1|2 = (k === 'a' || k === 'arrowleft') ? 0 : (k === 'd' || k === 'arrowright') ? 2 : 1;
      pressLane(lane);
    };
    const onUp = () => { gs.current.lanes = [false, false, false]; };

    window.addEventListener('mousedown', onMouse);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchend', onUp);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('mousedown', onMouse);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchend', onUp);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onUp);
    };
  }, [pressLane]);

  // ── React UI 레이어 ───────────────────────────────────────
  return (
    <div
      ref={wrapRef}
      className="relative w-full max-w-[400px] mx-auto select-none overflow-hidden rounded-3xl shadow-2xl"
      style={{ height: CANVAS_H, background: C_BG }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* 게임 중 그만 버튼 — 우측 하단 */}
      {phase === 'playing' && (
        <button
          onClick={endGame}
          className="absolute bottom-4 right-4 z-20 text-xs font-bold px-3 py-2 rounded-xl"
          style={{ color: C_MUTED, border: '1px solid rgba(148,163,184,0.3)', background: 'rgba(255,255,255,0.75)' }}
        >
          그만
        </button>
      )}

      {/* ── 시작 화면 ── */}
      {phase === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 px-8"
          style={{ background: 'rgba(245,246,250,0.97)' }}>
          <h1 className="text-5xl font-black tracking-tighter mb-2" style={{ color: C_TEXT }}>
            Rhythm Cat
          </h1>
          <p className="text-sm font-medium mb-1" style={{ color: C_MUTED }}>3레인 · 스테이지마다 BPM +5</p>
          <p className="text-sm font-bold mb-8" style={{ color: C_ACCENT }}>시작 {BASE_BPM} BPM · 스테이지당 30초</p>

          <div className="w-full rounded-2xl p-4 mb-5" style={{ background: '#fff', border: `1.5px solid rgba(${C_RGB},0.15)` }}>
            <p className="text-xs font-bold mb-3" style={{ color: C_MUTED }}>조작 방법</p>
            <div className="flex justify-between">
              {['← A키', '스페이스 / 클릭', 'D키 →'].map((t, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white"
                    style={{ background: C_ACCENT }}>
                    {i + 1}
                  </div>
                  <p className="text-xs font-bold text-center" style={{ color: C_TEXT }}>{t}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full rounded-2xl p-4 mb-8" style={{ background: '#fff', border: `1.5px solid rgba(${C_RGB},0.15)` }}>
            <p className="text-xs font-bold mb-2" style={{ color: C_MUTED }}>점수</p>
            <div className="flex justify-between text-xs font-bold">
              <span style={{ color: C_PERFECT }}>퍼펙냥 +10</span>
              <span style={{ color: C_GOOD }}>좋아옹 +5</span>
              <span style={{ color: C_MISS }}>놓쳤냥 -5</span>
            </div>
          </div>

          <button onClick={startGame}
            className="w-full py-5 font-black text-xl rounded-2xl active:scale-95 transition-transform"
            style={{ background: `linear-gradient(135deg, ${C_ACCENT}, rgba(${C_RGB},0.75))`, color: '#fff', boxShadow: `0 10px 32px rgba(${C_RGB},0.4)` }}>
            시작하기!
          </button>
          <p className="mt-4 text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>키보드 · 마우스 · 터치 모두 사용 가능</p>
        </div>
      )}

      {/* ── 결과 화면 ── */}
      {phase === 'result' && result && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 px-7"
          style={{ background: 'rgba(245,246,250,0.98)' }}>
          <p className="text-sm font-black mb-1 uppercase tracking-[0.2em]" style={{ color: C_ACCENT }}>결과</p>
          <p className="text-base font-bold mb-5" style={{ color: C_MUTED }}>STAGE {result.stageReached} 도달</p>

          <div className="w-full rounded-[32px] p-7 mb-5 flex flex-col items-center"
            style={{ background: '#fff', boxShadow: `0 12px 48px rgba(${C_RGB},0.15)`, border: `2px solid rgba(${C_RGB},0.15)` }}>
            <p className="font-black leading-none tabular-nums" style={{ fontSize: 88, color: C_TEXT }}>
              {result.score.toLocaleString()}
            </p>
            <div className="grid grid-cols-3 gap-3 w-full mt-7 pt-6"
              style={{ borderTop: `1.5px solid rgba(${C_RGB},0.1)` }}>
              {[
                { label: '퍼펙냥', value: result.perfectCnt, color: C_PERFECT, bg: 'rgba(245,158,11,0.08)' },
                { label: '좋아옹', value: result.goodCnt,    color: C_GOOD,    bg: 'rgba(16,185,129,0.08)' },
                { label: '놓쳤냥', value: result.missCnt,    color: C_MISS,    bg: 'rgba(239,68,68,0.08)'  },
              ].map(r => (
                <div key={r.label} className="flex flex-col items-center py-3 rounded-2xl" style={{ background: r.bg }}>
                  <p className="text-3xl font-black" style={{ color: r.color }}>{r.value}</p>
                  <p className="text-xs font-bold mt-1" style={{ color: C_MUTED }}>{r.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm font-bold mb-1" style={{ color: C_MUTED }}>최고 콤보</p>
              <p className="text-4xl font-black" style={{ color: C_TEXT }}>{result.maxCombo}</p>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button onClick={() => { setPhase('idle'); gs.current.phase = 'idle'; }}
              className="flex-1 py-4 font-black text-sm rounded-2xl active:scale-95 transition-transform"
              style={{ background: `rgba(${C_RGB},0.1)`, color: C_ACCENT, border: `2px solid rgba(${C_RGB},0.2)` }}>
              처음으로
            </button>
            <button onClick={startGame}
              className="flex-1 py-4 font-black text-base rounded-2xl active:scale-95 transition-transform"
              style={{ background: `linear-gradient(135deg, ${C_ACCENT}, rgba(${C_RGB},0.75))`, color: '#fff', boxShadow: `0 6px 20px rgba(${C_RGB},0.4)` }}>
              다시하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
