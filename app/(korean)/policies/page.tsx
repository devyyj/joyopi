import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell, { PageSection } from '@/app/components/page-shell';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

export const metadata: Metadata = {
  title: '약관·정책 — 조요피',
  description: '조요피가 만드는 앱의 개인정보 처리방침과 계정 삭제 안내',
};

export default function PoliciesPage() {
  return (
    <PageShell title="약관·정책" lead="앱마다 다루는 정보가 달라 개인정보 처리방침을 앱별로 둡니다.">
      <PageSection heading="돌멍타임 (Rockgazing / 石の子守り)">
        <ul>
          <li>
            <Link href="/ko/apps/rockgazing/privacy">개인정보 처리방침</Link> (<Link href="/en/apps/rockgazing/privacy" hrefLang="en">English</Link> ·{' '}
            <Link href="/ja/apps/rockgazing/privacy" hrefLang="ja">日本語</Link>)
          </li>
        </ul>
      </PageSection>

      <PageSection heading="아기록 (ベビろく / Agirok)">
        <ul>
          <li>
            <Link href="/ko/apps/agirok/privacy">개인정보처리방침</Link> (<Link href="/en/apps/agirok/privacy" hrefLang="en">English</Link> ·{' '}
            <Link href="/ja/apps/agirok/privacy" hrefLang="ja">日本語</Link>)
          </li>
          <li>
            <Link href="/ko/apps/agirok/delete-account">계정·데이터 삭제 안내</Link>
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