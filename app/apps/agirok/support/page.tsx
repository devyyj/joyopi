import type { Metadata } from 'next';
import Link from 'next/link';
import DocPage, { type DocLocale } from '../../_components/doc-page';
import { CONTACT_EMAIL } from '../../_lib/business-info';

// 아기록 지원 페이지. 내용 기준: docs/03_앱_스토어_페이지.md 5-2.
const EFFECTIVE_DATE = '2026-11-12';
const UPDATED_DATE = '2026-11-12';

export const metadata: Metadata = {
  title: '아기록 지원',
  description: '아기록 지원 · 자주 묻는 질문과 문의',
};

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const ko: DocLocale = {
  lang: 'ko',
  title: '아기록 지원',
  lead: <p>아기록은 한 손, 한 번 탭으로 끝나는 육아 기록 앱입니다.</p>,
  sections: [
    {
      id: 'contact',
      heading: '문의',
      body: (
        <p>
          궁금한 점이나 문제가 있으면 {mail}로 보내 주세요. 영업일 3일 이내에 답장합니다. 기기 종류와 앱 버전, 문제가 생긴
          화면을 함께 알려 주시면 더 빨리 도울 수 있습니다.
        </p>
      ),
    },
    {
      id: 'faq-device',
      heading: '기기를 바꾸면 기록은 어떻게 되나요?',
      body: <p>새 기기에서 같은 계정(구글 또는 Apple)으로 로그인하면 기록을 그대로 이어 씁니다.</p>,
    },
    {
      id: 'faq-invite',
      heading: '공동양육자는 어떻게 초대하나요?',
      body: (
        <ol>
          <li>설정에서 「초대 코드 만들기」를 눌러 6자리 초대 코드를 만듭니다. 코드는 24시간 동안 쓸 수 있습니다.</li>
          <li>받은 사람은 앱에 로그인한 뒤 「초대 코드를 받았어요」를 누르고 코드를 넣습니다.</li>
        </ol>
      ),
    },
    {
      id: 'faq-remove-ads',
      heading: '광고 제거는 어떻게 적용되나요?',
      body: (
        <ul>
          <li>광고 제거는 한 번만 결제하면 되고, 함께 쓰는 가족 모두 광고 없이 씁니다.</li>
          <li>다른 기기에서는 설정의 「구매 복원」을 누르면 다시 적용됩니다.</li>
        </ul>
      ),
    },
    {
      id: 'faq-refund',
      heading: '환불은 어떻게 받나요?',
      body: (
        <>
          <p>결제와 환불은 스토어가 처리하며, 개발자가 직접 환불해 드릴 수 없습니다.</p>
          <ul>
            <li>
              Apple: <a href="https://reportaproblem.apple.com">reportaproblem.apple.com</a>에서 요청
            </li>
            <li>
              Google Play: <a href="https://play.google.com/store/account/orderhistory">Play 주문 내역</a>에서 요청
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'faq-delete',
      heading: '탈퇴하고 데이터를 지우려면?',
      body: (
        <p>
          앱의 설정 › 「탈퇴하고 데이터 지우기」에서 바로 지울 수 있습니다. 앱을 이미 지웠다면 메일로 요청할 수 있습니다.
          자세한 내용은 <Link href="/apps/agirok/delete-account">계정·데이터 삭제 안내</Link>를 보세요.
        </p>
      ),
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
  showBusinessInfo: true,
};

export default function AgirokSupportPage() {
  return <DocPage locales={[ko]} />;
}
