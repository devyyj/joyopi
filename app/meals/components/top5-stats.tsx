'use client';

import React from 'react';
import { Card } from '@/app/components/ui';

interface Top5StatsProps {
  mostEatenList: Array<{ menuName: string; count: number }>;
  longestUnEatenList: Array<{ menuName: string; daysAgo: number }>;
}

// 순위별 색상 (1위 금, 2위 은, 3위 동, 나머지 기본)
const RANK_COLORS = ['text-[#fbbf24]', 'text-slate-300', 'text-amber-600', 'text-muted-foreground', 'text-muted-foreground'];
const RANK_BG = ['bg-[#fbbf24]/10', 'bg-slate-300/10', 'bg-amber-600/10', 'bg-secondary/50', 'bg-secondary/50'];

interface RankRowProps {
  rank: number;
  name: string;
  label: string;
}

function RankRow({ rank, name, label }: RankRowProps) {
  const colorClass = RANK_COLORS[rank - 1] ?? 'text-muted-foreground';
  const bgClass = RANK_BG[rank - 1] ?? 'bg-secondary/50';

  return (
    <div
      className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-md border border-border/20 ${bgClass}`}
      data-testid={`rank-row-${rank}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-[11px] font-extrabold w-5 text-center shrink-0 ${colorClass}`}>
          {rank}위
        </span>
        <span className="text-[11px] font-semibold text-foreground truncate" title={name}>
          {name}
        </span>
      </div>
      <span className={`text-[10px] font-bold shrink-0 ${colorClass}`}>{label}</span>
    </div>
  );
}

export default function Top5Stats({ mostEatenList, longestUnEatenList }: Top5StatsProps) {
  const isEmpty = mostEatenList.length === 0 && longestUnEatenList.length === 0;

  if (isEmpty) {
    return (
      <Card className="p-5">
        <div className="text-center py-6 text-xs text-muted-foreground font-medium space-y-1">
          <div className="text-2xl">🍽️</div>
          <p>해당 기간에 기록된 식사가 없습니다.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="top5-stats">
      {/* 최애 메뉴 TOP 5 */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            👑 최애 메뉴 TOP 5
          </h4>
          <span className="text-[9px] bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20 px-2 py-0.5 rounded font-bold">
            횟수 기준
          </span>
        </div>

        {mostEatenList.length > 0 ? (
          <div className="flex flex-col gap-1.5" data-testid="most-eaten-list">
            {mostEatenList.map((item, idx) => (
              <RankRow
                key={item.menuName}
                rank={idx + 1}
                name={item.menuName}
                label={`${item.count}회`}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            기록된 식사가 없습니다
          </p>
        )}
      </Card>

      {/* 그리운 맛 TOP 5 */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            🕰️ 그리운 맛 TOP 5
          </h4>
          <span className="text-[9px] bg-secondary text-muted-foreground border border-border/50 px-2 py-0.5 rounded font-bold">
            마지막 섭취 기준
          </span>
        </div>

        {longestUnEatenList.length > 0 ? (
          <div className="flex flex-col gap-1.5" data-testid="longest-uneaten-list">
            {longestUnEatenList.map((item, idx) => (
              <RankRow
                key={item.menuName}
                rank={idx + 1}
                name={item.menuName}
                label={item.daysAgo > 0 ? `${item.daysAgo}일 전` : '오늘'}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            비교할 메뉴가 충분하지 않습니다
          </p>
        )}
      </Card>
    </div>
  );
}
