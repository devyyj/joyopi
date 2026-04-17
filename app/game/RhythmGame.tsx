'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

// ─────────────────────────────────────────────────────────
// 상수: 캔버스 레이아웃
// ─────────────────────────────────────────────────────────

const CANVAS_H   = 640;
const HIT_ZONE_Y = 560;
const HIT_BTN_R  = 46;
const NOTE_R     = 32;
const TRACK_W    = 80;

// ─────────────────────────────────────────────────────────
// 상수: 판정 허용 오차 (ms)
// ─────────────────────────────────────────────────────────

const PERFECT_MS   = 70;
const GOOD_MS      = 150;
const AUTO_MISS_MS = 190;

// ─────────────────────────────────────────────────────────
// 상수: 게임 타임라인
// ─────────────────────────────────────────────────────────
//  [LEAD_IN] [──── STAGE 1 ────] [── BREAK ──] [──── STAGE 2 ────]
//     2s            30s                5s               30s

const LEAD_IN_MS   = 2_000;
const STAGE1_MS    = 30_000;
const BREAK_MS     = 5_000;
const STAGE2_MS    = 30_000;

const STAGE1_START = LEAD_IN_MS;                          // 2 000
const STAGE1_END   = STAGE1_START + STAGE1_MS;            // 32 000
const BREAK_START  = STAGE1_END;                          // 32 000
const BREAK_END    = BREAK_START + BREAK_MS;              // 37 000
const STAGE2_START = BREAK_END;                           // 37 000
const STAGE2_END   = STAGE2_START + STAGE2_MS;            // 67 000

// ─────────────────────────────────────────────────────────
// 상수: BPM
// ─────────────────────────────────────────────────────────

const BPM_STAGE1 = 50;
const BPM_STAGE2 = 80;

// ─────────────────────────────────────────────────────────
// 상수: 점수
// ─────────────────────────────────────────────────────────

const SCORE_PERFECT  = 10;
const SCORE_GOOD     = 5;
const SCORE_MISS_PEN = 5;
const MAX_STREAK     = 4; // 최대 연속 노트 수

// ─────────────────────────────────────────────────────────
// 상수: 고정 색상
// ─────────────────────────────────────────────────────────

const C_BG      = '#F5F6FA';
const C_TRACK   = 'rgba(0,0,0,0.03)';
const C_TEXT    = '#1C1917';
const C_MUTED   = '#94A3B8';
const C_DANGER  = '#EF4444';
const C_PERFECT = '#F59E0B';
const C_GOOD    = '#10B981';
const C_MISS    = '#EF4444';

const SYS_FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
const F = (weight: string, px: number) => `${weight} ${px}px ${SYS_FONT}`;

// ─────────────────────────────────────────────────────────
// 캐릭터: 버키 (단일)
// ─────────────────────────────────────────────────────────

const CAT = {
  name: '버키',
  image: '/cat/bucky.png',
  accent: '#64748B',
  accentRgb: '100,116,139',
  accentLight: 'rgba(100,116,139,0.1)',
} as const;

// ─────────────────────────────────────────────────────────
// 유틸리티
// ─────────────────────────────────────────────────────────

type GameStage = 'leadin' | 'stage1' | 'break' | 'stage2';

/** elapsed 기준으로 현재 게임 스테이지 반환 */
function getStage(elapsed: number): GameStage {
  if (elapsed < STAGE1_START) return 'leadin';
  if (elapsed < STAGE1_END)   return 'stage1';
  if (elapsed < STAGE2_START) return 'break';
  return 'stage2';
}

/** 스테이지별 현재 BPM 반환 */
function getStageBPM(stage: GameStage): number {
  return stage === 'stage2' ? BPM_STAGE2 : BPM_STAGE1;
}

// ─────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────

interface Note { id: number; time: number; judged: boolean }

interface Effect {
  id: number;
  text: string;
  color: string;
  alpha: number;
  offsetY: number;
  createdAt: number;
}

interface HitPulse { createdAt: number; color: string }

/** 콤보 팝업 애니메이션 상태 */
interface ComboAnim { count: number; startedAt: number }

interface GameResult {
  score: number;
  maxCombo: number;
  perfectCnt: number;
  goodCnt: number;
  missCnt: number;
}

