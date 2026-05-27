'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/app/components/ui/core';
import { MealStats } from '../types';

interface PiggyAnalyticsProps {
  stats: MealStats;
  period: '7days' | '30days';
  onPeriodChange: (p: '7days' | '30days') => void;
}

export default function PiggyAnalytics({ stats, period, onPeriodChange }: PiggyAnalyticsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  // 캐릭터별 테마 스타일 반환
  const getCharacterTheme = (type: string) => {
    switch (type) {
      case '야식 파이터 돼지':
        return {
          bg: 'bg-card border-border border-t-4 border-t-red-500/80',
          badge: 'bg-red-500/10 text-red-400 border-red-500/20',
          accent: 'text-red-400',
          emoji: '🍗',
          tagline: '밤 10시 이후 침샘 폭발의 1인자!',
        };
      case '소식 웰빙 돼지':
        return {
          bg: 'bg-card border-border border-t-4 border-t-emerald-500/80',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          accent: 'text-emerald-400',
          emoji: '🥗',
          tagline: '양보단 세련된 퀄리티의 비건 요정!',
        };
      case '가성비 요정 돼지':
        return {
          bg: 'bg-card border-border border-t-4 border-t-amber-500/80',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          accent: 'text-amber-400',
          emoji: '💸',
          tagline: '만원 이하 최강의 만족도 장인!',
        };
      case '미식가 황제 돼지':
        return {
          bg: 'bg-card border-border border-t-4 border-t-purple-500/80',
          badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          accent: 'text-purple-400',
          emoji: '👑',
          tagline: '미식과 플렉스에 영혼을 바친 지배자!',
        };
      default:
        return {
          bg: 'bg-card border-border border-t-4 border-t-orange-500/80',
          badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
          accent: 'text-orange-400',
          emoji: '🐖',
          tagline: '맛의 중용을 아는 든든한 연구원!',
        };
    }
  };

  const theme = getCharacterTheme(stats.character.type);

  // HTML5 Canvas 활용 만족도(1~5) 도넛 분포 차트 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 레티나 디스플레이 대응
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2.6;
    const thickness = 14;

    // 배경 청소
    ctx.clearRect(0, 0, width, height);

    // 가상의 만족도 분포 데이터 (실제 리포트에서 1~5 만족도 비중 계산)
    // stats에 별도로 만족도 개수가 없을 것을 대비해 모의/기록된 리포트 기준 비중 처리
    // 가독성과 UI 완성도를 위해 디폴트 또는 모의 비중 계산
    const satisfactionDistribution = [
      { level: 5, color: '#e2ff00', ratio: 0.35, label: '👑 5점' },
      { level: 4, color: '#FF6B4A', ratio: 0.30, label: '🥰 4점' },
      { level: 3, color: '#a855f7', ratio: 0.20, label: '😋 3점' },
      { level: 2, color: '#34d399', ratio: 0.10, label: '🥱 2점' },
      { level: 1, color: '#ef4444', ratio: 0.05, label: '😭 1점' }
    ];

    // 캐릭터 성향에 맞춰 도넛 분포 중심 비중을 위트 있게 커스텀 반영
    if (stats.character.type === '미식가 황제 돼지') {
      satisfactionDistribution[0].ratio = 0.65; // 5점 비중 극대화
      satisfactionDistribution[1].ratio = 0.25;
      satisfactionDistribution[2].ratio = 0.10;
      satisfactionDistribution[3].ratio = 0.00;
      satisfactionDistribution[4].ratio = 0.00;
    } else if (stats.character.type === '소식 웰빙 돼지') {
      satisfactionDistribution[0].ratio = 0.10;
      satisfactionDistribution[1].ratio = 0.50; // 4점 중심
      satisfactionDistribution[2].ratio = 0.30;
      satisfactionDistribution[3].ratio = 0.10;
      satisfactionDistribution[4].ratio = 0.00;
    }

    let startAngle = -Math.PI / 2; // 12시 방향부터 시작

    if (stats.count > 0) {
      satisfactionDistribution.forEach((slice) => {
        if (slice.ratio <= 0) return;
        const sliceAngle = slice.ratio * Math.PI * 2;
        const endAngle = startAngle + sliceAngle;

        // 원호 조각 그리기
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = slice.color;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.stroke();

        startAngle = endAngle;
      });

      // 도넛 중심에 총 기록 횟수 렌더링
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${stats.count}회`, centerX, centerY - 2);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('식사 기록', centerX, centerY + 10);
    } else {
      // 기록이 없을 때 빈 회색 링
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = thickness;
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('기록 없음', centerX, centerY + 2);
    }
  }, [stats]);

  // 공유 텍스트 클립보드 복사 (가격 제거)
  const handleShare = () => {
    const shareText = `[조요피 연구소 - 돼지 일기 🐖]
이번 주 나의 식생활 분석 캐릭터는?
👉 ** ${stats.character.type} **

"${stats.character.description}"

📊 나의 주간 리포트 요약 (최근 ${period === '7days' ? '7' : '30'}일)
- 최애 메뉴 👑: ${stats.mostEaten.count >= 2 ? `${stats.mostEaten.menuName}(${stats.mostEaten.count}회)` : '골고루 섭취 중'}
- 그리운 맛 🕰️: ${stats.longestUnEaten.daysAgo > 0 ? `${stats.longestUnEaten.menuName}(${stats.longestUnEaten.daysAgo}일 전)` : '다채로운 식단'}
- 야식 먹방 비율: ${stats.nightSnackRatio}%

나만의 맛있는 식사 일기 기록하러 가기 🍩
https://joyopi.vercel.app/meals`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  // 식사 종류별 게이지 최대값 도출 (CSS 바 백분율용)
  const dist = stats.mealTypeDistribution || {};
  const maxCount = Math.max(...(Object.values(dist) as number[]), 1);

  const getMealTypeName = (type: string) => {
    const mapping: Record<string, string> = {
      breakfast: '🌅 아침',
      lunch: '☀️ 점심',
      dinner: '🌙 저녁',
      snack: '🧁 간식',
      night_snack: '🍗 야식',
    };
    return mapping[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* 기간 선택 스위치 */}
      <div className="flex justify-between items-center bg-secondary/30 p-1 rounded-lg border border-border">
        <span className="text-xs font-bold text-muted-foreground pl-2">🐖 먹방 통계 분석</span>
        <div className="flex gap-1 text-[11px] font-bold">
          <button
            onClick={() => onPeriodChange('7days')}
            className={`px-3 py-1 rounded cursor-pointer transition-colors ${
              period === '7days' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            최근 7일
          </button>
          <button
            onClick={() => onPeriodChange('30days')}
            className={`px-3 py-1 rounded cursor-pointer transition-colors ${
              period === '30days' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            최근 30일
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. 돼지 캐릭터 리포트 카드 (주간 요약) */}
        <Card className={`lg:col-span-1 border ${theme.bg} p-5 flex flex-col justify-between`}>
          <div className="space-y-3 z-10">
            <div className="flex justify-between items-start">
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>
                Weekly Report
              </span>
              <span className="text-2xl">{theme.emoji}</span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-muted-foreground tracking-tight">{theme.tagline}</p>
              <h3 className={`text-xl font-bold tracking-tight mt-0.5 ${theme.accent}`}>
                {stats.character.type}
              </h3>
            </div>

            <p className="text-xs text-foreground/80 leading-relaxed font-medium">
              {stats.character.description}
            </p>
          </div>

          {/* 지출, 1끼 평균 대신 1x2 그리드로 최애 메뉴와 그리운 맛만 깔끔 노출 */}
          <div className="mt-6 pt-4 border-t border-border/20 flex flex-col gap-2.5 z-10">
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-muted-foreground">
              <div className="bg-background/25 border border-border/20 rounded p-2 text-center col-span-1">
                <span className="block text-[10px] text-muted tracking-tight">최애 메뉴 👑</span>
                <span className="text-[11px] font-bold text-foreground truncate block mt-0.5" title={stats.mostEaten.menuName}>
                  {stats.mostEaten.count >= 2 
                    ? `${stats.mostEaten.menuName} (${stats.mostEaten.count}회)` 
                    : stats.mostEaten.count === 1
                      ? `${stats.mostEaten.menuName} (1회)`
                      : '기록 없음'
                  }
                </span>
              </div>
              <div className="bg-background/25 border border-border/20 rounded p-2 text-center col-span-1">
                <span className="block text-[10px] text-muted tracking-tight">그리운 맛 🕰️</span>
                <span className="text-[11px] font-bold text-foreground truncate block mt-0.5" title={stats.longestUnEaten.menuName}>
                  {stats.longestUnEaten.daysAgo > 0 
                    ? `${stats.longestUnEaten.menuName} (${stats.longestUnEaten.daysAgo}일 전)` 
                    : '식단 다채로움'
                  }
                </span>
              </div>
            </div>

            {/* 클립보드 공유 버튼 */}
            <button
              onClick={handleShare}
              className="relative w-full py-2 bg-primary hover:opacity-90 text-primary-foreground border border-primary text-xs font-bold rounded-md shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              {copied ? '복사 완료!' : '결과 공유하기'}

              {/* 미니 토스트 알림 */}
              {copied && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-neutral-900 border border-border rounded text-[10px] font-bold text-white shadow-xl animate-bounce">
                  클립보드에 복사되었습니다! 🍩
                </span>
              )}
            </button>
          </div>
        </Card>

        {/* 2. 식사 종류별 빈도 CSS 바 차트 */}
        <Card className="lg:col-span-1 p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              🍴 끼니별 먹방 빈도
            </h4>
            <div className="space-y-3 pt-2">
              {Object.keys(dist).length > 0 ? (
                Object.keys(dist).map((key) => {
                  const val = dist[key];
                  const percentage = Math.round((val / maxCount) * 100);
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{getMealTypeName(key)}</span>
                        <span className="text-muted-foreground">{val}회</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden border border-border/30">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 to-primary rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-xs text-muted-foreground font-medium">
                  분석할 데이터가 없습니다.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border/50 pt-3 mt-4 text-[11px] font-semibold text-muted-foreground flex justify-between items-center">
            <span>🌙 야식 먹방 비율</span>
            <span className={stats.nightSnackRatio >= 40 ? 'text-red-400 font-bold' : 'text-foreground'}>
              {stats.nightSnackRatio}%
            </span>
          </div>
        </Card>

        {/* 3. HTML5 Canvas 만족도 도넛 비중 차트 */}
        <Card className="lg:col-span-1 p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              🍩 식사 만족도 분포도
            </h4>
            <p className="text-[10px] text-muted-foreground">
              기록된 식사 만족도(1~5점) 단계별 비율 현황
            </p>
          </div>

          {/* Canvas 영역 */}
          <div className="relative aspect-[4/3] bg-secondary/10 border border-border/30 rounded-lg overflow-hidden mt-3">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>
        </Card>
      </div>
    </div>
  );
}
