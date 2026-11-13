import type { Metadata } from 'next';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { BUSINESS_INFO, CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 돌보기(Rockgazing / 돌멍타임 / 石の子守り) 개인정보 처리방침.
// 내용 기준: docs/03_앱_스토어_페이지.md 4-1. 앱 기능이 바뀌면 그 표부터 고치고 여기와 날짜를 고친다.
// 2026-11-13: 1.0.0 동작(분석·오류 수집 PostHog, 실제 날씨 WeatherKit, Apple 구매 기록·Google Block Store)에 맞춤. 앱 출시에 맞춰 공개한다.
// 2026-11-13: PostHog가 받는 IP 주소와 그로 추정한 국가·도시, 실제 전송 항목(해시한 기기 값·이벤트 4개·가린 오류 메시지·앱 버전·OS 종류), 상품 이름(앱 화면 문구)을 반영.
const EFFECTIVE_DATE = '2026-11-13';
const UPDATED_DATE = '2026-11-13';


const APPLE_PRIVACY = 'https://www.apple.com/legal/privacy/';
const GOOGLE_PRIVACY = 'https://policies.google.com/privacy';
const POSTHOG_PRIVACY = 'https://posthog.com/privacy';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const ko: DocLocale = {
  lang: 'ko',
  title: '돌멍타임 개인정보 처리방침',
  lead: (
    <p>
      Rockgazing(한국 스토어 이름 「돌멍타임」, 이하 ‘앱’)은 {BUSINESS_INFO.nameKo}({BUSINESS_INFO.nameEn}, 이하 ‘개발자’)가
      만든 앱입니다. 이 문서는 앱이 어떤 정보를 다루는지 알려 드립니다.
    </p>
  ),
  notice: (
    <p>
      앱에는 회원가입·로그인·광고·추적이 없습니다. 개발자가 받는 정보는 앱을 고치고 오류를 바로잡기 위한 사용 통계와 오류
      정보뿐이며, 이름·돌 이름·날씨와 정확한 위치는 받지 않습니다. 통계를 위해 앱이 통신할 때 전달되는 IP 주소로 국가·도시
      수준의 대략적인 위치만 추정합니다.
    </p>
  ),
  sections: [
    {
      id: 'collect',
      heading: '1. 처리하는 정보와 목적',
      body: (
        <>
          <p>
            앱은 아래 정보를 자동으로 만들어 분석 서비스(PostHog)로 보냅니다. 개발자는 이 정보를 PostHog에서 봅니다.
          </p>
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
                <td>기기 무작위 값</td>
                <td>
                  앱이 분석에만 쓰려고 기기에서 만든 무작위 값을 변환(해시)한 값. 다시 설치하면 바뀌고, 다른 정보와 연결하지
                  않습니다.
                </td>
                <td>사용자 수·재방문 세기</td>
              </tr>
              <tr>
                <td>앱 사용 기록</td>
                <td>
                  앱을 연 것, 사용 시간 구간(1분 미만·1~10분·10~60분·60분 이상), 결제 안내를 본 것과 결제를 마친 것(각각 상품
                  종류: 다른 돌 만나기·이름 바꾸기). 가격과 거래 ID는 보내지 않습니다.
                </td>
                <td>앱 개선</td>
              </tr>
              <tr>
                <td>오류 정보</td>
                <td>오류 종류, 오류 메시지(사용자가 입력한 값은 가림), 오류가 난 코드 위치(파일·줄)</td>
                <td>오류 수정</td>
              </tr>
              <tr>
                <td>앱 정보</td>
                <td>앱 버전, 운영체제 종류(iOS·Android)</td>
                <td>앱 개선·오류 수정</td>
              </tr>
              <tr>
                <td>IP 주소와 대략적인 위치</td>
                <td>
                  IP 주소(앱이 통신할 때 자동으로 전달됨)와 그로 추정한 대략적인 위치(국가·도시). 기기의 위치 서비스는 쓰지
                  않습니다.
                </td>
                <td>지역별 사용 통계</td>
              </tr>
            </tbody>
          </table>
          <ul>
            <li>이름·이메일·연락처·광고 식별자·돌에 지어 준 이름·위치 서비스로 얻은 위치·날씨는 보내지 않습니다.</li>
            <li>
              사람별 프로필을 만들지 않고, 다른 회사의 앱·웹사이트 정보와 연결하지 않으며, 광고에 쓰지 않습니다(추적 없음).
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'location',
      heading: '2. 위치 정보 (실제 날씨, iOS)',
      body: (
        <ul>
          <li>
            iOS 앱은 첫 돌의 이름을 지은 뒤 ‘앱을 사용하는 동안’ 위치 권한을 한 번 묻습니다. 허용하면 대략적인 위치로 Apple
            WeatherKit에서 지금 있는 곳의 현재 날씨만 받아 돌 뒤의 배경에 그립니다.
          </li>
          <li>
            위치는 날씨를 받는 데만 쓰고 앱에 저장하지 않으며, 개발자에게 오지 않습니다. 기기에는 받은 날씨 값과 받은 시각만
            저장합니다. 날씨 요청은 <a href={APPLE_PRIVACY}>Apple 개인정보 처리방침</a>에 따라 Apple이 처리합니다.
          </li>
          <li>
            거부해도 앱은 그대로 동작하며, 계절에 맞는 날씨를 앱이 직접 고릅니다. 허용 여부는 기기의 설정 › 개인정보 보호 및
            보안 › 위치 서비스에서 언제든 바꿀 수 있습니다.
          </li>
          <li>Android 앱은 위치를 쓰지 않습니다.</li>
        </ul>
      ),
    },
    {
      id: 'device',
      heading: '3. 기기 안에만 저장하는 정보',
      body: (
        <>
          <p>아래 정보는 사용자의 기기(와 사용자 자신의 Apple·Google 계정)에만 있고, 개발자는 받지 않습니다.</p>
          <table>
            <thead>
              <tr>
                <th>정보</th>
                <th>저장 위치</th>
                <th>목적</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>만난 돌과 돌마다 지어 준 이름, 반영한 결제의 거래 ID</td>
                <td>
                  기기 안 앱 저장소. 다시 설치해도 돌아오도록 iOS는 Keychain에, Android는 Google Block Store에도 둡니다.
                  Android에서 Google 백업이 켜져 있으면 Block Store의 정보가 사용자의 Google 백업(종단 간 암호화)으로 새
                  기기에 옮겨집니다.
                </td>
                <td>내 돌과 이름을 보여 주고, 같은 결제를 두 번 반영하지 않기 위해</td>
              </tr>
              <tr>
                <td>
                  첫 돌을 정하는 값 (iOS: App Store 거래 ID 또는 기기에서 만든 무작위 값, Android: 기기 ID)
                </td>
                <td>기기 안(iOS Keychain, Android Block Store). 해시 계산에만 쓰고 밖으로 보내지 않습니다.</td>
                <td>다시 깔아도 같은 첫 돌을 만나게 하기 위해</td>
              </tr>
              <tr>
                <td>돌을 본 시간 통계</td>
                <td>기기 안 앱 저장소</td>
                <td>기록을 보여 주기 위해</td>
              </tr>
              <tr>
                <td>받은 날씨 값과 받은 시각 (iOS)</td>
                <td>기기 안 앱 저장소</td>
                <td>날씨를 60분 동안 다시 쓰기 위해</td>
              </tr>
              <tr>
                <td>분석용 기기 무작위 값</td>
                <td>기기 안 앱 저장소</td>
                <td>1번의 분석에 쓰기 위해</td>
              </tr>
            </tbody>
          </table>
          <p>
            iOS에서 새 기기로 옮기면, 만난 돌은 사용자의 Apple 구매 기록으로 되살립니다. 돌의 이름은 기기에만 남으므로 새
            기기에서는 첫 이름을 다시 짓습니다.
          </p>
        </>
      ),
    },
    {
      id: 'payment',
      heading: '4. 결제',
      body: (
        <p>
          앱 내 구입(다른 돌 만나기, 이름 바꾸기)은 Apple App Store 또는 Google Play가 처리합니다. 개발자는 카드 번호 등 결제 정보를
          받지 않으며, 앱은 스토어가 알려 주는 거래 기록만 기기 안에서 확인합니다. 분석으로는 결제를 마친 상품의 종류만
          보냅니다(1번). 결제 정보는 각 회사의 방침을 따릅니다: <a href={APPLE_PRIVACY}>Apple 개인정보 처리방침</a>,{' '}
          <a href={GOOGLE_PRIVACY}>Google 개인정보처리방침</a>.
        </p>
      ),
    },
    {
      id: 'retention',
      heading: '5. 보유 기간과 파기',
      body: (
        <ul>
          <li>
            분석 정보(1번): PostHog에 <strong>1년</strong> 보관된 뒤 지워집니다. 개발자는 전자 파일만 다루며, 복구할 수 없게
            지웁니다. 종이 문서는 만들지 않습니다.
          </li>
          <li>앱을 지우면 앱 저장소에 있던 정보와 분석용 기기 무작위 값이 함께 지워집니다.</li>
          <li>
            iOS의 Keychain에 둔 정보(만난 돌, 이름, 첫 돌 값)는 앱을 지워도 그 기기에 남아 다시 깔면 돌아옵니다. 기기를
            초기화(설정 › 일반 › 전송 또는 iPhone 재설정 › 모든 콘텐츠 및 설정 지우기)하면 지워집니다.
          </li>
          <li>
            Android의 Block Store에 둔 정보는 같은 기기에서 다시 깔면 돌아옵니다. 기기를 초기화하면 지워지고, Google 백업에
            들어간 것은 사용자의 Google 계정에서 기기 백업을 지우면 지워집니다.
          </li>
          <li>결제 기록은 Apple·Google이 각자의 방침에 따라 보관합니다.</li>
        </ul>
      ),
    },
    {
      id: 'sharing',
      heading: '6. 제3자 제공과 처리 위탁',
      body: (
        <>
          <p>
            개발자는 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 따라 수사기관 등이 적법한 절차로 요구하는 경우는
            예외입니다. 아래 일은 다른 회사에 맡깁니다.
          </p>
          <table>
            <thead>
              <tr>
                <th>받는 자</th>
                <th>맡기는 일</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PostHog Inc.</td>
                <td>앱 사용 통계와 오류 정보의 저장·분석(1번)</td>
              </tr>
            </tbody>
          </table>
          <p>결제는 Apple App Store, Google Play가 각자의 방침에 따라 처리합니다.</p>
        </>
      ),
    },
    {
      id: 'overseas',
      heading: '7. 국외 이전',
      body: (
        <>
          <table>
            <tbody>
              <tr>
                <th>받는 자</th>
                <td>PostHog Inc. (미국 회사, <a href={POSTHOG_PRIVACY}>개인정보 처리방침</a>)</td>
              </tr>
              <tr>
                <th>이전 국가</th>
                <td>독일 (PostHog의 EU 데이터센터, 프랑크푸르트)</td>
              </tr>
              <tr>
                <th>이전 항목</th>
                <td>
                  기기 무작위 값(해시), 앱 사용 기록, 오류 정보, 앱 정보, IP 주소와 그로 추정한 대략적인 위치(국가·도시) (1번 표)
                </td>
              </tr>
              <tr>
                <th>이전 시기·방법</th>
                <td>앱을 쓰는 때에 암호화된 통신망으로 전송</td>
              </tr>
              <tr>
                <th>이용 목적</th>
                <td>앱 개선, 오류 수정</td>
              </tr>
              <tr>
                <th>보유 기간</th>
                <td>1년 (PostHog 보관 기간이 지나면 지워짐)</td>
              </tr>
            </tbody>
          </table>
          <p>국외 이전을 원하지 않을 때는 8번을 보세요.</p>
        </>
      ),
    },
    {
      id: 'opt-out',
      heading: '8. 분석 수집을 원하지 않을 때',
      body: (
        <ul>
          <li>앱 안에는 분석 전송을 끄는 설정이 없습니다. 원하지 않으면 앱을 쓰지 않거나 지워서 거부할 수 있습니다.</li>
          <li>
            앱을 지우면 기기 무작위 값이 사라지고, 다시 설치하면 새 값이 만들어집니다. 이미 보낸 정보는 이 값으로만 묶여 있어
            개발자도 누구의 것인지 알 수 없으며, 1년 뒤 지워집니다.
          </li>
          <li>앱은 쿠키나 광고 식별자를 쓰지 않습니다.</li>
        </ul>
      ),
    },
    {
      id: 'security',
      heading: '9. 안전성 확보 조치',
      body: (
        <ul>
          <li>분석 정보는 암호화된 연결(TLS)로 보냅니다.</li>
          <li>사용자가 입력한 내용(돌 이름)과 위치 서비스로 얻은 위치는 보내지 않습니다.</li>
          <li>분석 정보에 접근할 수 있는 사람을 개인정보 보호책임자 한 명으로 제한합니다.</li>
        </ul>
      ),
    },
    {
      id: 'children',
      heading: '10. 어린이',
      body: (
        <p>
          앱은 13세 미만 어린이를 대상으로 하지 않으며, 이름·연락처처럼 누구인지 알 수 있는 정보를 누구에게서도 모으지
          않습니다.
        </p>
      ),
    },
    {
      id: 'rights',
      heading: '11. 이용자의 권리와 문의',
      body: (
        <ul>
          <li>기기 안의 정보는 기기에서 직접 보고, 고치고, 지울 수 있습니다(5번).</li>
          <li>
            이용자는 개인정보의 열람·정정·삭제·처리 정지를 요구할 수 있습니다. 다만 분석 정보는 기기 무작위 값으로만 묶여 있어
            개발자가 특정 이용자의 것을 찾지 못할 수 있습니다.
          </li>
          <li>궁금한 점이나 요청은 {mail}로 보내 주세요.</li>
        </ul>
      ),
    },
    {
      id: 'officer',
      heading: '12. 개인정보 보호책임자',
      body: (
        <p>
          {BUSINESS_INFO.privacyOfficer} ({BUSINESS_INFO.nameKo}), {mail}
        </p>
      ),
    },
    {
      id: 'changes',
      heading: '13. 방침의 변경',
      body: <p>내용이 바뀌면 이 페이지에 올리고 아래 시행일과 최종 수정일을 고칩니다.</p>,
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: 'Rockgazing Privacy Policy',
  lead: (
    <p>
      Rockgazing (the “app”) is made by {BUSINESS_INFO.nameEn} (the “developer”). This policy explains what information the
      app handles.
    </p>
  ),
  notice: (
    <p>
      There is no sign-up, login, advertising, or tracking. The only information the developer receives is usage
      statistics and error reports used to improve the app and fix bugs. The developer never receives your name, your
      stone’s name, your weather, or your precise location. For statistics, only an approximate country- and city-level
      location is estimated from the IP address that is passed along when the app communicates.
    </p>
  ),
  sections: [
    {
      id: 'collect',
      heading: '1. Information we process, and why',
      body: (
        <>
          <p>
            The app automatically creates the following information and sends it to an analytics service (PostHog). The
            developer views it in PostHog.
          </p>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Items</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Random device value</td>
                <td>
                  A hashed form of a random value the app creates on your device for analytics only. It changes when you
                  reinstall the app and is not linked to any other information.
                </td>
                <td>Counting users and return visits</td>
              </tr>
              <tr>
                <td>App usage</td>
                <td>
                  Opening the app, a usage-time range (under 1 min, 1–10 min, 10–60 min, over 60 min), viewing a purchase
                  screen and completing a purchase (each with the product type: Meet another stone, Rename). Prices and
                  transaction IDs are not sent.
                </td>
                <td>Improving the app</td>
              </tr>
              <tr>
                <td>Error information</td>
                <td>Error type, error message (with anything you typed masked), and where in the code it happened (file and line)</td>
                <td>Fixing bugs</td>
              </tr>
              <tr>
                <td>App information</td>
                <td>App version, operating system type (iOS or Android)</td>
                <td>Improving the app and fixing bugs</td>
              </tr>
              <tr>
                <td>IP address and approximate location</td>
                <td>
                  IP address (passed along automatically when the app communicates) and the approximate location estimated
                  from it (country and city). Your device’s location services are not used for this.
                </td>
                <td>Usage statistics by region</td>
              </tr>
            </tbody>
          </table>
          <ul>
            <li>
              Your name, email, contacts, advertising identifier, the names you give your stones, location from location
              services, and the weather are not sent.
            </li>
            <li>
              No per-person profiles are built, the data is not combined with data from other companies’ apps or websites,
              and it is not used for advertising (no tracking).
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'location',
      heading: '2. Location (live weather, iOS)',
      body: (
        <ul>
          <li>
            After you name your first stone, the iOS app asks once for location access “While Using the App.” If you
            allow it, the app uses your approximate location to get only the current weather where you are from Apple
            WeatherKit, and draws it behind your stone.
          </li>
          <li>
            Your location is used only to get the weather. It is not stored by the app and is never sent to the developer.
            Only the weather received and the time it was received are stored on the device. Weather requests are handled
            by Apple under the <a href={APPLE_PRIVACY}>Apple Privacy Policy</a>.
          </li>
          <li>
            If you decline, the app works as usual and picks weather that fits the season. You can change this at any time
            in Settings › Privacy &amp; Security › Location Services.
          </li>
          <li>The Android app does not use location.</li>
        </ul>
      ),
    },
    {
      id: 'device',
      heading: '3. Information kept only on your device',
      body: (
        <>
          <p>
            The following stays on your device (and in your own Apple or Google account). The developer does not receive
            it.
          </p>
          <table>
            <thead>
              <tr>
                <th>Information</th>
                <th>Where it is stored</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>The stones you have met, the name you gave each one, and the IDs of purchases already applied</td>
                <td>
                  App storage on the device. So that it comes back after reinstalling, it is also kept in the Keychain on
                  iOS and in Google Block Store on Android. On Android, if Google backup is on, the Block Store data moves
                  to a new device through your Google backup (end-to-end encrypted).
                </td>
                <td>To show your stones and names, and to avoid applying the same purchase twice</td>
              </tr>
              <tr>
                <td>
                  The value that decides your first stone (iOS: an App Store transaction ID or a random value created on
                  the device; Android: a device ID)
                </td>
                <td>
                  On the device (iOS Keychain, Android Block Store). It is only used to compute a hash and is never sent
                  anywhere.
                </td>
                <td>So that you meet the same first stone after reinstalling</td>
              </tr>
              <tr>
                <td>Viewing-time statistics</td>
                <td>App storage on the device</td>
                <td>To show your records</td>
              </tr>
              <tr>
                <td>The weather received and when it was received (iOS)</td>
                <td>App storage on the device</td>
                <td>To reuse the weather for 60 minutes</td>
              </tr>
              <tr>
                <td>The random device value for analytics</td>
                <td>App storage on the device</td>
                <td>For the analytics in section 1</td>
              </tr>
            </tbody>
          </table>
          <p>
            When you move to a new iOS device, the stones you have met are restored from your Apple purchase history. Stone
            names stay only on the old device, so you name your first stone again on the new one.
          </p>
        </>
      ),
    },
    {
      id: 'payment',
      heading: '4. Purchases',
      body: (
        <p>
          In-app purchases (Meet another stone, Rename) are processed by the Apple App Store or Google Play. The developer does
          not receive card numbers or other payment details; the app only checks the transaction records provided by the
          store, on your device. Analytics only receive the type of product purchased (section 1). Payment information is
          handled under each company’s policy: <a href={APPLE_PRIVACY}>Apple Privacy Policy</a>,{' '}
          <a href={GOOGLE_PRIVACY}>Google Privacy Policy</a>.
        </p>
      ),
    },
    {
      id: 'retention',
      heading: '5. Retention and deletion',
      body: (
        <ul>
          <li>
            Analytics information (section 1) is kept in PostHog for <strong>one year</strong> and then deleted. The
            developer handles it only as electronic data and deletes it so that it cannot be recovered. No paper records
            are made.
          </li>
          <li>Deleting the app deletes the information in its app storage, including the random device value for analytics.</li>
          <li>
            On iOS, the information kept in the Keychain (stones met, names, the first-stone value) remains on that device
            after the app is deleted and returns when you reinstall. It is erased when you erase the device (Settings ›
            General › Transfer or Reset iPhone › Erase All Content and Settings).
          </li>
          <li>
            On Android, the information in Block Store returns when you reinstall on the same device. It is erased when you
            reset the device, and what went into your Google backup is deleted when you delete the device backup from your
            Google account.
          </li>
          <li>Purchase records are kept by Apple and Google under their own policies.</li>
        </ul>
      ),
    },
    {
      id: 'sharing',
      heading: '6. Sharing and service providers',
      body: (
        <>
          <p>
            The developer does not provide personal information to third parties, except when required by law through
            proper legal process. The following work is entrusted to another company.
          </p>
          <table>
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Work entrusted</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PostHog Inc.</td>
                <td>Storing and analyzing usage statistics and error information (section 1)</td>
              </tr>
            </tbody>
          </table>
          <p>Purchases are processed by the Apple App Store and Google Play under their own policies.</p>
        </>
      ),
    },
    {
      id: 'overseas',
      heading: '7. International transfer',
      body: (
        <>
          <table>
            <tbody>
              <tr>
                <th>Recipient</th>
                <td>PostHog Inc. (a US company, <a href={POSTHOG_PRIVACY}>privacy policy</a>)</td>
              </tr>
              <tr>
                <th>Country</th>
                <td>Germany (PostHog’s EU data center, Frankfurt)</td>
              </tr>
              <tr>
                <th>Items</th>
                <td>
                  Random device value (hashed), app usage, error information, app information, IP address and the approximate
                  location estimated from it (country and city) (table in section 1)
                </td>
              </tr>
              <tr>
                <th>When and how</th>
                <td>Sent over an encrypted connection while you use the app</td>
              </tr>
              <tr>
                <th>Purpose</th>
                <td>Improving the app, fixing bugs</td>
              </tr>
              <tr>
                <th>Retention</th>
                <td>One year (deleted when PostHog’s retention period ends)</td>
              </tr>
            </tbody>
          </table>
          <p>If you do not want this transfer, see section 8.</p>
        </>
      ),
    },
    {
      id: 'opt-out',
      heading: '8. If you do not want analytics',
      body: (
        <ul>
          <li>
            There is no in-app setting to turn analytics off. If you do not want it, you can refuse by not using the app or
            by deleting it.
          </li>
          <li>
            Deleting the app removes the random device value, and a new one is created if you reinstall. Data already sent
            is tied only to that value, so even the developer cannot tell whose it is, and it is deleted after one year.
          </li>
          <li>The app does not use cookies or advertising identifiers.</li>
        </ul>
      ),
    },
    {
      id: 'security',
      heading: '9. Security measures',
      body: (
        <ul>
          <li>Analytics information is sent over an encrypted connection (TLS).</li>
          <li>What you type (stone names) and location from location services are never sent.</li>
          <li>Access to analytics information is limited to one person, the privacy officer.</li>
        </ul>
      ),
    },
    {
      id: 'children',
      heading: '10. Children',
      body: (
        <p>
          The app is not directed to children under 13, and it does not collect information that identifies anyone, such
          as names or contact details.
        </p>
      ),
    },
    {
      id: 'rights',
      heading: '11. Your rights and contact',
      body: (
        <ul>
          <li>You can view, change, or delete the information on your device yourself (section 5).</li>
          <li>
            You may ask to access, correct, delete, or stop the processing of your personal information. Because analytics
            information is tied only to a random device value, the developer may not be able to find the data that belongs
            to a particular person.
          </li>
          <li>For questions or requests, email {mail}.</li>
        </ul>
      ),
    },
    {
      id: 'officer',
      heading: '12. Privacy officer',
      body: (
        <p>
          {BUSINESS_INFO.privacyOfficerEn} ({BUSINESS_INFO.nameEn}), {mail}
        </p>
      ),
    },
    {
      id: 'changes',
      heading: '13. Changes to this policy',
      body: <p>If this policy changes, we will post it on this page and update the dates below.</p>,
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: '石の子守り プライバシーポリシー',
  lead: (
    <p>
      Rockgazing（日本のストア名「石の子守り」、以下「本アプリ」）は {BUSINESS_INFO.nameEn}
      （以下「開発者」）が提供するアプリです。本アプリが扱う情報についてご説明します。
    </p>
  ),
  notice: (
    <p>
      本アプリには会員登録・ログイン・広告・トラッキングはありません。開発者が受け取るのは、アプリの改善と不具合の修正のための利用統計とエラー情報だけで、氏名・石の名前・天気と正確な位置情報は受け取りません。統計のため、アプリが通信するときに伝わる IP アドレスから国・都市レベルのおおよその位置だけを推定します。
    </p>
  ),
  sections: [
    {
      id: 'collect',
      heading: '1. 取り扱う情報と目的',
      body: (
        <>
          <p>本アプリは以下の情報を自動で作成し、分析サービス（PostHog）に送信します。開発者はこの情報を PostHog で確認します。</p>
          <table>
            <thead>
              <tr>
                <th>区分</th>
                <th>項目</th>
                <th>目的</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>端末のランダム値</td>
                <td>本アプリが分析のためだけに端末で作るランダムな値を変換（ハッシュ化）した値。再インストールすると変わり、ほかの情報とは結びつけません。</td>
                <td>利用者数・再訪問の集計</td>
              </tr>
              <tr>
                <td>アプリの利用記録</td>
                <td>
                  アプリを開いたこと、利用時間の区分（1 分未満・1〜10 分・10〜60 分・60 分以上）、購入の案内を見たことと購入を完了したこと（それぞれ商品の種類：ほかの石に出会う・名前を変える）。価格と取引
                  ID は送信しません。
                </td>
                <td>アプリの改善</td>
              </tr>
              <tr>
                <td>エラー情報</td>
                <td>エラーの種類、エラーメッセージ（利用者が入力した値は伏せる）、エラーが起きたコードの位置（ファイル・行）</td>
                <td>不具合の修正</td>
              </tr>
              <tr>
                <td>アプリ情報</td>
                <td>アプリのバージョン、OS の種類（iOS・Android）</td>
                <td>アプリの改善・不具合の修正</td>
              </tr>
              <tr>
                <td>IP アドレスとおおよその位置</td>
                <td>
                  IP アドレス（アプリが通信するときに自動で伝わる）と、そこから推定したおおよその位置（国・都市）。端末の位置情報サービスは使いません。
                </td>
                <td>地域別の利用統計</td>
              </tr>
            </tbody>
          </table>
          <ul>
            <li>氏名・メールアドレス・連絡先・広告識別子・石につけた名前・位置情報サービスで得た位置情報・天気は送信しません。</li>
            <li>
              個人ごとのプロフィールは作らず、他社のアプリやウェブサイトの情報と結びつけず、広告にも使いません（トラッキングなし）。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'location',
      heading: '2. 位置情報（実際の天気、iOS）',
      body: (
        <ul>
          <li>
            iOS
            版は、最初の石に名前をつけた後に「Appの使用中は許可」の位置情報の許可を一度だけお願いします。許可すると、おおよその位置を使って
            Apple WeatherKit から今いる場所の現在の天気だけを受け取り、石の後ろの背景に描きます。
          </li>
          <li>
            位置情報は天気を受け取るためだけに使い、本アプリには保存せず、開発者にも届きません。端末には受け取った天気の値と受け取った時刻だけを保存します。天気の取得は{' '}
            <a href={APPLE_PRIVACY}>Apple プライバシーポリシー</a>に従って Apple が処理します。
          </li>
          <li>
            許可しなくても本アプリはそのまま使え、季節に合った天気を本アプリが選びます。許可は端末の 設定 › プライバシーとセキュリティ ›
            位置情報サービス でいつでも変更できます。
          </li>
          <li>Android 版は位置情報を使いません。</li>
        </ul>
      ),
    },
    {
      id: 'device',
      heading: '3. 端末内にのみ保存する情報',
      body: (
        <>
          <p>以下の情報は利用者の端末（と利用者自身の Apple・Google アカウント）にのみあり、開発者は受け取りません。</p>
          <table>
            <thead>
              <tr>
                <th>情報</th>
                <th>保存場所</th>
                <th>目的</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>出会った石と石ごとにつけた名前、反映済みの購入の取引 ID</td>
                <td>
                  端末内のアプリ保存領域。再インストール後も戻るように、iOS では Keychain、Android では Google Block Store
                  にも保存します。Android で Google バックアップが有効な場合、Block Store の情報は利用者の Google
                  バックアップ（エンドツーエンド暗号化）で新しい端末に移ります。
                </td>
                <td>利用者の石と名前を表示し、同じ購入を二度反映しないため</td>
              </tr>
              <tr>
                <td>
                  最初の石を決める値（iOS：App Store の取引 ID または端末で生成した乱数、Android：端末 ID）
                </td>
                <td>端末内（iOS Keychain、Android Block Store）。ハッシュの計算にのみ使い、外部には送信しません。</td>
                <td>再インストールしても同じ最初の石に出会えるようにするため</td>
              </tr>
              <tr>
                <td>石を見た時間の統計</td>
                <td>端末内のアプリ保存領域</td>
                <td>記録を表示するため</td>
              </tr>
              <tr>
                <td>受け取った天気の値と受け取った時刻（iOS）</td>
                <td>端末内のアプリ保存領域</td>
                <td>天気を 60 分間再利用するため</td>
              </tr>
              <tr>
                <td>分析用の端末のランダム値</td>
                <td>端末内のアプリ保存領域</td>
                <td>1 項の分析に使うため</td>
              </tr>
            </tbody>
          </table>
          <p>
            iOS で新しい端末に移ると、出会った石は利用者の Apple の購入履歴から復元します。石の名前は元の端末にのみ残るため、新しい端末では最初の名前をもう一度つけます。
          </p>
        </>
      ),
    },
    {
      id: 'payment',
      heading: '4. 購入',
      body: (
        <p>
          アプリ内課金（ほかの石に出会う、名前を変える）は Apple App Store または Google Play
          が処理します。開発者はカード番号などの決済情報を受け取らず、本アプリはストアから提供される取引記録を端末内で確認するだけです。分析には購入が完了した商品の種類だけを送信します（1
          項）。決済情報は各社のポリシーに従います：
          <a href={APPLE_PRIVACY}>Apple プライバシーポリシー</a>、<a href={GOOGLE_PRIVACY}>Google プライバシーポリシー</a>。
        </p>
      ),
    },
    {
      id: 'retention',
      heading: '5. 保管期間と削除',
      body: (
        <ul>
          <li>
            分析情報（1 項）：PostHog に<strong>1 年間</strong>
            保管された後、削除されます。開発者は電子データとしてのみ扱い、復元できないように削除します。紙の書類は作りません。
          </li>
          <li>アプリを削除すると、アプリ保存領域の情報と分析用の端末のランダム値も削除されます。</li>
          <li>
            iOS の Keychain
            に保存した情報（出会った石、名前、最初の石を決める値）はアプリを削除してもその端末に残り、再インストールすると元に戻ります。端末を初期化（設定
            › 一般 › 転送または iPhone をリセット › すべてのコンテンツと設定を消去）すると削除されます。
          </li>
          <li>
            Android の Block Store
            の情報は、同じ端末で再インストールすると元に戻ります。端末を初期化すると削除され、Google バックアップに入ったものは利用者の Google
            アカウントで端末のバックアップを削除すると削除されます。
          </li>
          <li>購入記録は Apple・Google が各社のポリシーに従って保管します。</li>
        </ul>
      ),
    },
    {
      id: 'sharing',
      heading: '6. 第三者提供と業務委託',
      body: (
        <>
          <p>
            開発者は個人情報を第三者に提供しません。ただし、法令に基づき捜査機関などが適法な手続きで求める場合は除きます。以下の業務はほかの会社に委託します。
          </p>
          <table>
            <thead>
              <tr>
                <th>委託先</th>
                <th>委託する業務</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PostHog Inc.</td>
                <td>利用統計とエラー情報の保存・分析（1 項）</td>
              </tr>
            </tbody>
          </table>
          <p>購入は Apple App Store、Google Play が各社のポリシーに従って処理します。</p>
        </>
      ),
    },
    {
      id: 'overseas',
      heading: '7. 国外移転',
      body: (
        <>
          <table>
            <tbody>
              <tr>
                <th>移転先</th>
                <td>PostHog Inc.（米国の会社、<a href={POSTHOG_PRIVACY}>プライバシーポリシー</a>）</td>
              </tr>
              <tr>
                <th>移転先の国</th>
                <td>ドイツ（PostHog の EU データセンター、フランクフルト）</td>
              </tr>
              <tr>
                <th>移転する項目</th>
                <td>
                  端末のランダム値（ハッシュ化）、アプリの利用記録、エラー情報、アプリ情報、IP アドレスとそこから推定したおおよその位置（国・都市）（1
                  項の表）
                </td>
              </tr>
              <tr>
                <th>移転の時期・方法</th>
                <td>アプリの利用時に暗号化された通信で送信</td>
              </tr>
              <tr>
                <th>利用目的</th>
                <td>アプリの改善、不具合の修正</td>
              </tr>
              <tr>
                <th>保管期間</th>
                <td>1 年（PostHog の保管期間が過ぎると削除）</td>
              </tr>
            </tbody>
          </table>
          <p>国外移転を望まない場合は 8 項をご覧ください。</p>
        </>
      ),
    },
    {
      id: 'opt-out',
      heading: '8. 分析を望まない場合',
      body: (
        <ul>
          <li>本アプリには分析の送信を止める設定はありません。望まない場合は、本アプリを使わないか削除することで拒否できます。</li>
          <li>
            アプリを削除すると端末のランダム値は消え、再インストールすると新しい値が作られます。送信済みの情報はこの値だけで結びついているため開発者にも誰のものかわからず、1
            年後に削除されます。
          </li>
          <li>本アプリは Cookie や広告識別子を使いません。</li>
        </ul>
      ),
    },
    {
      id: 'security',
      heading: '9. 安全管理措置',
      body: (
        <ul>
          <li>分析情報は暗号化された通信（TLS）で送信します。</li>
          <li>利用者が入力した内容（石の名前）と位置情報サービスで得た位置情報は送信しません。</li>
          <li>分析情報にアクセスできるのは個人情報保護責任者 1 名に限ります。</li>
        </ul>
      ),
    },
    {
      id: 'children',
      heading: '10. お子様について',
      body: (
        <p>
          本アプリは 13 歳未満のお子様を対象としておらず、氏名や連絡先など個人を特定できる情報をどなたからも収集しません。
        </p>
      ),
    },
    {
      id: 'rights',
      heading: '11. 利用者の権利とお問い合わせ',
      body: (
        <ul>
          <li>端末内の情報は、端末上でご自身で閲覧・訂正・削除できます（5 項）。</li>
          <li>
            利用者は個人情報の開示・訂正・削除・利用停止を求めることができます。ただし、分析情報は端末のランダム値だけで結びついているため、開発者が特定の利用者の情報を見つけられない場合があります。
          </li>
          <li>ご質問やご要望は {mail} までお送りください。</li>
        </ul>
      ),
    },
    {
      id: 'officer',
      heading: '12. 個人情報保護責任者',
      body: (
        <p>
          {BUSINESS_INFO.privacyOfficerEn}（{BUSINESS_INFO.nameEn}）、{mail}
        </p>
      ),
    },
    {
      id: 'changes',
      heading: '13. ポリシーの変更',
      body: <p>内容を変更した場合は、このページに掲載し、下記の施行日と最終更新日を更新します。</p>,
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const DOCS = { ko, en, ja };
const DESCRIPTIONS = {
  ko: 'Rockgazing(돌멍타임 / 石の子守り) 개인정보 처리방침',
  en: 'Rockgazing (돌멍타임 / 石の子守り) Privacy Policy',
  ja: '石の子守り（Rockgazing / 돌멍타임）プライバシーポリシー',
};

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/rockgazing/privacy', { title: DOCS[lang].title, description: DESCRIPTIONS[lang] });
}

export default async function RockgazingPrivacyPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} />;
}
