import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: '진격의 거인 성격 테스트 - 심장을 바쳐라!',
  description: '혹독한 운명의 세계관 속, 당신의 선택은 어떤 인물의 영혼과 공명할까요? 조사병단 입단 테스트를 통해 당신의 숨겨진 투지와 본능을 확인해보세요.',
  openGraph: {
    title: '진격의 거인 성격 테스트 - 심장을 바쳐라!',
    description: '혹독한 운명의 세계관 속, 당신의 선택은 어떤 인물의 영혼과 공명할까요? 조사병단 입단 테스트를 통해 당신의 숨겨진 투지와 본능을 확인해보세요.',
    images: [
      {
        url: '/images/shingeki/main.png',
        width: 1200,
        height: 630,
        alt: '진격의 거인 성격 테스트 메인 비주얼',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '진격의 거인 성격 테스트 - 심장을 바쳐라!',
    description: '혹독한 운명의 세계관 속, 당신의 선택은 어떤 인물의 영혼과 공명할까요? 조사병단 입단 테스트를 통해 당신의 숨겨진 투지와 본능을 확인해보세요.',
    images: ['/images/shingeki/main.png'],
  },
};

export default function ShingekiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
