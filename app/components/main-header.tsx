import Link from 'next/link';
import SiteNav from './site-nav';
import BrandLogo from './brand/brand-logo';

/** 공통 헤더: 로고와 대표 메뉴. 로그인은 없다. */
const MainHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-secondary border-b border-border">
      <div className="relative max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <Link href="/" aria-label="조요피 홈" className="flex items-center transition-opacity hover:opacity-80 active:scale-95">
            <BrandLogo className="h-5 w-auto" />
          </Link>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <SiteNav />
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
