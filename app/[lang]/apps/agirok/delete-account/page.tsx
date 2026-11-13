import type { Metadata } from 'next';
import Link from 'next/link';
import { localePath, type Lang } from '@/app/_i18n/config';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { BUSINESS_INFO, CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 아기록(ベビろく / Agirok) 계정·데이터 삭제 안내 — Google Play 데이터 보안 양식의 「계정 삭제 URL」.
// 내용 기준: docs/03_앱_스토어_페이지.md 5-3, apps/agirok/docs/privacy-policy.md 2장.
// 일본어·영어는 한국어판을 옮긴 것이다. 「」 안의 버튼 이름은 앱 화면 문구(agirok src/i18n/{ja,en}.ts)와 같게 쓴다.
const EFFECTIVE_DATE = '2026-11-12';
const UPDATED_DATE = '2026-11-12';
/** 일본어·영어판을 처음 올린 날 */
const TRANSLATED_DATE = '2026-11-13';

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
const privacyHref = (lang: Lang) => localePath(lang, '/apps/agirok/privacy');

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
            자세한 내용은 <Link href={privacyHref('ko')}>아기록 개인정보처리방침</Link>을 보세요.
          </p>
        </>
      ),
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: 'ベビろく アカウント・データの削除',
  lead: (
    <p>
      アプリ名：<strong>ベビろく</strong>（韓国名「아기록」） · 開発者：<strong>{BUSINESS_INFO.nameEn}</strong>
      <br />
      ベビろくのアカウントと、そのアカウントのデータを削除する方法をご案内します。
    </p>
  ),
  sections: [
    {
      id: 'in-app',
      heading: '1. アプリで削除する',
      body: (
        <>
          <ol>
            <li>ベビろくアプリを開き、設定に進みます。</li>
            <li>いちばん下の「退会してデータを削除」をタップします。</li>
            <li>確認画面で「退会」をタップすると、アカウントとデータがすぐに削除されます。</li>
          </ol>
          <ul>
            <li>
              iOS で Apple でログインしている場合は、もう一度 Apple でのログインを求められます。このとき Apple
              ログインの連携（トークン）もあわせて取り消されます。
            </li>
            <li>
              「安全のため、一度ログアウトして再ログインしてから退会してください。」と表示された場合は、ログアウトしてから再度ログインし、退会してください。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'by-email',
      heading: '2. アプリを使わずにリクエストする',
      body: (
        <>
          <p>すでにアプリを削除した場合や、アプリを使えない場合は、メールでリクエストできます。</p>
          <ol>
            <li>
              ベビろくのログインに使ったアカウントのメールアドレスから {mail} にメールを送ってください。件名は「ベビろく
              アカウント削除リクエスト」としてください。
            </li>
            <li>ご本人のアカウントであることを確認したうえでアカウントとデータを削除し、完了したら返信でお知らせします。</li>
          </ol>
          <p>リクエストを受け取った日から 7 営業日以内に対応します。</p>
        </>
      ),
    },
    {
      id: 'scope',
      heading: '3. 削除されるものと残るもの',
      body: (
        <>
          <table>
            <thead>
              <tr>
                <th>情報</th>
                <th>取り扱い</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>アカウント（アカウント識別子、メールアドレス、名前）</td>
                <td>遅滞なく削除</td>
              </tr>
              <tr>
                <td>ひとりで使っていた赤ちゃんの情報と育児記録</td>
                <td>遅滞なくすべて削除。元に戻すことはできません。</td>
              </tr>
              <tr>
                <td>ほかの家族と一緒に使っていた赤ちゃんの記録</td>
                <td>自分だけが抜け、記録は一緒に使っていた人が引き続き見られるように残ります。</td>
              </tr>
              <tr>
                <td>購入履歴（広告を非表示）</td>
                <td>Apple・Google がそれぞれの方針に従って保管します。開発者はカード情報などを保有していません。</td>
              </tr>
              <tr>
                <td>アプリの利用統計・エラーレポート</td>
                <td>Google の保存期間に従って保管されたあと削除されます。</td>
              </tr>
            </tbody>
          </table>
          <p>
            詳しくは<Link href={privacyHref('ja')}>ベビろくのプライバシーポリシー</Link>をご覧ください。
          </p>
        </>
      ),
    },
  ],
  effectiveDate: TRANSLATED_DATE,
  updatedDate: TRANSLATED_DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: 'Agirok: Delete Your Account and Data',
  lead: (
    <p>
      App name: <strong>Agirok</strong> (아기록 in Korea) · Developer: <strong>{BUSINESS_INFO.nameEn}</strong>
      <br />
      This page explains how to delete your Agirok account and the data in that account.
    </p>
  ),
  sections: [
    {
      id: 'in-app',
      heading: '1. Delete in the app',
      body: (
        <>
          <ol>
            <li>Open the Agirok app and go to Settings.</li>
            <li>At the bottom, tap “Delete account and data”.</li>
            <li>In the confirmation dialog, tap “Delete”. Your account and data are deleted right away.</li>
          </ol>
          <ul>
            <li>
              If you signed in with Apple on iOS, you will be asked to sign in with Apple once more. Your Sign in with Apple
              connection (token) is revoked at the same time.
            </li>
            <li>
              If you see “For security, please sign out, sign in again, and then delete your account.”, sign out, sign back
              in, and then delete your account.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'by-email',
      heading: '2. Request deletion without the app',
      body: (
        <>
          <p>If you have already removed the app or cannot use it, you can request deletion by email.</p>
          <ol>
            <li>
              From the email address of the account you used to sign in to Agirok, send an email to {mail} with the subject
              “Agirok account deletion request”.
            </li>
            <li>After confirming that the account is yours, I delete the account and data and let you know by reply when it is done.</li>
          </ol>
          <p>Requests are processed within 7 business days of receipt.</p>
        </>
      ),
    },
    {
      id: 'scope',
      heading: '3. What is deleted and what remains',
      body: (
        <>
          <table>
            <thead>
              <tr>
                <th>Information</th>
                <th>What happens</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Account (account identifier, email, name)</td>
                <td>Deleted without delay</td>
              </tr>
              <tr>
                <td>Information and records of a baby you tracked alone</td>
                <td>All deleted without delay. This cannot be undone.</td>
              </tr>
              <tr>
                <td>Records of a baby you shared with other co-caregivers</td>
                <td>Only you are removed. The records remain so the people you shared them with can keep viewing them.</td>
              </tr>
              <tr>
                <td>Purchase records (Remove ads)</td>
                <td>Kept by Apple and Google under their own policies. The developer does not hold card details or similar information.</td>
              </tr>
              <tr>
                <td>App usage statistics and error reports</td>
                <td>Kept for Google’s retention period and then deleted.</td>
              </tr>
            </tbody>
          </table>
          <p>
            For details, see the <Link href={privacyHref('en')}>Agirok Privacy Policy</Link>.
          </p>
        </>
      ),
    },
  ],
  effectiveDate: TRANSLATED_DATE,
  updatedDate: TRANSLATED_DATE,
};

const DOCS: Record<Lang, DocLocale> = { ko, ja, en };
const DESCRIPTIONS: Record<Lang, string> = {
  ko: '아기록 계정과 데이터를 지우는 방법',
  ja: 'ベビろくのアカウントとデータを削除する方法',
  en: 'How to delete your Agirok account and data',
};

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/agirok/delete-account', { title: DOCS[lang].title, description: DESCRIPTIONS[lang] });
}

export default async function AgirokDeleteAccountPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} />;
}
