import type { Metadata } from 'next';
import Link from 'next/link';
import { localePath, type Lang } from '@/app/_i18n/config';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { BUSINESS_INFO, CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 쌤케줄 개인정보처리방침. 원고 기준: ssamkejul/docs/legal/privacy-policy.md(한국어)·privacy-policy.ja.md·privacy-policy.en.md — 여기서 먼저 고치지 않는다.
// 일본어·영어는 한국어판을 옮긴 것이다(원어민 검수 전).
// 2026-11-24 전면 개정(시행 2026-12-01, 7일 전 공고). 이전 시행일 2026-11-16은 각 언어의 개정 이력에 남긴다.
// 공개 문서 표는 3열까지(AGENTS.md 6.11).
const DATE = '2026-12-01';
const UPDATED = '2026-11-24';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
const deleteHref = (lang: Lang) => localePath(lang, '/apps/ssamkejul/delete-account');
const ext = (href: string, label: string) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {label}
  </a>
);
const LINKS = {
  google: ext('https://policies.google.com/privacy', 'policies.google.com/privacy'),
  posthog: ext('https://posthog.com/privacy', 'posthog.com/privacy'),
  apple: ext('https://www.apple.com/legal/privacy/', 'apple.com/legal/privacy'),
  vercel: ext('https://vercel.com/legal/privacy-policy', 'vercel.com/legal/privacy-policy'),
  slack: ext('https://slack.com/trust/privacy/privacy-policy', 'slack.com/trust/privacy/privacy-policy'),
};

