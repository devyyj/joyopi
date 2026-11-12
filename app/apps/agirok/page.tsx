import type { Metadata } from 'next';
import AppDetail from '../_components/app-detail';
import { getApp } from '../_lib/apps';

export const metadata: Metadata = {
  title: '아기록 — 조요피',
  description: '아기록 — 한 손, 한 번 탭으로 끝나는 육아 기록',
};

export default function AgirokPage() {
  return <AppDetail app={getApp('agirok')} />;
}
