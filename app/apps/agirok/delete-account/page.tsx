import type { Metadata } from 'next';
import Link from 'next/link';
import DocPage, { type DocLocale } from '../../_components/doc-page';
import { BUSINESS_INFO, CONTACT_EMAIL } from '../../_lib/business-info';

// 아기록 계정·데이터 삭제 안내 — Google Play 데이터 보안 양식의 「계정 삭제 URL」.
// 내용 기준: docs/03_앱_스토어_페이지.md 5-3, apps/agirok/docs/privacy-policy.md 2장.
const EFFECTIVE_DATE = '2026-11-12';
const UPDATED_DATE = '2026-11-12';

export const metadata: Metadata = {
  title: '아기록 계정·데이터 삭제',
  description: '아기록 계정과 데이터를 지우는 방법',
};

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const ko: DocLocale = {
  lang: 'ko',
  title: '아기록 계정·데이터 삭제',
  lead: (
    <p>
      앱 이름: <strong>아기록</strong> · 개발자: <strong>{BUSINESS_INFO.nameKo}({BUSINESS_INFO.nameEn})</strong>
      <br />
      아기록 계정과 그 계정의 데이터를 지우는 방법을 안내합니다.
    </p>
  ),
  sections: [
    {
      id: 'in-app',
      heading: '1. 앱에서 지우기',
      body: (
        <>
          <ol>
            <li>아기록 앱을 열고 설정으로 갑니다.</li>
            <li>맨 아래 「탈퇴하고 데이터 지우기」를 누릅니다.</li>
            <li>확인 창에서 「탈퇴」를 누르면 계정과 데이터가 바로 지워집니다.</li>
          </ol>
          <ul>
            <li>iOS에서 Apple로 로그인했다면 Apple 로그인을 한 번 더 받습니다. 이때 Apple 로그인 연결(토큰)도 함께 취소됩니다.</li>
            <li>「보안을 위해 로그아웃 후 다시 로그인하고 탈퇴해 주세요」라고 나오면 로그아웃했다가 다시 로그인한 뒤 탈퇴합니다.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'by-email',
      heading: '2. 앱 없이 요청하기',
      body: (
        <>
          <p>앱을 이미 지웠거나 앱을 쓸 수 없다면 메일로 요청할 수 있습니다.</p>
          <ol>
            <li>
              아기록 로그인에 쓴 계정의 이메일로 {mail}에 메일을 보냅니다. 제목은 「아기록 계정 삭제 요청」으로 적어 주세요.
            </li>
            <li>본인 계정인지 확인한 뒤 계정과 데이터를 지우고, 끝나면 답장으로 알려 드립니다.</li>
          </ol>
          <p>요청을 받은 날부터 영업일 7일 이내에 처리합니다.</p>
        </>
      ),
    },
    {
      id: 'scope',
      heading: '3. 지워지는 것과 남는 것',
      body: (
        <>
          <table>
            <thead>
              <tr>
                <th>정보</th>
                <th>처리</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>계정(계정 식별자, 이메일, 이름)</td>
                <td>지체 없이 삭제</td>
              </tr>
              <tr>
                <td>혼자 쓰던 아기의 정보와 육아 기록</td>
                <td>지체 없이 모두 삭제. 되돌릴 수 없습니다.</td>
              </tr>
              <tr>
                <td>다른 공동양육자와 함께 쓰던 아기의 기록</td>
                <td>나만 빠지고, 기록은 함께 쓰던 사람들이 계속 볼 수 있도록 남습니다.</td>
              </tr>
              <tr>
                <td>결제 기록(광고 제거)</td>
                <td>Apple·Google이 각자의 방침에 따라 보관합니다. 회사는 카드 정보 등을 갖고 있지 않습니다.</td>
              </tr>
              <tr>
                <td>앱 사용 통계·오류 보고</td>
                <td>Google의 보유 기간에 따라 보관된 뒤 지워집니다.</td>
              </tr>
            </tbody>
          </table>
          <p>
            자세한 내용은 <Link href="/apps/agirok/privacy">아기록 개인정보처리방침</Link>을 보세요.
          </p>
        </>
      ),
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

export default function AgirokDeleteAccountPage() {
  return <DocPage locales={[ko]} />;
}
