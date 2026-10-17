'use client';

import React, { useMemo, useState } from 'react';
import type { CounterRelation, Hero } from '@/app/actions/overwatchData';
import { cn } from '@/utils/cn';
import { filterEdges, searchHero, type RoleFilter } from '../lib/counter-graph';
import { displayFont } from '../fonts';
import CounterGraph from './counter-graph';
import GraphToolbar from './graph-toolbar';
import HeroDetailPanel from './hero-detail-panel';
import { ACCENT, IN_COLOR, OUT_COLOR, ROLE_FILL } from './theme';

interface CounterMapClientProps {
  heroes: Record<string, Hero>;
  counters: CounterRelation[];
  version: string;
}

function LegendLine({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-[3px] w-6 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export default function CounterMapClient({ heroes, counters, version }: CounterMapClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [role, setRole] = useState<RoleFilter>('all');
  const [minStrength, setMinStrength] = useState(2);
  const [notFound, setNotFound] = useState(false);

  const edges = useMemo(() => filterEdges(counters, heroes, { role, minStrength }), [counters, heroes, role, minStrength]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setNotFound(false);
      return;
    }
    const hit = searchHero(query, heroes);
    setNotFound(!hit);
    if (hit) setSelectedId(hit.id);
  };

  return (
    <div className="min-h-full bg-[#0B1119] px-4 pb-10 pt-8 text-[#E8EDF3] sm:px-6">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold tracking-[0.18em]" style={{ color: ACCENT }}>
              YOPI LAB · OVERWATCH
            </span>
            <h1 className={cn(displayFont.className, 'text-4xl leading-none text-white sm:text-5xl')}>카운터 맵</h1>
            <p className="text-[15px] text-[#9AA7B8]">영웅을 눌러 누구에게 강하고 누구에게 약한지 확인하세요.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#2E3B4E] px-3.5 py-2 text-[13px] text-[#9AA7B8]">
            <span className="h-2 w-2 rounded-full" style={{ background: ACCENT }} />
            데이터 기준 {version}
          </div>
        </header>

        <GraphToolbar
          heroes={heroes}
          role={role}
          minStrength={minStrength}
          selectedId={selectedId}
          notFound={notFound}
          onRoleChange={setRole}
          onStrengthChange={setMinStrength}
          onSearch={handleSearch}
          onSelect={setSelectedId}
        />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <section className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[#1F2B3B] bg-[#0F1722] p-3 sm:p-4 lg:flex-1">
            <CounterGraph heroes={heroes} edges={edges} selectedId={selectedId} role={role} onSelect={setSelectedId} />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 border-t border-[#1F2B3B] px-1 pt-3 text-[13px] text-[#9AA7B8]">
              <LegendLine color={OUT_COLOR} label="내가 잡는 영웅" />
              <LegendLine color={IN_COLOR} label="나를 잡는 영웅" />
              <span className="flex items-center gap-2">선 굵기 = 상성 강도</span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: ROLE_FILL.tank }} />
                돌격
                <span className="ml-1.5 h-3 w-3 rounded-full" style={{ background: ROLE_FILL.damage }} />
                공격
                <span className="ml-1.5 h-3 w-3 rounded-full" style={{ background: ROLE_FILL.support }} />
                지원
              </span>
              <span className="sm:ml-auto">A → B : A가 B를 카운터</span>
            </div>
          </section>

          <div className="lg:w-[380px] lg:shrink-0">
            <HeroDetailPanel
              heroes={heroes}
              counters={counters}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onClear={() => setSelectedId(null)}
            />
          </div>
        </div>

        <footer className="text-xs leading-relaxed text-[#7A8798]">
          Overwatch 및 영웅 이미지의 저작권은 Blizzard Entertainment에 있습니다. 이 페이지는 비상업적 팬 페이지이며, 상성
          정보는 커뮤니티 공략을 참고해 정리한 것으로 실제 게임 상황과 다를 수 있습니다.
        </footer>
      </div>
    </div>
  );
}
