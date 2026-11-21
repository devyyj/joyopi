import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageHero from '@/app/components/page-hero';
import ExternalLink from '@/app/components/external-link';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';
import { getApps } from '@/app/apps/_lib/apps';
import { appTheme } from '@/app/apps/_lib/app-theme';

export const metadata: Metadata = {
  title: '약관·정책 — 조요피',
  description: '조요피가 만드는 앱의 개인정보 처리방침·이용약관·계정 삭제 안내',
};

const OTHER_LANGS = [
  ['ja', '日本語'],
  ['en', 'English'],
] as const;

export default function PoliciesPage() {
  const apps = getApps('ko');
  return (
    <div className="mx-auto grid w-full max-w-[1160px] gap-4 px-4 pb-14 pt-2 sm:grid-cols-2 lg:grid-cols-4">
      <div className="col-span-full">
        <PageHero
          prompt="cat policies"
          title="약관·정책"
          lead="앱마다 다루는 정보가 달라 개인정보 처리방침을 앱별로 둬요. 모두 한국어·日本語·English로 볼 수 있어요."
        />
      </div>

      {apps.map((app) => {
        const c = appTheme(app.slug);
        const docs = app.links.filter((l) => !l.href.endsWith('/support'));
        const row = app.slug === 'rockgazing' ? 'bg-white/10 hover:bg-white/15' : 'bg-white text-[#1B1B1B] hover:bg-[#FBFAF6]';
        return (
          <section key={app.slug} aria-labelledby={`p-${app.slug}`} className={`flex flex-col gap-3.5 rounded-[28px] p-6 ${c.tile} ${c.text}`}>
            <div className="flex items-center gap-3">
              <Image src={app.icon} alt="" width={52} height={52} className="h-[52px] w-[52px] rounded-[14px]" />
              <h2 id={`p-${app.slug}`} className="font-display text-[23px]">
                {app.name}
              </h2>
            </div>
            <ul className="flex flex-col gap-1.5">
              {docs.map((d) => {
                const path = d.href.replace(/^\/ko/, '');
                return (
                  <li key={d.href} className={`rounded-2xl ${row}`}>
                    <Link href={d.href} className="flex min-h-11 items-center justify-between px-3.5 text-sm">
                      {d.label} <span aria-hidden="true">→</span>
                    </Link>
                    <p className={`flex gap-3 px-3.5 pb-2.5 text-xs ${c.sub}`}>
                      {OTHER_LANGS.map(([lang, label]) => (
                        <Link key={lang} href={`/${lang}${path}`} hrefLang={lang} className="underline underline-offset-2">
                          {label}
                        </Link>
                      ))}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <section className="col-span-full flex flex-wrap gap-6 rounded-[28px] bg-card p-7 text-card-foreground">
        <div className="flex-[1_1_300px]">
          <h2 className="font-display text-2xl">joyopi.com 「의견 보내기」</h2>
          <p className="mt-2 text-[15px] leading-relaxed">이 사이트의 「의견 보내기」로 의견을 보내면 아래 정보를 받아요. 로그인은 필요 없어요.</p>
        </div>
        <dl className="grid flex-[2_1_480px] grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 text-sm leading-relaxed">
          <dt className="text-muted">받는 정보</dt>
          <dd>
            의견 내용, 고른 대상(사이트 또는 앱)과 분류, 답장 받을 이메일(적은 경우), 화면 언어, 브라우저에 저장한 무작위 ID(같은 브라우저의 과도한 전송을 막는 데만 씀)
          </dd>
          <dt className="text-muted">목적</dt>
          <dd>의견 확인과 답장, 사이트·앱 개선</dd>
          <dt className="text-muted">보유 기간</dt>
          <dd>받은 날부터 1년 보관한 뒤 지웁니다.</dd>
          <dt className="text-muted">처리를 맡기는 곳</dt>
          <dd>Vercel Inc.(의견을 받는 서버, 미국), Google Firebase(저장, 서울 리전), Slack Technologies, LLC(운영자에게 새 의견 알림, 미국)</dd>
          <dt className="text-muted">IP 주소</dt>
          <dd>전송 횟수를 세는 데 쓰지만, 원래 값은 남기지 않고 바꾼 값(해시)으로만 셉니다.</dd>
        </dl>
      </section>

      <section className="col-span-full flex flex-wrap items-center justify-between gap-3.5 rounded-[28px] bg-[#FFE8A3] px-7 py-6 text-[#1B1B1B]">
        <p className="text-[15px]">정책에 대한 문의는 메일로 보내 주세요.</p>
        <ExternalLink href={`mailto:${CONTACT_EMAIL}`} lang="ko" className="min-h-12 rounded-full bg-[#1B1B1B] px-6 text-[#F5F2EA]">
          {CONTACT_EMAIL}
        </ExternalLink>
      </section>
    </div>
  );
}
