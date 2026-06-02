import { Metadata } from 'next';
import ShingekiClient from './shingeki-client';
import { CHARACTERS } from '../actions/shingekiData';

type Props = {
  searchParams: Promise<{ c?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const charName = resolvedSearchParams.c;
  
  if (charName) {
    const decodedName = decodeURIComponent(charName);
    const character = CHARACTERS[decodedName];
    
    if (character) {
      return {
        title: `${character.name} - 진격의 거인 성격 테스트`,
        description: `${character.title}: ${character.description}`,
        openGraph: {
          title: `${character.name} - 진격의 거인 성격 테스트`,
          description: `${character.title}: ${character.description}`,
          images: [
            {
              url: character.imageUrl,
              width: 800,
              height: 1067,
              alt: character.name,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${character.name} - 진격의 거인 성격 테스트`,
          description: `${character.title}: ${character.description}`,
          images: [character.imageUrl],
        },
      };
    }
  }

  // 기본값 (이미 layout.tsx에 설정되어 있지만, 페이지 레벨에서 명시적으로 제어 가능)
  return {
    title: '진격의 거인 성격 테스트 - 심장을 바쳐라!',
    description: '혹독한 운명의 세계관 속, 당신의 선택은 어떤 인물의 영혼과 공명할까요?',
  };
}

export default function ShingekiPage() {
  return <ShingekiClient />;
}
