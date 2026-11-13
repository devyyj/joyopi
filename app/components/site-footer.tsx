import Link from 'next/link';
import BusinessInfo from '@/app/apps/_components/business-info';
import type { Lang } from '@/app/_i18n/config';
import { getDictionary } from '@/app/_i18n/dictionary';
import { getNavItems, getPolicyLinks } from './site-links';
import BrandLogo from './brand/brand-logo';

/** 모든 페이지 아래에 붙는 공통 푸터: 대표 메뉴, 약관·정책, 사업자 정보(그 언어로). */
export default function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer data-site-footer className="border-t border-border bg-secondary">
      <div className="max-w-5xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-[1fr_1fr_2fr]">
        <div>
          <BrandLogo className="h-4 w-auto" />
          <ul className="mt-4 space-y-2 text-xs">
            {getNavItems(lang).map((item) => (
              <li key={item.href}>
                <Link href={item.href} hrefLang={item.hrefLang} className="text-foreground hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold text-foreground">{getDictionary(lang).footer.policies}</h2>
          <ul className="mt-2 space-y-2 text-xs">
            {getPolicyLinks(lang).map((item) => (
              <li key={item.href}>
                <Link href={item.href} hrefLang={item.hrefLang} className="text-foreground hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <BusinessInfo lang={lang} />
      </div>
      <p className="max-w-5xl mx-auto px-4 pb-6 text-[10px] text-muted">&copy; 2026 JOYOPI. All rights reserved.</p>
    </footer>
  );
}
