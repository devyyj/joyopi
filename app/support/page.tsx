import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell, { PageSection } from '@/app/components/page-shell';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

export const metadata: Metadata = {
  title: '지원 — 조요피',
  description: '조요피의 앱 지원: 자주 묻는 질문과 문의 방법',
};

export default function SupportPage() {
  return (
    <PageShell title="지원" lead="앱별 자주 묻는 질문을 먼저 확인해 주세요. 해결되지 않으면 문의를 남겨 주세요.">
      <PageSection heading="앱별 지원">
        <ul>
          <li>
            <Link href="/apps/rockgazing/support">Rockgazing(돌멍타임) 지원</Link> — 돌 만나기·이름 바꾸기, 재설치, 환불
          </li>
          <li>
            <Link href="/apps/agirok/support">아기록 지원</Link> — 기기 변경, 공동양육자 초대, 광고 제거, 환불
          </li>
          <li>
            <Link href="/apps/agirok/delete-account">아기록 계정·데이터 삭제</Link>
          </li>
        </ul>
      </PageSection>

      <PageSection heading="문의하기">
        <ul>
          <li>
            <Link href="/board">문의 게시판</Link> — 누구나 볼 수 있는 공개 게시판입니다. 다른 분께도 도움이 될 질문에 좋습니다.
          </li>
          <li>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> — 계정이나 결제처럼 개인정보가 들어가는 문의는 메일로 보내
            주세요.
          </li>
        </ul>
        <p>제가 직접 확인하고 영업일 3일 이내에 답합니다. 기기 종류와 앱 버전, 문제가 생긴 화면을 함께 알려 주시면 더 빨리 도울 수 있습니다.</p>
      </PageSection>

      <PageSection heading="결제와 환불">
        <p>
          결제와 환불은 App Store와 Google Play가 처리하며, 개발자가 직접 환불해 드릴 수 없습니다. 요청 방법은 각 앱의 지원
          페이지에 있습니다.
        </p>
      </PageSection>
    </PageShell>
  );
}