/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button, Modal } from '@/app/components/ui/core';
import { createMeal, updateMeal } from '@/app/actions/meals';
import { Meal, MealImage } from '../types';

interface MealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal?: Meal; // 수정 모드일 때 전달받는 식사 레코드
  onSuccess: () => void;
}

const TEMPLATE_TAGS = ['#혼밥', '#스트레스', '#행복', '#가족', '#야식', '#배달음식', '#치팅데이', '#소소한행복'];

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

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuName.trim()) {
      setErrorMsg('메뉴명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('menuName', menuName.trim());
    formData.append('mealType', mealType);
    formData.append('satisfaction', satisfaction.toString());
    formData.append('memo', memo.trim());
    formData.append('tags', JSON.stringify(tags));
    formData.append('eatenAt', new Date(eatenAt).toISOString());

    // 이미지 추가
    images.forEach((img) => {
      formData.append('images', img);
    });

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

    setIsLoading(false);

    if (response.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(response.message || '요청 처리에 실패했습니다.');
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
            required
          />
        </div>

        {/* 만족도 */}
        <div className="space-y-2">
          <label className="font-bold text-foreground">식사 만족도: {satisfaction}단계</label>
          <input
            type="range"
            min="1"
            max="5"
            value={satisfaction}
            onChange={(e) => setSatisfaction(parseInt(e.target.value))}
            className="w-full accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-[11px] text-muted-foreground text-center font-medium mt-1">
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
          {tags.filter((t) => !TEMPLATE_TAGS.includes(t)).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-muted-foreground mr-1 flex items-center font-bold">커스텀:</span>
              {tags
                .filter((t) => !TEMPLATE_TAGS.includes(t))
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
