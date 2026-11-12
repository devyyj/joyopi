'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, MessageSquare, Radio, Smartphone } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { isEchoAllowedEmail } from '@/utils/echo-access';

interface ToolItem {
  name: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TOOLS: ToolItem[] = [
  {
    name: '앱',
    href: '/',
    description: '조요피가 만드는 앱과 지원·개인정보 안내',
    icon: Smartphone,
  },
  {
    name: '게시판',
    href: '/board',
    description: '자유로운 소통과 공유 공간',
    icon: MessageSquare,
  },
  {
    name: '에코',
    href: '/echo',
    description: '발소리 재생 시간을 실시간으로 연장·동기화',
    icon: Radio,
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
        if (isEchoAllowedEmail(user?.email)) {
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
      {/* 런처 버튼: 브랜드 색 변수만 써서 라이트·다크 모드 모두 로고 색(크림·잉크·주황)에 맞춘다 */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-xs sm:text-sm font-bold text-foreground transition-all active:scale-[0.98] group cursor-pointer border-border hover:border-primary ${isOpen ? 'border-primary' : ''}`}
        aria-label="메뉴 열기"
        aria-expanded={isOpen}
      >
        <LayoutGrid className={`w-4 h-4 transition-colors group-hover:text-primary ${isOpen ? 'text-primary' : 'text-muted'}`} />
        <span>메뉴</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[10px] text-muted ml-0.5"
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
            className="absolute left-0 mt-2.5 w-[280px] sm:w-[320px] rounded-2xl border border-border bg-card text-card-foreground shadow-xl p-3 z-50 flex flex-col gap-1.5"
          >
            {/* 로고 `> joyopi_` 처럼 고정폭 글꼴에 > 와 커서 _ 를 주황으로 */}
            <div
              data-testid="menu-header"
              className="px-2 py-1.5 border-b border-border mb-1 font-mono text-[11px] font-extrabold tracking-tight text-muted"
            >
              <span className="text-primary">&gt;</span> menu<span className="text-primary">_</span>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {TOOLS.filter(tool => tool.href !== '/echo' || isEchoAuthorized).map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setIsOpen(false)}
                  className="flex gap-3 items-start p-2.5 rounded-xl border border-transparent transition-all hover:bg-secondary hover:border-border group"
                >
                  <div className="p-2 rounded-lg bg-secondary border border-border shrink-0 group-hover:scale-105 transition-transform">
                    <tool.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {tool.name}
                    </span>
                    <span className="text-[10px] text-muted leading-normal mt-0.5 font-medium">
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
