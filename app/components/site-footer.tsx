import Link from 'next/link';
import BusinessInfo from '@/app/apps/_components/business-info';
import { NAV_ITEMS, POLICY_LINKS } from './site-links';
import BrandLogo from './brand/brand-logo';

/** 모든 페이지 아래에 붙는 공통 푸터: 대표 메뉴, 약관·정책, 사업자 정보. */
export default function SiteFooter() {
  return (
    <footer data-site-footer className="border-t border-border bg-secondary">
      <div className="max-w-5xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-[1fr_1fr_2fr]">
        <div>
          <BrandLogo className="h-4 w-auto" />
          <ul className="mt-4 space-y-2 text-xs">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-foreground hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold text-foreground">약관·정책</h2>
          <ul className="mt-2 space-y-2 text-xs">
            {POLICY_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-foreground hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <BusinessInfo />
      </div>
      <p className="max-w-5xl mx-auto px-4 pb-6 text-[10px] text-muted">&copy; 2026 JOYOPI. All rights reserved.</p>
    </footer>
  );
}
