'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/core';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MealStats } from '../types';

interface PiggyAnalyticsProps {
  stats: MealStats;
  period: '7days' | '30days';
  onPeriodChange: (p: '7days' | '30days') => void;
}

export default function PiggyAnalytics({ stats, period, onPeriodChange }: PiggyAnalyticsProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeRating, setActiveRating] = useState<number | null>(null);

  // 하이드레이션 및 set-state-in-effect Cascading 방어
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

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

  // 공유 텍스트 클립보드 복사
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

  // 식사 종류별 게이지 최대값 도출
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

  // 만족도 백분율 계산 및 데이터 정리
  const satisfactionDist = stats.satisfactionDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalSatisfaction = Object.values(satisfactionDist).reduce((a, b) => a + b, 0);

  const satisfactionData = [
    { rating: 5, label: '5점 👑', name: '👑 최고의 맛!', color: '#fbbf24', fontColor: 'text-[#fbbf24]', badge: 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20 hover:bg-[#fbbf24]/20', desc: '최상의 식사! 입 안 가득 축제가 벌어진 완벽한 식사였네요.' },
    { rating: 4, label: '4점 🥰', name: '🥰 아주 맛있어요', color: '#fb923c', fontColor: 'text-[#fb923c]', badge: 'bg-[#fb923c]/10 text-[#fb923c] border-[#fb923c]/20 hover:bg-[#fb923c]/20', desc: '든든하고 행복하게! 만족스럽고 즐거운 훌륭한 한 끼였습니다.' },
    { rating: 3, label: '3점 😋', name: '😋 무난해요', color: '#c084fc', fontColor: 'text-[#c084fc]', badge: 'bg-[#c084fc]/10 text-[#c084fc] border-[#c084fc]/20 hover:bg-[#c084fc]/20', desc: '매일 먹어도 편안한! 모나지 않고 소소하며 든든한 식사입니다.' },
    { rating: 2, label: '2점 🥱', name: '🥱 조금 아쉽네요', color: '#818cf8', fontColor: 'text-[#818cf8]', badge: 'bg-[#818cf8]/10 text-[#818cf8] border-[#818cf8]/20 hover:bg-[#818cf8]/20', desc: '조금 아쉬운 타이밍! 다음 끼니에는 더 근사한 맛을 찾아가 볼까요?' },
    { rating: 1, label: '1점 😭', name: '😭 흑역사 식단', color: '#f87171', fontColor: 'text-[#f87171]', badge: 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/20 hover:bg-[#f87171]/20', desc: '이건 선 넘었지! 너무 아쉽거나 급하게 때운 식사였습니다. 힘내세요!' },
  ];

  // 만족도 차트용 리포트 가공 (0개 이상인 조각들만 필터링)
  const chartData = satisfactionData
    .map(item => {
      const value = satisfactionDist[item.rating as 1 | 2 | 3 | 4 | 5] || 0;
      const ratio = totalSatisfaction > 0 ? value / totalSatisfaction : 0;
      const percentage = Math.round(ratio * 100);
      return { ...item, value, ratio, percentage };
    })
    .filter(item => item.value > 0);

  // 디폴트로 보여줄 상세 정보 도출 (가장 많은 회수를 차지한 만족도)
  const defaultSegment = [...satisfactionData]
    .map(item => {
      const value = satisfactionDist[item.rating as 1 | 2 | 3 | 4 | 5] || 0;
      const ratio = totalSatisfaction > 0 ? value / totalSatisfaction : 0;
      const percentage = Math.round(ratio * 100);
      return { ...item, value, ratio, percentage };
    })
    .sort((a, b) => b.value - a.value)[0];

  const currentDisplaySegment = chartData.find(s => s.rating === activeRating) || 
    (chartData.length > 0 ? chartData.find(s => s.rating === defaultSegment.rating) || chartData[0] : null);

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

        {/* 3. 극도로 정갈하고 깨끗한 Recharts 기반 '모던 플랫 파이 차트' */}
        <Card className="lg:col-span-1 p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                🍩 식사 만족도 분포도
              </h4>
              <span className="bg-secondary text-foreground border border-border/50 rounded p-0.5 px-2 text-[9px] font-bold">
                📊 총 {totalSatisfaction}회 기록
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              기록된 만족도(1~5점) 점유 현황 및 원형 차트
            </p>
          </div>

          {/* 파이 차트 렌더링 영역 */}
          <div className="relative aspect-[4/3] bg-secondary/10 border border-border/30 rounded-lg overflow-hidden mt-3 flex items-center justify-center min-h-[180px]">
            {(() => {
              if (!mounted) {
                return (
                  <div className="text-[10px] font-bold text-muted-foreground animate-pulse">
                    차트 엔진 로드 중...
                  </div>
                );
              }

              if (totalSatisfaction === 0) {
                return (
                  <div className="text-center text-xs text-muted-foreground font-semibold flex flex-col items-center gap-1.5">
                    <span className="text-xl">🍩</span>
                    <span>식사 기록이 아직 없습니다.</span>
                  </div>
                );
              }

              return (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius="52%"
                      outerRadius="78%"
                      paddingAngle={2.5}
                      dataKey="value"
                      stroke="#1e1e24"
                      strokeWidth={1.5}
                    >
                      {chartData.map((entry) => {
                        const isCurrentActive = activeRating === entry.rating;
                        return (
                          <Cell
                            key={`cell-${entry.rating}`}
                            fill={entry.color}
                            onMouseEnter={() => setActiveRating(entry.rating)}
                            onMouseLeave={() => setActiveRating(null)}
                            className={`transition-all duration-200 cursor-pointer outline-none ${
                              isCurrentActive 
                                ? 'opacity-100 filter drop-shadow-[0_0_6px_rgba(255,255,255,0.15)]' 
                                : activeRating !== null 
                                  ? 'opacity-40' 
                                  : 'opacity-90 hover:opacity-100'
                            }`}
                          />
                        );
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              );
            })()}
          </div>

          {/* 차트 세그먼트와 실시간 호버 연동형 글래스모피즘 피드백 보드 */}
          {totalSatisfaction > 0 && currentDisplaySegment && (
            <div 
              className="bg-secondary/20 border border-border/40 p-3 rounded-lg flex flex-col justify-between gap-1 min-h-[75px] transition-all duration-200 mt-4"
              data-testid="satisfaction-detail-feedback"
            >
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-extrabold flex items-center gap-1 ${currentDisplaySegment.fontColor}`}>
                  {currentDisplaySegment.name}
                </span>
                <span className="text-[9px] text-muted-foreground font-semibold">
                  {currentDisplaySegment.value}회 기록 ({currentDisplaySegment.percentage}%)
                </span>
              </div>
              <p className="text-[10px] text-foreground/80 leading-relaxed font-medium">
                {currentDisplaySegment.desc}
              </p>
            </div>
          )}

          {/* 5색 글래스모피즘 스코어 칩 범례 */}
          {totalSatisfaction > 0 && (
            <div className="grid grid-cols-5 gap-1 pt-3 border-t border-border/30 text-[9px] font-bold text-center mt-4">
              {satisfactionData.map((item) => {
                const count = satisfactionDist[item.rating as 1 | 2 | 3 | 4 | 5] || 0;
                const ratio = totalSatisfaction > 0 ? Math.round((count / totalSatisfaction) * 100) : 0;
                const isCurrentActive = activeRating === item.rating;

                return (
                  <div
                    key={item.rating}
                    onMouseEnter={() => count > 0 && setActiveRating(item.rating)}
                    onMouseLeave={() => setActiveRating(null)}
                    className={`p-1.5 rounded-md border flex flex-col justify-between items-center transition-all duration-200 cursor-pointer ${
                      count > 0 ? item.badge : 'bg-secondary/5 text-muted-foreground/40 border-border/20 cursor-not-allowed opacity-30'
                    } ${
                      isCurrentActive ? 'scale-105 shadow-md border-white/20' : ''
                    }`}
                  >
                    <span className="text-[7.5px] tracking-tight">{item.label}</span>
                    <span className="text-[10px] font-extrabold mt-0.5">{count}회</span>
                    <span className="text-[7px] opacity-60 font-semibold mt-0.5">{ratio}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
