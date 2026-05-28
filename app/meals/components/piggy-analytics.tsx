'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { MealStats } from '../types';

interface PiggyAnalyticsProps {
  stats: MealStats;
}

export default function PiggyAnalytics({ stats }: PiggyAnalyticsProps) {
  const [mounted, setMounted] = useState(false);
  const [activeRating, setActiveRating] = useState<number | null>(null);

  // 하이드레이션 및 set-state-in-effect Cascading 방어
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // 식사 종류별 데이터 도출
  const dist = stats.mealTypeDistribution || {};

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. 최애 메뉴 & 그리운 맛 TOP 5 합본 카드 */}
        <Card className="lg:col-span-1 p-5 border border-border bg-card flex flex-col justify-between" data-testid="top5-stats-card">
          <div className="space-y-4">
            {/* 최애 메뉴 TOP 5 */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                👑 최애 메뉴 TOP 5
              </h4>
              <div className="space-y-1.5">
                {stats.mostEatenList && stats.mostEatenList.length > 0 ? (
                  stats.mostEatenList.slice(0, 5).map((item, idx) => (
                    <div key={item.menuName} className="flex items-center justify-between text-[11px] font-semibold p-1.5 bg-secondary/15 border border-border/20 rounded">
                      <span className="text-foreground flex items-center gap-1.5">
                        <span className="text-primary font-bold">#{idx + 1}</span> {item.menuName}
                      </span>
                      <span className="text-muted-foreground text-[10px]">{item.count}회</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-[10px] text-muted-foreground font-semibold">
                    최애 메뉴가 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 경계 구분선 */}
            <div className="border-t border-border/40" />

            {/* 그리운 맛 TOP 5 */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                🕰️ 그리운 맛 TOP 5
              </h4>
              <div className="space-y-1.5">
                {stats.longestUnEatenList && stats.longestUnEatenList.length > 0 ? (
                  stats.longestUnEatenList.slice(0, 5).map((item, idx) => (
                    <div key={item.menuName} className="flex items-center justify-between text-[11px] font-semibold p-1.5 bg-secondary/15 border border-border/20 rounded">
                      <span className="text-foreground flex items-center gap-1.5">
                        <span className="text-indigo-400 font-bold">#{idx + 1}</span> {item.menuName}
                      </span>
                      <span className="text-muted-foreground text-[10px]">{item.daysAgo}일째</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-[10px] text-muted-foreground font-semibold">
                    그리운 메뉴가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* 2. 식사 종류별 빈도 Recharts 바 차트 */}
        <Card className="lg:col-span-1 p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              🍴 끼니별 먹방 빈도
            </h4>
            <div className="relative aspect-[4/3] bg-secondary/10 border border-border/30 rounded-lg overflow-hidden mt-3 flex items-center justify-center min-h-[180px]">
              {(() => {
                if (!mounted) {
                  return (
                    <div className="text-[10px] font-bold text-muted-foreground animate-pulse">
                      차트 엔진 로드 중...
                    </div>
                  );
                }

                const mealTypeData = Object.keys(dist).map((key) => ({
                  name: getMealTypeName(key),
                  count: dist[key],
                })).sort((a, b) => b.count - a.count);

                if (mealTypeData.length === 0) {
                  return (
                    <div className="text-center text-xs text-muted-foreground font-semibold flex flex-col items-center gap-1.5">
                      <span className="text-xl">🍴</span>
                      <span>끼니 기록이 아직 없습니다.</span>
                    </div>
                  );
                }

                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mealTypeData}
                      layout="vertical"
                      margin={{ top: 15, right: 25, left: 10, bottom: 5 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        width={65}
                        tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 700 }}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-popover border border-border px-2.5 py-1.5 rounded shadow-md text-[10px] font-bold text-popover-foreground">
                                {payload[0].name} : <span className="text-primary">{payload[0].value}회</span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--color-primary)"
                        radius={[0, 4, 4, 0]}
                        barSize={12}
                      >
                        {mealTypeData.map((entry, index) => {
                          // 끼니별 부드러운 파스텔 컬러 톤 그라데이션 매칭
                          const colors = ['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#3b82f6'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
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
                <div className="relative w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius="80%"
                        outerRadius="100%"
                        cornerRadius="50%"
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
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
                                  ? 'opacity-100 filter drop-shadow-[0_0_6px_rgba(255,255,255,0.15)] scale-[1.03] origin-center' 
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
                  
                  {/* 도넛 차트 정중앙 텍스트 정보 표현부 (하단 영역 대체) */}
                  {currentDisplaySegment && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
                      <span className="text-[10px] font-bold text-muted-foreground tracking-wider mb-0.5">
                        {currentDisplaySegment.label}
                      </span>
                      <span className={`text-sm font-extrabold ${currentDisplaySegment.fontColor}`}>
                        {currentDisplaySegment.percentage}%
                      </span>
                      <span className="text-[9px] text-muted-foreground font-semibold mt-0.5">
                        {currentDisplaySegment.value}회 기록
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </Card>
      </div>
    </div>
  );
}
