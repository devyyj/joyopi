import { Black_Han_Sans } from 'next/font/google';

// 제목용 디스플레이 글꼴. 한글 글리프는 unicode-range 로 필요할 때 내려받는다.
export const displayFont = Black_Han_Sans({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});
