'use client';

import React, { useState } from 'react';
import { DateRange, MealPeriod } from '../types';

interface DateRangeSelectorProps {
  range: DateRange;
  onChange: (range: DateRange) => void;
}

// YYYY-MM-DD 형식 날짜 포맷 헬퍼
function formatYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// N일 전 날짜 계산
function subDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

// 표시용 날짜 포맷 (YYYY.MM.DD)
function formatDisplay(ymd: string): string {
  return ymd.replace(/-/g, '.');
}

// 두 날짜 사이의 일수 계산
function diffDays(from: string, to: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const f = new Date(from).getTime();
  const t = new Date(to).getTime();
  return Math.round(Math.abs(t - f) / msPerDay) + 1;
}

const PERIOD_OPTIONS: { value: MealPeriod; label: string; days?: number }[] = [
  { value: '7days', label: '7일', days: 7 },
  { value: '14days', label: '14일', days: 14 },
  { value: '30days', label: '30일', days: 30 },
  { value: 'custom', label: '직접 설정' },
];

export default function DateRangeSelector({ range, onChange }: DateRangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(range.period === 'custom');
  const [customFrom, setCustomFrom] = useState(range.from);
  const [customTo, setCustomTo] = useState(range.to);

  const handlePeriodClick = (opt: typeof PERIOD_OPTIONS[number]) => {
    if (opt.value === 'custom') {
      setShowCustom(true);
      // 현재 range를 custom 모드로 전환
      onChange({ period: 'custom', from: range.from, to: range.to });
      return;
    }

    setShowCustom(false);
    const today = new Date();
    const from = formatYMD(subDays(today, opt.days! - 1));
    const to = formatYMD(today);
    onChange({ period: opt.value, from, to });
  };

  const handleCustomApply = () => {
    if (!customFrom || !customTo) return;
    const from = customFrom <= customTo ? customFrom : customTo;
    const to = customFrom <= customTo ? customTo : customFrom;
    onChange({ period: 'custom', from, to });
  };

  const totalDays = diffDays(range.from, range.to);

  return (
    <div
      className="bg-card border border-border rounded-lg p-4 space-y-3"
      data-testid="date-range-selector"
    >
      {/* 탭 버튼 영역 */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          분석 기간
        </span>

        <div className="flex items-center gap-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              data-testid={`period-tab-${opt.value}`}
              onClick={() => handlePeriodClick(opt)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                range.period === opt.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent hover:border-border'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 직접 설정 슬라이드다운 */}
      {showCustom && (
        <div
          className="flex items-center gap-2 pt-2 border-t border-border/40 animate-in slide-in-from-top-1 duration-150"
          data-testid="custom-range-inputs"
        >
          <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">시작일</span>
          <input
            type="date"
            value={customFrom}
            max={customTo}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="flex-1 px-2 py-1 text-xs bg-secondary border border-border rounded text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
          />
          <span className="text-[10px] font-bold text-muted-foreground">~</span>
          <input
            type="date"
            value={customTo}
            min={customFrom}
            onChange={(e) => setCustomTo(e.target.value)}
            className="flex-1 px-2 py-1 text-xs bg-secondary border border-border rounded text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
          />
          <button
            onClick={handleCustomApply}
            className="px-3 py-1 bg-primary text-primary-foreground text-[11px] font-bold rounded cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            적용
          </button>
        </div>
      )}

      {/* 현재 범위 요약 */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium pt-1 border-t border-border/30">
        <span>
          📅 {formatDisplay(range.from)} ~ {formatDisplay(range.to)}
        </span>
        <span className="bg-secondary px-2 py-0.5 rounded font-bold text-foreground">
          {totalDays}일
        </span>
      </div>
    </div>
  );
}
