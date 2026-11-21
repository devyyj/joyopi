import Link from 'next/link';
import { localePath, type Lang } from '@/app/_i18n/config';
import { getDictionary } from '@/app/_i18n/dictionary';
import { getApps } from '@/app/apps/_lib/apps';
import SiteNav from './site-nav';
import LanguageSwitcher from './language-switcher';
import BrandLogo from './brand/brand-logo';
import FeedbackButton from './feedback/feedback-dialog';
import { feedbackTargets } from './feedback/targets';
import { getNavItems } from './site-links';

/** 공통 헤더: 로고, 대표 메뉴, 의견 보내기, 언어 전환. 로그인은 없다. */
const MainHeader = ({ lang }: { lang: Lang }) => {
  const t = getDictionary(lang);
  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="relative mx-auto flex h-16 max-w-[1160px] items-center justify-between gap-3 px-4">
        <Link
          href={localePath(lang, '/')}
          aria-label={t.site.homeAria}
          className="flex shrink-0 items-center transition-opacity hover:opacity-80 active:scale-95"
        >
          <BrandLogo className="h-6 w-auto" />
        </Link>

        <div className="flex min-w-0 items-center gap-1.5 md:gap-2">
          <SiteNav items={getNavItems(lang)} labels={t.nav} />
          <FeedbackButton
            lang={lang}
            apps={feedbackTargets(getApps(lang))}
            className="hidden min-h-11 cursor-pointer items-center rounded-full bg-[#1B1B1B] px-4 text-[15px] text-[#F5F2EA] sm:inline-flex dark:bg-[#F5F2EA] dark:text-[#1B1B1B]"
          >
            {t.nav.feedback}
          </FeedbackButton>
          <LanguageSwitcher lang={lang} label={t.nav.language} />
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
