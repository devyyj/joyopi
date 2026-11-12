import type { Metadata } from 'next';
import PageShell from '@/app/components/page-shell';
import AppCard from './_components/app-card';
import { APPS } from './_lib/apps';

export const metadata: Metadata = {
  title: '앱 — 조요피',
  description: '조요피가 만드는 앱: Rockgazing(돌멍타임), 아기록',
};

export default function AppsIndex() {
  return (
    <PageShell title="앱" lead="제가 만들고 운영하는 모바일 앱입니다.">
      <div className="grid gap-4 md:grid-cols-2">
        {APPS.map((app) => (
          <AppCard key={app.slug} app={app} />
        ))}
      </div>
    </PageShell>
  );
}