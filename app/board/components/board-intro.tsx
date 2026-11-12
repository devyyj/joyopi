import Link from 'next/link';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

/** 문의 게시판 머리말: 공개 게시판임을 알리고, 개인정보가 들어가는 문의는 메일로 안내한다. */
export default function BoardIntro() {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-extrabold tracking-tight">문의 게시판</h1>
      <p className="mt-2 text-sm text-muted leading-relaxed">
        앱을 쓰다가 궁금한 점이나 문제를 남겨 주세요. 제가 댓글로 답합니다. 글을 쓰려면 로그인이 필요합니다.
      </p>
      <ul className="mt-4 space-y-1.5 rounded-xl border border-border bg-card p-4 text-xs leading-relaxed">
        <li>
          이 게시판은 <strong>누구나 볼 수 있습니다.</strong> 이메일, 전화번호, 결제 내역 같은 개인정보는 적지 마세요.
        </li>
        <li>
          개인정보가 들어가는 문의는{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-2">
            {CONTACT_EMAIL}
          </a>
          로 보내 주세요.
        </li>
        <li>
          자주 묻는 질문은{' '}
          <Link href="/support" className="text-primary underline underline-offset-2">
            지원
          </Link>{' '}
          페이지에 있습니다.
        </li>
      </ul>
    </header>
  );
}