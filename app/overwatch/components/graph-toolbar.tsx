'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { ROLE_LABELS, type Hero } from '@/app/actions/overwatchData';

interface GraphToolbarProps {
  heroes: Record<string, Hero>;
  selectedId: string | null;
  notFound: boolean;
  onSearch: (query: string) => void;
  onSelect: (heroId: string) => void;
}

export default function GraphToolbar({ heroes, selectedId, notFound, onSearch, onSelect }: GraphToolbarProps) {
  const sortedHeroes = Object.values(heroes).sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  return (
    <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-[#1F2B3B] bg-[#111A26] p-4">
      <div className="flex w-full flex-col gap-2 sm:w-[320px]">
        <div className="relative">
          <label htmlFor="hero-search" className="sr-only">
            영웅 검색
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D9AAB]" />
          <input
            id="hero-search"
            type="search"
            placeholder="영웅 이름 검색 (예: 겐지)"
            onChange={(e) => onSearch(e.target.value)}
            className="h-10 w-full rounded-full border border-[#2E3B4E] bg-[#0B1119] pl-10 pr-4 text-sm text-[#E8EDF3] placeholder:text-[#7A8798] focus:border-[#F99E1A] focus:outline-none"
          />
        </div>
        {notFound && <span className="pl-3.5 text-xs text-[#FF8A66]">일치하는 영웅이 없습니다.</span>}
      </div>
      <div className="w-full sm:w-[280px] lg:hidden">
        <label htmlFor="hero-select" className="sr-only">
          영웅 목록에서 선택
        </label>
        <select
          id="hero-select"
          value={selectedId ?? ''}
          onChange={(e) => e.target.value && onSelect(e.target.value)}
          className="h-10 w-full rounded-full border border-[#2E3B4E] bg-[#0B1119] px-4 text-sm text-[#E8EDF3] focus:border-[#F99E1A] focus:outline-none"
        >
          <option value="">영웅 목록에서 선택</option>
          {sortedHeroes.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name} ({ROLE_LABELS[h.role]})
            </option>
          ))}
        </select>
      </div>
      <p className="self-center text-[13px] text-[#9AA7B8] sm:ml-auto">굵은 선은 하드 카운터, 얇은 선은 카운터입니다.</p>
    </div>
  );
}
