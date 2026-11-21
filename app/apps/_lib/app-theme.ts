// 앱마다의 타일 색. 홈·앱 목록·앱 소개·문서·지원·소식·정책이 모두 같은 색을 쓴다(앱 아이콘과 어울리게 고름).

export interface AppTheme {
  /** 타일 배경 */
  tile: string;
  /** 타일 위 글자 */
  text: string;
  /** 보조 글자(이름 옆 다른 나라 이름·설명) */
  sub: string;
  /** 배지·작은 알약 배경 */
  chip: string;
  /** 주 버튼 */
  button: string;
  /** 테두리 버튼 */
  outline: string;
  /** 소식 등 흰 카드 안에서 쓰는 옅은 앱 색 */
  soft: string;
}

const THEMES: Record<string, AppTheme> = {
  rockgazing: {
    tile: 'bg-[#2C3550]',
    text: 'text-[#F5F2EA]',
    sub: 'text-[#DDD6C8]',
    chip: 'bg-white/15',
    button: 'bg-[#F5F2EA] text-[#1B1B1B]',
    outline: 'border-2 border-white/40 text-[#F5F2EA]',
    soft: 'bg-[#DDE2F0]',
  },
  ssamkejul: {
    tile: 'bg-[#FFE3CF]',
    text: 'text-[#1B1B1B]',
    sub: 'text-[#5E4A3C]',
    chip: 'bg-white',
    button: 'bg-[#1B1B1B] text-[#F5F2EA]',
    outline: 'border-2 border-[#1B1B1B] text-[#1B1B1B]',
    soft: 'bg-[#FFE3CF]',
  },
  agirok: {
    tile: 'bg-[#E3EEF8]',
    text: 'text-[#1B1B1B]',
    sub: 'text-[#44505C]',
    chip: 'bg-white',
    button: 'bg-[#1B1B1B] text-[#F5F2EA]',
    outline: 'border-2 border-[#1B1B1B] text-[#1B1B1B]',
    soft: 'bg-[#E3EEF8]',
  },
  likeloop: {
    tile: 'bg-[#EEE6FA]',
    text: 'text-[#1B1B1B]',
    sub: 'text-[#4E4560]',
    chip: 'bg-white',
    button: 'bg-[#1B1B1B] text-[#F5F2EA]',
    outline: 'border-2 border-[#1B1B1B] text-[#1B1B1B]',
    soft: 'bg-[#EEE6FA]',
  },
};

export const appTheme = (slug: string): AppTheme => THEMES[slug] ?? THEMES.agirok;
