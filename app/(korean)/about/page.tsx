import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import PageHero from '@/app/components/page-hero';
import ExternalLink, { NewWindowIcon } from '@/app/components/external-link';
import FeedbackButton from '@/app/components/feedback/feedback-dialog';
import { feedbackTargets } from '@/app/components/feedback/targets';
import { getApps } from '@/app/apps/_lib/apps';
import { BUSINESS_INFO, CONTACT_EMAIL } from '@/app/apps/_lib/business-info';
import { YOUTUBE_CHANNEL_URL } from '@/utils/youtube/feed';
import { INFLEARN_PROFILE_URL } from '@/utils/inflearn/profile';

export const metadata: Metadata = {
  title: '소개 — 조요피',
  description: '앱을 만들고, 영상과 강의로 나누는 개발자 조요피입니다.',
};

const tile = 'flex flex-col gap-3 rounded-[32px] p-6 text-[#1B1B1B] transition-transform hover:-translate-y-0.5';

export default function AboutPage() {
  const apps = getApps('ko');
  return (
    <div className="mx-auto grid w-full max-w-[1160px] gap-4 px-4 pb-14 pt-2 md:grid-cols-3">
      <div className="col-span-full">
        <PageHero
          prompt="whoami"
          title="소개"
          lead={
            <>
              <p className="font-display text-[28px] leading-snug text-[#F5F2EA] sm:text-[34px]">안녕하세요, 조요피입니다</p>
              <p className="mt-3">
                저는 온라인에서 조요피(joyopi)라는 이름으로 활동하는 현업 백엔드 개발자예요. AI랑 같이 혼자서 앱을 만들고, 일하며 배운 건
                영상과 강의로 나눠요.
              </p>
            </>
          }
        />
      </div>

      <h2 className="col-span-full mx-1.5 mt-3 font-display text-[28px]">하는 일</h2>
      <Link href="/ko/apps" className={`${tile} bg-[#FFE3CF]`}>
        <span className="flex gap-1.5">
          {apps.map((a) => (
            <Image key={a.slug} src={a.icon} alt="" width={44} height={44} className="h-11 w-11 rounded-xl" />
          ))}
        </span>
        <span className="font-display text-[26px]">앱 만들기</span>
        <span className="text-[15px] leading-relaxed">
          직접 만들고 운영하고, 문의에도 직접 답해요. 지금까지 {apps.length}개를 만들었어요.
        </span>
        <span className="mt-auto text-[15px]">앱 보기 →</span>
      </Link>
      <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className={`${tile} bg-[#E8590C]`}>
        <span aria-hidden="true" className="flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-[#1B1B1B]">
          <Play className="h-5 w-5 fill-[#E8590C] text-[#E8590C]" />
        </span>
        <span className="font-display text-[26px]">유튜브</span>
        <span className="text-[15px] leading-relaxed">개발자로 일하며 보고, 겪고, 생각한 것들을 영상으로 나눠요.</span>
        <span className="mt-auto inline-flex items-center gap-1.5 text-[15px]">
          채널 보기 <NewWindowIcon />
          <span className="sr-only">(새 창에서 열려요)</span>
        </span>
      </a>
      <a href={INFLEARN_PROFILE_URL} target="_blank" rel="noopener noreferrer" className={`${tile} bg-[#CFE8DC]`}>
        <span aria-hidden="true" className="flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5h6a3 3 0 0 1 3 3v11a2 2 0 0 0-2-2H4z" />
            <path d="M20 5h-6a3 3 0 0 0-3 3v11a2 2 0 0 1 2-2h7z" />
          </svg>
        </span>
        <span className="font-display text-[26px]">인프런 강의</span>
        <span className="text-[15px] leading-relaxed">현업에서 겪은 백엔드 문제로 강의를 만들어요. 동시성, 분산 트랜잭션 등.</span>
        <span className="mt-auto inline-flex items-center gap-1.5 text-[15px]">
          강의 보기 <NewWindowIcon />
          <span className="sr-only">(새 창에서 열려요)</span>
        </span>
      </a>

      <h2 className="col-span-full mx-1.5 mt-3 font-display text-[28px]">앱을 만들 때 지키는 것</h2>
      {[
        ['꼭 필요한 정보만', '앱에 꼭 필요한 정보만 다뤄요.'],
        ['어디에 두는지 공개', '앱마다 무엇을 어디에 저장하는지 개인정보 처리방침에 적어 공개해요.'],
        ['언제든 스스로 지울 수 있게', '지우는 방법을 함께 안내해요.'],
      ].map(([title, body], i) => (
        <div key={title} className="rounded-[28px] bg-card p-6 text-card-foreground">
          <p aria-hidden="true" className="font-brand text-[15px] font-extrabold text-[#B8440A] dark:text-[#FF8A3D]">
            {String(i + 1).padStart(2, '0')}
          </p>
          <h3 className="mt-2.5 text-lg font-bold">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            {body}
            {i === 2 ? (
              <>
                {' '}
                <Link href="/policies" className="text-[#B8440A] underline underline-offset-2 dark:text-[#FF8A3D]">
                  약관·정책 보기
                </Link>
              </>
            ) : null}
          </p>
        </div>
      ))}

      <section className="col-span-full flex flex-wrap items-center justify-between gap-4 rounded-[32px] bg-[#FFE8A3] p-7 text-[#1B1B1B]">
        <div className="flex-[1_1_420px]">
          <h2 className="font-display text-[26px]">연락하기</h2>
          <p className="mt-2 text-[15px] leading-relaxed">
            앱은 같은 이름의 사업자({BUSINESS_INFO.nameKo}, {BUSINESS_INFO.nameEn})로 내요. 사업자 정보는 페이지 아래에 있어요. 앱 사용 중 문의는{' '}
            <Link href="/support" className="underline underline-offset-2">
              지원
            </Link>
            을 봐 주세요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FeedbackButton lang="ko" apps={feedbackTargets(apps)} className="inline-flex min-h-12 cursor-pointer items-center rounded-full bg-[#1B1B1B] px-6 text-[#F5F2EA]">
            의견 보내기
          </FeedbackButton>
          <ExternalLink href={`mailto:${CONTACT_EMAIL}`} lang="ko" className="min-h-12 px-3 text-[15px] underline-offset-4 hover:underline">
            {CONTACT_EMAIL}
          </ExternalLink>
        </div>
      </section>
    </div>
  );
}
