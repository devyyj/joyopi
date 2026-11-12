import type { Metadata } from 'next';
import AppDetail from '../_components/app-detail';
import { getApp } from '../_lib/apps';

export const metadata: Metadata = {
  title: 'Rockgazing — 조요피',
  description: 'Rockgazing(돌멍타임 / 石の子守り) — 배경과 날씨가 바뀌는 곳에 돌 하나를 두고 바라보는 앱',
};

export default function RockgazingPage() {
  return <AppDetail app={getApp('rockgazing')} />;
}
