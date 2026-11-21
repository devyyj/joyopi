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

      <PageSection heading="joyopi.com 「의견 보내기」">
        <p>이 사이트의 「의견 보내기」로 의견을 보내면 아래 정보를 받습니다. 로그인은 필요 없습니다.</p>
        <ul>
          <li>받는 정보: 의견 내용, 고른 대상(사이트 또는 앱)과 분류, 답장 받을 이메일(적은 경우), 화면 언어, 브라우저에 저장한 무작위 ID(같은 브라우저의 과도한 전송을 막는 데만 씀)</li>
          <li>목적: 의견 확인과 답장, 사이트·앱 개선</li>
          <li>보유 기간: 받은 날부터 1년 보관한 뒤 지웁니다.</li>
          <li>
            처리를 맡기는 곳: Vercel Inc.(의견을 받는 서버, 미국), Google Firebase(저장, 서울 리전), Slack Technologies, LLC(운영자에게 새 의견 알림, 미국)
          </li>
          <li>전송 횟수를 세기 위해 IP 주소를 쓰지만, 원래 값은 남기지 않고 바꾼 값(해시)으로만 셉니다.</li>
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