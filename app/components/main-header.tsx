import Link from 'next/link';
import { localePath, type Lang } from '@/app/_i18n/config';
import { getDictionary } from '@/app/_i18n/dictionary';
import SiteNav from './site-nav';
import LanguageSwitcher from './language-switcher';
import BrandLogo from './brand/brand-logo';
import { getNavItems } from './site-links';

/** 공통 헤더: 로고, 언어 전환, 대표 메뉴. 로그인은 없다. */
const MainHeader = ({ lang }: { lang: Lang }) => {
  const t = getDictionary(lang);
  return (
    <header className="sticky top-0 z-50 w-full bg-secondary border-b border-border">
      <div className="relative max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-6 shrink-0">
          <Link href={localePath(lang, '/')} aria-label={t.site.homeAria} className="flex items-center transition-opacity hover:opacity-80 active:scale-95">
            <BrandLogo className="h-5 w-auto" />
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <SiteNav items={getNavItems(lang)} labels={t.nav} />
          <LanguageSwitcher lang={lang} label={t.nav.language} />
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
