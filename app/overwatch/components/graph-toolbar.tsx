'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { HERO_ROLES, ROLE_LABELS, type Hero } from '@/app/actions/overwatchData';
import { cn } from '@/utils/cn';
import type { RoleFilter } from '../lib/counter-graph';

const ROLE_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  ...HERO_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] })),
];

const STRENGTH_OPTIONS = [
  { value: 1, label: '모든 강도' },
  { value: 2, label: '유리 이상' },
  { value: 3, label: '매우 유리만' },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'h-10 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors',
        active
          ? 'border-[#F99E1A] bg-[#F99E1A] text-[#1A1206]'
          : 'border-[#2E3B4E] bg-transparent text-[#C9D3DE] hover:border-[#F99E1A]/60'
      )}
    >
      {children}
    </button>
  );
}

interface GraphToolbarProps {
  heroes: Record<string, Hero>;
  role: RoleFilter;
  minStrength: number;
  selectedId: string | null;
  notFound: boolean;
  onRoleChange: (role: RoleFilter) => void;
  onStrengthChange: (strength: number) => void;
  onSearch: (query: string) => void;
  onSelect: (heroId: string) => void;
}

export default function GraphToolbar({
  heroes,
  role,
  minStrength,
  selectedId,
  notFound,
  onRoleChange,
  onStrengthChange,
  onSearch,
  onSelect,
}: GraphToolbarProps) {
  const sortedHeroes = Object.values(heroes).sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  return (
    <div className="flex flex-wrap items-start gap-x-6 gap-y-3 rounded-2xl border border-[#1F2B3B] bg-[#111A26] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[13px] font-bold text-[#9AA7B8]">역할</span>
        {ROLE_OPTIONS.map((o) => (
          <Chip key={o.value} active={role === o.value} onClick={() => onRoleChange(o.value)}>
            {o.label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[13px] font-bold text-[#9AA7B8]">상성 강도</span>
        {STRENGTH_OPTIONS.map((o) => (
          <Chip key={o.value} active={minStrength === o.value} onClick={() => onStrengthChange(o.value)}>
            {o.label}
          </Chip>
        ))}
      </div>
      <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:min-w-[260px]">
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
        <label htmlFor="hero-select" className="sr-only">
          영웅 목록에서 선택
        </label>
        <select
          id="hero-select"
          value={selectedId ?? ''}
          onChange={(e) => e.target.value && onSelect(e.target.value)}
          className="h-10 w-full rounded-full border border-[#2E3B4E] bg-[#0B1119] px-4 text-sm text-[#E8EDF3] focus:border-[#F99E1A] focus:outline-none lg:hidden"
        >
          <option value="">영웅 목록에서 선택</option>
          {sortedHeroes.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name} ({ROLE_LABELS[h.role]})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
