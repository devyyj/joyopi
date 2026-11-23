import type { Metadata } from 'next';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { BUSINESS_INFO, CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 무당 이야기 게임(가제 「신내림 받은 김대리」, 코드명 mudang) 개인정보 처리방침.
// 내용 기준: mudang 앱 1.0 동작(2026-11-24) — 분석·오류 PostHog(이벤트 이름과 종류 하나만), 의견 보내기(공통 4장),
// 게임 저장은 기기 안, 공유 카드는 OS 공유 시트, 위치·계정·광고·앱 내 구매 없음. 돌보기 방침(rockgazing/privacy)과 같은 틀.
// 앱 이름이 확정되면 제목을 고친다(2026-11-24 이름 미확정).
const EFFECTIVE_DATE = '2026-11-24';
const UPDATED_DATE = '2026-11-24';

const POSTHOG_PRIVACY = 'https://posthog.com/privacy';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const ko: DocLocale = {
  lang: 'ko',
  title: '신내림 받은 김대리 개인정보 처리방침',
  lead: (
    <p>
      「신내림 받은 김대리」(이하 ‘앱’)는 {BUSINESS_INFO.nameKo}({BUSINESS_INFO.nameEn}, 이하 ‘개발자’)가 만든 이야기 게임입니다.
      이 문서는 앱이 어떤 정보를 다루는지 알려 드립니다.
    </p>
  ),
  notice: (
    <p>
      앱에는 회원가입·로그인·광고·추적·앱 내 구매가 없고, 게임 진행은 기기 안에만 저장합니다. 개발자가 받는 정보는 앱을 고치기
      위한 사용 통계와 오류 정보, 그리고 사용자가 설정 › 의견 보내기로 직접 보낸 의견뿐입니다. 신당 이름·게임 속 선택·위치는
      받지 않습니다.
    </p>
  ),
  sections: [
    {
      id: 'collect',
      heading: '1. 처리하는 정보와 목적',
      body: (
        <>
          <p>앱은 아래 정보를 자동으로 만들어 분석 서비스(PostHog)로 보냅니다.</p>
          <table>
            <thead>
              <tr><th>구분</th><th>항목</th><th>목적</th></tr>
            </thead>
            <tbody>
              <tr><td>기기 무작위 값</td><td>분석에만 쓰려고 기기에서 만든 무작위 값을 변환(해시)한 값. 다시 설치하면 바뀝니다.</td><td>사용자 수·재방문 세기</td></tr>
              <tr><td>앱 사용 기록</td><td>앱을 연 것, 사용 시간 구간(1분 미만·1~10분·10~60분·60분 이상), 게임 진행 이벤트 이름(새 게임 시작, 장 도달, 상담 마침, 미니게임 건너뜀, 결말 도달, 회귀, 하룻밤 점집 마침, 명함 공유)과 그 종류 하나(예: 몇 장, 어떤 결말). 입력한 글은 보내지 않습니다.</td><td>앱 개선</td></tr>
              <tr><td>오류 정보</td><td>오류 종류, 오류 메시지(입력한 값은 가림), 오류가 난 코드 위치</td><td>오류 수정</td></tr>
              <tr><td>앱 정보</td><td>앱 버전, 운영체제 종류(iOS·Android)</td><td>앱 개선·오류 수정</td></tr>
              <tr><td>IP 주소와 대략적인 위치</td><td>앱이 통신할 때 자동으로 전달되는 IP 주소와 그로 추정한 국가·도시. 기기의 위치 서비스는 쓰지 않습니다.</td><td>지역별 사용 통계</td></tr>
            </tbody>
          </table>
          <ul>
            <li>분석으로는 이름·이메일·연락처·광고 식별자·신당 이름·게임 속 선택을 보내지 않습니다.</li>
            <li>사람별 프로필을 만들지 않고, 다른 회사의 정보와 연결하지 않으며, 광고에 쓰지 않습니다(추적 없음).</li>
          </ul>
          <p>사용자가 설정 › 의견 보내기에서 「보내기」를 누를 때만 아래 정보를 joyopi.com 서버로 보냅니다.</p>
          <table>
            <thead>
              <tr><th>구분</th><th>항목</th><th>목적</th></tr>
            </thead>
            <tbody>
              <tr><td>의견</td><td>의견 내용과 고른 분류(선택)</td><td>의견 확인과 앱 개선</td></tr>
              <tr><td>답장 받을 이메일(선택)</td><td>사용자가 적었을 때만</td><td>답장</td></tr>
              <tr><td>기기 정보</td><td>앱 버전·빌드 번호, 운영체제 종류와 버전, 기기 모델, 앱 언어</td><td>문제 재현과 수정</td></tr>
              <tr><td>의견용 기기 무작위 값</td><td>의견 보내기에만 쓰는 무작위 값(분석용과 다름)</td><td>과도한 전송 막기</td></tr>
              <tr><td>IP 주소</td><td>원문은 저장하지 않고 변환(해시)한 값으로 전송 횟수만 셉니다</td><td>과도한 전송 막기</td></tr>
            </tbody>
          </table>
        </>
      ),
    },
    {
      id: 'device',
      heading: '2. 기기 안에만 저장하는 정보',
      body: (
        <ul>
          <li>게임 진행(날짜·복채·손님 결과·신당 이름·성별·모신 신), 회차를 넘어 남는 기록(결말 컬렉션·추억 앨범·업적·하룻밤 점집 최고 점수), 게임 설정은 기기 안 앱 저장소에만 둡니다. 개발자는 받지 않습니다.</li>
          <li>「명함 공유」는 기기에서 그림을 만들어 운영체제의 공유 화면으로 넘길 뿐이며, 어디로 보낼지는 사용자가 고릅니다. 개발자에게는 공유했다는 이벤트 이름만 옵니다(1번).</li>
          <li>앱은 새 소식과 앱 설정(강제 업데이트·공지)을 joyopi.com에서 읽어 옵니다. 이때 개인정보를 보내지 않습니다.</li>
        </ul>
      ),
    },
    {
      id: 'retention',
      heading: '3. 보유 기간과 파기',
      body: (
        <ul>
          <li>분석 정보(1번): PostHog에 <strong>1년</strong> 보관된 뒤 지워집니다.</li>
          <li>보낸 의견과 답장 받을 이메일: 받은 날부터 <strong>1년</strong> 보관한 뒤 지웁니다. 더 일찍 지우기를 원하면 아래 연락처로 알려 주세요.</li>
          <li>앱을 지우면 기기 안의 게임 진행·기록과 분석용 무작위 값이 함께 지워집니다.</li>
          <li>앱 구매 기록은 Apple·Google이 각자의 방침에 따라 보관합니다.</li>
        </ul>
      ),
    },
    {
      id: 'sharing',
      heading: '4. 제3자 제공과 처리 위탁',
      body: (
        <>
          <p>개발자는 개인정보를 제3자에게 제공하지 않습니다(법령에 따른 적법한 요구는 예외). 아래 일은 다른 회사에 맡깁니다.</p>
          <table>
            <thead>
              <tr><th>받는 자</th><th>맡기는 일</th></tr>
            </thead>
            <tbody>
              <tr><td>PostHog Inc.</td><td>앱 사용 통계와 오류 정보의 저장·분석(1번)</td></tr>
              <tr><td>Vercel Inc.</td><td>의견을 받는 joyopi.com 서버 운영</td></tr>
              <tr><td>Google LLC (Firebase)</td><td>받은 의견 저장(Cloud Firestore, 서울 리전)</td></tr>
              <tr><td>Slack Technologies, LLC</td><td>새 의견을 개발자에게 알림</td></tr>
            </tbody>
          </table>
        </>
      ),
    },
    {
      id: 'overseas',
      heading: '5. 국외 이전',
      body: (
        <>
          <table>
            <tbody>
              <tr><th>받는 자</th><td>PostHog Inc. (미국 회사, <a href={POSTHOG_PRIVACY}>개인정보 처리방침</a>)</td></tr>
              <tr><th>이전 국가</th><td>독일 (PostHog의 EU 데이터센터, 프랑크푸르트)</td></tr>
              <tr><th>이전 항목</th><td>1번 첫 번째 표의 항목</td></tr>
              <tr><th>이전 시기·방법</th><td>앱을 쓰는 때에 암호화된 통신망으로 전송</td></tr>
              <tr><th>이용 목적·보유 기간</th><td>앱 개선·오류 수정, 1년</td></tr>
            </tbody>
          </table>
          <p>
            의견 보내기: 보낸 정보는 Vercel Inc.(미국)의 서버를 거쳐 Google LLC의 Cloud Firestore 서울 리전(대한민국)에 저장되고,
            알림을 위해 의견 내용·분류·답장 이메일·기기 정보가 Slack Technologies, LLC(미국)로 갑니다. 원하지 않으면 의견 보내기
            대신 메일({CONTACT_EMAIL})로 문의할 수 있습니다.
          </p>
        </>
      ),
    },
    {
      id: 'opt-out',
      heading: '6. 분석 수집을 원하지 않을 때',
      body: (
        <ul>
          <li>앱 안에는 분석 전송을 끄는 설정이 없습니다. 원하지 않으면 앱을 쓰지 않거나 지워서 거부할 수 있습니다.</li>
          <li>앱은 인터넷 없이도 플레이할 수 있으며, 연결이 없을 때는 아무것도 보내지 않습니다.</li>
          <li>앱은 쿠키나 광고 식별자를 쓰지 않습니다.</li>
        </ul>
      ),
    },
    {
      id: 'security',
      heading: '7. 안전성 확보 조치',
      body: (
        <ul>
          <li>분석 정보와 의견은 암호화된 연결(TLS)로 보냅니다.</li>
          <li>분석 정보에 접근할 수 있는 사람을 개인정보 보호책임자 한 명으로 제한합니다.</li>
        </ul>
      ),
    },
    {
      id: 'children',
      heading: '8. 어린이',
      body: <p>앱은 13세 미만 어린이를 대상으로 하지 않으며, 누구인지 알 수 있는 정보를 누구에게서도 모으지 않습니다.</p>,
    },
    {
      id: 'rights',
      heading: '9. 이용자의 권리와 문의',
      body: (
        <ul>
          <li>이용자는 개인정보의 열람·정정·삭제·처리 정지를 요구할 수 있습니다. 다만 분석 정보는 기기 무작위 값으로만 묶여 있어 특정 이용자의 것을 찾지 못할 수 있습니다.</li>
          <li>궁금한 점이나 요청은 {mail}로 보내 주세요.</li>
        </ul>
      ),
    },
    {
      id: 'officer',
      heading: '10. 개인정보 보호책임자',
      body: <p>{BUSINESS_INFO.privacyOfficer} ({BUSINESS_INFO.nameKo}), {mail}</p>,
    },
    {
      id: 'changes',
      heading: '11. 방침의 변경',
      body: <p>내용이 바뀌면 이 페이지에 올리고 아래 시행일과 최종 수정일을 고칩니다.</p>,
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: 'Shaman Kim Privacy Policy',
  lead: (
    <p>
      “Shaman Kim” (Korean title 「신내림 받은 김대리」, the “App”) is a story game made by {BUSINESS_INFO.nameEn} (the “Developer”).
      This policy explains what information the App handles.
    </p>
  ),
  notice: (
    <p>
      The App has no sign-up, login, ads, tracking, or in-app purchases, and your game progress stays on your device. The Developer
      only receives usage statistics and error information to improve the App, plus feedback you choose to send from Settings ›
      Send feedback. Your shrine name, in-game choices, and location are never received.
    </p>
  ),
  sections: [
    {
      id: 'collect',
      heading: '1. Information we process and why',
      body: (
        <>
          <p>The App automatically sends the following to our analytics service (PostHog).</p>
          <table>
            <thead><tr><th>Type</th><th>Details</th><th>Purpose</th></tr></thead>
            <tbody>
              <tr><td>Random device value</td><td>A hash of a random value the App creates for analytics only. It changes if you reinstall.</td><td>Counting users and return visits</td></tr>
              <tr><td>Usage</td><td>Opening the App, a usage-time range, and game event names (new game, chapter reached, consultation finished, mini-game skipped, ending reached, rebirth, One-Night Shrine finished, card shared) with one category (e.g. which chapter or ending). Nothing you type is sent.</td><td>Improving the App</td></tr>
              <tr><td>Errors</td><td>Error type, message (typed values masked), and code location</td><td>Fixing bugs</td></tr>
              <tr><td>App info</td><td>App version, OS type (iOS/Android)</td><td>Improvement and fixes</td></tr>
              <tr><td>IP address and approximate location</td><td>The IP address sent automatically when the App connects, and the country/city estimated from it. Location services are not used.</td><td>Regional statistics</td></tr>
            </tbody>
          </table>
          <p>
            Only when you tap “Send” in Settings › Send feedback, the App sends your message, an optional category, an optional reply
            email, device info (app version and build, OS and version, device model, App language), a separate random value, and your IP
            address (stored only as a hash to count submissions) to the joyopi.com server.
          </p>
        </>
      ),
    },
    {
      id: 'device',
      heading: '2. Information stored only on your device',
      body: (
        <ul>
          <li>Game progress, records kept across lives (endings, album, achievements, One-Night Shrine best scores), and settings are stored only on your device.</li>
          <li>“Share card” creates an image on your device and hands it to your OS share sheet; you choose where it goes. The Developer only receives the event name (section 1).</li>
          <li>The App reads news and app settings from joyopi.com without sending personal information.</li>
        </ul>
      ),
    },
    {
      id: 'retention',
      heading: '3. Retention',
      body: (
        <ul>
          <li>Analytics: kept by PostHog for <strong>1 year</strong>, then deleted.</li>
          <li>Feedback and reply email: kept for <strong>1 year</strong> from receipt. Ask us to delete it sooner at any time.</li>
          <li>Deleting the App erases the data on your device. Purchase records are kept by Apple and Google under their policies.</li>
        </ul>
      ),
    },
    {
      id: 'sharing',
      heading: '4. Sharing and processors',
      body: (
        <p>
          We do not provide personal information to third parties, except when lawfully required. Processors: PostHog Inc. (analytics),
          Vercel Inc. (joyopi.com server for feedback), Google LLC – Firebase (feedback storage, Seoul region), Slack Technologies, LLC
          (feedback notifications).
        </p>
      ),
    },
    {
      id: 'overseas',
      heading: '5. International transfers',
      body: (
        <p>
          Analytics are transferred to PostHog’s EU data center in Frankfurt, Germany (<a href={POSTHOG_PRIVACY}>PostHog privacy
          policy</a>) over encrypted connections while you use the App, and kept for 1 year. Feedback passes through Vercel (USA), is
          stored in Firebase Seoul (Korea), and notifications go to Slack (USA). You can email {CONTACT_EMAIL} instead.
        </p>
      ),
    },
    {
      id: 'rights',
      heading: '6. Your choices and rights',
      body: (
        <ul>
          <li>There is no in-app switch for analytics; you can stop by not using or deleting the App. The App sends nothing while offline. No cookies or advertising identifiers are used.</li>
          <li>You may request access, correction, deletion, or restriction of processing (including under the GDPR and CCPA). Analytics are tied only to a random value, so we may not be able to find yours.</li>
          <li>The App is not directed to children under 13.</li>
          <li>Contact: {BUSINESS_INFO.privacyOfficerEn}, {mail}. Korean law governs this policy; if language versions differ, the Korean version prevails.</li>
        </ul>
      ),
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: '神降ろしのキム代理 プライバシーポリシー',
  lead: (
    <p>
      「神降ろしのキム代理」（韓国語名「신내림 받은 김대리」、以下「本アプリ」）は、{BUSINESS_INFO.nameEn}（以下「開発者」）が作った物語ゲームです。
      本ポリシーは、本アプリが扱う情報について説明します。
    </p>
  ),
  notice: (
    <p>
      本アプリには会員登録・ログイン・広告・トラッキング・アプリ内課金はなく、ゲームの進行は端末内にだけ保存されます。開発者が受け取るのは、
      改善のための利用統計とエラー情報、そして利用者が設定 › ご意見を送る から自分で送ったご意見だけです。神堂の名前・ゲーム内の選択・位置情報は受け取りません。
    </p>
  ),
  sections: [
    {
      id: 'collect',
      heading: '1. 取り扱う情報と目的',
      body: (
        <>
          <p>本アプリは次の情報を自動で作成し、分析サービス（PostHog）へ送信します。</p>
          <table>
            <thead><tr><th>区分</th><th>項目</th><th>目的</th></tr></thead>
            <tbody>
              <tr><td>端末のランダム値</td><td>分析専用に端末で作ったランダム値のハッシュ。再インストールで変わります。</td><td>利用者数・再訪の集計</td></tr>
              <tr><td>利用記録</td><td>アプリを開いたこと、利用時間の区分、ゲームの進行イベント名（新しいゲーム、章の到達、相談の完了、ミニゲームのスキップ、エンディング到達、回帰、一夜の占い処の完了、名刺の共有）とその種類一つ（例：何章、どのエンディング）。入力した文章は送信しません。</td><td>アプリの改善</td></tr>
              <tr><td>エラー情報</td><td>エラーの種類、メッセージ（入力値は伏せる）、発生した場所</td><td>不具合の修正</td></tr>
              <tr><td>アプリ情報</td><td>アプリのバージョン、OS の種類</td><td>改善・修正</td></tr>
              <tr><td>IP アドレスとおおよその位置</td><td>通信時に自動で伝わる IP アドレスと、そこから推定した国・都市。位置情報サービスは使いません。</td><td>地域別の統計</td></tr>
            </tbody>
          </table>
          <p>
            設定 › ご意見を送る で「送信」を押したときだけ、ご意見・分類（任意）・返信用メール（任意）・端末情報・ご意見専用のランダム値・IP
            アドレス（ハッシュで送信回数のみ数えます）を joyopi.com のサーバーへ送ります。
          </p>
        </>
      ),
    },
    {
      id: 'device',
      heading: '2. 端末内にだけ保存する情報',
      body: (
        <ul>
          <li>ゲームの進行、周回を越えて残る記録（エンディング・アルバム・実績・一夜の占い処の最高点）、設定は端末内にだけ保存し、開発者は受け取りません。</li>
          <li>「名刺の共有」は端末で画像を作り OS の共有画面へ渡すだけで、送り先は利用者が選びます。開発者にはイベント名だけが届きます。</li>
        </ul>
      ),
    },
    {
      id: 'retention',
      heading: '3. 保存期間',
      body: <p>分析情報は PostHog で<strong>1年</strong>、ご意見と返信用メールは受け取った日から<strong>1年</strong>保存した後に削除します。アプリを削除すると端末内の情報も消えます。</p>,
    },
    {
      id: 'sharing',
      heading: '4. 第三者提供・委託・国外移転',
      body: (
        <p>
          個人情報を第三者に提供しません（法令に基づく適法な要求を除く）。委託先：PostHog Inc.（分析、ドイツ・フランクフルトの EU データセンター、
          <a href={POSTHOG_PRIVACY}>プライバシーポリシー</a>）、Vercel Inc.（米国、ご意見を受けるサーバー）、Google LLC – Firebase（ソウル、ご意見の保存）、
          Slack Technologies, LLC（米国、通知）。
        </p>
      ),
    },
    {
      id: 'rights',
      heading: '5. 利用者の権利とお問い合わせ',
      body: (
        <ul>
          <li>アプリ内に分析を止める設定はありません。使わない・削除することで拒否できます。オフライン時は何も送信しません。</li>
          <li>個人情報の開示・訂正・削除・利用停止を求めることができます。13歳未満を対象としていません。</li>
          <li>お問い合わせ：{mail}。本ポリシーは韓国法に基づき、言語版に違いがある場合は韓国語版が優先します。</li>
        </ul>
      ),
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const DOCS = { ko, en, ja };
const DESCRIPTIONS = {
  ko: '신내림 받은 김대리(무당 이야기 게임) 개인정보 처리방침',
  en: 'Shaman Kim (신내림 받은 김대리) Privacy Policy',
  ja: '神降ろしのキム代理（신내림 받은 김대리）プライバシーポリシー',
};

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/mudang/privacy', { title: DOCS[lang].title, description: DESCRIPTIONS[lang] });
}

export default async function MudangPrivacyPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} slug="mudang" path={`/${lang}/apps/mudang/privacy`} />;
}
