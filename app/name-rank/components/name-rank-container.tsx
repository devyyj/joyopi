'use client';

import React, { useState, useTransition } from 'react';
import { createBabyName, updateBabyName, deleteBabyName, reorderBabyNames } from '@/app/actions/name-rank';
import { Plus, ArrowUp, ArrowDown, Trash2, Edit2, Check, X, Sparkles, AlertCircle, Lock, Radio, BookOpen, Star, Sparkle, Trophy } from 'lucide-react';

interface NameRankItem {
  id: string;
  name: string;
  role: string;
  rank: number;
  createdAt: Date;
  updatedAt: Date;
}

interface NameRankContainerProps {
  initialDadNames: NameRankItem[];
  initialMomNames: NameRankItem[];
  currentUserEmail: string;
}

// 0. 인기 TOP 50: 통계청 및 대법원 통계 기준 가장 흔한 남자 아기 이름 50선 ('조'씨 성 일괄 적용)
const POPULAR_BOY_NAMES = [
  '도윤', '이준', '하준', '시우', '도현', '태오', '이안', '서준', '선우', '은우',
  '수호', '도하', '이현', '지호', '우주', '은호', '유준', '윤우', '주원', '시윤',
  '연우', '우진', '이도', '지한', '예준', '하진', '도준', '이한', '지후', '하민',
  '민준', '로운', '이든', '태이', '유안', '태하', '유찬', '지우', '현우', '지환',
  '시원', '지안', '서우', '하율', '준우', '건우', '민재', '정우', '승우', '준서'
].map(name => `조${name}`);

// 1. 테마: 소리와 울림 (Sound & Rhythm) - 50개 ('조'씨 성 일괄 적용, 유니크)
const THEME_SOUND_NAMES = [
  '율', '은율', '하겸', '로하', '지율', '서율', '윤솔', '주율', '시율', '유하',
  '은솔', '하온', '다온', '도유', '지온', '해온', '유율', '주온', '예안', '유온',
  '시온', '해율', '라온', '하음', '도온', '유진', '윤서', '이솔', '하엘', '이율',
  '서하', '율우', '예솔', '윤하', '주하', '율하', '시하', '유솔', '아인', '나온',
  '다울', '하랑', '아윤', '유이', '이레', '라율', '하은', '다솔', '소율', '나율'
].map(name => `조${name}`);

// 2. 테마: 순우리말 (Native Korean) - 50개 ('조'씨 성 일괄 적용, 유니크)
const THEME_KOREAN_NAMES = [
  '한결', '가온', '나래', '마루', '새론', '슬옹', '새샘', '솔', '벼리', '누리',
  '그린', '미르', '빛', '빛가람', '찬솔', '보람', '이루', '슬기', '노을', '벼루',
  '한울', '아라', '늘찬', '다빈', '다슬', '다올', '도담', '든솔', '바름', '새별',
  '샘', '세찬', '아람', '예봄', '우솔', '으뜸', '은별', '은새', '찬샘', '찬슬',
  '참', '푸름', '하람', '하얀', '한빛', '한샘', '한솔', '해솔', '해찬', '힘찬'
].map(name => `조${name}`);

// 3. 테마: 덕목과 소망 (Virtue & Blessing) - 50개 ('조'씨 성 일괄 적용, 유니크)
const THEME_VIRTUE_NAMES = [
  '재원', '태경', '윤성', '재윤', '민규', '승민', '시헌', '태윤', '찬우', '지성',
  '윤찬', '주안', '수현', '승재', '민성', '준영', '윤호', '재희', '준오', '재혁',
  '태민', '승현', '민혁', '은준', '동현', '덕우', '상우', '진우', '재현', '용우',
  '성준', '경민', '상현', '진성', '성현', '성우', '영민', '태현', '동우', '정민',
  '지헌', '지섭', '재민', '창우', '현준', '형준', '성민', '규원', '승오', '현오'
].map(name => `조${name}`);

// 4. 테마: 자연과 계절 (Nature & Season) - 50개 ('조'씨 성 일괄 적용, 유니크)
const THEME_NATURE_NAMES = [
  '도원', '유성', '해민', '유담', '도겸', '서원', '지오', '동하', '윤오', '시열',
  '하늘', '푸른', '늘봄', '솔뫼', '서한', '강산', '백두', '가을', '여름', '은샘',
  '새벽', '윤산', '바다', '동해', '태양', '청산', '수안', '서강', '은강', '대해',
  '산들', '태산', '서해', '도강', '태풍', '한바다', '들샘', '숲', '강록', '여울',
  '별솔', '바람', '강솔', '도해', '은해', '산아', '늘솔', '가람', '구름', '초원'
].map(name => `조${name}`);

