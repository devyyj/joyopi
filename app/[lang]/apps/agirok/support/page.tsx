import type { Metadata } from 'next';
import Link from 'next/link';
import { localePath, type Lang } from '@/app/_i18n/config';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 아기록(ベビろく / Agirok) 지원 페이지. 내용 기준: docs/03_앱_스토어_페이지.md 5-2.
// 일본어·영어는 한국어판을 옮긴 것이다. 「」 안의 버튼 이름은 앱 화면 문구(agirok src/i18n/{ja,en}.ts)와 같게 쓴다.
const EFFECTIVE_DATE = '2026-11-12';
const UPDATED_DATE = '2026-11-12';
/** 일본어·영어판을 처음 올린 날 */
const TRANSLATED_DATE = '2026-11-13';

const APPLE_REFUND = 'https://reportaproblem.apple.com';
const GOOGLE_REFUND = 'https://play.google.com/store/account/orderhistory';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
const deleteHref = (lang: Lang) => localePath(lang, '/apps/agirok/delete-account');

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
              Apple: <a href={APPLE_REFUND}>reportaproblem.apple.com</a>에서 요청
            </li>
            <li>
              Google Play: <a href={GOOGLE_REFUND}>Play 주문 내역</a>에서 요청
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
          자세한 내용은 <Link href={deleteHref('ko')}>계정·데이터 삭제 안내</Link>를 보세요.
        </p>
      ),
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: 'ベビろく サポート',
  lead: <p>ベビろく（韓国名「아기록」）は、片手で、ワンタップで終わる育児記録アプリです。</p>,
  sections: [
    {
      id: 'contact',
      heading: 'お問い合わせ',
      body: (
        <p>
          ご質問や不具合は {mail} までお送りください。3 営業日以内にお返事します。端末の機種、アプリのバージョン、問題が起きた画面をあわせてお知らせいただくと、より早く対応できます。
        </p>
      ),
    },
    {
      id: 'faq-device',
      heading: '機種変更をすると記録はどうなりますか？',
      body: <p>新しい端末で同じアカウント（Google または Apple）でログインすれば、記録をそのまま引き継いで使えます。</p>,
    },
    {
      id: 'faq-invite',
      heading: '一緒に育児をする家族はどうやって招待しますか？',
      body: (
        <ol>
          <li>設定で「招待コードを作る」をタップし、6 桁の招待コードを作ります。コードは 24 時間使えます。</li>
          <li>受け取った人はアプリにログインしてから「招待コードを受け取りました」をタップし、コードを入力します。</li>
        </ol>
      ),
    },
    {
      id: 'faq-remove-ads',
      heading: '「広告を非表示」はどのように適用されますか？',
      body: (
        <ul>
          <li>一度購入すれば、一緒に使っている家族全員が広告なしで使えます。</li>
          <li>ほかの端末では、設定の「購入を復元」をタップすると再び適用されます。</li>
        </ul>
      ),
    },
    {
      id: 'faq-refund',
      heading: '返金はどうすれば受けられますか？',
      body: (
        <>
          <p>支払いと返金はストアが処理しており、開発者が直接返金することはできません。</p>
          <ul>
            <li>
              Apple：<a href={APPLE_REFUND}>reportaproblem.apple.com</a> からリクエスト
            </li>
            <li>
              Google Play：<a href={GOOGLE_REFUND}>Play の注文履歴</a>からリクエスト
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'faq-delete',
      heading: '退会してデータを削除するには？',
      body: (
        <p>
          アプリの設定 ›「退会してデータを削除」からすぐに削除できます。すでにアプリを削除した場合は、メールでリクエストできます。
          詳しくは<Link href={deleteHref('ja')}>アカウント・データの削除について</Link>をご覧ください。
        </p>
      ),
    },
  ],
  effectiveDate: TRANSLATED_DATE,
  updatedDate: TRANSLATED_DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: 'Agirok Support',
  lead: <p>Agirok (아기록 in Korea) is a baby log app you can use with one hand and a single tap.</p>,
  sections: [
    {
      id: 'contact',
      heading: 'Contact',
      body: (
        <p>
          If you have a question or a problem, please email {mail}. I reply within 3 business days. Including your device
          model, app version, and the screen where the problem happened helps me help you faster.
        </p>
      ),
    },
    {
      id: 'faq-device',
      heading: 'What happens to my records if I switch devices?',
      body: <p>Sign in on the new device with the same account (Google or Apple) and your records carry over as they are.</p>,
    },
    {
      id: 'faq-invite',
      heading: 'How do I invite a co-caregiver?',
      body: (
        <ol>
          <li>In Settings, tap “Create invite code” to make a 6-digit invite code. The code can be used for 24 hours.</li>
          <li>The other person signs in to the app, taps “I have an invite code”, and enters the code.</li>
        </ol>
      ),
    },
    {
      id: 'faq-remove-ads',
      heading: 'How does “Remove ads” work?',
      body: (
        <ul>
          <li>You pay once, and everyone in the family who shares the records uses the app without ads.</li>
          <li>On another device, tap “Restore purchase” in Settings to apply it again.</li>
        </ul>
      ),
    },
    {
      id: 'faq-refund',
      heading: 'How do I get a refund?',
      body: (
        <>
          <p>Payments and refunds are handled by the stores. The developer cannot issue refunds directly.</p>
          <ul>
            <li>
              Apple: request one at <a href={APPLE_REFUND}>reportaproblem.apple.com</a>
            </li>
            <li>
              Google Play: request one from your <a href={GOOGLE_REFUND}>Play order history</a>
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'faq-delete',
      heading: 'How do I delete my account and data?',
      body: (
        <p>
          You can delete them right away from Settings › “Delete account and data” in the app. If you have already removed
          the app, you can request deletion by email. See <Link href={deleteHref('en')}>Deleting your account and data</Link>{' '}
          for details.
        </p>
      ),
    },
  ],
  effectiveDate: TRANSLATED_DATE,
  updatedDate: TRANSLATED_DATE,
};

const DOCS: Record<Lang, DocLocale> = { ko, ja, en };
const DESCRIPTIONS: Record<Lang, string> = {
  ko: '아기록 지원 · 자주 묻는 질문과 문의',
  ja: 'ベビろく サポート・よくある質問とお問い合わせ',
  en: 'Agirok support · FAQ and contact',
};

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/agirok/support', { title: DOCS[lang].title, description: DESCRIPTIONS[lang] });
}

export default async function AgirokSupportPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} />;
}
