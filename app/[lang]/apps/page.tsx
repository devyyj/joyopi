import type { Metadata } from 'next';
import { getDictionary } from '@/app/_i18n/dictionary';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import PageShell from '@/app/components/page-shell';
import AppCard from '@/app/apps/_components/app-card';
import { getApps } from '@/app/apps/_lib/apps';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  const t = getDictionary(lang).apps;
  return localizedMetadata(lang, '/apps', { title: t.metaTitle, description: t.metaDescription });
}

export default async function AppsIndex({ params }: LangParams) {
  const lang = await resolveLang(params);
  const t = getDictionary(lang).apps;
  return (
    <PageShell title={t.title} lead={t.lead}>
      <div className="grid gap-4 md:grid-cols-2">
        {getApps(lang).map((app) => (
          <AppCard key={app.slug} app={app} lang={lang} />
        ))}
      </div>
    </PageShell>
  );
}