type ActiveThemeTab = 'popular' | 'sound' | 'korean' | 'virtue' | 'nature';

export default function NameRankContainer({ initialDadNames, initialMomNames, currentUserEmail }: NameRankContainerProps) {
  const [dadNames, setDadNames] = useState<NameRankItem[]>(initialDadNames);
  const [momNames, setMomNames] = useState<NameRankItem[]>(initialMomNames);
  const [isPending, startTransition] = useTransition();

  // 하단 추천 테마 탭 선택 상태 ('popular' | 'sound' | 'korean' | 'virtue' | 'nature')
  const [activeTab, setActiveTab] = useState<ActiveThemeTab>('popular');

  // 권한 판별
  const canManageDad = currentUserEmail === 'devyyj@gmail.com';
  const canManageMom = currentUserEmail === 'noticeably34@gmail.com';
  const hasAnyEditPermission = canManageDad || canManageMom;

  // 입력 필드 상태
  const [newName, setNewName] = useState({ dad: '', mom: '' });
  
  // 수정 모드 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // 에러 메시지 상태
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 겹치는 이름(공통 후보군) 검출
  const dadSet = new Set(dadNames.map(n => n.name.trim()));
  const momSet = new Set(momNames.map(n => n.name.trim()));
  const matchedNames = new Set([...dadSet].filter(name => momSet.has(name)));

  // 성(조)과 이름을 시각적으로 분리하여 돋보이게 렌더링하는 헬퍼 함수
  const renderFormattedName = (fullName: string, isLightMode: boolean = true, isRecommendation: boolean = false) => {
    const trimmed = fullName.trim();
    if (trimmed.startsWith('조')) {
      const lastName = '조';
      const firstName = trimmed.slice(1);
      return (
        <span className="inline-flex items-center">
          <span className={`${isLightMode ? 'text-neutral-400 font-normal' : 'text-neutral-400/80 font-normal'} mr-0.5 ${
            isRecommendation ? 'text-sm md:text-base' : 'text-base md:text-lg'
          }`}>
            {lastName}
          </span>
          <span className={`${isLightMode ? 'text-indigo-600' : 'text-rose-600'} font-semibold ${
            isRecommendation ? 'text-base md:text-lg' : 'text-lg md:text-xl'
          }`}>
            {firstName}
          </span>
        </span>
      );
    }
    return <span className={`font-semibold text-neutral-800 ${isRecommendation ? 'text-base md:text-lg' : 'text-lg md:text-xl'}`}>{fullName}</span>;
  };

  // 이름 추가 공통 함수
  const addNameByName = async (nameVal: string, role: 'dad' | 'mom') => {
    if (role === 'dad' && !canManageDad) return;
    if (role === 'mom' && !canManageMom) return;

    setErrorMsg(null);
    try {
      const response = await createBabyName(nameVal, role);
      if (response.success && response.data) {
        const newItem = {
          ...response.data,
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt)
        } as NameRankItem;

        if (role === 'dad') {
          setDadNames(prev => [...prev, newItem].sort((a, b) => a.rank - b.rank));
        } else {
          setMomNames(prev => [...prev, newItem].sort((a, b) => a.rank - b.rank));
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : '이름을 추가하지 못했습니다.');
    }
  };

  // 입력창을 통한 이름 추가 핸들러
  const handleAddName = async (role: 'dad' | 'mom') => {
    const nameVal = newName[role].trim();
    if (!nameVal) return;
    await addNameByName(nameVal, role);
    setNewName(prev => ({ ...prev, [role]: '' }));
  };

  // 추천 이름 클릭 시 선호도 랭킹 추가 핸들러
  const handleRecommendClick = async (name: string) => {
    if (!hasAnyEditPermission) {
      setErrorMsg('이름을 추가할 권한이 없습니다.');
      return;
    }

    if (canManageDad) {
      if (dadNames.some(item => item.name.trim() === name)) {
        setErrorMsg(`'${name}'은(는) 이미 아빠 선호도 랭킹에 추가되어 있습니다.`);
        return;
      }
      await addNameByName(name, 'dad');
    } else if (canManageMom) {
      if (momNames.some(item => item.name.trim() === name)) {
        setErrorMsg(`'${name}'은(는) 이미 엄마 선호도 랭킹에 추가되어 있습니다.`);
        return;
      }
      await addNameByName(name, 'mom');
    }
  };

  // 이름 삭제 핸들러
  const handleDeleteName = async (id: string, role: 'dad' | 'mom') => {
    if (role === 'dad' && !canManageDad) return;
    if (role === 'mom' && !canManageMom) return;

    setErrorMsg(null);
    // 낙관적 업데이트 적용
    const targetState = role === 'dad' ? dadNames : momNames;
    const filtered = targetState.filter(item => item.id !== id);
    const reordered = filtered.map((item, idx) => ({ ...item, rank: idx + 1 }));

    if (role === 'dad') {
      setDadNames(reordered);
    } else {
      setMomNames(reordered);
    }

    try {
      await deleteBabyName(id);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : '이름 삭제에 실패했습니다.');
      window.location.reload();
    }
  };

  // 수정 진입 핸들러
  const startEditing = (item: NameRankItem) => {
    setEditingId(item.id);
    setEditingText(item.name);
  };

  // 수정 취소 핸들러
  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  // 수정 저장 핸들러
  const handleSaveEdit = async (id: string, role: 'dad' | 'mom') => {
    if (!editingText.trim()) return;

    setErrorMsg(null);
    // 화면 즉시 반영
    const updater = (prev: NameRankItem[]) =>
      prev.map(item => (item.id === id ? { ...item, name: editingText.trim(), updatedAt: new Date() } : item));

    if (role === 'dad') {
      setDadNames(updater);
    } else {
      setMomNames(updater);
    }

    setEditingId(null);

    try {
      await updateBabyName(id, editingText.trim());
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : '이름 수정에 실패했습니다.');
      window.location.reload();
    }
  };

  // 순서 변경 핸들러 (위/아래 이동)
  const handleMove = async (index: number, direction: 'up' | 'down', role: 'dad' | 'mom') => {
    if (role === 'dad' && !canManageDad) return;
    if (role === 'mom' && !canManageMom) return;

    const list = role === 'dad' ? [...dadNames] : [...momNames];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= list.length) return;

    // 항목 스왑
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // 순위(rank) 재부여
    const updatedList = list.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));

    if (role === 'dad') {
      setDadNames(updatedList);
    } else {
      setMomNames(updatedList);
    }

    startTransition(async () => {
      try {
        const orderedIds = updatedList.map(item => item.id);
        await reorderBabyNames(role, orderedIds);
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : '순위 변경에 실패했습니다.');
        window.location.reload();
      }
    });
  };

  // 활성화된 탭의 이름 데이터 가져오기
  const getActiveThemeNames = () => {
    switch (activeTab) {
      case 'popular':
        return POPULAR_BOY_NAMES;
      case 'sound':
        return THEME_SOUND_NAMES;
      case 'korean':
        return THEME_KOREAN_NAMES;
      case 'virtue':
        return THEME_VIRTUE_NAMES;
      case 'nature':
        return THEME_NATURE_NAMES;
      default:
        return POPULAR_BOY_NAMES;
    }
  };

  return (
    <div className="space-y-10">
      {/* 에러 메시지 배너 */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2열 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* 아빠 랭킹 열 */}
        <div className={`bg-white/80 border rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur-md shadow-xl transition-all duration-300 ${
          canManageDad 
            ? 'border-sky-100 shadow-sky-50/50' 
            : 'border-neutral-200/50 opacity-95 shadow-neutral-100/50'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <span className="text-3xl filter drop-shadow-sm">👨</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-2xl font-bold text-neutral-800">아빠의 선호도 랭킹</h2>
                  {!canManageDad && <Lock className="w-4 h-4 text-neutral-400" />}
                </div>
                <p className="text-sm text-neutral-500 font-medium">아빠(devyyj)가 꼽은 추천 이름들</p>
              </div>
            </div>
            <span className="text-sm font-bold px-3 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-100">
              Total {dadNames.length}
            </span>
          </div>

          {/* 이름 등록 폼 */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={canManageDad ? "아기 이름 후보 입력" : "아빠(devyyj)만 편집 가능합니다"}
              disabled={!canManageDad}
              value={newName.dad}
              onChange={e => setNewName(prev => ({ ...prev, dad: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleAddName('dad')}
              className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70 focus:border-sky-400 focus:bg-white focus:outline-hidden text-base text-neutral-800 placeholder:text-neutral-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            />
            <button
              onClick={() => handleAddName('dad')}
              disabled={!canManageDad}
              className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm shadow-sky-100"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* 리스트 목록 */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {dadNames.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-base font-medium">
                아빠의 후보 이름을 등록해주세요.
              </div>
            ) : (
              dadNames.map((item, index) => {
                const isMatched = matchedNames.has(item.name.trim());
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 border ${
                      isMatched
                        ? 'bg-amber-50/70 border-amber-200/80 shadow-xs shadow-amber-100/30'
                        : 'bg-white border-neutral-100 hover:border-neutral-200/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* 순위 숫자 배지 */}
                      <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold shrink-0 ${
                        index === 0
                          ? 'bg-amber-400 text-amber-950'
                          : index === 1
                          ? 'bg-neutral-200 text-neutral-700'
                          : index === 2
                          ? 'bg-amber-600/20 text-amber-800 border border-amber-600/30'
                          : 'bg-neutral-50 text-neutral-400'
                      }`}>
                        {index + 1}
                      </span>

                      {/* 이름 표시 또는 에디터 */}
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingText}
                            onChange={e => setEditingText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSaveEdit(item.id, 'dad')}
                            className="w-full px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-base text-neutral-800 focus:outline-hidden"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(item.id, 'dad')}
                            className="p-1 rounded-md text-emerald-500 hover:bg-neutral-100"
                          >
                            <Check className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 rounded-md text-neutral-400 hover:bg-neutral-100"
                          >
                            <X className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate">
                            {renderFormattedName(item.name, true, false)}
                          </span>
                          {isMatched && (
                            <span className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-bold shrink-0 animate-pulse">
                              <Sparkles className="w-3 h-3" /> 매칭
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 액션 버튼 그룹 */}
                    {!isEditing && canManageDad && (
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {/* 순위 이동 화살표 */}
                        <button
                          onClick={() => handleMove(index, 'up', 'dad')}
                          disabled={index === 0 || isPending}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down', 'dad')}
                          disabled={index === dadNames.length - 1 || isPending}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        
                        {/* 수정 & 삭제 */}
                        <button
                          onClick={() => startEditing(item)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteName(item.id, 'dad')}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 엄마 랭킹 열 */}
        <div className={`bg-white/80 border rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur-md shadow-xl transition-all duration-300 ${
          canManageMom 
            ? 'border-rose-100 shadow-rose-50/50' 
            : 'border-neutral-200/50 opacity-95 shadow-neutral-100/50'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <span className="text-3xl filter drop-shadow-sm">👩</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-2xl font-bold text-neutral-800">엄마의 선호도 랭킹</h2>
                  {!canManageMom && <Lock className="w-4 h-4 text-neutral-400" />}
                </div>
                <p className="text-sm text-neutral-500 font-medium">엄마(지우츄)가 꼽은 추천 이름들</p>
              </div>
            </div>
            <span className="text-sm font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
              Total {momNames.length}
            </span>
          </div>

          {/* 이름 등록 폼 */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={canManageMom ? "아기 이름 후보 입력" : "엄마(지우츄)만 편집 가능합니다"}
              disabled={!canManageMom}
              value={newName.mom}
              onChange={e => setNewName(prev => ({ ...prev, mom: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleAddName('mom')}
              className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70 focus:border-rose-400 focus:bg-white focus:outline-hidden text-base text-neutral-800 placeholder:text-neutral-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            />
            <button
              onClick={() => handleAddName('mom')}
              disabled={!canManageMom}
              className="p-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm shadow-rose-100"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* 리스트 목록 */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {momNames.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-base font-medium">
                엄마의 후보 이름을 등록해주세요.
              </div>
            ) : (
              momNames.map((item, index) => {
                const isMatched = matchedNames.has(item.name.trim());
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 border ${
                      isMatched
                        ? 'bg-amber-50/70 border-amber-200/80 shadow-xs shadow-amber-100/30'
                        : 'bg-white border-neutral-100 hover:border-neutral-200/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* 순위 숫자 배지 */}
                      <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold shrink-0 ${
                        index === 0
                          ? 'bg-amber-400 text-amber-950'
                          : index === 1
                          ? 'bg-neutral-200 text-neutral-700'
                          : index === 2
                          ? 'bg-amber-600/20 text-amber-800 border border-amber-600/30'
                          : 'bg-neutral-50 text-neutral-400'
                      }`}>
                        {index + 1}
                      </span>

                      {/* 이름 표시 또는 에디터 */}
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingText}
                            onChange={e => setEditingText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSaveEdit(item.id, 'mom')}
                            className="w-full px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-base text-neutral-800 focus:outline-hidden"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(item.id, 'mom')}
                            className="p-1 rounded-md text-emerald-500 hover:bg-neutral-100"
                          >
                            <Check className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 rounded-md text-neutral-400 hover:bg-neutral-100"
                          >
                            <X className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate">
                            {renderFormattedName(item.name, false, false)}
                          </span>
                          {isMatched && (
                            <span className="inline-flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-bold shrink-0 animate-pulse">
                              <Sparkles className="w-3 h-3" /> 매칭
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 액션 버튼 그룹 */}
                    {!isEditing && canManageMom && (
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {/* 순위 이동 화살표 */}
                        <button
                          onClick={() => handleMove(index, 'up', 'mom')}
                          disabled={index === 0 || isPending}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down', 'mom')}
                          disabled={index === momNames.length - 1 || isPending}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        
                        {/* 수정 & 삭제 */}
                        <button
                          onClick={() => startEditing(item)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteName(item.id, 'mom')}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* 통계청 인기 아기 이름 추천 리스트 (4대 기획 테마 + 인기 TOP 50 탭 인터페이스 구성) */}
      <div className="bg-white/60 border border-neutral-100 rounded-3xl p-6 md:p-8 space-y-6 shadow-md backdrop-blur-xs">
        
        {/* 탭 헤더 영역 */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-lg font-bold text-neutral-800">추천 아기 이름 테마별 탐색기</h3>
            <p className="text-sm text-neutral-500 font-medium mt-0.5">원하는 테마의 이름을 클릭하면 본인의 선호도 랭킹에 즉시 추가됩니다.</p>
          </div>
          
          {/* 5대 테마 탭 토글 버튼 (인기 TOP 50 포함) */}
          <div className="flex flex-wrap p-1 bg-neutral-100 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('popular')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'popular'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Trophy className="w-4 h-4 text-indigo-500" />
              <span>📊 인기 TOP 50</span>
            </button>
            <button
              onClick={() => setActiveTab('sound')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'sound'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Radio className="w-4 h-4 text-blue-500" />
              <span>🔊 소리와 울림 (50)</span>
            </button>
            <button
              onClick={() => setActiveTab('korean')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'korean'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Sparkle className="w-4 h-4 text-emerald-500" />
              <span>🌱 순우리말 (50)</span>
            </button>
            <button
              onClick={() => setActiveTab('virtue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'virtue'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-rose-500" />
              <span>🎓 덕목과 소망 (50)</span>
            </button>
            <button
              onClick={() => setActiveTab('nature')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'nature'
                  ? 'bg-white text-sky-600 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Star className="w-4 h-4 text-sky-500" />
              <span>🌊 자연과 계절 (50)</span>
            </button>
          </div>
        </div>

        {/* 탭 콘텐츠 영역 */}
        <div className="min-h-[150px]">
          <div className="flex flex-wrap gap-2 animate-fadeIn">
            {getActiveThemeNames().map((name, index) => {
              const isAddedByDad = dadNames.some(item => item.name.trim() === name);
              const isAddedByMom = momNames.some(item => item.name.trim() === name);
              const isAlreadyAdded = (canManageDad && isAddedByDad) || (canManageMom && isAddedByMom);

              // 테마별 호버 컬러 매핑
              let hoverBorderClass = 'hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600';
              if (activeTab === 'sound') hoverBorderClass = 'hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600';
              if (activeTab === 'korean') hoverBorderClass = 'hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-600';
              if (activeTab === 'virtue') hoverBorderClass = 'hover:border-rose-400 hover:bg-rose-50/50 hover:text-rose-600';
              if (activeTab === 'nature') hoverBorderClass = 'hover:border-sky-400 hover:bg-sky-50/50 hover:text-sky-600';

              return (
                <button
                  key={name}
                  onClick={() => handleRecommendClick(name)}
                  disabled={isAlreadyAdded || !hasAnyEditPermission}
                  className={`text-sm md:text-base font-semibold px-3 py-2 rounded-full border transition-all cursor-pointer select-none ${
                    isAlreadyAdded
                      ? 'bg-neutral-100 border-neutral-200/50 text-neutral-400 cursor-not-allowed'
                      : `bg-white border-neutral-200/60 text-neutral-700 active:scale-95 shadow-xs ${hoverBorderClass}`
                  }`}
                  title={isAlreadyAdded ? '이미 내 랭킹에 존재합니다.' : `내 랭킹에 '${name}' 추가`}
                >
                  <span className="text-xs text-neutral-400 font-mono mr-1.5">{index + 1}</span>
                  {renderFormattedName(name, canManageDad, true)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
