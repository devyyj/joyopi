'use client';

import { createPost, updatePost, ActionResult } from '@/app/actions/board';
import { Button, Card } from '@/app/components/ui/core';
import SafeImage from './safe-image';
import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PostImage {
  id: number;
  url: string;
}

interface PostFormProps {
  initialData?: {
    id: number;
    title: string;
    content: string;
    images?: PostImage[];
  };
}

const MAX_TITLE = 50;
const MAX_CONTENT = 5000;
const MAX_IMAGES = 10;
const IMAGE_RESIZE_WIDTH = 1200;

export default function PostForm({ initialData }: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  
  // 이미지 상태 관리
  const [existingImages] = useState<PostImage[]>(initialData?.images || []);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<{ id: string; url: string; blob: Blob }[]>([]);

  const [state, action, isPending] = useActionState(async (_prevState: ActionResult | null, formData: FormData) => {
    // 1. 삭제할 이미지 ID들 추가
    removedImageIds.forEach(id => formData.append('removedImageIds', id.toString()));

    // 2. 새 이미지 Blob들 추가
    newImagePreviews.forEach(item => {
      formData.append('images', item.blob, `image-${item.id}.webp`);
    });

    if (initialData) {
      return await updatePost(initialData.id, formData);
    } else {
      return await createPost(formData);
    }
  }, { success: false });

  // 성공 시 목록으로 이동
  useEffect(() => {
    if (state.success) {
      router.push('/board');
      router.refresh();
    }
  }, [state.success, router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const currentTotal = existingImages.length - removedImageIds.length + newImagePreviews.length;
    if (currentTotal + files.length > MAX_IMAGES) {
      alert(`사진은 최대 ${MAX_IMAGES}장까지 업로드 가능합니다.`);
      return;
    }

    const processFile = (file: File): Promise<{ id: string; url: string; blob: Blob }> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > IMAGE_RESIZE_WIDTH) {
                height *= IMAGE_RESIZE_WIDTH / width;
                width = IMAGE_RESIZE_WIDTH;
              }
            } else {
              if (height > IMAGE_RESIZE_WIDTH) {
                width *= IMAGE_RESIZE_WIDTH / height;
                height = IMAGE_RESIZE_WIDTH;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
              if (blob) {
                resolve({
                  id: crypto.randomUUID(),
                  url: URL.createObjectURL(blob),
                  blob
                });
              }
            }, 'image/webp', 0.8);
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    };

    const newProcessedImages = await Promise.all(files.map(processFile));
    setNewImagePreviews(prev => [...prev, ...newProcessedImages]);
    
    // input 비우기 (같은 파일 다시 선택 가능하도록)
    e.target.value = '';
  };

  const removeExistingImage = (id: number) => {
    setRemovedImageIds(prev => [...prev, id]);
  };

  const removeNewImage = (id: string) => {
    setNewImagePreviews(prev => {
      const target = prev.find(item => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter(item => item.id !== id);
    });
  };

  return (
    <form action={action}>
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label htmlFor="title" className="text-sm font-medium">제목</label>
            <span className={`text-[10px] ${title.length > MAX_TITLE ? 'text-red-500 font-bold' : 'text-muted'}`}>
              {title.length} / {MAX_TITLE}
            </span>
          </div>
          <input 
            type="text" 
            name="title" 
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_TITLE}
            required 
            className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* 사진 첨부 섹션 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">사진 첨부</label>
            <span className="text-[10px] text-muted">
              {existingImages.length - removedImageIds.length + newImagePreviews.length} / {MAX_IMAGES}
            </span>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {/* 기존 이미지 */}
            {existingImages.filter(img => !removedImageIds.includes(img.id)).map((img) => (
              <div key={img.id} className="relative aspect-square rounded-md overflow-hidden border border-border group">
                <SafeImage src={img.url} alt="기존 사진" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removeExistingImage(img.id)}
                  className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))}
            
            {/* 새 이미지 */}
            {newImagePreviews.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-md overflow-hidden border border-primary/30 group">
                <SafeImage src={img.url} alt="새 사진" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removeNewImage(img.id)}
                  className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                  </svg>
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[8px] text-white text-center py-0.5">NEW</div>
              </div>
            ))}

            {/* 추가 버튼 */}
            {(existingImages.length - removedImageIds.length + newImagePreviews.length) < MAX_IMAGES && (
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-border rounded-md hover:bg-secondary cursor-pointer transition-colors">
                <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[10px] text-muted mt-1 font-medium">사진 추가</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label htmlFor="content" className="text-sm font-medium">내용</label>
            <span className={`text-[10px] ${content.length > MAX_CONTENT ? 'text-red-500 font-bold' : 'text-muted'}`}>
              {content.length} / {MAX_CONTENT}
            </span>
          </div>
          <textarea 
            name="content" 
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CONTENT}
            required 
            rows={15}
            className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" 
            placeholder="내용을 입력하세요"
          />
        </div>
        
        {state.message && <p className="text-xs text-red-500">{state.message}</p>}

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Link href="/board" className="text-sm text-muted hover:text-foreground">취소</Link>
          <Button 
            type="submit" 
            isLoading={isPending}
            disabled={title.length > MAX_TITLE || content.length > MAX_CONTENT}
          >
            {initialData ? '수정 완료' : '게시하기'}
          </Button>
        </div>
      </Card>
    </form>
  );
}
