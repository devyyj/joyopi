'use client';

import Image from 'next/image';
import React from 'react';
import { ROLE_LABELS, type CounterRelation, type Hero } from '@/app/actions/overwatchData';
import { cn } from '@/utils/cn';
import { getCounteredBy, getCountersOf } from '../lib/counter-graph';
import { displayFont } from '../fonts';
import { ACCENT, IN_COLOR, IN_TEXT_COLOR, OUT_COLOR, ROLE_FILL, STRENGTH_LABELS, strengthPips } from './theme';

function Portrait({ hero, size, ring }: { hero: Hero; size: number; ring?: string }) {
  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size, background: ROLE_FILL[hero.role], border: ring ? `3px solid ${ring}` : undefined }}
    >
      <Image src={hero.imageUrl} alt="" fill sizes={`${size}px`} className="object-cover" />
    </span>
  );
}

function RelationList({
  title,
  color,
  textColor,
  relations,
  otherOf,
  heroes,
  onSelect,
}: {
  title: string;
  color: string;
  textColor: string;
  relations: CounterRelation[];
  otherOf: (r: CounterRelation) => string;
  heroes: Record<string, Hero>;
  onSelect: (heroId: string) => void;
}) {
  return (
    <section className="flex flex-col gap-1">
      <div className="flex items-center justify-between pb-1.5" style={{ borderBottom: `2px solid ${color}` }}>
        <h3 className="text-[15px] font-bold" style={{ color: textColor }}>
          {title}
        </h3>
        <span className="text-[13px] text-[#9AA7B8]">{relations.length}명</span>
      </div>
      {relations.length === 0 ? (
        <p className="px-2 py-3 text-[13px] text-[#7A8798]">정리된 관계가 없습니다.</p>
      ) : (
        <ul aria-label={title} className="flex flex-col">
          {relations.map((r) => {
            const other = heroes[otherOf(r)];
            return (
              <li key={other.id}>
                <button
                  type="button"
                  onClick={() => onSelect(other.id)}
                  className="flex w-full cursor-pointer items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <Portrait hero={other} size={36} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-[15px] font-bold text-[#E8EDF3]">{other.name}</span>
                      <span
                        className="shrink-0 text-xs tracking-[0.1em]"
                        style={{ color: textColor }}
                        title={STRENGTH_LABELS[r.strength]}
                      >
                        <span aria-hidden="true">{strengthPips(r.strength)}</span>
                        <span className="sr-only">{STRENGTH_LABELS[r.strength]}</span>
                      </span>
                    </span>
                    <span className="text-[13px] leading-snug text-[#9AA7B8]">{r.reason}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

interface HeroDetailPanelProps {
  heroes: Record<string, Hero>;
  counters: CounterRelation[];
  selectedId: string | null;
  onSelect: (heroId: string) => void;
  onClear: () => void;
}

export default function HeroDetailPanel({ heroes, counters, selectedId, onSelect, onClear }: HeroDetailPanelProps) {
  const hero = selectedId ? heroes[selectedId] : null;

  return (
    <aside
      aria-label="선택한 영웅 상세"
      className="flex flex-col gap-5 rounded-2xl border border-[#1F2B3B] bg-[#111A26] p-5 lg:sticky lg:top-6"
    >
      {!hero ? (
        <div className="flex flex-col gap-2 px-2 py-10 text-center">
          <span className={cn(displayFont.className, 'text-[22px] text-[#E8EDF3]')}>영웅을 선택하세요</span>
          <span className="text-sm text-[#9AA7B8]">관계도에서 영웅을 누르면 상성 정보가 여기에 표시됩니다.</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3.5">
            <Portrait hero={hero} size={64} ring={ACCENT} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h2 className={cn(displayFont.className, 'text-[28px] leading-tight text-white')}>{hero.name}</h2>
              <span className="text-[13px] text-[#9AA7B8]">{ROLE_LABELS[hero.role]} 영웅</span>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="h-10 shrink-0 cursor-pointer rounded-lg border border-[#2E3B4E] px-3.5 text-[13px] font-medium text-[#C9D3DE] transition-colors hover:border-[#F99E1A]/60"
            >
              선택 해제
            </button>
          </div>
          <RelationList
            title="내가 잡는 영웅"
            color={OUT_COLOR}
            textColor={OUT_COLOR}
            relations={getCountersOf(hero.id, counters)}
            otherOf={(r) => r.target}
            heroes={heroes}
            onSelect={onSelect}
          />
          <RelationList
            title="나를 잡는 영웅"
            color={IN_COLOR}
            textColor={IN_TEXT_COLOR}
            relations={getCounteredBy(hero.id, counters)}
            otherOf={(r) => r.counter}
            heroes={heroes}
            onSelect={onSelect}
          />
        </>
      )}
    </aside>
  );
}
