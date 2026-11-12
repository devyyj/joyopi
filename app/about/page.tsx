import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell, { PageSection } from '@/app/components/page-shell';
import { APPS } from '@/app/apps/_lib/apps';
import { BUSINESS_INFO, CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

export const metadata: Metadata = {
  title: '소개 — 조요피',
  description: '모바일 앱을 만드는 조요피입니다.',
};

export default function AboutPage() {
  return (
    <PageShell
      title="소개"
      lead="안녕하세요, 조요피입니다. 온라인에서 조요피(joyopi)라는 이름으로 활동하며 모바일 앱을 만듭니다."
    >
      <PageSection heading="하는 일">
        <p>
          저는 앱을 직접 만들고 운영하며, 문의에도 직접 답합니다. 지금은 두 개의 앱을 준비하고 있습니다.
        </p>
        <ul>
          {APPS.map((app) => (
            <li key={app.slug}>
              <Link href={app.href}>{app.name}</Link> — {app.description}
            </li>
          ))}
        </ul>
        <p>
          <Link href="/apps">앱 모두 보기</Link>
        </p>
      </PageSection>

      <PageSection heading="제가 지키는 원칙">
        <ul>
          <li>앱에 꼭 필요한 정보만 다룹니다.</li>
          <li>앱마다 무엇을 어디에 저장하는지 개인정보 처리방침에 적어 공개합니다.</li>
          <li>언제든 스스로 지울 수 있는 방법을 함께 안내합니다.</li>
        </ul>
        <p>
          <Link href="/policies">약관·정책 보기</Link>
        </p>
      </PageSection>

      <PageSection heading="연락처">
        <p>
          앱은 같은 이름의 사업자({BUSINESS_INFO.nameKo}, {BUSINESS_INFO.nameEn})로 냅니다. 사업자 정보는 페이지 아래에 있습니다.
        </p>
        <p>
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <p>
          앱 사용 중 문의는 <Link href="/support">지원</Link> 페이지를 봐 주세요.
        </p>
      </PageSection>
    </PageShell>
  );
}