/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button, Modal } from '@/app/components/ui';
import { createMeal, updateMeal, getUniqueMenuNames } from '@/app/actions/meals';
import { Meal, MealImage } from '../types';
import { createClient } from '@/utils/supabase/client';

interface MealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal?: Meal; // 수정 모드일 때 전달받는 식사 레코드
  onSuccess: () => void;
}

const TEMPLATE_TAGS = [
  '#혼밥', '#스트레스', '#행복', '#가족', '#야식', 
  '#배달음식', '#치팅데이', '#소소한행복', '#친구와함께', '#데이트',
  '#가성비', '#럭셔리', '#집밥', '#건강식', '#해장', '#폭식'
];

export default function MealFormModal({ isOpen, onClose, meal, onSuccess }: MealFormModalProps) {
  const [menuName, setMenuName] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [satisfaction, setSatisfaction] = useState(3);
  const [memo, setMemo] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [eatenAt, setEatenAt] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<MealImage[]>([]);
  const [deleteImageUrls, setDeleteImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [recentTags, setRecentTags] = useState<string[]>([]);
  const [uniqueMenuNamesList, setUniqueMenuNamesList] = useState<string[]>([]);

  // 로컬스토리지에서 최근 사용한 커스텀 태그를 불러옴 & DB에서 실제 기록된 메뉴명 리스트 로드
  useEffect(() => {
    if (isOpen) {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('piggy-recent-tags');
        if (saved) {
          try {
            setRecentTags(JSON.parse(saved));
          } catch (e) {
            console.error(e);
          }
        }
      }
      
      // DB에 저장된 실제 사용자 메뉴 목록 로드
      getUniqueMenuNames().then(res => {
        if (res.success && res.data) {
          setUniqueMenuNamesList(res.data);
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (meal) {
        // 수정 모드 초기화
        setMenuName(meal.menuName);
        setMealType(meal.mealType);
        setSatisfaction(meal.satisfaction);
        setMemo(meal.memo || '');
        setTags(meal.tags || []);
        
        // 날짜 변환 (YYYY-MM-DDTHH:MM)
        const d = new Date(meal.eatenAt);
        const offset = d.getTimezoneOffset() * 60000;
        const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
        setEatenAt(localISOTime);

        setExistingImages(meal.images || []);
        setImages([]);
        setPreviewUrls([]);
        setDeleteImageUrls([]);
      } else {
        // 등록 모드 초기화
        setMenuName('');
        setMealType('lunch');
        setSatisfaction(3);
        setMemo('');
        setTags([]);
        setExistingImages([]);
        setImages([]);
        setPreviewUrls([]);
        setDeleteImageUrls([]);
        
        // 현재 로컬 시간으로 일시 초기화
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
        setEatenAt(localISOTime);
      }
      setErrorMsg('');
      setCustomTag('');
    }
  }, [isOpen, meal]);

  // 클라이언트 측 Canvas WebP 이미지 리사이징
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context error'));
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Blob compression error'));
              const compressedFile = new File([blob], `meal_${Date.now()}.webp`, {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/webp',
            0.8
          );
        };
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: File[] = [];
    const newUrls: string[] = [];

    const currentTotalCount = existingImages.length - deleteImageUrls.length + images.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (currentTotalCount + newImages.length >= 3) {
        alert('음식 사진은 최대 3장까지만 등록 가능합니다.');
        break;
      }

      setIsLoading(true);
      try {
        const compressed = await compressImage(file);
        newImages.push(compressed);
        newUrls.push(URL.createObjectURL(compressed));
      } catch (err) {
        console.error('Image compression failed:', err);
      } finally {
        setIsLoading(false);
      }
    }

    setImages((prev) => [...prev, ...newImages]);
    setPreviewUrls((prev) => [...prev, ...newUrls]);
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url: string) => {
    setDeleteImageUrls((prev) => [...prev, url]);
  };

  // 태그 토글
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setTags((prev) => [...prev, tag]);
    }
  };

  // 커스텀 태그 추가
  const addCustomTag = () => {
    if (!customTag.trim()) return;
    let formatted = customTag.trim();
    if (!formatted.startsWith('#')) {
      formatted = '#' + formatted;
    }
    if (!tags.includes(formatted)) {
      setTags((prev) => [...prev, formatted]);
    }
    setCustomTag('');
  };

  // 클라이언트에서 직접 Supabase Storage에 이미지 업로드
  const uploadImagesToStorage = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const extension = file.name.split('.').pop() || 'webp';
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meal-images')
        .upload(fileName, file, { contentType: file.type });

      if (uploadError || !uploadData) {
        console.error('Storage Upload Error:', uploadError);
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('meal-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuName.trim()) {
      setErrorMsg('메뉴명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. 이미지를 클라이언트에서 직접 Supabase Storage에 업로드
      const uploadedUrls = await uploadImagesToStorage(images);

      // 2. URL만 Server Action에 전달
      const formData = new FormData();
      formData.append('menuName', menuName.trim());
      formData.append('mealType', mealType);
      formData.append('satisfaction', satisfaction.toString());
      formData.append('memo', memo.trim());
      formData.append('tags', JSON.stringify(tags));
      formData.append('eatenAt', new Date(eatenAt).toISOString());
      formData.append('imageUrls', JSON.stringify(uploadedUrls));

      // 수정 모드 이미지 삭제 처리
      if (meal && deleteImageUrls.length > 0) {
        formData.append('deleteImageUrls', JSON.stringify(deleteImageUrls));
      }

      let response;
      if (meal) {
        response = await updateMeal(meal.id, formData);
      } else {
        response = await createMeal(formData);
      }

      if (response.success) {
        // 성공 시 사용자가 입력한 커스텀 태그들을 로컬스토리지에 최근 지정 태그로 업데이트 저장 (최대 5개 관리)
        const customTags = tags.filter(t => !TEMPLATE_TAGS.includes(t));
        if (customTags.length > 0) {
          const saved = localStorage.getItem('piggy-recent-tags');
          let currentRecents: string[] = saved ? JSON.parse(saved) : [];
          // 중복 방지하며 앞에 추가
          customTags.forEach(ct => {
            currentRecents = [ct, ...currentRecents.filter(x => x !== ct)];
          });
          // 최대 5개 유지
          localStorage.setItem('piggy-recent-tags', JSON.stringify(currentRecents.slice(0, 5)));
        }

        onSuccess();
        onClose();
      } else {
        setErrorMsg(response.message || '요청 처리에 실패했습니다.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const satisfactionEmojis = ['😭 (최악)', '🥱 (평범)', '😋 (맛있음)', '🥰 (대만족)', '👑 (인생 요리)'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={meal ? '식사 기록 수정' : '오늘의 식사 기록하기'}>
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-md text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* 식사 구분 */}
          <div className="space-y-2 col-span-1">
            <label className="font-bold text-foreground">식사 구분</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="breakfast">🌅 아침</option>
              <option value="lunch">☀️ 점심</option>
              <option value="dinner">🌙 저녁</option>
              <option value="snack">🧁 간식</option>
              <option value="night_snack">🍗 야식</option>
            </select>
          </div>

          {/* 식사 일시 */}
          <div className="space-y-2 col-span-1">
            <label className="font-bold text-foreground">식사 일시</label>
            <input
              type="datetime-local"
              value={eatenAt}
              onChange={(e) => setEatenAt(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
              required
            />
          </div>
        </div>

        {/* 메뉴명 */}
        <div className="space-y-2">
          <label className="font-bold text-foreground flex justify-between">
            <span>메뉴명</span>
            <span className="text-[11px] font-normal text-muted-foreground">{menuName.length}/50</span>
          </label>
          <input
            type="text"
            value={menuName}
            onChange={(e) => setMenuName(e.target.value.slice(0, 50))}
            placeholder="예: 바삭바삭 수제 돈까스"
            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md text-foreground focus:outline-none focus:border-primary transition-colors"
            list="recommended-menus"
            required
          />
          <datalist id="recommended-menus">
            {(() => {
              // 사용자가 타이핑 중인 경우, 과거 고유 메뉴명 전체를 실시간 퍼지 필터링하여 노출 (최대 10개)
              const query = menuName.trim().toLowerCase();
              
              if (uniqueMenuNamesList.length > 0) {
                const filtered = query
                  ? uniqueMenuNamesList.filter(name => name.toLowerCase().includes(query))
                  : uniqueMenuNamesList; // 아무것도 입력하지 않았을 땐 전체 중 앞 10개 추천
                  
                if (filtered.length > 0) {
                  return filtered.slice(0, 10).map((name) => (
                    <option key={name} value={name} />
                  ));
                }
              }
              
              // 매칭되는 유저 기록이 없거나 초기 데이터인 경우 백업 템플릿 노출
              const backupList = [
                '수제 돈까스', '김치찌개', '된장찌개', '제육볶음', 
                '양념치킨', '짜장면', '삼겹살 구이', '떡볶이', 
                '초밥', '소고기 샤브샤브', '라면', '샐러드'
              ];
              const filteredBackup = query 
                ? backupList.filter(b => b.includes(query))
                : backupList;
              
              return filteredBackup.slice(0, 8).map(b => (
                <option key={b} value={b} />
              ));
            })()}
          </datalist>
        </div>

        {/* 만족도 */}
        <div className="space-y-2">
          <label className="font-bold text-foreground">식사 만족도</label>
          <div className="flex items-center gap-1.5 justify-center py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setSatisfaction(star)}
                className="text-3xl transition-transform hover:scale-125 focus:outline-none cursor-pointer p-0.5"
                title={`${star}점`}
              >
                <span className={star <= satisfaction ? 'opacity-100' : 'opacity-20'}>
                  ⭐
                </span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground text-center font-bold mt-1 bg-secondary/30 rounded py-1 px-3 border border-border/20">
            {satisfactionEmojis[satisfaction - 1]}
          </p>
        </div>

        {/* 감정 및 환경 태그 */}
        <div className="space-y-2">
          <label className="font-bold text-foreground">식사 분위기 / 감정 태그</label>
          {/* 템플릿 태그 리스트 */}
          <div className="flex flex-wrap gap-1.5 py-1">
            {TEMPLATE_TAGS.map((t) => {
              const selected = tags.includes(t);
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                    selected
                      ? 'bg-primary/20 border-primary text-primary shadow-sm scale-95'
                      : 'bg-secondary/40 border-border text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* 최근 사용한 커스텀 태그 영역 */}
          {recentTags.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-border/20">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                ⏱️ 최근 지정 태그 (클릭 시 선택)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {recentTags.map((rt) => {
                  const selected = tags.includes(rt);
                  return (
                    <button
                      type="button"
                      key={rt}
                      onClick={() => toggleTag(rt)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all border cursor-pointer ${
                        selected
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-sm scale-95 font-bold'
                          : 'bg-secondary/20 border-border/50 text-muted-foreground hover:bg-secondary/40'
                      }`}
                    >
                      {rt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 커스텀 태그 추가 폼 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomTag();
                }
              }}
              placeholder="예: #야외피크닉"
              className="flex-1 px-3 py-1.5 bg-secondary/50 border border-border rounded-md text-xs focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={addCustomTag}
              className="px-3 py-1.5 bg-secondary hover:bg-border border border-border rounded-md text-xs font-bold text-foreground transition-colors cursor-pointer"
            >
              추가
            </button>
          </div>
          {/* 현재 선택된 커스텀 태그 노출 */}
          {tags.filter((t) => !TEMPLATE_TAGS.includes(t) && !recentTags.includes(t)).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-muted-foreground mr-1 flex items-center font-bold">커스텀:</span>
              {tags
                .filter((t) => !TEMPLATE_TAGS.includes(t) && !recentTags.includes(t))
                .map((t) => (
                  <span
                    key={t}
                    onClick={() => toggleTag(t)}
                    className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold cursor-pointer hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-colors"
                  >
                    {t} <span className="ml-1 opacity-60">×</span>
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* 한 줄 메모 */}
        <div className="space-y-2">
          <label className="font-bold text-foreground flex justify-between">
            <span>한 줄 메모</span>
            <span className="text-[11px] font-normal text-muted-foreground">{memo.length}/100</span>
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value.slice(0, 100))}
            placeholder="식사 분위기나 오늘의 에피소드를 적어주세요 (최대 100자)"
            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-md text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* 음식 사진 첨부 (최대 3장) */}
        <div className="space-y-2">
          <label className="font-bold text-foreground">
            음식 사진 <span className="text-muted-foreground font-normal">(선택, 최대 3장)</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {/* 업로드 버튼 */}
            {(existingImages.length - deleteImageUrls.length + images.length) < 3 && (
              <label className="relative aspect-square border border-dashed border-border rounded-md hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-all">
                <svg className="w-6 h-6 text-muted-foreground mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[10px] text-muted-foreground">사진 추가</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  multiple
                  className="hidden"
                />
              </label>
            )}

            {/* 기존 사진 노출 */}
            {existingImages
              .filter((img) => !deleteImageUrls.includes(img.url))
              .map((img) => (
                <div key={img.id} className="relative aspect-square rounded-md overflow-hidden border border-border group">
                  <Image 
                    src={img.url} 
                    alt="기존 음식" 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 768px) 80px, 80px"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.url)}
                    className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-red-500 transition-opacity"
                  >
                    삭제
                  </button>
                </div>
              ))}

            {/* 신규 등록 사진 노출 */}
            {previewUrls.map((url, idx) => (
              <div key={url} className="relative aspect-square rounded-md overflow-hidden border border-border group">
                <Image 
                  src={url} 
                  alt="신규 음식" 
                  fill 
                  className="object-cover"
                  sizes="(max-width: 768px) 80px, 80px"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-red-500 transition-opacity cursor-pointer"
                >
                  취소
                </button>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            ※ 큰 용량의 원본 사진도 브라우저에서 자동으로 고효율 WebP 형식으로 크기 조정 및 압축되어 가볍게 업로드됩니다.
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-2 border-t border-border pt-4 mt-6">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading} disabled={isLoading}>
            {meal ? '수정 완료' : '식사 기록 저장'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