/** 게임 전체 상태 (ref로 관리하여 렌더 사이클 밖에서 고속 업데이트) */
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
  effects: Effect[];
  effectId: number;
  hitPulses: HitPulse[];
  comboAnim: ComboAnim | null;
  pressed: boolean;
  canvasW: number;
  rafId: number;
}

function initGS(): GS {
  return {
    phase: 'idle',
    startTime: 0, elapsed: 0,
    score: 0, combo: 0, maxCombo: 0,
    perfectCnt: 0, goodCnt: 0, missCnt: 0,
    notes: [], effects: [], effectId: 0,
    hitPulses: [], comboAnim: null,
    pressed: false, canvasW: 400, rafId: 0,
  };
}

// ─────────────────────────────────────────────────────────
// 노트 생성
// ─────────────────────────────────────────────────────────

let _noteId = 0;

/**
 * 스테이지 1(50 BPM)과 스테이지 2(80 BPM)의 노트를 각각 생성.
 * 휴식 구간에는 노트 없음. 각 스테이지: 16분음표 그리드, 60% 확률, 연속 최대 4개 제한.
 */
function generateNotes(): Note[] {
  const SPAWN = 0.60;
  const notes: Note[] = [];

  function spawnPhase(bpm: number, startMs: number, endMs: number) {
    const beat     = 60_000 / bpm;
    const interval = beat / 4;        // 16분음표 간격
    const minGap   = interval * 0.75; // 최소 노트 간격
    let streak = 0;

    for (let t = startMs; t < endMs; t += interval) {
      const mustBreak = streak >= MAX_STREAK;
      const canSpawn  =
        !mustBreak &&
        Math.random() < SPAWN &&
        (notes.length === 0 || t - notes[notes.length - 1].time >= minGap);

      if (canSpawn) { notes.push({ id: _noteId++, time: t, judged: false }); streak++; }
      else streak = 0;
    }
  }

  // 스테이지 1
  spawnPhase(BPM_STAGE1, STAGE1_START, STAGE1_END);

  // 스테이지 2: 1.5초 준비 구간 후 노트 시작 (화면에 첫 노트가 부드럽게 등장)
  const beat2 = 60_000 / BPM_STAGE2;
  spawnPhase(BPM_STAGE2, STAGE2_START + beat2 * 2, STAGE2_END);

  return notes;
}

// ─────────────────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────────────────

