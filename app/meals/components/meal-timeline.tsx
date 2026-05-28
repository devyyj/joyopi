import React, { useState, useOptimistic, startTransition } from 'react';
import SafeImage from '@/app/board/components/safe-image';
import { ConfirmModal } from '@/app/components/ui/core';
import { deleteMeal, updateMeal, getMeals } from '@/app/actions/meals';
import MealFormModal from './meal-form-modal';
import { Meal, DateRange } from '../types';

interface MealTimelineProps {
  initialMeals: Meal[];
  initialNextCursor: number | null;
  initialHasMore: boolean;
  range: DateRange;
  onRefresh: () => void;
}

export default function MealTimeline({ initialMeals, initialNextCursor, initialHasMore, range, onRefresh }: MealTimelineProps) {
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState<number | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // 페이지네이션 상태
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [nextCursor, setNextCursor] = useState<number | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [prevInitialMeals, setPrevInitialMeals] = useState<Meal[]>(initialMeals);
  if (initialMeals !== prevInitialMeals) {
    setMeals(initialMeals);
    setNextCursor(initialNextCursor);
    setHasMore(initialHasMore);
    setPrevInitialMeals(initialMeals);
  }
  const [inlineEditMealId, setInlineEditMealId] = useState<number | null>(null);
  const [inlineField, setInlineField] = useState<'satisfaction' | null>(null);

  // 낙관적 업데이트 (Optimistic UI) 적용
  const [optimisticMeals, setOptimisticMeals] = useOptimistic(
    meals,
    (state, action: { type: 'delete' | 'update' | 'update_inline'; id: number; data?: Partial<Meal> }) => {
      if (action.type === 'delete') {
        return state.filter((m) => m.id !== action.id);
      }
      if (action.type === 'update_inline') {
        return state.map((m) => {
          if (m.id === action.id) {
            return { ...m, ...action.data };
          }
          return m;
        });
      }
      return state;
    }
  );

  // 삭제 액션
  const handleDeleteConfirm = async () => {
    if (deletingMealId === null) return;
    const targetId = deletingMealId;

    startTransition(() => {
      // 1. 낙관적 반영
      setOptimisticMeals({ type: 'delete', id: targetId });
    });

    const response = await deleteMeal(targetId);
    if (!response.success) {
      alert(response.message || '삭제에 실패했습니다. 다시 시도해 주세요.');
    }
    // 삭제 후 로컬 목록에서도 제거
    setMeals((prev) => prev.filter((m) => m.id !== targetId));
    onRefresh();
  };

  // 더 불러오기
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || !nextCursor) return;
    setIsLoadingMore(true);
    try {
      const result = await getMeals({
        from: range.from,
        to: range.to,
        cursor: nextCursor,
        limit: 10,
      });
      setMeals((prev) => [...prev, ...(result.meals as Meal[])]);
      setNextCursor(result.nextCursor);
      setHasMore(result.hasMore);
    } catch (e) {
      console.error('[loadMore Error]:', e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 인라인 만족도 저장
  const saveInlineSatisfaction = async (mealId: number, nextSat: number) => {
    startTransition(() => {
      setOptimisticMeals({
        type: 'update_inline',
        id: mealId,
        data: { satisfaction: nextSat },
      });
    });

    const formData = new FormData();
    formData.append('satisfaction', nextSat.toString());
    const response = await updateMeal(mealId, formData);

    if (!response.success) {
      alert(response.message || '만족도 수정 실패');
    }
    
    setInlineEditMealId(null);
    setInlineField(null);
    onRefresh();
  };

  const getMealTypeBadge = (type: string) => {
    switch (type) {
      case 'breakfast':
        return { label: '🌅 아침', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
      case 'lunch':
        return { label: '☀️ 점심', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' };
      case 'dinner':
        return { label: '🌙 저녁', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'snack':
        return { label: '🧁 간식', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' };
      case 'night_snack':
        return { label: '🍗 야식', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
      default:
        return { label: '🍴 식사', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    }
  };

  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 도넛 모양 폴백 일러스트 컴포넌트
  const DonutFallback = () => (
    <div className="flex flex-col items-center justify-center bg-amber-500/5 text-amber-600/50 w-full h-full p-4 border border-dashed border-amber-500/20 rounded-md">
      <div className="relative w-10 h-10 mb-1 border-4 border-amber-500/30 rounded-full flex items-center justify-center animate-pulse">
        {/* 도넛 구멍 */}
        <div className="w-3 h-3 bg-card border border-amber-500/20 rounded-full" />
        {/* 스프링클 데코 */}
        <div className="absolute top-1 left-2 w-1 h-2 bg-pink-400 rounded-full rotate-45" />
        <div className="absolute bottom-1 right-2 w-1.5 h-1 bg-cyan-400 rounded-full" />
      </div>
      <span className="text-[10px] font-bold tracking-tight opacity-70">음식 사진 없음</span>
    </div>
  );

  if (optimisticMeals.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-card border border-border rounded-lg shadow-sm">
        <div className="text-5xl mb-4">🍩</div>
        <h3 className="text-base font-bold text-foreground mb-1">오늘 기록된 식사가 없습니다</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
          식기 전에 오늘 먹은 소중한 한 끼를 기록해 보세요. 식사 구분과 음식 만족도가 모여 귀여운 돼지 분석 결과가 만들어집니다!
        </p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-border/80 pl-6 ml-3 space-y-6">
      {optimisticMeals.map((meal) => {
        const badge = getMealTypeBadge(meal.mealType);
        const hasImages = meal.images && meal.images.length > 0;
        const mainImage = meal.images && meal.images.length > 0 ? meal.images[0].url : null;

        const isEditingThisSatisfaction = inlineEditMealId === meal.id && inlineField === 'satisfaction';

        return (
          <div key={meal.id} className="relative group bg-card border border-border rounded-lg p-4 shadow-sm hover:border-primary/30 transition-all">
            {/* 타임라인 마커 피치 볼 */}
            <div className="absolute -left-[32px] top-6 w-3.5 h-3.5 rounded-full border-2 border-background bg-primary shadow-sm" />

            <div className="flex flex-col md:flex-row gap-4 items-start">
              {/* 이미지 썸네일 */}
              <div className="w-20 h-20 shrink-0 relative rounded-md overflow-hidden bg-secondary border border-border">
                {hasImages ? (
                  <SafeImage
                    src={mainImage}
                    alt={meal.menuName}
                    className="w-full h-full object-cover"
                    fallback={<DonutFallback />}
                  />
                ) : (
                  <DonutFallback />
                )}
              </div>

              {/* 디테일 내용 */}
              <div className="flex-1 space-y-2.5 w-full">
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* 시간 */}
                    <span 
                      className="text-xs font-bold text-muted-foreground"
                      suppressHydrationWarning
                    >
                      {formatDate(meal.eatenAt)}
                    </span>
                    {/* 식사타입 배지 */}
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badge.color}`}>
                      {badge.label}
                    </span>
                    {/* 메뉴명 */}
                    <h4 className="text-sm md:text-base font-bold text-foreground tracking-tight">
                      {meal.menuName}
                    </h4>
                  </div>

                  {/* 관리 버튼군 */}
                  <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingMeal(meal);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1 hover:bg-secondary border border-transparent hover:border-border rounded text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                      title="수정"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setDeletingMealId(meal.id);
                        setIsDeleteConfirmOpen(true);
                      }}
                      className="p-1 hover:bg-secondary border border-transparent hover:border-border rounded text-red-500/80 hover:text-red-500 transition-all cursor-pointer"
                      title="삭제"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* 지표 리스트 (식비, 포만감 제거하고 오직 만족도 인라인 폼만 콤팩트 노출) */}
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground bg-secondary/20 border border-border/30 rounded-md px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span>😋 만족도:</span>
                    {isEditingThisSatisfaction ? (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => saveInlineSatisfaction(meal.id, s)}
                            className={`text-xs hover:scale-125 transition-transform cursor-pointer ${
                              s <= meal.satisfaction ? 'opacity-100' : 'opacity-30'
                            }`}
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span
                        onClick={() => {
                          setInlineEditMealId(meal.id);
                          setInlineField('satisfaction');
                        }}
                        className="text-foreground font-bold hover:text-primary hover:underline underline-offset-2 cursor-pointer flex items-center gap-0.5 transition-colors"
                        title="클릭 시 평점 간편 수정"
                      >
                        {Array.from({ length: meal.satisfaction }).map((_, i) => (
                          <span key={i} className="text-primary text-[10px]">⭐</span>
                        ))}
                        {meal.satisfaction}/5
                      </span>
                    )}
                  </div>
                </div>

                {/* 태그 및 메모 */}
                <div className="space-y-1.5">
                  {meal.memo && (
                    <p className="text-xs text-foreground/80 italic font-medium">
                      &ldquo;{meal.memo}&rdquo;
                    </p>
                  )}
                  {meal.tags && meal.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {meal.tags.map((t: string) => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2.5 text-xs font-bold text-primary hover:text-primary-foreground bg-primary/10 hover:bg-primary border border-primary/20 hover:border-primary rounded-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingMore ? '불러오는 중...' : '🍴 더 보기'}
          </button>
        </div>
      )}

      {/* 모달 렌더링 */}
      {isEditModalOpen && editingMeal && (
        <MealFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingMeal(null);
          }}
          meal={editingMeal}
          onSuccess={onRefresh}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setDeletingMealId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="식사 기록 삭제"
        message="이 식사 기록을 정말 삭제하시겠습니까? 관련 음식 사진도 함께 지워집니다."
        confirmText="삭제하기"
        cancelText="취소"
        variant="danger"
      />
    </div>
  );
}
