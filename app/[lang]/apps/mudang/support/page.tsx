import type { Metadata } from 'next';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 무당 이야기 게임(가제 「신내림 받은 김대리」, 코드명 mudang) 지원 페이지. 앱 이름이 확정되면 제목을 고친다.
const EFFECTIVE_DATE = '2026-11-24';
const UPDATED_DATE = '2026-11-24';

const APPLE_REFUND = 'https://reportaproblem.apple.com';
const GOOGLE_REFUND = 'https://play.google.com/store/account/orderhistory';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const ko: DocLocale = {
  lang: 'ko',
  title: '신내림 받은 김대리 지원',
  lead: <p>「신내림 받은 김대리」는 무당이 된 회사원이 손님의 숨은 사정을 맞혀 가는 이야기 게임입니다. 실제 점술·운세 서비스가 아닙니다.</p>,
  sections: [
    { id: 'contact', heading: '문의', body: <p>궁금한 점이나 문제가 있으면 {mail}로 보내 주세요. 영업일 3일 이내에 답장합니다. 기기 종류와 앱 버전, 문제가 생긴 화면을 함께 알려 주시면 더 빨리 도울 수 있습니다. 앱의 설정 › 의견 보내기로도 보낼 수 있습니다.</p> },
    { id: 'faq-save', heading: '진행은 어디에 저장되나요?', body: <p>기기 안에만 저장됩니다. 계정이 없어서 앱을 지우거나 기기를 바꾸면 진행이 이어지지 않습니다. 결말 컬렉션·업적도 같습니다.</p> },
    { id: 'faq-offline', heading: '인터넷이 없어도 되나요?', body: <p>네. 게임은 인터넷 없이 플레이할 수 있습니다. 새 소식과 앱 설정만 연결될 때 받아 옵니다.</p> },
    { id: 'faq-daily', heading: '하룻밤 점집은 무엇인가요?', body: <p>날짜마다 정해지는 손님 다섯 명을 연달아 받아 점수를 내는 모드입니다. 같은 날에는 누구나 같은 손님을 만나고, 기기 안에 그날 최고 점수가 남습니다. 인생 모드 진행에는 영향을 주지 않습니다.</p> },
    { id: 'faq-refund', heading: '환불은 어떻게 받나요?', body: (<><p>구매와 환불은 스토어가 처리하며, 개발자가 직접 환불해 드릴 수 없습니다.</p><ul><li>Apple: <a href={APPLE_REFUND}>reportaproblem.apple.com</a></li><li>Google Play: <a href={GOOGLE_REFUND}>Play 주문 내역</a></li></ul></>) },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: 'Shaman Kim Support',
  lead: <p>“Shaman Kim” is a story game about an office worker who becomes a shaman and uncovers clients’ hidden stories. It is not a real fortune-telling service.</p>,
  sections: [
    { id: 'contact', heading: 'Contact', body: <p>Email {mail} and we will reply within 3 business days. Please include your device, app version, and the screen where the problem happened. You can also use Settings › Send feedback in the App.</p> },
    { id: 'faq-save', heading: 'Where is my progress saved?', body: <p>Only on your device. There are no accounts, so progress does not carry over if you delete the App or change devices.</p> },
    { id: 'faq-offline', heading: 'Can I play offline?', body: <p>Yes. Only news and app settings are fetched when you are online.</p> },
    { id: 'faq-refund', heading: 'How do I get a refund?', body: <p>Purchases and refunds are handled by the store: Apple <a href={APPLE_REFUND}>reportaproblem.apple.com</a>, Google Play <a href={GOOGLE_REFUND}>order history</a>.</p> },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: '神降ろしのキム代理 サポート',
  lead: <p>「神降ろしのキム代理」は、巫女になった会社員が依頼人の隠れた事情を当てていく物語ゲームです。実際の占いサービスではありません。</p>,
  sections: [
    { id: 'contact', heading: 'お問い合わせ', body: <p>{mail} までお送りください。3営業日以内に返信します。端末の種類・アプリのバージョン・問題が起きた画面もお知らせください。アプリの 設定 › ご意見を送る からも送れます。</p> },
    { id: 'faq-save', heading: '進行はどこに保存されますか？', body: <p>端末内にだけ保存されます。アカウントがないため、アプリを削除したり機種を変えたりすると進行は引き継がれません。</p> },
    { id: 'faq-offline', heading: 'オフラインで遊べますか？', body: <p>はい。お知らせとアプリ設定だけ、接続時に受け取ります。</p> },
    { id: 'faq-refund', heading: '返金はどうすればいいですか？', body: <p>購入と返金はストアが扱います：Apple <a href={APPLE_REFUND}>reportaproblem.apple.com</a>、Google Play <a href={GOOGLE_REFUND}>注文履歴</a>。</p> },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const DOCS = { ko, en, ja };

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/mudang/support', { title: DOCS[lang].title });
}

export default async function MudangSupportPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} slug="mudang" path={`/${lang}/apps/mudang/support`} />;
}
