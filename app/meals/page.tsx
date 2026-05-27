'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { Button, Card, SectionHeader } from '@/app/components/ui/core';
import { createClient } from '@/utils/supabase/client';
import { getMeals, getMealStats } from '@/app/actions/meals';
import PiggyAnalytics from './components/piggy-analytics';
import MealTimeline from './components/meal-timeline';
import MealFormModal from './components/meal-form-modal';
import { signInWithGoogle } from '@/app/actions/auth';
import { Meal, MealStats } from './types';
import { User } from '@supabase/supabase-js';

export default function MealsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [, startTransition] = useTransition();

  // 데이터 상태
  const [mealsList, setMealsList] = useState<Meal[]>([]);
  const [stats, setStats] = useState<MealStats | null>(null);

  // 제어 상태
  // lazy state initialization을 적용하여 useEffect에서의 동기식 set-state-in-effect 린트 오류 원천 방지
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  });
  const [period, setPeriod] = useState<'7days' | '30days'>('7days');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. 로그인 상태 감지
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: supabaseUser } }) => {
      setUser(supabaseUser);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. 데이터 로딩 함수 (날짜, 통계 기간 변경 시 호출)
  const loadData = useCallback(() => {
    if (!user) return;
    
    startTransition(async () => {
      const fetchedMeals = await getMeals(selectedDate || undefined);
      const fetchedStats = await getMealStats(period);
      setMealsList(fetchedMeals as Meal[]);
      setStats(fetchedStats as MealStats);
    });
  }, [user, selectedDate, period]);

  useEffect(() => {
    if (user && selectedDate) {
      loadData();
    }
  }, [user, selectedDate, period, loadData]);

  // 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-xs text-muted-foreground font-semibold">사용자 인증 확인 중...</p>
      </div>
    );
  }

  // 비로그인 화면
  if (!user) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="text-6xl animate-bounce">🐖</div>
        <div className="space-y-3 max-w-lg mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            나만의 맛있는 기록, <span className="text-primary font-extrabold text-shadow-sm">돼지 일기</span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            오늘 먹은 음식, 기분, 지불한 식비를 기록하고 맞춤형 식생활 분석 보고서를 받아보세요. 
            소식가부터 미식가, 가성비 파이터까지 당신의 먹방 본능 유형을 귀여운 카드로 도출해 드립니다.
          </p>
        </div>

        <Card className="max-w-sm mx-auto p-6 border border-border shadow-md bg-secondary/15">
          <p className="text-xs text-muted-foreground font-semibold mb-4">
            로그인 시 즉시 기록을 시작할 수 있습니다.
          </p>
          <Button variant="primary" className="w-full flex items-center justify-center gap-2" onClick={handleGoogleLogin}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            Google 계정으로 시작하기
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-24">
      {/* 타이틀 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <SectionHeader
          label="YOPI LAB Micro Service"
          title="🐖 돼지 일기 (Piggy Diary)"
          description="그날 먹은 기분과 지출한 식비를 바탕으로 도출되는 위트 있는 분석 리포트"
        />
        <Button variant="primary" className="shrink-0 flex items-center gap-1.5" size="sm" onClick={() => setIsModalOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          식사 기록하기
        </Button>
      </div>

      {/* 1. 통계 대시보드 영역 */}
      {stats && (
        <section className="space-y-3">
          <PiggyAnalytics stats={stats} period={period} onPeriodChange={setPeriod} />
        </section>
      )}

      {/* 2. 타임라인 기록 영역 */}
      <section className="space-y-5 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/20 border border-border/50 rounded-lg px-4 py-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <span>📅 타임라인 먹방 일지</span>
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">날짜 선택:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 text-xs bg-card border border-border rounded-md text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
            />
          </div>
        </div>

        <MealTimeline initialMeals={mealsList} onRefresh={loadData} />
      </section>

      {/* 등록 모달 */}
      {isModalOpen && (
        <MealFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadData}
        />
      )}

      {/* 3. 모바일/데스크톱 플로팅 연필 액션 버튼 (FAB) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary hover:opacity-90 text-primary-foreground border border-primary shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center group"
        title="오늘의 식사 기록 추가"
      >
        <svg
          className="w-5 h-5 group-hover:scale-110 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </main>
  );
}
