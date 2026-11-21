'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import type { SiteLink } from './site-links';

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/** 헤더의 대표 메뉴. 넓은 화면에서는 가로로 늘어놓고, 좁은 화면에서는 버튼으로 펼친다. */
interface SiteNavProps {
  items: SiteLink[];
  labels: { mainMenu: string; mobileMenu: string; openMenu: string; closeMenu: string };
}

export default function SiteNav({ items, labels }: SiteNavProps) {
  const pathname = usePathname() ?? '/';
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav aria-label={labels.mainMenu} className="hidden lg:flex items-center gap-1.5">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              hrefLang={item.hrefLang}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center rounded-full px-4 text-[15px] transition-colors ${active ? 'bg-foreground text-background' : 'bg-card text-foreground hover:bg-secondary'}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? labels.closeMenu : labels.openMenu}
        aria-expanded={isOpen}
        className="lg:hidden order-last flex items-center justify-center w-11 h-11 rounded-full bg-card text-foreground hover:bg-secondary cursor-pointer"
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {isOpen && (
        <nav
          aria-label={labels.mobileMenu}
          className="lg:hidden absolute left-0 right-0 top-16 border-b border-border bg-background shadow-lg"
        >
          <ul className="max-w-5xl mx-auto px-4 py-2">
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    hrefLang={item.hrefLang}
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
