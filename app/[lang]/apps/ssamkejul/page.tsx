import type { Metadata } from 'next';
import { getDictionary } from '@/app/_i18n/dictionary';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import AppDetail from '@/app/apps/_components/app-detail';
import { getApp } from '@/app/apps/_lib/apps';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  const app = getApp('ssamkejul', lang);
  return localizedMetadata(lang, '/apps/ssamkejul', {
    title: `${app.name}${getDictionary(lang).apps.metaSuffix}`,
    description: `${app.name}(${app.altNames.join(' / ')}) — ${app.description}`,
  });
}

export default async function SsamkejulPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <AppDetail app={getApp('ssamkejul', lang)} lang={lang} />;
}