export default function RhythmGame() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);
  const gs          = useRef<GS>(initGS());
  const catImgRef   = useRef<HTMLImageElement | null>(null);
  // gameLoop를 ref로 저장해 stale closure 없이 최신 버전 호출
  const gameLoopRef = useRef<() => void>(undefined);

  const [phase, setPhase]   = useState<'idle' | 'playing' | 'result'>('idle');
  const [result, setResult] = useState<GameResult | null>(null);
  const [, setTick]         = useState(0);

  useEffect(() => {
    const img = new Image();
    img.src = CAT.image;
    img.onload = () => { catImgRef.current = img; };
  }, []);

  // ── 캔버스 드로우 헬퍼 ──────────────────────────────────

  /** 원형 클리핑으로 버키 이미지 렌더링. 로드 전엔 강조색 원으로 대체 */
  const drawBucky = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number, y: number, r: number, alpha = 1,
  ) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    if (catImgRef.current) {
      ctx.drawImage(catImgRef.current, x - r, y - r, r * 2, r * 2);
    } else {
      ctx.fillStyle = CAT.accent;
      ctx.fill();
    }
    ctx.restore();
  }, []);

  // ── 점수 / 판정 처리 ────────────────────────────────────

  /** 성공 판정: 점수 부여, 콤보 증가, 시각 효과 생성 */
  const applyScore = useCallback((absDelta: number) => {
    const s = gs.current;
    const isPerfect = absDelta <= PERFECT_MS;
    const base  = isPerfect ? SCORE_PERFECT : SCORE_GOOD;
    const text  = isPerfect ? '퍼펙냥!' : '좋아옹!';
    const color = isPerfect ? C_PERFECT : C_GOOD;

    s.combo++;
    s.score += base + s.combo; // 1콤보당 +1 추가 보너스
    if (isPerfect) s.perfectCnt++; else s.goodCnt++;
    if (s.combo > s.maxCombo) s.maxCombo = s.combo;

    s.comboAnim = { count: s.combo, startedAt: s.elapsed };
    s.effects.push({ id: s.effectId++, text, color, alpha: 1, offsetY: 0, createdAt: s.elapsed });
    s.hitPulses.push({ createdAt: s.elapsed, color });
  }, []);

  /** 놓쳤냥 판정: 콤보 초기화, 패널티 적용 */
  const applyMiss = useCallback(() => {
    const s = gs.current;
    s.combo = 0;
    s.comboAnim = null;
    s.score = Math.max(0, s.score - SCORE_MISS_PEN);
    s.missCnt++;
    s.effects.push({ id: s.effectId++, text: '놓쳤냥', color: C_MISS, alpha: 1, offsetY: 0, createdAt: s.elapsed });
    s.hitPulses.push({ createdAt: s.elapsed, color: C_MISS });
  }, []);

  // ── 입력 처리 ────────────────────────────────────────────

  /** 키/마우스/터치: 히트존 근처 최적 노트 탐색 후 판정. 휴식 중엔 무시 */
  const pressNote = useCallback(() => {
    const s = gs.current;
    if (s.phase !== 'playing') return;
    const stage = getStage(s.elapsed);
    if (stage === 'leadin' || stage === 'break') return; // 리드인/휴식 중 입력 무시

    s.pressed = true;

    let best: Note | null = null;
    let bestDelta = Infinity;
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

  // ── 게임 흐름 ────────────────────────────────────────────

  const endGame = useCallback(() => {
    const s = gs.current;
    if (s.phase !== 'playing') return;
    setResult({
      score: s.score, maxCombo: s.maxCombo,
      perfectCnt: s.perfectCnt, goodCnt: s.goodCnt, missCnt: s.missCnt,
    });
    s.phase = 'result';
    setPhase('result');
  }, []);

  const startGame = useCallback(() => {
    const s = gs.current;
    const currentW = s.canvasW;
    Object.assign(s, initGS(), { phase: 'playing', canvasW: currentW });
    s.notes = generateNotes();
    s.startTime = performance.now();
    setPhase('playing');
  }, []);

  // ── 캔버스 렌더링 ────────────────────────────────────────

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s  = gs.current;
    const W  = s.canvasW;
    const cx = W / 2;

    // 배경
    ctx.fillStyle = C_BG;
    ctx.fillRect(0, 0, W, CANVAS_H);

    if (s.phase === 'idle') return;

    const stage = getStage(s.elapsed);

    // ── 휴식 화면 (break만 별도 처리 후 return) ───────────
    if (stage === 'break') {
      const breakElapsed = s.elapsed - BREAK_START;
      const breakLeft    = Math.max(0, BREAK_MS - breakElapsed);
      const countdown    = Math.ceil(breakLeft / 1000);
      const isLastSecond = countdown <= 1;

      // 반투명 오버레이
      ctx.fillStyle = 'rgba(245,246,250,0.88)';
      ctx.fillRect(0, 0, W, CANVAS_H);

      ctx.textAlign = 'center';
      ctx.font = F('700', 16);
      ctx.fillStyle = C_MUTED;
      ctx.fillText('다음 스테이지', cx, CANVAS_H / 2 - 110);

      ctx.font = F('900', 52);
      ctx.fillStyle = C_DANGER;
      ctx.shadowColor = C_DANGER;
      ctx.shadowBlur = isLastSecond ? 24 : 10;
      ctx.fillText('스테이지 2', cx, CANVAS_H / 2 - 54);
      ctx.shadowBlur = 0;

      ctx.font = F('700', 22);
      ctx.fillStyle = C_TEXT;
      ctx.fillText(`${BPM_STAGE2} BPM`, cx, CANVAS_H / 2 - 14);

      ctx.font = F('900', 100);
      ctx.fillStyle = isLastSecond ? C_DANGER : C_TEXT;
      if (isLastSecond) { ctx.shadowColor = C_DANGER; ctx.shadowBlur = 24; }
      ctx.fillText(countdown > 0 ? `${countdown}` : '!', cx, CANVAS_H / 2 + 80);
      ctx.shadowBlur = 0;

      ctx.font = F('600', 14);
      ctx.fillStyle = C_MUTED;
      ctx.fillText('준비하세요!', cx, CANVAS_H / 2 + 116);
      return;
    }

    // ── 게임 플레이 화면 (leadin / stage1 / stage2) ────────
    // leadin: 첫 노트 등장 전 2초 — 트랙·히트존·HUD는 즉시 표시

    const bpm      = getStageBPM(stage);
    const beat     = 60_000 / bpm;
    const stageEnd = stage === 'stage2' ? STAGE2_END : STAGE1_END;
    // leadin 동안 타이머는 스테이지 1 기준 (30s) 고정 표시
    const timeLeft = stage === 'leadin'
      ? STAGE1_MS / 1000
      : Math.max(0, (stageEnd - s.elapsed) / 1000);
    const progress = stage === 'stage2'
      ? Math.min(1, (s.elapsed - STAGE2_START) / STAGE2_MS)
      : stage === 'stage1'
        ? Math.min(1, (s.elapsed - STAGE1_START) / STAGE1_MS)
        : 0; // leadin: 진행 바 0%
    const isDanger = timeLeft <= 10 && stage !== 'leadin';

    // ── 진행 바 (그라디언트 + 선단 글로우) ──
    ctx.fillStyle = `rgba(${CAT.accentRgb},0.12)`;
    ctx.fillRect(0, 0, W, 7);

    const barGrad = ctx.createLinearGradient(0, 0, W * progress, 0);
    barGrad.addColorStop(0, `rgba(${CAT.accentRgb},0.5)`);
    barGrad.addColorStop(1, CAT.accent);
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, 0, W * progress, 7);

    if (progress > 0.01) {
      ctx.beginPath();
      ctx.arc(W * progress, 3.5, 5, 0, Math.PI * 2);
      ctx.fillStyle = CAT.accent;
      ctx.shadowColor = CAT.accent;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // ── 스테이지 표시 (좌측 상단) ──
    ctx.textAlign = 'left';
    ctx.font = F('900', 14);
    ctx.fillStyle = stage === 'stage2' ? C_DANGER : CAT.accent;
    ctx.fillText(`STAGE ${stage === 'stage1' ? '1' : '2'}`, 18, 30);

    // ── 트랙 ──
    ctx.fillStyle = C_TRACK;
    ctx.fillRect(cx - TRACK_W / 2, 10, TRACK_W, CANVAS_H - 10);

    // ── 타이머 ──
    ctx.textAlign = 'center';
    ctx.font = F('900', 56);
    ctx.fillStyle = isDanger ? C_DANGER : C_TEXT;
    if (isDanger) { ctx.shadowColor = C_DANGER; ctx.shadowBlur = 16; }
    ctx.fillText(`${Math.ceil(timeLeft)}`, cx, 70);
    ctx.shadowBlur = 0;

    // ── BPM ──
    ctx.font = F('700', 18);
    ctx.fillStyle = C_MUTED;
    ctx.fillText(`${bpm} BPM`, cx, 96);

    // ── 노트 (글로우 링 포함) ──
    const spd = HIT_ZONE_Y - 100; // 노트 이동 거리 (픽셀)
    for (const n of s.notes) {
      if (n.judged) continue;
      const y = HIT_ZONE_Y - (n.time - s.elapsed) * spd / beat;
      if (y < -60 || y > CANVAS_H + 60) continue;
      const proximity = Math.max(0, 1 - Math.abs(y - HIT_ZONE_Y) / 240);

      // 외곽 글로우 링
      ctx.beginPath();
      ctx.arc(cx, y, NOTE_R + 6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${CAT.accentRgb},${proximity * 0.55})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      drawBucky(ctx, cx, y, NOTE_R, 0.4 + proximity * 0.6);
    }

    // ── 히트존 ──
    // 맥박 외곽 링
    const pulse = Math.sin(s.elapsed / 350) * 0.5 + 0.5;
    ctx.beginPath();
    ctx.arc(cx, HIT_ZONE_Y, HIT_BTN_R + 14 + pulse * 4, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${CAT.accentRgb},${0.08 + pulse * 0.08})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 메인 히트존 링
    ctx.beginPath();
    ctx.arc(cx, HIT_ZONE_Y, HIT_BTN_R, 0, Math.PI * 2);
    ctx.strokeStyle = s.pressed ? CAT.accent : `rgba(${CAT.accentRgb},0.4)`;
    ctx.lineWidth = s.pressed ? 4.5 : 2.5;
    if (s.pressed) { ctx.shadowColor = CAT.accent; ctx.shadowBlur = 20; }
    ctx.stroke();
    ctx.shadowBlur = 0;

    drawBucky(ctx, cx, HIT_ZONE_Y, HIT_BTN_R - 4, s.pressed ? 0.9 : 0.28);

    // ── 히트 펄스 ──
    for (const p of s.hitPulses) {
      const age = s.elapsed - p.createdAt;
      if (age < 0 || age > 500) continue;
      const t = age / 500;
      ctx.beginPath();
      ctx.arc(cx, HIT_ZONE_Y, HIT_BTN_R + t * 50, 0, Math.PI * 2);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = (1 - t) * 0.75;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // ── 판정 효과 (퍼펙냥/좋아옹/놓쳤냥) ──
    for (const e of s.effects) {
      ctx.save();
      ctx.globalAlpha = e.alpha;
      ctx.font = F('900', 58);
      ctx.fillStyle = e.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 18;
      ctx.fillText(e.text, cx, HIT_ZONE_Y - 100 - e.offsetY);
      ctx.restore();
    }

    // ── 콤보 팝업 ──
    if (s.comboAnim && s.combo > 1) {
      const age   = s.elapsed - s.comboAnim.startedAt;
      const TOTAL = 900;
      if (age >= 0 && age < TOTAL) {
        // 팝 인 → 안정 → 페이드 아웃
        let scale = 1;
        let alpha = 1;
        if (age < 150)      scale = 0.4 + (age / 150) * 0.9;
        else if (age < 280) scale = 1.3 - ((age - 150) / 130) * 0.3;
        if (age > 550)      alpha = 1 - (age - 550) / 350;

        ctx.save();
        ctx.globalAlpha = alpha * 0.13;
        ctx.font = F('900', Math.round(120 * scale));
        ctx.fillStyle = CAT.accent;
        ctx.textAlign = 'center';
        ctx.fillText(`${s.comboAnim.count}`, cx, CANVAS_H / 2 + 40);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha * 0.9;
        ctx.font = F('800', Math.round(20 * Math.min(1, scale)));
        ctx.fillStyle = CAT.accent;
        ctx.textAlign = 'center';
        ctx.shadowColor = CAT.accent;
        ctx.shadowBlur = 8;
        ctx.fillText(`${s.comboAnim.count} 콤보`, cx, CANVAS_H / 2 + 72);
        ctx.restore();
      }
    }

    // ── 점수 (우측 상단) ──
    ctx.textAlign = 'right';
    ctx.font = F('900', 44);
    ctx.fillStyle = C_TEXT;
    ctx.fillText(s.score.toLocaleString(), W - 18, 60);
  }, [drawBucky]);

  // ── 게임 루프 ────────────────────────────────────────────

  const gameLoop = useCallback(() => {
    const s   = gs.current;
    const now = performance.now();

    if (s.phase !== 'idle') s.elapsed = now - s.startTime;

    if (s.phase === 'playing') {
      const stage = getStage(s.elapsed);

      // 휴식 중: pressed 상태 초기화, 자동 미스 처리 안 함
      if (stage === 'break') {
        s.pressed = false;
      } else {
        // 판정 시간 초과 노트 자동 놓쳤냥 처리 (휴식 구간 제외)
        s.notes = s.notes.map(n => {
          if (!n.judged && s.elapsed - n.time > AUTO_MISS_MS) {
            applyMiss();
            return { ...n, judged: true };
          }
          return n;
        });
      }

      // 게임 종료: 스테이지 2 완료
      if (s.elapsed >= STAGE2_END) endGame();

      setTick(now);
    }

    s.effects = s.effects
      .map(e => {
        const age = s.elapsed - e.createdAt;
        return { ...e, alpha: Math.max(0, 1 - age / 500), offsetY: age * 0.1 };
      })
      .filter(e => e.alpha > 0);

    s.hitPulses = s.hitPulses.filter(p => s.elapsed - p.createdAt < 500);

    draw();
    s.rafId = requestAnimationFrame(() => gameLoopRef.current?.());
  }, [draw, applyMiss, endGame]);

  useEffect(() => { gameLoopRef.current = gameLoop; }, [gameLoop]);

  useEffect(() => {
    const s = gs.current;
    const updateSize = () => {
      s.canvasW = Math.min(wrapRef.current?.clientWidth || 400, 400);
      if (canvasRef.current) {
        canvasRef.current.width  = s.canvasW;
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
    // 버튼 클릭은 게임 입력으로 처리하지 않음
    const onDown = (e: MouseEvent | TouchEvent | KeyboardEvent) => {
      if (e.type !== 'keydown' && (e.target as HTMLElement).tagName === 'BUTTON') return;
      pressNote();
    };
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

  // ─────────────────────────────────────────────────────────
  // 렌더: React UI 레이어
  // ─────────────────────────────────────────────────────────

  return (
    <div
      ref={wrapRef}
      className="relative w-full max-w-[400px] mx-auto select-none overflow-hidden rounded-3xl shadow-2xl"
      style={{ height: CANVAS_H, background: C_BG }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* 게임 중 나가기 버튼 */}
      {phase === 'playing' && (
        <button
          onClick={endGame}
          className="absolute top-[100px] left-4 z-20 text-xs font-bold px-3 py-1.5 rounded-xl"
          style={{ color: C_MUTED, border: '1px solid rgba(148,163,184,0.3)', background: 'rgba(255,255,255,0.7)' }}
        >
          그만
        </button>
      )}

      {/* ── 시작 화면 ── */}
      {phase === 'idle' && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-40 px-8"
          style={{ background: 'rgba(245,246,250,0.97)' }}
        >
          {/* 버키 이미지 */}
          <div
            className="w-24 h-24 rounded-full overflow-hidden mb-5 shadow-xl"
            style={{
              border: `3px solid ${CAT.accent}`,
              boxShadow: `0 8px 28px rgba(${CAT.accentRgb},0.3)`,
            }}
          >
            <img src={CAT.image} alt={CAT.name} className="w-full h-full object-cover" />
          </div>

          <h1 className="text-5xl font-black tracking-tighter mb-1" style={{ color: C_TEXT }}>
            Rhythm Cat
          </h1>
          <p className="text-base mb-10 font-medium" style={{ color: C_MUTED }}>
            {CAT.name}와 함께하는 2스테이지 리듬 도전
          </p>

          {/* 게임 구조 안내 카드 */}
          <div
            className="w-full rounded-2xl overflow-hidden mb-8"
            style={{ border: `1.5px solid rgba(${CAT.accentRgb},0.15)` }}
          >
            {/* 스테이지 1 */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ background: 'rgba(255,255,255,0.9)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white"
                  style={{ background: CAT.accent }}
                >
                  1
                </div>
                <div>
                  <p className="text-sm font-black" style={{ color: C_TEXT }}>스테이지 1</p>
                  <p className="text-xs" style={{ color: C_MUTED }}>30초</p>
                </div>
              </div>
              <p className="text-2xl font-black" style={{ color: CAT.accent }}>{BPM_STAGE1} <span className="text-sm font-bold">BPM</span></p>
            </div>

            {/* 휴식 구간 */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ background: `rgba(${CAT.accentRgb},0.06)`, borderTop: `1px solid rgba(${CAT.accentRgb},0.1)`, borderBottom: `1px solid rgba(${CAT.accentRgb},0.1)` }}
            >
              <p className="text-xs font-bold" style={{ color: C_MUTED }}>휴식</p>
              <p className="text-xs font-bold" style={{ color: C_MUTED }}>5초 카운트다운</p>
            </div>

            {/* 스테이지 2 */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ background: 'rgba(255,255,255,0.9)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white"
                  style={{ background: C_DANGER }}
                >
                  2
                </div>
                <div>
                  <p className="text-sm font-black" style={{ color: C_TEXT }}>스테이지 2</p>
                  <p className="text-xs" style={{ color: C_MUTED }}>30초</p>
                </div>
              </div>
              <p className="text-2xl font-black" style={{ color: C_DANGER }}>{BPM_STAGE2} <span className="text-sm font-bold">BPM</span></p>
            </div>
          </div>

          {/* 시작 버튼 */}
          <button
            onClick={startGame}
            className="w-full py-5 font-black text-xl rounded-2xl active:scale-95 transition-transform"
            style={{
              background: `linear-gradient(135deg, ${CAT.accent}, rgba(${CAT.accentRgb},0.75))`,
              color: '#FFFFFF',
              boxShadow: `0 10px 32px rgba(${CAT.accentRgb},0.4)`,
            }}
          >
            시작하기!
          </button>

          <p className="mt-4 text-xs" style={{ color: 'rgba(148,163,184,0.6)' }}>
            키보드 · 마우스 · 터치 모두 사용 가능
          </p>
        </div>
      )}

      {/* ── 결과 화면 ── */}
      {phase === 'result' && result && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-50 px-7"
          style={{ background: 'rgba(245,246,250,0.98)' }}
        >
          <p className="text-base font-black mb-5 uppercase tracking-[0.2em]" style={{ color: CAT.accent }}>
            결과
          </p>

          {/* 점수 카드 */}
          <div
            className="w-full rounded-[32px] p-7 mb-5 flex flex-col items-center"
            style={{
              background: '#FFFFFF',
              boxShadow: `0 12px 48px rgba(${CAT.accentRgb},0.15)`,
              border: `2px solid rgba(${CAT.accentRgb},0.15)`,
            }}
          >
            {/* 버키 + 완료 뱃지 */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: `2.5px solid ${CAT.accent}` }}
              >
                <img src={CAT.image} alt={CAT.name} className="w-full h-full object-cover" />
              </div>
              <div
                className="text-xs font-black px-3 py-1.5 rounded-full"
                style={{ background: CAT.accentLight, color: CAT.accent }}
              >
                {CAT.name} · STAGE 1+2 클리어
              </div>
            </div>

            {/* 최종 점수 */}
            <p
              className="font-black leading-none tabular-nums"
              style={{ fontSize: 88, color: C_TEXT }}
            >
              {result.score.toLocaleString()}
            </p>

            {/* 판정 통계 */}
            <div
              className="grid grid-cols-3 gap-3 w-full mt-7 pt-6"
              style={{ borderTop: `1.5px solid rgba(${CAT.accentRgb},0.1)` }}
            >
              {[
                { label: '퍼펙냥', value: result.perfectCnt, color: C_PERFECT, bg: 'rgba(245,158,11,0.08)' },
                { label: '좋아옹', value: result.goodCnt,    color: C_GOOD,    bg: 'rgba(16,185,129,0.08)' },
                { label: '놓쳤냥', value: result.missCnt,    color: C_MISS,    bg: 'rgba(239,68,68,0.08)' },
              ].map(r => (
                <div
                  key={r.label}
                  className="flex flex-col items-center py-3 rounded-2xl"
                  style={{ background: r.bg }}
                >
                  <p className="text-3xl font-black" style={{ color: r.color }}>{r.value}</p>
                  <p className="text-xs font-bold mt-1" style={{ color: C_MUTED }}>{r.label}</p>
                </div>
              ))}
            </div>

            {/* 최고 콤보 */}
            <div className="mt-6 text-center">
              <p className="text-sm font-bold mb-1" style={{ color: C_MUTED }}>최고 콤보</p>
              <p className="text-4xl font-black" style={{ color: C_TEXT }}>{result.maxCombo}</p>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 w-full">
            <button
              onClick={() => { setPhase('idle'); gs.current.phase = 'idle'; }}
              className="flex-1 py-4 font-black text-sm rounded-2xl active:scale-95 transition-transform"
              style={{
                background: CAT.accentLight,
                color: CAT.accent,
                border: `2px solid rgba(${CAT.accentRgb},0.2)`,
              }}
            >
              처음으로
            </button>
            <button
              onClick={startGame}
              className="flex-1 py-4 font-black text-base rounded-2xl active:scale-95 transition-transform"
              style={{
                background: `linear-gradient(135deg, ${CAT.accent}, rgba(${CAT.accentRgb},0.75))`,
                color: '#FFFFFF',
                boxShadow: `0 6px 20px rgba(${CAT.accentRgb},0.4)`,
              }}
            >
              다시하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
