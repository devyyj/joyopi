'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, MessageSquare, Radio, Notebook, Heart, Sparkles, Swords } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const ALLOWED_EMAILS = ['devyyj@gmail.com', 'noticeably34@gmail.com'];

interface ToolItem {
  name: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  hoverColor: string;
  hoverTextColor: string;
  accent?: boolean;
}

const TOOLS: ToolItem[] = [
  {
    name: '연구소 게시판',
    href: '/board',
    description: '연구원들의 자유로운 소통과 공유 공간',
    icon: MessageSquare,
    color: 'text-[#4f46e5]',
    hoverColor: 'hover:bg-indigo-50/60 hover:border-indigo-200/40',
    hoverTextColor: 'group-hover:text-[#4f46e5]'
  },
  {
    name: '메아리 에코',
    href: '/echo',
    description: '음성 및 상태 메시지 실시간 동기화',
    icon: Radio,
    color: 'text-[#06b6d4]',
    hoverColor: 'hover:bg-cyan-50/60 hover:border-cyan-200/40',
    hoverTextColor: 'group-hover:text-[#06b6d4]'
  },
  {
    name: '돼지 일기',
    href: '/meals',
    description: '식단 일지 및 칼로리 통계 분석기',
    icon: Notebook,
    color: 'text-[#10b981]',
    hoverColor: 'hover:bg-emerald-50/60 hover:border-emerald-200/40',
    hoverTextColor: 'group-hover:text-[#10b981]'
  },
  {
    name: '심장을 바쳐라!',
    href: '/shingeki',
    description: '진격의 거인 성향 및 행동강령 테스트',
    icon: Heart,
    color: 'text-[#8B0000]',
    hoverColor: 'hover:bg-red-50/80 hover:border-red-200/50',
    hoverTextColor: 'group-hover:text-[#8B0000]',
    accent: true
  },
  {
    name: '오버워치 카운터 맵',
    href: '/overwatch',
    description: '영웅별 카운터 관계를 한눈에 보는 관계도',
    icon: Swords,
    color: 'text-[#d97706]',
    hoverColor: 'hover:bg-amber-50/60 hover:border-amber-200/40',
    hoverTextColor: 'group-hover:text-[#d97706]'
  },
  {
    name: '이름 랭킹 (Name Rank)',
    href: '/name-rank',
    description: '아기 이름 선호도 랭킹 및 매칭 조율실',
    icon: Sparkles,
    color: 'text-[#db2777]',
    hoverColor: 'hover:bg-pink-50/60 hover:border-pink-200/40',
    hoverTextColor: 'group-hover:text-[#db2777]',
    accent: true
  }
];

export default function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEchoAuthorized, setIsEchoAuthorized] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkEchoAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && ALLOWED_EMAILS.includes(user.email || '')) {
          setIsEchoAuthorized(true);
        }
      } catch (e) {
        console.error('Failed to check echo authorization in navigation menu:', e);
      }
    }
    checkEchoAuth();
  }, [supabase]);

  // 메뉴 바깥 영역 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* 콤팩트한 런처 트리거 버튼 */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 hover:border-[#8B0000]/30 bg-white hover:bg-neutral-50 text-xs sm:text-sm font-bold text-neutral-700 hover:text-neutral-900 transition-all active:scale-[0.98] group cursor-pointer shadow-sm"
        aria-label="연구소 도구 메뉴 열기"
      >
        <LayoutGrid className="w-4 h-4 text-neutral-400 group-hover:text-[#8B0000] transition-colors" />
        <span className="hidden sm:inline">연구소 도구</span>
        <span className="inline sm:hidden">도구</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[10px] text-neutral-400 ml-0.5"
        >
          ▼
        </motion.span>
      </button>

      {/* 애니메이션 팝오버 런처 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2.5 w-[280px] sm:w-[320px] rounded-2xl border border-neutral-200/80 bg-white/95 backdrop-blur-md shadow-2xl p-3 z-50 flex flex-col gap-1.5"
          >
            <div className="px-2 py-1.5 border-b border-neutral-200 mb-1 flex items-center justify-between text-[11px] font-extrabold text-neutral-400 tracking-wider">
              <span>YOPI LAB SERVICES</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>

            <div className="grid grid-cols-1 gap-1">
              {TOOLS.filter(tool => (tool.href !== '/echo' && tool.href !== '/name-rank') || isEchoAuthorized).map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex gap-3 items-start p-2.5 rounded-xl border border-transparent transition-all ${tool.hoverColor} group`}
                >
                  <div className={`p-2 rounded-lg bg-neutral-50 border border-neutral-200 shrink-0 group-hover:scale-105 transition-transform`}>
                    <tool.icon className={`w-4.5 h-4.5 ${tool.color}`} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`text-xs font-bold text-neutral-800 ${tool.hoverTextColor} transition-colors`}>
                      {tool.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 leading-normal mt-0.5 font-medium">
                      {tool.description}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
