import type { Metadata } from 'next';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 돌보기(Rockgazing / 돌멍타임 / 石の子守り) 지원 페이지.
// 내용 기준: docs/03_앱_스토어_페이지.md 4-2. 결제 화면 문구가 확정되면 FAQ를 실제 문구와 맞춘다.
const EFFECTIVE_DATE = '2026-11-12';
const UPDATED_DATE = '2026-11-13';


const APPLE_REFUND = 'https://reportaproblem.apple.com';
const GOOGLE_REFUND = 'https://play.google.com/store/account/orderhistory';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const ko: DocLocale = {
  lang: 'ko',
  title: '돌멍타임 지원',
  lead: (
    <p>
      Rockgazing(한국 스토어 이름 「돌멍타임」)은 배경과 날씨가 바뀌는 곳에 돌 하나를 두고 가만히 바라보는 앱입니다.
    </p>
  ),
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
      id: 'faq-purchase',
      heading: '다른 돌 만나기·이름 바꾸기는 무엇인가요?',
      body: (
        <ul>
          <li>둘 다 한 번 살 때마다 한 번 쓰는 상품(소모성)입니다.</li>
          <li>
            <strong>다른 돌 만나기</strong>: 아직 만나지 않은 돌 가운데 하나를 같은 확률로 만납니다. 이미 만난 돌은 다시 나오지
            않습니다. 만난 돌은 모아 두고 언제든 무료로 바꿔 볼 수 있습니다.
          </li>
          <li>
            <strong>이름 바꾸기</strong>: 지금 돌의 이름을 새로 짓습니다. 이름은 돌마다 따로 기억합니다.
          </li>
        </ul>
      ),
    },
    {
      id: 'faq-reinstall',
      heading: '앱을 지웠다가 다시 깔면 어떻게 되나요?',
      body: <p>같은 기기에서는 만난 돌과 이름이 그대로 돌아옵니다.</p>,
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
      id: 'faq-screen',
      heading: '화면이 왜 꺼지지 않나요?',
      body: <p>켜 두고 바라보는 앱이라, 앱이 열려 있는 동안에는 화면이 자동으로 꺼지지 않게 해 두었습니다.</p>,
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: 'Rockgazing Support',
  lead: (
    <p>Rockgazing is an app for quietly watching a single stone in a place where the scenery and weather change.</p>
  ),
  sections: [
    {
      id: 'contact',
      heading: 'Contact',
      body: (
        <p>
          If you have a question or a problem, email {mail}. We reply within 3 business days. Telling us your device,
          the app version, and the screen where the problem happened helps us help you faster.
        </p>
      ),
    },
    {
      id: 'faq-purchase',
      heading: 'What are “Meet another stone” and “Rename”?',
      body: (
        <ul>
          <li>Both are consumable purchases: each purchase can be used once.</li>
          <li>
            <strong>Meet another stone</strong>: you meet one of the stones you have not met yet, each with equal probability.
            A stone you have already met never comes up again. Stones you have met are kept, and you can switch between
            them for free at any time.
          </li>
          <li>
            <strong>Rename</strong>: give your current stone a new name. Each stone remembers its own name.
          </li>
        </ul>
      ),
    },
    {
      id: 'faq-reinstall',
      heading: 'What happens if I delete and reinstall the app?',
      body: <p>On the same device, the stones you have met and their names come back.</p>,
    },
    {
      id: 'faq-refund',
      heading: 'How do I get a refund?',
      body: (
        <>
          <p>Purchases and refunds are handled by the store. The developer cannot issue refunds directly.</p>
          <ul>
            <li>
              Apple: request at <a href={APPLE_REFUND}>reportaproblem.apple.com</a>
            </li>
            <li>
              Google Play: request from your <a href={GOOGLE_REFUND}>Play order history</a>
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'faq-screen',
      heading: 'Why doesn’t the screen turn off?',
      body: (
        <p>The app is meant to be left on and watched, so the screen does not turn off automatically while it is open.</p>
      ),
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: '石の子守り サポート',
  lead: (
    <p>
      Rockgazing（日本のストア名「石の子守り」）は、背景や天気が移り変わる場所に石をひとつ置いて、静かに眺めるアプリです。
    </p>
  ),
  sections: [
    {
      id: 'contact',
      heading: 'お問い合わせ',
      body: (
        <p>
          ご質問や不具合は {mail}{' '}
          までお送りください。3 営業日以内に返信します。端末の種類、アプリのバージョン、問題が起きた画面をお知らせいただくと、より早く対応できます。
        </p>
      ),
    },
    {
      id: 'faq-purchase',
      heading: '「ほかの石に出会う」「名前を変える」とは？',
      body: (
        <ul>
          <li>どちらも 1 回の購入につき 1 回使える消耗型の商品です。</li>
          <li>
            <strong>ほかの石に出会う</strong>
            ：まだ出会っていない石の中から、同じ確率でひとつに出会います。すでに出会った石は二度と出ません。出会った石は集めておけて、いつでも無料で切り替えられます。
          </li>
          <li>
            <strong>名前を変える</strong>：今の石に新しい名前をつけます。名前は石ごとに覚えています。
          </li>
        </ul>
      ),
    },
    {
      id: 'faq-reinstall',
      heading: 'アプリを削除して再インストールするとどうなりますか？',
      body: <p>同じ端末であれば、出会った石と名前はそのまま戻ります。</p>,
    },
    {
      id: 'faq-refund',
      heading: '返金はどうすればよいですか？',
      body: (
        <>
          <p>購入と返金はストアが処理します。開発者が直接返金することはできません。</p>
          <ul>
            <li>
              Apple：<a href={APPLE_REFUND}>reportaproblem.apple.com</a> から申請
            </li>
            <li>
              Google Play：<a href={GOOGLE_REFUND}>Play の注文履歴</a> から申請
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'faq-screen',
      heading: '画面が消えないのはなぜですか？',
      body: <p>つけたまま眺めるアプリのため、アプリを開いている間は画面が自動で消えないようにしています。</p>,
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const DOCS = { ko, en, ja };
const DESCRIPTIONS = {
  ko: 'Rockgazing(돌멍타임 / 石の子守り) 지원 · 자주 묻는 질문과 문의',
  en: 'Rockgazing (돌멍타임 / 石の子守り) support · FAQ and contact',
  ja: '石の子守り（Rockgazing / 돌멍타임）サポート・よくある質問とお問い合わせ',
};

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/rockgazing/support', { title: DOCS[lang].title, description: DESCRIPTIONS[lang] });
}

export default async function RockgazingSupportPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} />;
}
