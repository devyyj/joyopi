'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { PostImage } from '@/app/actions/board';

interface ImageViewerProps {
  images: PostImage[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImageViewer({ images, initialIndex, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // ESC 키로 닫기 및 화살표 키로 이동
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    // 스크롤 방지
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handlePrev, handleNext, onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
        aria-label="닫기"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12"></path>
        </svg>
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            className="absolute left-4 z-10 p-3 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all group"
            aria-label="이전 사진"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-active:-translate-x-1 transition-transform">
              <path d="M15 18l-6-6 6-6"></path>
            </svg>
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 z-10 p-3 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all group"
            aria-label="다음 사진"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-active:translate-x-1 transition-transform">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </button>
        </>
      )}

      {/* Main Image */}
      <div className="relative w-full h-full max-w-5xl max-h-[85vh] p-4 flex items-center justify-center select-none" onClick={(e) => e.stopPropagation()}>
        <div className="relative w-full h-full flex items-center justify-center">
          <Image 
            src={images[currentIndex].url} 
            alt={`사진 ${currentIndex + 1}`}
            fill
            className="object-contain animate-in zoom-in-95 duration-300"
            priority
            sizes="100vw"
          />
        </div>
      </div>

      {/* Info Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
        <p className="text-[11px] font-bold text-white tracking-widest uppercase">
          {currentIndex + 1} <span className="text-white/40">/</span> {images.length}
        </p>
      </div>

      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
