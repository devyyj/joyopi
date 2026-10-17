import { Metadata } from 'next';
import { COUNTERS, HEROES, OVERWATCH_DATA_VERSION } from '../actions/overwatchData';
import CounterMapClient from './components/counter-map-client';

export const metadata: Metadata = {
  title: '오버워치 카운터 맵 - 조요피 연구소',
  description: '오버워치 영웅 간 카운터 관계를 한눈에 보는 관계도. 영웅을 선택해 누구에게 강하고 약한지 확인하세요.',
  openGraph: {
    title: '오버워치 카운터 맵',
    description: '오버워치 영웅 간 카운터 관계를 한눈에 보는 관계도',
  },
};

export default function OverwatchPage() {
  return <CounterMapClient heroes={HEROES} counters={COUNTERS} version={OVERWATCH_DATA_VERSION} />;
}
