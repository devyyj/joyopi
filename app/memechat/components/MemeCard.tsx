'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemeInfo } from '../utils/memeMapper';
import Image from 'next/image';

interface MemeCardProps {
  meme: MemeInfo | null;
  transcript: string;
  isFinal: boolean;
  isListening: boolean;
}

export default function MemeCard({ meme, transcript, isFinal, isListening }: MemeCardProps) {
  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto aspect-square rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
      {/* 밈 이미지 영역 (Framer Motion으로 페이드 & 스케일 트랜지션) */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-950">
        <AnimatePresence mode="wait">
          {meme ? (
            <motion.div
              key={meme.actionId}
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.1, rotate: 2 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="relative w-full h-full"
            >
              <Image
                src={meme.imagePath}
                alt={meme.title}
                fill
                priority
                sizes="(max-w-md) 100vw, 450px"
                className="object-contain p-4"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="text-slate-400 text-center px-6"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center animate-pulse">
                📷
              </div>
              <p className="font-semibold text-lg">카메라 앞에 서주세요</p>
              <p className="text-sm text-slate-500 mt-1">미소 짓거나 엄지를 들면 밈이 매핑됩니다.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 실시간 말풍선 자막 오버레이 (Framer Motion) */}
      <div className="absolute bottom-6 left-4 right-4 z-10 flex flex-col items-center">
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className={`px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md max-w-full text-center break-words ${
                isFinal
                  ? 'bg-indigo-600/90 text-white border border-indigo-400/30'
                  : 'bg-slate-800/80 text-indigo-200 border border-slate-700/50'
              }`}
            >
              <p className="text-sm font-semibold tracking-wide md:text-base">
                {transcript}
              </p>
              {/* 말풍선 꼬리 */}
              <div
                className={`w-3 h-3 absolute -bottom-1.5 left-1/2 -translate-x-1/2 rotate-45 ${
                  isFinal ? 'bg-indigo-600/90' : 'bg-slate-800/80'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 현재 마이크 동작 중 펄스 인디케이터 */}
        {isListening && !transcript && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            음성 인식 대기 중... 말해보세요
          </motion.div>
        )}
      </div>
    </div>
  );
}
