/* eslint-disable @next/next/no-img-element -- 벡터 SVG 로고는 최적화가 필요 없어 img로 직접 사용 */

// joyopi 워드마크 `> joyopi_` — 밝은/어두운 화면에 맞는 파일을 CSS로 전환한다.
const BrandLogo = ({ className = 'h-5 w-auto' }: { className?: string }) => (
  <>
    <img src="/joyopi-wordmark.svg" alt="joyopi" className={`${className} block dark:hidden`} />
    <img src="/joyopi-wordmark-dark.svg" alt="joyopi" className={`${className} hidden dark:block`} />
  </>
);

export default BrandLogo;
