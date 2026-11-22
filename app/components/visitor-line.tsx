'use client';

import { useEffect, useState } from 'react';
import { recordVisit } from '@/app/actions/visits';
import { kstDay, type VisitStats } from '@/utils/visits';

// 이 브라우저를 마지막으로 센 날(한국 날짜). 같은 날 다시 와도 숫자를 올리지 않는다.
const KEY = 'joyopi:visit-day';

function readDay(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function saveDay(day: string) {
  try {
    localStorage.setItem(KEY, day);
  } catch {
    // 저장소를 못 쓰는 브라우저(사생활 보호 모드 등)는 다음 방문 때 다시 셀 수 있다
  }
}

const fmt = (n: number) => n.toLocaleString('en-US');

/**
 * 홈 인사 타일의 방문자 줄(시안 B): `> visitors.today 1,284  total 52,903  since 2026-11-22`.
 * 홈은 1시간마다 다시 만들어지므로 숫자는 마운트 뒤 서버 액션으로 받아 온다.
 * 받기 전에는 같은 높이의 자리만 잡고, 실패하면 줄을 숨긴다.
 */
export default function VisitorLine() {
  const [stats, setStats] = useState<VisitStats | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    const today = kstDay(new Date());
    const count = readDay() !== today;
    recordVisit(count)
      .catch(() => null)
      .then((result) => {
        if (!alive) return;
        if (result && count) saveDay(today);
        setStats(result);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (stats === null) return null;

  const item = (key: string, value: string) => (
    <span className="whitespace-nowrap">
      <span className="text-[#8F887B]">{key}</span> <span className="tabular-nums text-[#FF8A3D]">{value}</span>
    </span>
  );

  return (
    <p className="mt-5 flex min-h-5 flex-wrap gap-x-3.5 gap-y-1 font-brand text-[13px] text-[#DDD6C8]">
      {stats ? (
        <>
          {item('> visitors.today', fmt(stats.today))}
          {item('total', fmt(stats.total))}
          {stats.since ? item('since', stats.since) : null}
        </>
      ) : null}
    </p>
  );
}
