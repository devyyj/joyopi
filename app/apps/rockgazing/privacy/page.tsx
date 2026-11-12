import type { Metadata } from 'next';
import DocPage, { type DocLocale } from '../../_components/doc-page';
import { BUSINESS_INFO, CONTACT_EMAIL } from '../../_lib/business-info';

// 돌보기(Rockgazing / 돌멍타임 / 石の子守り) 개인정보 처리방침.
// 내용 기준: docs/03_앱_스토어_페이지.md 4-1. 앱 기능이 바뀌면 그 표부터 고치고 여기와 날짜를 고친다.
const EFFECTIVE_DATE = '2026-11-12';
const UPDATED_DATE = '2026-11-12';

export const metadata: Metadata = {
  title: 'Rockgazing 개인정보 처리방침',
  description: 'Rockgazing(돌멍타임 / 石の子守り) 개인정보 처리방침 · Privacy Policy · プライバシーポリシー',
};

const APPLE_PRIVACY = 'https://www.apple.com/legal/privacy/';
const GOOGLE_PRIVACY = 'https://policies.google.com/privacy';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const ko: DocLocale = {
  lang: 'ko',
  title: 'Rockgazing 개인정보 처리방침',
  lead: (
    <p>
      Rockgazing(한국 스토어 이름 「돌멍타임」, 이하 ‘앱’)은 {BUSINESS_INFO.nameKo}({BUSINESS_INFO.nameEn})가 만든 앱입니다. 이
      문서는 앱이 어떤 정보를 다루는지 알려 드립니다.
    </p>
  ),
  notice: <p>앱에는 개발자 서버로 보내는 개인정보가 없습니다. 회원가입·로그인·광고·추적·분석 도구가 없습니다.</p>,
  sections: [
    {
      id: 'collect',
      heading: '1. 개발자가 받는 개인정보',
      body: (
        <p>
          없습니다. 앱은 개발자 서버와 통신하지 않으며, 이름·이메일·위치·연락처·광고 식별자 같은 정보를 모으거나 밖으로 보내지
          않습니다.
        </p>
      ),
    },
    {
      id: 'device',
      heading: '2. 기기 안에 저장하는 정보와 목적',
      body: (
        <>
          <p>아래 정보는 사용자의 기기 안에만 저장되며 개발자는 받지 않습니다.</p>
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
                <td>돌에 지어 준 이름, 만난 돌, 돌을 본 시간 통계</td>
                <td>기기 안 앱 저장소. iOS에서는 Keychain에도 두어, 앱을 지웠다 다시 깔아도 같은 기기에서 돌아옵니다.</td>
                <td>내 돌과 기록을 보여 주기 위해</td>
              </tr>
              <tr>
                <td>첫 돌을 정하는 값 (iOS: App Store 거래 ID 또는 기기에서 만든 무작위 값, Android: 기기 ID)</td>
                <td>기기 안. 해시 계산에만 쓰고 밖으로 보내지 않습니다.</td>
                <td>다시 깔아도 같은 첫 돌을 만나게 하기 위해</td>
              </tr>
            </tbody>
          </table>
          <p>
            앞으로 iCloud 동기화를 넣으면 위 정보가 사용자의 iCloud(Apple)에 저장됩니다. 이때도 개발자는 받지 않으며, 넣을 때 이
            문서를 고쳐 알립니다.
          </p>
        </>
      ),
    },
    {
      id: 'payment',
      heading: '3. 결제',
      body: (
        <p>
          앱 내 구입(돌 만나기, 이름 바꾸기)은 Apple App Store 또는 Google Play가 처리합니다. 개발자는 카드 번호 등 결제 정보를
          받지 않으며, 앱은 스토어가 알려 주는 거래 기록만 기기 안에서 확인합니다. 결제 정보는 각 회사의 방침을 따릅니다:{' '}
          <a href={APPLE_PRIVACY}>Apple 개인정보 처리방침</a>, <a href={GOOGLE_PRIVACY}>Google 개인정보처리방침</a>.
        </p>
      ),
    },
    {
      id: 'sharing',
      heading: '4. 제3자 제공과 국외 이전',
      body: <p>개발자가 받는 개인정보가 없으므로 제3자에게 제공하거나 국외로 이전하는 정보도 없습니다.</p>,
    },
    {
      id: 'deletion',
      heading: '5. 보관과 삭제',
      body: (
        <ul>
          <li>앱을 지우면 앱 저장소에 있던 정보가 함께 지워집니다.</li>
          <li>
            iOS의 Keychain에 둔 정보(돌 이름, 만난 돌, 통계)는 앱을 지워도 그 기기에 남아, 다시 깔면 돌아옵니다. 이 정보는 기기
            밖으로 나가지 않으며, 기기를 초기화(설정 › 일반 › 전송 또는 iPhone 재설정 › 모든 콘텐츠 및 설정 지우기)하면
            지워집니다.
          </li>
          <li>iCloud 동기화를 넣은 뒤에는 설정 › Apple 계정 › iCloud › 저장 공간 관리에서 앱 데이터를 지울 수 있습니다.</li>
        </ul>
      ),
    },
    {
      id: 'children',
      heading: '6. 어린이',
      body: <p>앱은 13세 미만 어린이를 대상으로 하지 않으며, 누구의 개인정보도 모으지 않습니다.</p>,
    },
    {
      id: 'rights',
      heading: '7. 이용자의 권리와 문의',
      body: (
        <p>
          정보가 기기 안에만 있으므로 열람·정정·삭제는 기기에서 직접 할 수 있습니다(5번). 궁금한 점이나 요청은 {mail}로 보내
          주세요.
        </p>
      ),
    },
    {
      id: 'officer',
      heading: '8. 개인정보 보호책임자',
      body: (
        <p>
          {BUSINESS_INFO.privacyOfficer} ({BUSINESS_INFO.nameKo}), {mail}
        </p>
      ),
    },
    {
      id: 'changes',
      heading: '9. 방침의 변경',
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
      Rockgazing (the “app”) is made by {BUSINESS_INFO.nameEn}. This policy explains what information the app handles.
    </p>
  ),
  notice: (
    <p>
      The app sends no personal information to the developer. There is no sign-up, login, advertising, tracking, or
      analytics.
    </p>
  ),
  sections: [
    {
      id: 'collect',
      heading: '1. Personal information the developer receives',
      body: (
        <p>
          None. The app does not communicate with any developer server, and it does not collect or transmit your name,
          email, location, contacts, advertising identifier, or similar data.
        </p>
      ),
    },
    {
      id: 'device',
      heading: '2. Information stored on your device, and why',
      body: (
        <>
          <p>The following stays on your device only. The developer does not receive it.</p>
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
                <td>The names you give your stones, the stones you have met, and viewing-time statistics</td>
                <td>
                  App storage on the device. On iOS it is also kept in the Keychain, so it comes back on the same device
                  after you reinstall the app.
                </td>
                <td>To show your stones and records</td>
              </tr>
              <tr>
                <td>
                  The value that decides your first stone (iOS: an App Store transaction ID or a random value created on
                  the device; Android: a device ID)
                </td>
                <td>On the device. It is only used to compute a hash and is never sent anywhere.</td>
                <td>So that you meet the same first stone after reinstalling</td>
              </tr>
            </tbody>
          </table>
          <p>
            If iCloud sync is added in the future, this information will be stored in your own iCloud (Apple). The
            developer still will not receive it, and this policy will be updated when that happens.
          </p>
        </>
      ),
    },
    {
      id: 'payment',
      heading: '3. Purchases',
      body: (
        <p>
          In-app purchases (Meet a stone, Rename) are processed by the Apple App Store or Google Play. The developer does
          not receive card numbers or other payment details; the app only checks the transaction records provided by the
          store, on your device. Payment information is handled under each company’s policy:{' '}
          <a href={APPLE_PRIVACY}>Apple Privacy Policy</a>, <a href={GOOGLE_PRIVACY}>Google Privacy Policy</a>.
        </p>
      ),
    },
    {
      id: 'sharing',
      heading: '4. Sharing and international transfers',
      body: (
        <p>
          Because the developer receives no personal information, nothing is shared with third parties or transferred to
          other countries.
        </p>
      ),
    },
    {
      id: 'deletion',
      heading: '5. Retention and deletion',
      body: (
        <ul>
          <li>Deleting the app deletes the information in its app storage.</li>
          <li>
            On iOS, the information kept in the Keychain (stone names, stones met, statistics) remains on that device after
            the app is deleted and returns when you reinstall. It never leaves the device, and it is erased when you
            erase the device (Settings › General › Transfer or Reset iPhone › Erase All Content and Settings).
          </li>
          <li>
            Once iCloud sync is added, you will be able to delete the app’s data in Settings › Apple Account › iCloud ›
            Manage Storage.
          </li>
        </ul>
      ),
    },
    {
      id: 'children',
      heading: '6. Children',
      body: (
        <p>The app is not directed to children under 13, and it does not collect personal information from anyone.</p>
      ),
    },
    {
      id: 'rights',
      heading: '7. Your rights and contact',
      body: (
        <p>
          Since the information exists only on your device, you can view, change, or delete it there yourself (section
          5). For questions or requests, email {mail}.
        </p>
      ),
    },
    {
      id: 'officer',
      heading: '8. Privacy officer',
      body: (
        <p>
          {BUSINESS_INFO.privacyOfficer} ({BUSINESS_INFO.nameEn}), {mail}
        </p>
      ),
    },
    {
      id: 'changes',
      heading: '9. Changes to this policy',
      body: <p>If this policy changes, we will post it on this page and update the dates below.</p>,
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: 'Rockgazing プライバシーポリシー',
  lead: (
    <p>
      Rockgazing（日本のストア名「石の子守り」、以下「本アプリ」）は {BUSINESS_INFO.nameEn}{' '}
      が提供するアプリです。本アプリが扱う情報についてご説明します。
    </p>
  ),
  notice: (
    <p>
      本アプリは開発者のサーバーに個人情報を送信しません。会員登録・ログイン・広告・トラッキング・分析ツールはありません。
    </p>
  ),
  sections: [
    {
      id: 'collect',
      heading: '1. 開発者が受け取る個人情報',
      body: (
        <p>
          ありません。本アプリは開発者のサーバーと通信せず、氏名・メールアドレス・位置情報・連絡先・広告識別子などを収集・送信しません。
        </p>
      ),
    },
    {
      id: 'device',
      heading: '2. 端末内に保存する情報と目的',
      body: (
        <>
          <p>以下の情報は利用者の端末内にのみ保存され、開発者は受け取りません。</p>
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
                <td>石につけた名前、出会った石、石を見た時間の統計</td>
                <td>
                  端末内のアプリ保存領域。iOS では Keychain にも保存するため、アプリを削除して再インストールしても同じ端末で元に戻ります。
                </td>
                <td>利用者の石と記録を表示するため</td>
              </tr>
              <tr>
                <td>
                  最初の石を決める値（iOS：App Store の取引 ID または端末で生成した乱数、Android：端末 ID）
                </td>
                <td>端末内。ハッシュの計算にのみ使い、外部には送信しません。</td>
                <td>再インストールしても同じ最初の石に出会えるようにするため</td>
              </tr>
            </tbody>
          </table>
          <p>
            今後 iCloud 同期を追加した場合、上記の情報は利用者自身の iCloud（Apple）に保存されます。その場合も開発者は受け取らず、追加時に本ポリシーを更新してお知らせします。
          </p>
        </>
      ),
    },
    {
      id: 'payment',
      heading: '3. 購入',
      body: (
        <p>
          アプリ内課金（石に出会う、名前を変える）は Apple App Store または Google Play
          が処理します。開発者はカード番号などの決済情報を受け取らず、本アプリはストアから提供される取引記録を端末内で確認するだけです。決済情報は各社のポリシーに従います：
          <a href={APPLE_PRIVACY}>Apple プライバシーポリシー</a>、<a href={GOOGLE_PRIVACY}>Google プライバシーポリシー</a>。
        </p>
      ),
    },
    {
      id: 'sharing',
      heading: '4. 第三者提供と国外移転',
      body: <p>開発者が受け取る個人情報がないため、第三者への提供や国外への移転もありません。</p>,
    },
    {
      id: 'deletion',
      heading: '5. 保管と削除',
      body: (
        <ul>
          <li>アプリを削除すると、アプリ保存領域の情報も削除されます。</li>
          <li>
            iOS の Keychain に保存した情報（石の名前、出会った石、統計）はアプリを削除してもその端末に残り、再インストールすると元に戻ります。この情報は端末の外には出ず、端末を初期化（設定 › 一般 › 転送または iPhone をリセット › すべてのコンテンツと設定を消去）すると削除されます。
          </li>
          <li>iCloud 同期の追加後は、設定 › Apple アカウント › iCloud › ストレージを管理 からアプリのデータを削除できます。</li>
        </ul>
      ),
    },
    {
      id: 'children',
      heading: '6. お子様について',
      body: <p>本アプリは 13 歳未満のお子様を対象としておらず、どなたの個人情報も収集しません。</p>,
    },
    {
      id: 'rights',
      heading: '7. 利用者の権利とお問い合わせ',
      body: (
        <p>
          情報は端末内にのみあるため、閲覧・訂正・削除は端末上でご自身で行えます（5 項）。ご質問やご要望は {mail}{' '}
          までお送りください。
        </p>
      ),
    },
    {
      id: 'officer',
      heading: '8. 個人情報保護責任者',
      body: (
        <p>
          {BUSINESS_INFO.privacyOfficer}（{BUSINESS_INFO.nameEn}）、{mail}
        </p>
      ),
    },
    {
      id: 'changes',
      heading: '9. ポリシーの変更',
      body: <p>内容を変更した場合は、このページに掲載し、下記の施行日と最終更新日を更新します。</p>,
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

export default function RockgazingPrivacyPage() {
  return <DocPage locales={[ko, en, ja]} />;
}
