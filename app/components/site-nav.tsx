'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from './site-links';

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/** 헤더의 대표 메뉴. 넓은 화면에서는 가로로 늘어놓고, 좁은 화면에서는 버튼으로 펼친다. */
export default function SiteNav() {
  const pathname = usePathname() ?? '/';
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav aria-label="주 메뉴" className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors hover:text-primary ${active ? 'text-primary' : 'text-foreground'}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
        aria-expanded={isOpen}
        className="md:hidden order-last flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card text-foreground hover:border-primary cursor-pointer"
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {isOpen && (
        <nav
          aria-label="모바일 메뉴"
          className="md:hidden absolute left-0 right-0 top-14 border-b border-border bg-secondary shadow-lg"
        >
          <ul className="max-w-5xl mx-auto px-4 py-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`block py-3 text-sm font-bold border-b border-border last:border-b-0 ${active ? 'text-primary' : 'text-foreground'}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </>
  );
}
