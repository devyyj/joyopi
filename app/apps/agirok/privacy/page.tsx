import type { Metadata } from 'next';
import Link from 'next/link';
import DocPage, { type DocLocale } from '../../_components/doc-page';
import { BUSINESS_INFO, CONTACT_EMAIL } from '../../_lib/business-info';

// 아기록 개인정보처리방침.
// 원고 기준: apps/agirok/docs/privacy-policy.md — 내용을 여기서 먼저 고치지 않는다.
// 원고가 바뀌면 그대로 다시 옮기고 날짜를 고친다. (docs/03_앱_스토어_페이지.md 5-1)
const EFFECTIVE_DATE = '2026-11-12';
const UPDATED_DATE = '2026-11-12';

export const metadata: Metadata = {
  title: '아기록 개인정보처리방침',
  description: '아기록 개인정보처리방침',
};

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const ko: DocLocale = {
  lang: 'ko',
  title: '아기록 개인정보처리방침',
  lead: (
    <p>
      아기록(이하 ‘앱’)은 {BUSINESS_INFO.nameKo}({BUSINESS_INFO.nameEn}, 이하 ‘회사’)가 만든 육아 기록 앱입니다. 회사는 육아
      기록을 돕기 위해 꼭 필요한 정보만 처리합니다.
    </p>
  ),
  notice: (
    <p>
      아기 육아 기록은 광고에 쓰지 않으며 광고 회사에 넘기지 않습니다. 앱은 보호자가 쓰는 앱이며, 아기에 대한 정보는 아동의
      건강과 관련된 정보로 보아 신중하게 다룹니다.
    </p>
  ),
  sections: [
    {
      id: 'items',
      heading: '1. 처리하는 정보와 목적',
      body: (
        <>
          <table>
            <thead>
              <tr>
                <th>구분</th>
                <th>항목</th>
                <th>목적</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>계정</td>
                <td>구글 또는 Apple 계정 식별자, 이메일(Apple의 이메일 가리기를 쓰면 대체 주소), 이름</td>
                <td>로그인, 기기 변경 시 기록 복구</td>
              </tr>
              <tr>
                <td>아기 정보</td>
                <td>이름(태명), 태어난 날, 밤잠 시간대</td>
                <td>생후 일수 표시, 낮잠·밤잠 구분</td>
              </tr>
              <tr>
                <td>육아 기록</td>
                <td>수유(양·시간), 수면 시간, 기저귀, 메모, 기록한 사람 이름</td>
                <td>기록·요약·차트, 공동양육자와 공유</td>
              </tr>
              <tr>
                <td>기기·사용 정보</td>
                <td>앱 사용 통계, 오류 보고, 기기 종류·운영체제 버전</td>
                <td>앱 개선, 오류 수정 (Firebase Analytics·Crashlytics)</td>
              </tr>
              <tr>
                <td>광고</td>
                <td>광고 식별자(동의한 경우)</td>
                <td>광고 표시 (Google AdMob)</td>
              </tr>
              <tr>
                <td>결제</td>
                <td>광고 제거 구매 여부</td>
                <td>구매한 가족 계정에서 광고 숨기기</td>
              </tr>
            </tbody>
          </table>
          <ul>
            <li>위 정보는 앱을 쓰는 동안 이용자가 직접 입력하거나, 앱 이용 과정에서 자동으로 만들어집니다.</li>
            <li>맞춤형 광고는 동의한 경우에만 표시합니다. 동의하지 않아도 앱을 쓸 수 있습니다.</li>
            <li>카드 번호 등 결제 정보는 Apple·Google이 처리하며 회사는 받지 않습니다.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'retention',
      heading: '2. 보유·이용 기간과 보관 장소',
      body: (
        <ul>
          <li>
            계정·아기 정보·육아 기록: <strong>탈퇴할 때까지</strong> 보유하며, 탈퇴하면 지체 없이 지웁니다.
          </li>
          <li>
            다른 공동양육자와 함께 쓰던 아기의 기록은 탈퇴한 뒤에도 그 사람들이 계속 볼 수 있습니다. 혼자 쓰던 아기의 기록은
            모두 지워집니다.
          </li>
          <li>앱 사용 통계·오류 보고: Google의 보유 기간에 따라 보관된 뒤 지워집니다.</li>
          <li>기록은 Google Firebase(Cloud Firestore, 서울 리전)에 암호화된 연결로 저장합니다.</li>
          <li>
            관계 법령에 따라 보관해야 하는 정보가 있으면 그 기간 동안 따로 보관합니다. 결제 기록은 Apple·Google이 보관합니다.
          </li>
        </ul>
      ),
    },
    {
      id: 'destruction',
      heading: '3. 파기 절차와 방법',
      body: (
        <ul>
          <li>탈퇴하거나 처리 목적을 다한 정보는 지체 없이 파기합니다.</li>
          <li>
            전자 파일은 복구할 수 없도록 서버(Cloud Firestore)와 인증 계정에서 삭제합니다. 종이 문서는 만들지 않습니다.
          </li>
        </ul>
      ),
    },
    {
      id: 'third-party',
      heading: '4. 제3자 제공',
      body: (
        <p>
          회사는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 따라 수사기관 등이 적법한 절차로 요구하는 경우는
          예외입니다.
        </p>
      ),
    },
    {
      id: 'entrust',
      heading: '5. 처리 위탁',
      body: (
        <>
          <table>
            <thead>
              <tr>
                <th>받는 자</th>
                <th>맡기는 일</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Google LLC</td>
                <td>
                  로그인(Firebase Authentication), 데이터 저장(Cloud Firestore), 통계·오류 보고(Firebase
                  Analytics·Crashlytics), 광고(AdMob)
                </td>
              </tr>
              <tr>
                <td>Apple Inc.</td>
                <td>로그인(Apple로 로그인, iOS)</td>
              </tr>
            </tbody>
          </table>
          <p>결제(광고 제거)는 Apple App Store, Google Play가 각자의 방침에 따라 처리합니다.</p>
        </>
      ),
    },
    {
      id: 'overseas',
      heading: '6. 국외 이전',
      body: (
        <>
          {/* 원고는 6열 표지만, 모바일 폭(390px)에서 가로 스크롤이 생겨 받는 자별 2열 표로 옮긴다. 내용은 같다. */}
          <table>
            <tbody>
              <tr><th>받는 자</th><td>Google LLC</td></tr>
              <tr><th>이전 국가</th><td>미국 등 Google 데이터센터가 있는 국가</td></tr>
              <tr><th>이전 항목</th><td>계정 식별자·이메일·이름(Firebase Authentication), 앱 사용 통계·오류 보고·기기 정보(Firebase Analytics·Crashlytics), 광고 식별자(AdMob, 동의한 경우)</td></tr>
              <tr><th>이전 시기·방법</th><td>앱을 쓰는 때에 암호화된 통신망으로 전송</td></tr>
              <tr><th>이용 목적</th><td>로그인, 앱 개선·오류 수정, 광고 표시</td></tr>
              <tr><th>보유 기간</th><td>탈퇴 또는 위탁 계약 종료 시까지(통계·오류 보고는 Google의 보유 기간)</td></tr>
            </tbody>
          </table>
          <table>
            <tbody>
              <tr><th>받는 자</th><td>Apple Inc.</td></tr>
              <tr><th>이전 국가</th><td>미국</td></tr>
              <tr><th>이전 항목</th><td>Apple 계정 식별자, 이메일(또는 대체 주소), 이름</td></tr>
              <tr><th>이전 시기·방법</th><td>Apple로 로그인할 때 암호화된 통신망으로 전송</td></tr>
              <tr><th>이용 목적</th><td>로그인</td></tr>
              <tr><th>보유 기간</th><td>탈퇴 시까지(탈퇴하면 Apple 로그인 토큰을 취소)</td></tr>
            </tbody>
          </table>
          <ul>
            <li>아기 정보와 육아 기록은 서울 리전에 저장합니다.</li>
            <li>
              국외 이전을 원하지 않으면 앱을 쓰지 않거나 탈퇴하여 거부할 수 있습니다. 다만 로그인이 필요한 앱이라 이 경우 앱을
              쓸 수 없습니다. 맞춤형 광고에 쓰이는 광고 식별자는 설정 › ‘광고 개인정보 설정’에서 따로 거부할 수 있습니다.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'rights',
      heading: '7. 이용자의 권리와 행사 방법',
      body: (
        <ul>
          <li>이용자는 언제든지 자신의 개인정보를 열람·정정·삭제하거나 처리 정지를 요구할 수 있습니다.</li>
          <li>앱에서 기록과 아기 정보, 내 이름을 직접 보고 고칠 수 있습니다.</li>
          <li>
            앱의 설정 › ‘탈퇴하고 데이터 지우기’로 언제든 모든 정보를 지울 수 있습니다. 앱이 없어도 문의 메일로 삭제를 요청할
            수 있습니다(<Link href="/apps/agirok/delete-account">계정·데이터 삭제 안내</Link>).
          </li>
          <li>설정 › ‘광고 개인정보 설정’에서 맞춤형 광고 동의를 바꿀 수 있습니다.</li>
          <li>그 밖의 요청은 {mail}로 보내면 지체 없이 처리합니다.</li>
        </ul>
      ),
    },
    {
      id: 'security',
      heading: '8. 안전성 확보 조치',
      body: (
        <ul>
          <li>모든 통신은 암호화된 연결(TLS)로 주고받습니다.</li>
          <li>데이터베이스 보안 규칙으로, 그 아기의 양육자로 등록된 계정만 기록을 읽고 쓸 수 있게 합니다.</li>
          <li>공동양육자 초대 코드는 6자리이며 24시간 뒤에는 쓸 수 없습니다.</li>
          <li>운영 데이터에 접근할 수 있는 사람을 개인정보 보호책임자 한 명으로 제한합니다.</li>
        </ul>
      ),
    },
    {
      id: 'ad-id',
      heading: '9. 자동 수집 장치(광고 식별자)와 거부 방법',
      body: (
        <ul>
          <li>
            앱은 쿠키를 쓰지 않습니다. 광고를 위해 기기의 광고 식별자(Android 광고 ID, iOS IDFA)를 동의한 경우에만 씁니다.
          </li>
          <li>
            거부 방법: 앱의 설정 › ‘광고 개인정보 설정’에서 동의를 바꿉니다. iOS는 설정 › 개인정보 보호 및 보안 › 추적,
            Android는 설정 › Google › 광고에서 광고 ID를 지우거나 재설정할 수 있습니다.
          </li>
        </ul>
      ),
    },
    {
      id: 'children',
      heading: '10. 아동의 개인정보',
      body: (
        <p>
          앱은 보호자가 쓰는 앱이며 만 14세 미만 아동을 대상으로 하지 않습니다. 아기에 대한 정보는 보호자가 입력하며, 아동
          건강 관련 정보로 보아 신중하게 다룹니다.
        </p>
      ),
    },
    {
      id: 'officer',
      heading: '11. 개인정보 보호책임자와 문의',
      body: (
        <ul>
          <li>
            개인정보 보호책임자: {BUSINESS_INFO.privacyOfficer} ({BUSINESS_INFO.nameKo})
          </li>
          <li>연락처: {mail}</li>
          <li>
            개인정보 침해에 대한 신고·상담은 개인정보침해신고센터(privacy.kisa.or.kr, 국번 없이 118),
            개인정보분쟁조정위원회(www.kopico.go.kr, 1833-6972)에 할 수 있습니다.
          </li>
        </ul>
      ),
    },
    {
      id: 'changes',
      heading: '12. 방침의 변경',
      body: <p>내용이 바뀌면 이 페이지에 올리고 시행일과 최종 수정일을 고칩니다.</p>,
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

export default function AgirokPrivacyPage() {
  return <DocPage locales={[ko]} />;
}
