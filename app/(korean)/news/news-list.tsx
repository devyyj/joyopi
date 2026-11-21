'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHero from '@/app/components/page-hero';
import type { NewsEntry } from './_lib/all-news';

interface Source {
  id: string;
  name: string;
  icon: string | null;
}

const SOFT: Record<string, string> = {
  rockgazing: 'bg-[#DDE2F0]',
  ssamkejul: 'bg-[#FFE3CF]',
  agirok: 'bg-[#E3EEF8]',
  likeloop: 'bg-[#EEE6FA]',
};

/** 소식 목록과 「골라 보기」 알약. 달마다 묶어 카드로 보여 준다 */
export default function NewsList({ items, sources }: { items: NewsEntry[]; sources: Source[] }) {
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? items : items.filter((n) => n.source === filter);
  const months = [...new Set(shown.map((n) => n.date.slice(0, 7)))];

  const chip = (on: boolean) =>
    `inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full text-sm ${on ? 'bg-[#F5F2EA] text-[#1B1B1B]' : 'bg-[#2A2825] text-[#F5F2EA] hover:bg-[#3A3733]'}`;

  return (
    <>
      <PageHero prompt="git log" title="소식" lead="앱 출시·업데이트와 사이트 소식을 한곳에 모았어요. 앱 안 「새 소식」과 같은 글이에요.">
      <div role="group" aria-label="골라 보기" className="mt-5 flex flex-wrap gap-1.5">
        {[{ id: 'all', name: '전체', icon: null }, ...sources].map((s) => (
          <button key={s.id} type="button" aria-pressed={filter === s.id} onClick={() => setFilter(s.id)} className={`${chip(filter === s.id)} ${s.icon ? 'pl-1.5 pr-3.5' : 'px-4'}`}>
            {s.icon ? <Image src={s.icon} alt="" width={32} height={32} className="h-8 w-8 rounded-[10px]" /> : null}
            {s.name}
          </button>
        ))}
      </div>
      </PageHero>

      {months.map((m) => (
        <section key={m} aria-labelledby={`m-${m}`} className="flex flex-col gap-4">
          <h2 id={`m-${m}`} className="mx-1.5 mt-2.5 font-display text-2xl">
            {Number(m.slice(0, 4))}년 {Number(m.slice(5, 7))}월
          </h2>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shown
              .filter((n) => n.date.startsWith(m))
              .map((n) => {
                const site = n.source === 'site';
                return (
                  <li key={n.key}>
                    <article className={`flex h-full flex-col gap-2.5 rounded-[28px] p-6 ${site ? 'bg-[#1B1B1B] text-[#F5F2EA] dark:ring-1 dark:ring-white/10' : 'bg-card text-card-foreground'}`}>
                      <div className="flex items-center gap-2.5">
                        {n.icon ? (
                          <Image src={n.icon} alt="" width={40} height={40} className="h-10 w-10 rounded-xl" />
                        ) : (
                          <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F2EA] font-brand text-[15px] font-extrabold text-[#1B1B1B]">
                            <span className="text-[#E8590C]">&gt;</span>j
                          </span>
                        )}
                        <span className="text-sm">{n.sourceName}</span>
                        <span className={`ml-auto rounded-full px-2.5 py-1 text-xs ${site ? 'bg-[#2A2825]' : n.tag === '공지' ? 'bg-[#FFE8A3] text-[#1B1B1B]' : `${SOFT[n.source] ?? 'bg-secondary'} text-[#1B1B1B]`}`}>
                          {n.tag}
                        </span>
                      </div>
                      <time dateTime={n.date} className={`text-[13px] ${site ? 'text-[#BDB6A8]' : 'text-muted'}`}>
                        {n.date}
                      </time>
                      <h3 className="font-display text-[22px] leading-snug">
                        <Link href={n.href} className="underline-offset-4 hover:underline">
                          {n.title}
                        </Link>
                      </h3>
                      {n.lines.length > 1 ? (
                        <ul className={`list-disc pl-[18px] text-sm leading-relaxed ${site ? 'text-[#DDD6C8]' : 'text-muted'}`}>
                          {n.lines.map((l) => (
                            <li key={l}>{l}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className={`text-sm leading-relaxed ${site ? 'text-[#DDD6C8]' : 'text-muted'}`}>{n.lines[0]}</p>
                      )}
                    </article>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </>
  );
}