const ko: DocLocale = {
  lang: 'ko',
  title: '쌤케줄 개인정보처리방침',
  lead: (
    <p>
      쌤케줄(일본어 이름 せんせジュール, 영어 이름 Teachedule, 이하 ‘앱’)은 조요피(JOYOPI, 이하 ‘회사’)가 만든 1인 레슨 선생님용 일정 앱입니다. 선생님은 앱을 설치하고, 수강생은 선생님이 보낸 링크로 앱 설치 없이 웹에서 일정을 봅니다. 회사는 레슨 일정 관리에 꼭 필요한 정보만 처리합니다. 수강생 정보는 광고에 쓰지 않으며, 앱에는 광고가 없습니다.
    </p>
  ),
  sections: [
    {
      id: 'items',
      heading: '1. 처리하는 정보와 목적',
      body: (
        <>
          <table>
            <thead><tr><th>누구</th><th>항목</th><th>목적</th></tr></thead>
            <tbody>
              <tr><td>선생님</td><td>로그인 계정 식별자(카카오·LINE·Apple·Google), Apple·Google이 주는 경우 이메일</td><td>로그인, 계정 구분</td></tr>
              <tr><td>선생님</td><td>선생님이 입력한 이름, 레슨 설정(가능 시간·길이·쉬는 시간·정책·레슨비·통화·시간대·언어), 개인 일정 표시와 그 메모, 공지</td><td>수강생에게 일정·공지 표시, 빈 시간 계산, 통계</td></tr>
              <tr><td>선생님</td><td>기기 푸시 토큰, 기기 종류</td><td>수강생 요청·남은 횟수 알림</td></tr>
              <tr><td>수강생(선생님이 입력)</td><td>이름, 메모, 남은 횟수, 수강생별 소식</td><td>선생님의 레슨 관리</td></tr>
              <tr><td>수강생</td><td>로그인 계정 식별자(카카오·LINE·Apple·Google), Apple·Google이 주는 경우 이메일·이름</td><td>로그인, 초대받은 레슨에 연결</td></tr>
              <tr><td>수강생</td><td>레슨 신청·변경·취소 요청과 메모</td><td>일정 조정</td></tr>
              <tr><td>선생님·수강생</td><td>동의한 약관 버전과 동의 시각</td><td>동의 기록 보관</td></tr>
              <tr><td>모두</td><td>레슨 일정(날짜·시각·상태)</td><td>일정 관리</td></tr>
              <tr><td>모두(자동, 끌 수 있음)</td><td>사용 기록(앱 실행·기능 사용 이벤트, 무작위 기기 ID, 기기 종류·OS, 언어, 앱 버전), 오류 기록(오류 종류와 발생 위치)</td><td>서비스 개선과 오류 수정. 로그인 계정과 연결하지 않고 사람 프로필을 만들지 않으며, 이름·메모·로그인 ID는 보내지 않습니다. IP 주소는 저장하지 않습니다.</td></tr>
              <tr><td>수강생 웹 이용자(자동)</td><td>브라우저·기기 신호와 상호작용 정보(Google reCAPTCHA가 수집)</td><td>자동화된 악용·부정 요청 차단</td></tr>
              <tr><td>의견을 보낸 선생님</td><td>의견 내용과 고른 분류, 답장 받을 이메일(선택), 기기 정보(앱 버전·OS·기기 모델·언어), 의견용 무작위 기기 ID, IP 주소(원문은 저장하지 않고 해시값으로 전송 횟수 제한에만 씀)</td><td>의견 확인과 답장, 서비스 개선, 과도한 전송 막기. 이름·수강생·일정 같은 계정 정보는 함께 보내지 않습니다.</td></tr>
            </tbody>
          </table>
          <p>카카오·LINE에서 받는 닉네임은 저장하지 않습니다. 카카오·LINE 로그인은 한국어·일본어 화면에서만 제공하고, 영어 화면에서는 Apple·Google 로그인만 제공합니다.</p>
          <p>회사는 건강 상태 같은 민감정보를 요구하지 않습니다. 선생님은 수강생 메모에 건강 상태 등 민감한 정보를 적지 말아 주세요. 꼭 필요하면 수강생(만 14세 미만이면 법정대리인)에게 따로 동의를 받아야 합니다.</p>
        </>
      ),
    },
    {
      id: 'role',
      heading: '2. 선생님이 입력하는 수강생 정보',
      body: (
        <>
          <p>선생님이 입력한 수강생 정보(이름·메모·남은 횟수·소식)는 선생님이 무엇을 왜 입력할지 정하고, 회사는 서비스를 제공하기 위해 선생님을 대신해 처리합니다. 선생님은 수강생에게 알리고 필요한 동의(수강생이 만 14세 미만이면 법정대리인의 동의)를 받은 뒤 입력해야 합니다.</p>
          <p>사용 기록·오류 기록, 악용 방지, 의견 처리는 회사가 스스로 목적을 정해 처리하며, 그 책임도 회사에 있습니다.</p>
          <p>선생님이 입력한 수강생 정보의 출처는 선생님입니다. 수강생은 요청하면 정보의 출처와 처리 목적을 안내받고 처리 정지를 요구할 수 있습니다.</p>
        </>
      ),
    },
    {
      id: 'retention',
      heading: '3. 보유 기간과 파기',
      body: (
        <>
          <ul>
            <li>선생님 계정과 모든 수강생·일정 정보: 선생님이 탈퇴할 때까지. 탈퇴하면 바로 지웁니다(앱 「설정」›「계정 삭제(탈퇴)」).</li>
            <li>수강생 연결 정보: 수강생이나 선생님이 연결을 끊거나 선생님이 수강생을 삭제할 때까지.</li>
            <li>선생님이 삭제한 수강생: 이름과 지난 레슨 기록은 선생님의 지난 일정 표시를 위해 남고, 연결·초대·앞으로의 레슨은 바로 지웁니다. 선생님 탈퇴 때 모두 지웁니다.</li>
            <li>수강생 로그인 계정: 수강생 웹 메뉴의 계정 삭제로 바로 지울 수 있습니다. 레슨 연결이 모두 끊긴 뒤에도 남을 수 있으며, 이메일로 요청해도 지웁니다.</li>
            <li>약관 동의 기록: 계정을 지울 때까지.</li>
            <li>사용 기록·오류 기록: 1년. 설정에서 끄면 기기의 무작위 ID를 지우고 더 보내지 않습니다.</li>
            <li>보낸 의견과 답장 받을 이메일: 받은 날부터 1년 뒤 자동으로 지웁니다. 운영자에게 간 Slack 알림 사본도 1년 뒤 지워집니다. 전송 횟수 제한용 해시값은 1시간 뒤 만료됩니다.</li>
          </ul>
          <p>보유 기간이 끝나거나 처리 목적을 이루면 지체 없이 파기합니다. 전자 파일은 복구할 수 없는 방법으로 지우며, 종이 문서는 만들지 않습니다. 서비스 제공업체의 백업에 남은 사본은 그 업체의 보관 주기에 따라 지워집니다. 현재 법령에 따라 따로 보관하는 정보는 없습니다.</p>
        </>
      ),
    },
    {
      id: 'transfer',
      heading: '4. 처리 위탁과 국외 이전',
      body: (
        <>
          <table>
            <thead><tr><th>받는 자(위치·연락처)</th><th>하는 일</th><th>이전 항목</th></tr></thead>
            <tbody>
              <tr><td>Google LLC (Firebase·Google Cloud)<br />대한민국(데이터베이스·서버, 서울 리전), 미국<br />{LINKS.google}</td><td>로그인, 데이터베이스·서버 함수, 푸시 알림 발송, 원격 설정, 웹 호스팅, 악용 방지(reCAPTCHA), 받은 의견 저장</td><td>로그인 계정 식별자·이메일·이름, 선생님·수강생·일정 정보, 푸시 토큰, 의견, 웹 브라우저·기기 신호</td></tr>
              <tr><td>PostHog Inc.<br />독일(EU)<br />{LINKS.posthog}</td><td>사용 기록·오류 기록 저장과 분석</td><td>무작위 기기 ID, 기기 종류·OS, 언어, 앱 버전, 사용 이벤트, 오류 종류와 발생 위치</td></tr>
              <tr><td>Apple Inc.<br />미국<br />{LINKS.apple}</td><td>iOS 푸시 알림 전달</td><td>푸시 토큰, 알림 내용(수강생 이름·요청 일시)</td></tr>
              <tr><td>Vercel Inc.<br />미국<br />{LINKS.vercel}</td><td>의견을 받는 joyopi.com 서버</td><td>의견 내용, 답장 이메일(선택), 기기 정보, 의견용 기기 ID, IP 주소(전달만)</td></tr>
              <tr><td>Slack Technologies, LLC<br />미국<br />{LINKS.slack}</td><td>새 의견을 운영자에게 알림</td><td>의견 내용, 답장 이메일(선택), 기기 정보</td></tr>
            </tbody>
          </table>
          <p>이전 시기와 방법: 서비스를 이용할 때 네트워크(HTTPS)로 수시 전송합니다. 보유 기간: 3항과 같습니다. 이 이전은 이용자와의 계약 이행에 필요한 처리위탁·보관으로서 「개인정보 보호법」 제28조의8 제1항 제3호에 따라 이 방침으로 알립니다.</p>
          <p>거부 방법과 효과: 국외 이전을 원하지 않으면 앱 사용을 멈추거나 탈퇴할 수 있으며, 거부하면 서비스를 이용할 수 없습니다. 사용 기록·오류 기록은 설정에서 끄면 PostHog로 보내지 않습니다.</p>
          <p>로그인 서비스: 카카오 로그인(주식회사 카카오, 대한민국), LINE 로그인(LY Corporation, 일본), Apple 로그인(Apple Inc., 미국), Google 로그인(Google LLC, 미국)은 이용자가 직접 고른 로그인 수단입니다. 로그인할 때 그 회사가 회사에 계정 식별자(Apple·Google은 이메일·이름 포함)를 주며, 그 회사의 처리는 각 회사의 개인정보처리방침을 따릅니다.</p>
        </>
      ),
    },
    {
      id: 'device',
      heading: '5. 자동 수집 장치와 끄는 방법',
      body: (
        <>
          <p>앱과 수강생 웹은 로그인 상태 유지(Firebase), 사용 통계(무작위 기기 ID), 의견 전송 횟수 제한(의견용 기기 ID)을 위해 기기 저장소(localStorage·IndexedDB)를 씁니다. 수강생 웹의 Google reCAPTCHA는 악용 방지를 위해 쿠키 등을 쓸 수 있습니다.</p>
          <p>사용 기록·오류 기록은 선생님 앱 「설정」의 「사용 통계 보내기」와 수강생 웹 메뉴에서 끌 수 있습니다. 끄면 무작위 기기 ID를 지우고 더 보내지 않습니다. EU·EEA(유럽경제지역)·영국에서는 먼저 묻고, 허락하기 전에는 아무것도 저장하거나 보내지 않습니다. 브라우저의 사이트 데이터를 지우거나 앱을 삭제해도 저장된 값이 지워집니다(이때 로그인도 풀립니다).</p>
        </>
      ),
    },
    {
      id: 'rights',
      heading: '6. 이용자의 권리와 행사 방법',
      body: (
        <>
          <p>언제든 자기 정보의 열람·정정·삭제·처리 정지와 동의 철회를 요청할 수 있습니다.</p>
          <ul>
            <li>선생님은 앱에서 직접 고치고 탈퇴할 수 있습니다.</li>
            <li>수강생은 수강생 웹에서 연결을 끊거나 계정을 지울 수 있습니다.</li>
            <li>선생님이 입력한 수강생 정보(이름·메모)의 수정·삭제는 선생님에게 요청하거나 회사에 문의할 수 있습니다.</li>
          </ul>
          <p>그 밖의 요청은 {mail}로 보내 주세요. 본인 확인을 위해 로그인 방법과 선생님 이름을 여쭐 수 있으며, 받은 날부터 10일 이내에 결과를 알립니다. 만 14세 미만 아동의 법정대리인과 위임받은 대리인도 같은 권리를 행사할 수 있습니다. 자세한 방법은 <Link href={deleteHref('ko')}>계정·데이터 삭제 안내</Link>를 보세요.</p>
        </>
      ),
    },
    {
      id: 'children',
      heading: '7. 아동',
      body: (
        <>
          <p>만 14세(거주 국가 법이 더 높은 연령을 정한 경우 그 연령) 미만은 직접 가입할 수 없으며 보호자가 대신 로그인해야 합니다.</p>
          <p>수강생은 로그인 전에 나이를 묻는 질문에 답하며, 해당 연령 미만이면 보호자가 로그인하도록 안내합니다. 나이 답은 저장하지 않습니다. 보호자 계정 하나에 여러 자녀의 레슨을 연결할 수 있고, 보호자는 언제든 연결을 끊거나 계정을 지우고 삭제를 요청할 수 있습니다. 해당 연령 미만 아동이 직접 가입한 사실을 알게 되면 그 계정과 정보를 지웁니다.</p>
        </>
      ),
    },
    {
      id: 'security',
      heading: '8. 안전성 확보조치',
      body: (
        <ul>
          <li>관리적 조치: 개인정보를 다루는 사람을 대표자 1인으로 한정합니다.</li>
          <li>기술적 조치: 접근 규칙으로 선생님 본인만 자기 데이터를 읽고, 수강생은 서버를 거쳐 자기 일정만 봅니다. 일정 변경·초대·연결은 서버만 합니다. 통신은 HTTPS로 암호화하고, 저장 데이터는 Google Cloud 기본 암호화로 보호합니다. 카카오·LINE 로그인 비밀키는 서버에만 두고, 관리 콘솔 계정은 2단계 인증으로 보호합니다.</li>
          <li>물리적 조치: 데이터는 Google Cloud 데이터센터에 두며, 회사는 따로 서버실을 두지 않습니다.</li>
        </ul>
      ),
    },
    {
      id: 'officer',
      heading: '9. 개인정보 보호책임자와 문의',
      body: (
        <p>
          개인정보 보호책임자: {BUSINESS_INFO.privacyOfficer}(대표, {BUSINESS_INFO.nameKo}), 이메일 {mail}, 전화 {BUSINESS_INFO.phone}, 주소 {BUSINESS_INFO.addressKo}. 열람 등 요청과 개인정보 관련 문의·불만도 같은 곳에서 받습니다.
        </p>
      ),
    },
    {
      id: 'remedy',
      heading: '10. 권익침해 구제방법',
      body: (
        <>
          <p>개인정보 침해에 대한 상담·신고나 분쟁 해결은 아래 기관에 할 수 있습니다.</p>
          <ul>
            <li>개인정보분쟁조정위원회: 1833-6972, {ext('https://www.kopico.go.kr', 'kopico.go.kr')}</li>
            <li>개인정보침해신고센터(한국인터넷진흥원): 118, {ext('https://privacy.kisa.or.kr', 'privacy.kisa.or.kr')}</li>
            <li>대검찰청: 1301, {ext('https://www.spo.go.kr', 'spo.go.kr')}</li>
            <li>경찰청: 182, {ext('https://ecrm.police.go.kr', 'ecrm.police.go.kr')}</li>
          </ul>
        </>
      ),
    },
    {
      id: 'gdpr',
      heading: '11. EU·EEA·영국 거주자',
      body: (
        <>
          <p>앱은 2026년 11월 24일부터 EU·EEA(유럽경제지역)와 영국의 앱스토어에서 제공하지 않습니다. 다만 수강생 웹은 이 지역에서도 열 수 있어, GDPR·UK GDPR에 따른 사항을 알립니다.</p>
          <ul>
            <li>컨트롤러: {BUSINESS_INFO.nameKo}({BUSINESS_INFO.nameEn}, 대표 {BUSINESS_INFO.representative}), {BUSINESS_INFO.addressEn}, {mail}. 선생님이 입력한 수강생 정보는 선생님을 대신해 처리합니다(2항).</li>
            <li>처리 근거: 계약 이행(로그인·일정·요청·알림·선생님의 레슨 관리), 동의(사용 기록·오류 기록, 푸시 알림. 언제든 철회할 수 있습니다), 정당한 이익(악용 방지, 의견 처리. 반대할 수 있습니다), 법적 의무.</li>
            <li>권리: 열람, 정정, 삭제, 처리 제한, 이동, 반대, 동의 철회. {mail}로 요청하며, 거주 국가의 개인정보 감독기관에 민원을 낼 수도 있습니다.</li>
            <li>이전: 데이터는 대한민국(EU·영국의 적정성 결정 국가)에 저장되며, 미국으로의 이전은 표준계약조항(SCC) 또는 해당되는 경우 EU-미국 데이터 프라이버시 프레임워크(영국은 UK Extension)에 따릅니다.</li>
            <li>자동화된 결정만으로 이용자에게 영향을 주는 결정은 하지 않습니다. 로그인 정보 제공은 서비스 이용에 필요합니다.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'changes',
      heading: '12. 바뀔 때와 개정 이력',
      body: (
        <>
          <p>이 방침이 바뀌면 시행 7일 전(이용자에게 불리한 변경은 30일 전)에 이 페이지와 앱 업데이트 안내로 알립니다.</p>
          <table>
            <thead><tr><th>시행일</th><th>바뀐 내용</th></tr></thead>
            <tbody>
              <tr><td>2026-12-01<br />(2026-11-24 공고)</td><td>사용 통계 끄기와 EU·EEA·영국 사전 동의, PostHog IP 미저장, 수강생 나이 확인과 계정 삭제, 약관 동의 기록, 의견 1년 자동 삭제를 반영. 파기, 자동 수집 장치, 국외 이전 항목, 권리 행사 방법, 구제방법, 선생님이 입력하는 수강생 정보, EU·EEA·영국 안내를 더하고 「익명 사용 기록」 표현을 바로잡음.</td></tr>
              <tr><td>2026-11-16</td><td>최초 시행(출시 전 2026-11-19 오류 기록, 2026-11-21 의견 보내기 항목을 더함).</td></tr>
            </tbody>
          </table>
        </>
      ),
    },
  ],
  effectiveDate: DATE,
  updatedDate: UPDATED,
};

const ja: DocLocale = {
  lang: 'ja',
  title: 'せんせジュール プライバシーポリシー',
  lead: (
    <p>
      せんせジュール（韓国語名 쌤케줄、英語名 Teachedule、以下「本アプリ」）は、JOYOPI（以下「当社」）が提供する個人レッスンの先生向けスケジュールアプリです。先生はアプリをインストールし、生徒は先生が送ったリンクからインストール不要でWebで予定を確認します。当社はレッスンの予定管理に必要な情報だけを取り扱います。生徒の情報を広告に使うことはなく、本アプリに広告はありません。
    </p>
  ),
  sections: [
    {
      id: 'items',
      heading: '1. 取り扱う情報と利用目的',
      body: (
        <>
          <table>
            <thead><tr><th>対象</th><th>項目</th><th>利用目的</th></tr></thead>
            <tbody>
              <tr><td>先生</td><td>ログインアカウントの識別子（カカオ・LINE・Apple・Google）、Apple・Googleから提供される場合はメールアドレス</td><td>ログイン、アカウントの識別</td></tr>
              <tr><td>先生</td><td>先生が入力した名前、レッスン設定（可能な時間・長さ・休憩時間・ルール・レッスン料・通貨・タイムゾーン・言語）、個人の予定の表示とそのメモ、お知らせ</td><td>生徒への予定・お知らせの表示、空き時間の計算、統計</td></tr>
              <tr><td>先生</td><td>端末のプッシュ通知トークン、端末の種類</td><td>生徒からのリクエスト・残り回数の通知</td></tr>
              <tr><td>生徒（先生が入力）</td><td>名前、メモ、残り回数、生徒ごとのお知らせ</td><td>先生のレッスン管理</td></tr>
              <tr><td>生徒</td><td>ログインアカウントの識別子（カカオ・LINE・Apple・Google）、Apple・Googleから提供される場合はメールアドレス・名前</td><td>ログイン、招待されたレッスンとの連携</td></tr>
              <tr><td>生徒</td><td>レッスンの予約・振替・キャンセルのリクエストとメモ</td><td>予定の調整</td></tr>
              <tr><td>先生・生徒</td><td>同意した利用規約のバージョンと同意日時</td><td>同意記録の保管</td></tr>
              <tr><td>全員</td><td>レッスンの予定（日付・時刻・状態）</td><td>予定管理</td></tr>
              <tr><td>全員（自動、オフにできます）</td><td>利用記録（起動・機能の利用イベント、ランダムな端末ID、端末の種類・OS、言語、アプリのバージョン）、エラーの記録（エラーの種類と発生箇所）</td><td>サービス改善と不具合の修正。ログインアカウントと結び付けず、個人のプロフィールは作らず、名前・メモ・ログインIDは送りません。IPアドレスは保存しません。</td></tr>
              <tr><td>生徒用Webの利用者（自動）</td><td>ブラウザ・端末の情報と操作の情報（Google reCAPTCHAが収集）</td><td>自動化された不正利用の防止</td></tr>
              <tr><td>ご意見を送った先生</td><td>ご意見の内容と選んだ分類、返信用メールアドレス（任意）、端末情報（アプリのバージョン・OS・端末のモデル・言語）、ご意見用のランダムな端末ID、IPアドレス（原文は保存せず、ハッシュ値を送信回数の制限にのみ使用）</td><td>ご意見の確認と返信、サービス改善、過度な送信の防止。お名前・生徒・予定などのアカウント情報は送りません。</td></tr>
            </tbody>
          </table>
          <p>カカオ・LINEから受け取るニックネームは保存しません。カカオ・LINEログインは韓国語・日本語の画面でのみ提供し、英語の画面ではApple・Googleログインのみを提供します。</p>
          <p>当社は健康状態などの要配慮個人情報を求めません。先生は生徒のメモに健康状態などの要配慮個人情報を書かないでください。どうしても必要な場合は、生徒（14歳未満の場合は法定代理人）から別途同意を得てください。</p>
        </>
      ),
    },
    {
      id: 'role',
      heading: '2. 先生が入力する生徒の情報',
      body: (
        <>
          <p>先生が入力する生徒の情報（名前・メモ・残り回数・お知らせ）は、何をなぜ入力するかを先生が決め、当社はサービスを提供するために先生に代わって取り扱います。先生は生徒に知らせ、必要な同意（生徒が14歳未満の場合は法定代理人の同意）を得たうえで入力してください。</p>
          <p>利用記録・エラーの記録、不正利用の防止、ご意見の対応は、当社が自ら目的を定めて取り扱い、その責任も当社が負います。</p>
          <p>先生が入力した生徒の情報の取得元は先生です。生徒はご請求により、取得元と利用目的の説明を受け、利用停止を求めることができます。</p>
        </>
      ),
    },
    {
      id: 'retention',
      heading: '3. 保存期間と廃棄',
      body: (
        <>
          <ul>
            <li>先生のアカウントとすべての生徒・予定の情報: 先生が退会するまで。退会するとすぐに削除します（アプリ「設定」›「アカウント削除（退会）」）。</li>
            <li>生徒の連携情報: 生徒または先生が連携を解除するか、先生が生徒を削除するまで。</li>
            <li>先生が削除した生徒: 名前と過去のレッスン記録は先生の過去の予定表示のために残り、連携・招待・今後のレッスンはすぐに削除します。先生の退会時にすべて削除します。</li>
            <li>生徒のログインアカウント: 生徒用Webのメニューのアカウント削除ですぐに削除できます。レッスンとの連携がすべて解除された後も残ることがあり、メールでご依頼いただいても削除します。</li>
            <li>利用規約への同意記録: アカウントを削除するまで。</li>
            <li>利用記録・エラーの記録: 1年。設定でオフにすると、端末のランダムなIDを削除し、以後送信しません。</li>
            <li>送られたご意見と返信用メールアドレス: 受け取った日から1年後に自動で削除します。運営者へのSlack通知の写しも1年後に削除されます。送信回数の制限に使うハッシュ値は1時間で失効します。</li>
          </ul>
          <p>保存期間が終わるか利用目的を達成したときは、遅滞なく廃棄します。電子ファイルは復元できない方法で削除し、紙の書類は作成しません。委託先のバックアップに残る写しは、その委託先の保管周期に従って削除されます。現在、法令に基づいて別途保管している情報はありません。</p>
        </>
      ),
    },
    {
      id: 'transfer',
      heading: '4. 取扱いの委託と外国にある第三者への提供',
      body: (
        <>
          <table>
            <thead><tr><th>委託先（所在国・連絡先）</th><th>内容</th><th>提供する項目</th></tr></thead>
            <tbody>
              <tr><td>Google LLC（Firebase・Google Cloud）<br />大韓民国（データベース・サーバー、ソウルリージョン）、米国<br />{LINKS.google}</td><td>ログイン、データベース・サーバー機能、プッシュ通知の送信、リモート設定、Webホスティング、不正利用の防止（reCAPTCHA）、受け取ったご意見の保存</td><td>ログインアカウントの識別子・メールアドレス・名前、先生・生徒・予定の情報、プッシュ通知トークン、ご意見、Webブラウザ・端末の情報</td></tr>
              <tr><td>PostHog Inc.<br />ドイツ（EU）<br />{LINKS.posthog}</td><td>利用記録・エラーの記録の保存と分析</td><td>ランダムな端末ID、端末の種類・OS、言語、アプリのバージョン、利用イベント、エラーの種類と発生箇所</td></tr>
              <tr><td>Apple Inc.<br />米国<br />{LINKS.apple}</td><td>iOSのプッシュ通知の配信</td><td>プッシュ通知トークン、通知の内容（生徒の名前・リクエストの日時）</td></tr>
              <tr><td>Vercel Inc.<br />米国<br />{LINKS.vercel}</td><td>ご意見を受け取るjoyopi.comのサーバー</td><td>ご意見の内容、返信用メールアドレス（任意）、端末情報、ご意見用の端末ID、IPアドレス（中継のみ）</td></tr>
              <tr><td>Slack Technologies, LLC<br />米国<br />{LINKS.slack}</td><td>新しいご意見の運営者への通知</td><td>ご意見の内容、返信用メールアドレス（任意）、端末情報</td></tr>
            </tbody>
          </table>
          <p>当社は大韓民国の事業者であり、上記の委託先には外国（大韓民国・米国・ドイツ）にある事業者が含まれます。ドイツは個人情報保護委員会が定める、日本と同等の水準にあると認められる個人情報の保護に関する制度を有する国（EU・EEA）です。各国の個人情報の保護に関する制度は、個人情報保護委員会のウェブサイトで確認できます。</p>
          <p>当社は、大韓民国・米国の委託先との間で、利用規約・データ処理契約等により、個人情報の保護に関する法律第4章第2節の規定の趣旨に沿った措置の実施を確保し、その実施状況を定期的に確認しています。これらの措置に関する情報は、ご請求に応じて提供します。</p>
          <p>ログインサービス：カカオログイン（Kakao Corp.、大韓民国）、LINEログイン（LINEヤフー株式会社、日本）、Appleでサインイン（Apple Inc.、米国）、Googleログイン（Google LLC、米国）は、利用者が自ら選ぶログイン手段です。ログイン時にその会社から当社にアカウントの識別子（Apple・Googleはメールアドレス・名前を含む）が提供され、その会社における取扱いは各社のプライバシーポリシーに従います。</p>
        </>
      ),
    },
    {
      id: 'device',
      heading: '5. 端末への保存と利用記録のオフ',
      body: (
        <>
          <p>本アプリと生徒用Webは、ログイン状態の維持（Firebase）、利用統計（ランダムな端末ID）、ご意見の送信回数の制限（ご意見用の端末ID）のために端末の保存領域（localStorage・IndexedDB）を使います。生徒用WebのGoogle reCAPTCHAは、不正利用の防止のためにCookie等を使うことがあります。</p>
          <p>利用記録・エラーの記録は、先生用アプリの設定と生徒用Webのメニューでオフにできます。オフにするとランダムな端末IDを削除し、以後送信しません。EU・EEA（欧州経済領域）・英国では最初に確認し、許可されるまでは何も保存・送信しません。ブラウザのサイトデータを消去するか、アプリを削除しても保存された値は消えます（このときログインも解除されます）。</p>
        </>
      ),
    },
    {
      id: 'rights',
      heading: '6. 開示等のご請求',
      body: (
        <>
          <p>保有個人データの利用目的の通知、開示（第三者提供記録の開示を含む）、訂正・追加・削除、利用停止・消去、第三者提供の停止をいつでもご請求いただけます。</p>
          <ul>
            <li>先生はアプリで直接修正・退会できます。</li>
            <li>生徒は生徒用Webで連携の解除とアカウントの削除ができます。</li>
            <li>先生が入力した生徒の情報（名前・メモ）の訂正・削除は、先生にお願いするか当社にお問い合わせください。</li>
          </ul>
          <p>その他のご請求は {mail} までご連絡ください。ご本人確認のため、ご利用のログイン方法と先生のお名前を伺うことがあります。手数料はいただきません。遅滞なく（原則として受け付けから10日以内に）回答します。未成年者の法定代理人や委任を受けた代理人もご請求いただけます。詳しくは<Link href={deleteHref('ja')}>アカウント・データの削除</Link>をご覧ください。</p>
        </>
      ),
    },
    {
      id: 'children',
      heading: '7. 子どもの情報',
      body: (
        <>
          <p>14歳（お住まいの国の法律でより高い年齢が定められている場合はその年齢）未満の方はご自身で登録できず、保護者の方が代わりにログインする必要があります。</p>
          <p>生徒はログインの前に年齢の確認に答え、その年齢未満の場合は保護者の方がログインするようご案内します。年齢の回答は保存しません。保護者のアカウント1つに複数のお子さまのレッスンを連携でき、保護者はいつでも連携の解除・アカウントの削除・情報の削除のご請求ができます。その年齢未満のお子さまがご自身で登録したことが分かった場合は、そのアカウントと情報を削除します。</p>
        </>
      ),
    },
    {
      id: 'security',
      heading: '8. 安全管理措置',
      body: (
        <ul>
          <li>組織的・人的安全管理措置：個人データを取り扱う者を代表者1名に限定しています。</li>
          <li>技術的安全管理措置：アクセスルールにより先生本人だけが自分のデータを閲覧でき、生徒はサーバーを通して自分の予定だけを見ます。予定の変更・招待・連携はサーバーだけが行います。通信はHTTPSで暗号化し、保存データはGoogle Cloudの標準の暗号化で保護します。カカオ・LINEログインの秘密鍵はサーバーにのみ保管し、管理コンソールのアカウントは2段階認証で保護します。</li>
          <li>物理的安全管理措置：データはGoogle Cloudのデータセンターに保管し、当社は独自のサーバールームを持ちません。</li>
          <li>外的環境の把握：当社は大韓民国に所在し、データは大韓民国（Google Cloud ソウルリージョン）、米国およびドイツで取り扱われます。各国の個人情報の保護に関する制度を把握したうえで、安全管理措置を実施しています。</li>
        </ul>
      ),
    },
    {
      id: 'officer',
      heading: '9. 事業者・個人情報保護責任者・苦情窓口',
      body: (
        <ul>
          <li>事業者：{BUSINESS_INFO.nameEn}（大韓民国の個人事業者）</li>
          <li>住所：{BUSINESS_INFO.addressEn}</li>
          <li>代表者・個人情報保護責任者：{BUSINESS_INFO.representativeEn}（{BUSINESS_INFO.representative}）</li>
          <li>開示等のご請求・苦情・お問い合わせの窓口：{mail}</li>
        </ul>
      ),
    },
    {
      id: 'gdpr',
      heading: '10. EU・EEA・英国にお住まいの方',
      body: (
        <>
          <p>本アプリは2026年11月24日から、EU・EEA（欧州経済領域）と英国のApp Storeでは提供していません。ただし生徒用Webはこれらの地域からも開けるため、GDPR・UK GDPRに基づく事項をお知らせします。</p>
          <ul>
            <li>管理者（コントローラー）：{BUSINESS_INFO.nameEn}（代表 {BUSINESS_INFO.representativeEn}）、{BUSINESS_INFO.addressEn}、{mail}。先生が入力した生徒の情報は先生に代わって取り扱います（第2項）。</li>
            <li>法的根拠：契約の履行（ログイン・予定・リクエスト・通知・先生のレッスン管理）、同意（利用記録・エラーの記録、プッシュ通知。いつでも撤回できます）、正当な利益（不正利用の防止、ご意見の対応。異議を述べることができます）、法的義務。</li>
            <li>権利：アクセス、訂正、消去、処理の制限、データポータビリティ、異議、同意の撤回。{mail} までご請求ください。お住まいの国のデータ保護監督機関に苦情を申し立てることもできます。</li>
            <li>移転：データは大韓民国（EU・英国の十分性認定国）に保存され、米国への移転は標準契約条項（SCC）または該当する場合はEU-米国データプライバシーフレームワーク（英国はUK Extension）に基づきます。</li>
            <li>自動化された処理のみによる決定は行いません。ログイン情報の提供はサービスの利用に必要です。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'changes',
      heading: '11. 変更と改定履歴',
      body: (
        <>
          <p>本ポリシーを変更する場合は、施行の7日前（利用者に不利な変更は30日前）までに本ページとアプリのアップデート案内でお知らせします。</p>
          <table>
            <thead><tr><th>施行日</th><th>変更内容</th></tr></thead>
            <tbody>
              <tr><td>2026-12-01<br />（2026-11-24 公表）</td><td>利用統計のオフとEU・EEA・英国での事前同意、PostHogでのIPアドレス非保存、生徒の年齢確認とアカウント削除、利用規約への同意記録、ご意見の1年後の自動削除を反映。廃棄、端末への保存、外国にある第三者への提供の項目、開示等のご請求の手続、外的環境の把握、苦情窓口、先生が入力する生徒の情報、EU・EEA・英国のご案内を追加し、「匿名の利用記録」の表現を訂正。</td></tr>
              <tr><td>2026-11-16</td><td>制定（公開前の2026-11-19にエラーの記録、2026-11-21にご意見の送信の項目を追加）。</td></tr>
            </tbody>
          </table>
        </>
      ),
    },
  ],
  effectiveDate: DATE,
  updatedDate: UPDATED,
};

const en: DocLocale = {
  lang: 'en',
  title: 'Teachedule Privacy Policy',
  lead: (
    <p>
      Teachedule (Korean name 쌤케줄 “Ssamkejul”, Japanese name せんせジュール; the “App”) is a lesson-scheduling app for independent teachers, made by JOYOPI (“we”). Teachers install the App; students view their schedule on the web through a link from their teacher, with nothing to install. We handle only the information needed to manage lesson schedules. Student information is never used for advertising, and the App shows no ads.
    </p>
  ),
  sections: [
    {
      id: 'items',
      heading: '1. Information we handle and why',
      body: (
        <>
          <table>
            <thead><tr><th>Who</th><th>Information</th><th>Purpose</th></tr></thead>
            <tbody>
              <tr><td>Teachers</td><td>Sign-in account identifier (Kakao, LINE, Apple, Google); email if Apple or Google provides it</td><td>Sign-in and account identification</td></tr>
              <tr><td>Teachers</td><td>Name you enter, lesson settings (available hours, length, breaks, rules, lesson fee, currency, time zone, language), personal time blocks and their labels, announcements</td><td>Showing schedules and announcements to students, finding open slots, statistics</td></tr>
              <tr><td>Teachers</td><td>Device push token and device type</td><td>Notifying you of student requests and lessons left</td></tr>
              <tr><td>Students (entered by the teacher)</td><td>Name, note, lessons left, per-student announcements</td><td>The teacher’s lesson management</td></tr>
              <tr><td>Students</td><td>Sign-in account identifier (Kakao, LINE, Apple, Google); email and name if Apple or Google provides them</td><td>Sign-in and linking to the lessons you were invited to</td></tr>
              <tr><td>Students</td><td>Booking, rescheduling and cancellation requests and notes</td><td>Arranging the schedule</td></tr>
              <tr><td>Teachers and students</td><td>The version of the terms you accepted and when</td><td>Keeping a record of acceptance</td></tr>
              <tr><td>Everyone</td><td>Lesson schedule (date, time, status)</td><td>Schedule management</td></tr>
              <tr><td>Everyone (automatic, can be turned off)</td><td>Usage events (app opens, feature use, a random device ID, device type and OS, language, app version) and error reports (error type and where it occurred)</td><td>Improving the service and fixing errors. Not linked to your account; we don’t build personal profiles, and names, notes and sign-in IDs are never included. IP addresses are not stored.</td></tr>
              <tr><td>Student web users (automatic)</td><td>Browser and device signals and interaction data (collected by Google reCAPTCHA)</td><td>Blocking automated abuse</td></tr>
              <tr><td>Teachers who send feedback</td><td>Your message and the category you chose, an email for a reply (optional), device info (app version, OS, device model, language), a separate random device ID for feedback, IP address (not stored as such; a hash is used only to limit how often feedback can be sent)</td><td>Reading and replying to feedback, improving the service, limiting excessive sending. Names, students, schedules and other account details are not sent.</td></tr>
            </tbody>
          </table>
          <p>We do not store nicknames received from Kakao or LINE. Kakao and LINE sign-in are offered only when the App is shown in Korean or Japanese. In English, the App offers only Apple and Google sign-in.</p>
          <p>We do not ask for sensitive information such as health conditions. Teachers should not write health or other sensitive information in student notes. If it is truly needed, the teacher must get separate consent from the student (or, for a child, from the parent or guardian).</p>
        </>
      ),
    },
    {
      id: 'role',
      heading: '2. Student information entered by teachers',
      body: (
        <>
          <p>For student information a teacher enters (name, note, lessons left, announcements), the teacher decides what to enter and why, and we handle it on the teacher’s behalf to provide the service. Teachers must tell their students and obtain any required consent (from a parent or guardian if the student is a child) before entering it.</p>
          <p>For our own usage statistics, error reports, security and abuse prevention, and handling feedback, JOYOPI decides the purposes itself and is responsible as an independent controller.</p>
          <p>Student information a teacher enters comes from the teacher. Students can ask us where it came from and why it is processed.</p>
        </>
      ),
    },
    {
      id: 'retention',
      heading: '3. How long we keep it and how we delete it',
      body: (
        <>
          <ul>
            <li>Teacher accounts and all student and schedule data: until the teacher deletes their account, at which point it is deleted immediately (Settings › Delete account).</li>
            <li>Student links: until the student or teacher unlinks, or the teacher deletes the student.</li>
            <li>Students deleted by a teacher: we keep only the name and past lesson records so past schedules still display; the link, invite and upcoming lessons are deleted right away. Everything is deleted when the teacher deletes their account.</li>
            <li>Student sign-in accounts: students can delete their account at once from the student web menu. An account may remain after all lesson links are removed; we also delete it on request by email.</li>
            <li>Record of accepting the terms: until the account is deleted.</li>
            <li>Usage events and error reports: 1 year. If you turn them off in Settings, we delete the random device ID and stop sending.</li>
            <li>Feedback and the reply email: deleted automatically 1 year after we receive them. The Slack notification copy sent to the operator is also deleted after 1 year. The hash used to limit sending expires after 1 hour.</li>
          </ul>
          <p>When a retention period ends or the purpose is achieved, we delete the data without delay. Electronic files are deleted so they cannot be recovered, and we keep no paper records. Copies in our providers’ backups are deleted on their backup cycles. We currently keep no data under a separate legal retention requirement.</p>
        </>
      ),
    },
    {
      id: 'transfer',
      heading: '4. Service providers and international transfers',
      body: (
        <>
          <table>
            <thead><tr><th>Provider (location, contact)</th><th>Purpose</th><th>Data transferred</th></tr></thead>
            <tbody>
              <tr><td>Google LLC (Firebase, Google Cloud)<br />South Korea (database and server, Seoul region), USA<br />{LINKS.google}</td><td>Sign-in, database and server functions, sending push notifications, remote config, web hosting, abuse prevention (reCAPTCHA), storing feedback</td><td>Sign-in identifiers, email and name; teacher, student and schedule data; push tokens; feedback; web browser and device signals</td></tr>
              <tr><td>PostHog Inc.<br />Germany (EU)<br />{LINKS.posthog}</td><td>Storing and analyzing usage events and error reports</td><td>Random device ID, device type and OS, language, app version, usage events, error type and location</td></tr>
              <tr><td>Apple Inc.<br />USA<br />{LINKS.apple}</td><td>Delivering iOS push notifications</td><td>Push token, notification content (student name, request time)</td></tr>
              <tr><td>Vercel Inc.<br />USA<br />{LINKS.vercel}</td><td>The joyopi.com server that receives feedback</td><td>Feedback message, reply email (optional), device info, feedback device ID, IP address (passed through only)</td></tr>
              <tr><td>Slack Technologies, LLC<br />USA<br />{LINKS.slack}</td><td>Notifying the operator of new feedback</td><td>Feedback message, reply email (optional), device info</td></tr>
            </tbody>
          </table>
          <p>Data is sent over the network (HTTPS) whenever you use the service, and kept for the periods in section 3. If you do not want your information transferred, you can stop using the App or delete your account; without these transfers the service cannot work. Usage events and error reports are not sent to PostHog if you turn them off.</p>
          <p>Sign-in services: Kakao (Kakao Corp., South Korea), LINE (LY Corporation, Japan), Sign in with Apple (Apple Inc., USA) and Google Sign-In (Google LLC, USA) are sign-in methods you choose. When you sign in, that company gives us your account identifier (and, for Apple and Google, your email and name); its own handling of your data follows its privacy policy.</p>
        </>
      ),
    },
    {
      id: 'device',
      heading: '5. Device storage and turning off usage statistics',
      body: (
        <>
          <p>The App and the student web use device storage (localStorage, IndexedDB) to keep you signed in (Firebase), for usage statistics (a random device ID) and to limit feedback sending (a separate feedback device ID). Google reCAPTCHA on the student web may use cookies and similar technologies to prevent abuse.</p>
          <p>You can turn off usage events and error reports in the teacher App’s Settings and in the student web menu. When they are off, we delete the random device ID and stop sending. In the EEA and the UK we ask first, and nothing is stored or sent before you allow it. Clearing your browser’s site data or deleting the App also removes the stored values (and signs you out).</p>
          <p>We do not track users across other companies’ apps or websites, so we do not respond differently to browser Do Not Track signals.</p>
        </>
      ),
    },
    {
      id: 'rights',
      heading: '6. Your rights',
      body: (
        <>
          <p>You can ask to access, correct or delete your information, restrict or stop its processing, or withdraw consent at any time.</p>
          <ul>
            <li>Teachers can edit their data and delete their account in the App.</li>
            <li>Students can unlink or delete their account on the student web.</li>
            <li>To correct or delete student information a teacher entered (name, note), ask the teacher or contact us.</li>
          </ul>
          <p>For anything else, email {mail}. We may ask which sign-in method you use and your teacher’s name to verify your identity, and we reply within 10 days of receiving your request. A child’s parent or guardian and an authorized agent can make requests too. See <Link href={deleteHref('en')}>Delete account & data</Link> for details.</p>
        </>
      ),
    },
    {
      id: 'children',
      heading: '7. Children',
      body: (
        <>
          <p>Children under 14 (or a higher age where the law of their country requires) cannot sign up themselves; a parent or guardian must sign in for them.</p>
          <p>Before signing in, students answer an age question; anyone below that age is asked to have a parent or guardian sign in. We do not store the answer. One parent account can link several children’s lessons, and parents can unlink, delete the account and request deletion at any time. If we learn that a child below that age signed up on their own, we delete the account and its data.</p>
        </>
      ),
    },
    {
      id: 'security',
      heading: '8. Security',
      body: (
        <ul>
          <li>Only our representative handles personal data.</li>
          <li>Access rules let only the teacher read their data; students see only their own schedule through our server, and only the server changes schedules, invites and links. Traffic is encrypted with HTTPS, stored data is protected by Google Cloud’s default encryption, the Kakao and LINE sign-in secret keys are stored only on our server, and admin console accounts use two-step verification.</li>
          <li>Data is kept in Google Cloud data centers; we run no server room of our own.</li>
        </ul>
      ),
    },
    {
      id: 'officer',
      heading: '9. Who we are and privacy officer',
      body: (
        <p>
          {BUSINESS_INFO.nameEn} (a sole proprietorship in the Republic of Korea), {BUSINESS_INFO.addressEn}. Privacy officer: {BUSINESS_INFO.privacyOfficerEn}, the representative. Contact: {mail}.
        </p>
      ),
    },
    {
      id: 'ccpa',
      heading: '10. California residents (CCPA/CPRA)',
      body: (
        <>
          <p>If you live in California, you have the right to know what personal information we collected about you, why, and with whom we share it; the right to delete it; the right to correct inaccurate information; and the right not to be treated differently for using these rights.</p>
          <p>We do not sell personal information, and we do not share it for cross-context behavioral advertising. We do not collect sensitive personal information. The App has no ads and does not track you across other companies’ apps or websites. To make a request, email {mail}. We may need to verify your identity, and we will respond within 45 days. You may use an authorized agent.</p>
          <p>In the past 12 months we collected the categories in section 1 (identifiers, contact information, user content, internet or app activity) from you, from your teacher, and automatically from your device, for the purposes listed there, and disclosed them for business purposes only to the service providers in section 4. We keep each category for the periods in section 3.</p>
        </>
      ),
    },
    {
      id: 'gdpr',
      heading: '11. EEA and UK residents (GDPR)',
      body: (
        <>
          <p>Since November 24, 2026 the App has not been offered in App Stores in the European Union, the European Economic Area or the United Kingdom. The student web can still be opened there, so we give the following information under the GDPR and the UK GDPR.</p>
          <ul>
            <li>Controller: {BUSINESS_INFO.nameEn} (representative: {BUSINESS_INFO.representativeEn}), {BUSINESS_INFO.addressEn}, {mail}. We handle student information that teachers enter on the teacher’s behalf (section 2).</li>
            <li>Legal bases: contract (sign-in, schedules, requests, notifications and the teacher’s lesson management); consent (usage events and error reports, push notifications; you can withdraw it at any time); legitimate interests (abuse prevention and handling feedback; you can object); legal obligation where the law requires it.</li>
            <li>Rights: access, rectification, erasure, restriction, data portability, objection and withdrawal of consent. Email {mail} to use them. You can also complain to the data protection authority where you live.</li>
            <li>Transfers: data is stored in South Korea, which has EU and UK adequacy decisions. For transfers to the United States we rely on Standard Contractual Clauses or, where applicable, the EU-U.S. Data Privacy Framework (and its UK Extension).</li>
            <li>We make no decisions based solely on automated processing. Providing sign-in data is necessary to use the service.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'changes',
      heading: '12. Changes and revision history',
      body: (
        <>
          <p>If this policy changes, we will announce it on this page and in the App’s update notes at least 7 days before it takes effect (30 days for changes unfavorable to you).</p>
          <table>
            <thead><tr><th>Effective</th><th>Changes</th></tr></thead>
            <tbody>
              <tr><td>2026-12-01<br />(published 2026-11-24)</td><td>Added the option to turn off usage statistics and prior consent in the EEA and UK, no IP storage at PostHog, the student age question and account deletion, the record of accepted terms, and automatic deletion of feedback after 1 year. Added sections on deletion, device storage, data transferred to each provider, how to use your rights, student information entered by teachers and EEA/UK residents, and corrected the wording “anonymous usage events”.</td></tr>
              <tr><td>2026-11-16</td><td>First version (before release, error reports were added on 2026-11-19 and feedback on 2026-11-21; CCPA and GDPR sections on 2026-11-23).</td></tr>
            </tbody>
          </table>
        </>
      ),
    },
  ],
  effectiveDate: DATE,
  updatedDate: UPDATED,
};

const DOCS: Record<Lang, DocLocale> = { ko, ja, en };
const TITLES: Record<Lang, string> = { ko: '쌤케줄 개인정보처리방침', ja: 'せんせジュール プライバシーポリシー', en: 'Teachedule Privacy Policy' };

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/ssamkejul/privacy', { title: DOCS[lang].title, description: TITLES[lang] });
}

export default async function SsamkejulPrivacyPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} slug="ssamkejul" path={`/${lang}/apps/ssamkejul/privacy`} />;
}
