import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PageHero from '@/app/components/page-hero';
import ExternalLink from '@/app/components/external-link';
import FeedbackButton from '@/app/components/feedback/feedback-dialog';
import { feedbackTargets } from '@/app/components/feedback/targets';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';
import { getApps } from '@/app/apps/_lib/apps';
import { appTheme } from '@/app/apps/_lib/app-theme';

export const metadata: Metadata = {
  title: '지원 — 조요피',
  description: '조요피의 앱 지원: 자주 묻는 질문과 문의 방법',
};

/** 앱별 지원 카드의 한 줄 요약(지원 페이지의 주요 질문) */
const SUPPORT_TOPICS: Record<string, string> = {
  rockgazing: '다른 돌 만나기·이름 바꾸기, 재설치, 환불',
  ssamkejul: '수강생 초대 링크, 시간 바꾸기, 탈퇴',
  agirok: '기기 변경, 공동양육자 초대, 광고 제거, 환불',
  likeloop: '친구 초대 링크, 답 공개 범위, 탈퇴',
};

export default function SupportPage() {
  const apps = getApps('ko');
  return (
    <div className="mx-auto grid w-full max-w-[1160px] gap-4 px-4 pb-14 pt-2 sm:grid-cols-2 lg:grid-cols-4">
      <div className="col-span-full">
        <PageHero prompt="help" title="지원" lead="앱별 자주 묻는 질문을 먼저 보시고, 해결되지 않으면 편하게 알려 주세요. 제가 직접 읽고 답해요." />
      </div>

      <section className="col-span-full flex flex-wrap items-center justify-between gap-4 rounded-[32px] bg-[#FFE8A3] p-7 text-[#1B1B1B]">
        <div className="flex-[1_1_420px]">
          <h2 className="font-display text-[28px]">바로 물어보기</h2>
          <p className="mt-2 text-[15px] leading-relaxed">
            「의견 보내기」는 로그인 없이 바로 보내져요. 답장이 필요하면 이메일만 남겨 주세요. 영업일 3일 이내에 답해요.
          </p>
          <p className="mt-1.5 text-sm text-[#5E4A1C]">기기 종류, 앱 버전, 문제가 생긴 화면을 함께 알려 주시면 더 빨리 도울 수 있어요.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FeedbackButton lang="ko" apps={feedbackTargets(apps)} className="inline-flex min-h-[52px] cursor-pointer items-center rounded-full bg-[#1B1B1B] px-6 text-base text-[#F5F2EA]">
            의견 보내기
          </FeedbackButton>
          <ExternalLink href={`mailto:${CONTACT_EMAIL}`} lang="ko" className="min-h-[52px] px-3 text-[15px] underline-offset-4 hover:underline">
            {CONTACT_EMAIL}
          </ExternalLink>
        </div>
        <p className="basis-full text-sm text-[#5E4A1C]">이 사이트에는 회원가입·로그인과 게시판이 없어요.</p>
      </section>

      <h2 className="col-span-full mx-1.5 mt-3 font-display text-[28px]">앱별 지원</h2>
      {apps.map((app) => {
        const c = appTheme(app.slug);
        const support = app.links.find((l) => l.href.endsWith('/support'));
        const remove = app.links.find((l) => l.href.endsWith('/delete-account'));
        return (
          <article key={app.slug} className={`flex flex-col gap-3 rounded-[28px] p-6 ${c.tile} ${c.text}`}>
            <div className="flex items-center gap-3">
              <Image src={app.icon} alt="" width={56} height={56} className="h-14 w-14 rounded-2xl" />
              <h3 className="font-display text-2xl">{app.name}</h3>
            </div>
            <p className={`text-sm leading-relaxed ${c.sub}`}>{SUPPORT_TOPICS[app.slug]}</p>
            <div className="mt-auto flex flex-wrap gap-1.5">
              {support ? (
                <Link href={support.href} className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm ${c.button}`}>
                  {app.name} 지원 보기
                </Link>
              ) : null}
              {remove ? (
                <Link href={remove.href} className={`inline-flex min-h-11 items-center rounded-full px-3.5 text-sm ${app.slug === 'rockgazing' ? 'bg-white/15' : 'bg-white'}`}>
                  계정 삭제
                </Link>
              ) : null}
            </div>
          </article>
        );
      })}

      <section className="col-span-full flex flex-wrap items-start gap-5 rounded-[28px] bg-card p-6 text-card-foreground">
        <span aria-hidden="true" className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] bg-[#CFE8DC] text-[#1B1B1B]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="6" width="18" height="13" rx="3" />
            <path d="M3 10h18M7 15h4" />
          </svg>
        </span>
        <div className="flex-[1_1_400px]">
          <h2 className="font-display text-2xl">결제와 환불</h2>
          <p className="mt-2 text-[15px] leading-relaxed">
            결제와 환불은 App Store와 Google Play가 처리해서, 제가 직접 환불해 드릴 수는 없어요. 요청 방법은 각 앱의 지원 페이지에 있어요.
          </p>
        </div>
      </section>
    </div>
  );
}
