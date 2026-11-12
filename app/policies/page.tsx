import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell, { PageSection } from '@/app/components/page-shell';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

export const metadata: Metadata = {
  title: '약관·정책 — 조요피',
  description: '조요피(JOYOPI) 앱의 개인정보 처리방침과 계정 삭제 안내',
};

export default function PoliciesPage() {
  return (
    <PageShell title="약관·정책" lead="앱마다 다루는 정보가 달라 개인정보 처리방침을 앱별로 둡니다.">
      <PageSection heading="Rockgazing (돌멍타임 / 石の子守り)">
        <ul>
          <li>
            <Link href="/apps/rockgazing/privacy">개인정보 처리방침</Link> (한국어 · English · 日本語)
          </li>
        </ul>
      </PageSection>

      <PageSection heading="아기록">
        <ul>
          <li>
            <Link href="/apps/agirok/privacy">개인정보처리방침</Link>
          </li>
          <li>
            <Link href="/apps/agirok/delete-account">계정·데이터 삭제 안내</Link>
          </li>
        </ul>
      </PageSection>

      <PageSection heading="문의">
        <p>
          정책에 대한 문의는 <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>로 보내 주세요.
        </p>
      </PageSection>
    </PageShell>
  );
}