import type { Metadata } from 'next';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { BUSINESS_INFO, CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 무당 이야기 게임(가제 「신내림 받은 김대리」, 코드명 mudang) 이용약관. 앱 정보 화면에서 연다(mudang src/lib/links.ts TERMS_URL).
// 계정·서버·앱 내 구매가 없는 한 번 결제 앱 기준. 앱 이름이 확정되면 제목을 고친다.
const EFFECTIVE_DATE = '2026-11-24';
const UPDATED_DATE = '2026-11-24';

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const ko: DocLocale = {
  lang: 'ko',
  title: '신내림 받은 김대리 이용약관',
  lead: <p>이 약관은 {BUSINESS_INFO.nameKo}({BUSINESS_INFO.nameEn}, 이하 ‘개발자’)가 만든 이야기 게임 「신내림 받은 김대리」(이하 ‘앱’)를 쓰는 조건을 정합니다.</p>,
  sections: [
    { id: 'fiction', heading: '1. 이야기 게임', body: <p>앱의 인물·사연·점괘·부적·굿은 모두 꾸며 낸 이야기이며, 실제 점술·운세·종교 행위나 조언이 아닙니다. 앱의 내용을 근거로 건강·재산·법률 등 실제 결정을 하지 마세요.</p> },
    { id: 'license', heading: '2. 사용 권리', body: <p>앱을 구매하면 스토어(Apple App Store·Google Play) 약관에 따라 개인적·비상업적으로 앱을 쓸 권리를 얻습니다. 앱의 글·그림·음악의 저작권은 개발자 또는 원저작자에게 있습니다. 「명함 공유」 이미지는 개인적으로 자유롭게 공유할 수 있습니다.</p> },
    { id: 'prohibited', heading: '3. 하지 말아야 할 일', body: <ul><li>앱을 뜯어 고치거나(역설계) 내용을 복제해 배포하는 일</li><li>앱을 이용해 다른 사람이나 개발자에게 피해를 주는 일</li></ul> },
    { id: 'data', heading: '4. 저장과 개인정보', body: <p>게임 진행은 기기 안에만 저장되며, 앱을 지우거나 기기를 바꾸면 이어지지 않을 수 있습니다. 개인정보 처리는 <a href="/apps/mudang/privacy">개인정보 처리방침</a>을 따릅니다.</p> },
    { id: 'payment', heading: '5. 결제와 환불', body: <p>구매와 환불은 각 스토어의 정책을 따릅니다. 앱에는 앱 내 구매와 광고가 없습니다.</p> },
    { id: 'changes', heading: '6. 서비스와 약관의 변경', body: <p>개발자는 업데이트로 앱의 내용을 바꾸거나 고칠 수 있습니다. 약관이 바뀌면 이 페이지에 올리고 시행일을 고칩니다.</p> },
    { id: 'liability', heading: '7. 책임의 제한', body: <p>개발자는 관련 법령이 허용하는 범위에서, 앱을 쓰다가 생긴 간접적 손해에 책임을 지지 않습니다. 다만 개발자의 고의 또는 중대한 과실로 생긴 손해는 예외입니다.</p> },
    { id: 'law', heading: '8. 준거법과 문의', body: <p>이 약관은 대한민국 법을 따릅니다. 언어판이 다르면 한국어판이 우선합니다. 문의: {mail}</p> },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: 'Shaman Kim Terms of Use',
  lead: <p>These terms govern your use of the story game “Shaman Kim” (the “App”) made by {BUSINESS_INFO.nameEn} (the “Developer”).</p>,
  sections: [
    { id: 'fiction', heading: '1. A story game', body: <p>All characters, stories, readings, talismans, and rituals in the App are fiction. They are not real divination, fortune-telling, religious practice, or advice. Do not make real-life health, financial, or legal decisions based on the App.</p> },
    { id: 'license', heading: '2. License', body: <p>Buying the App grants you a personal, non-commercial right to use it under the App Store or Google Play terms. Text, art, and music belong to the Developer or their original authors. You may freely share “Share card” images for personal use.</p> },
    { id: 'prohibited', heading: '3. Prohibited use', body: <p>Do not reverse-engineer the App, redistribute its content, or use it to harm others or the Developer.</p> },
    { id: 'data', heading: '4. Saves and privacy', body: <p>Game progress is stored only on your device and may not carry over if you delete the App or change devices. See the <a href="/apps/mudang/privacy">Privacy Policy</a>.</p> },
    { id: 'payment', heading: '5. Payment and refunds', body: <p>Purchases and refunds follow each store’s policy. The App has no in-app purchases or ads.</p> },
    { id: 'law', heading: '6. Changes, liability, and law', body: <p>We may update the App and these terms; changes are posted here. To the extent permitted by law, the Developer is not liable for indirect damages, except those caused by intent or gross negligence. Korean law applies; if versions differ, the Korean version prevails. Contact: {mail}</p> },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: '神降ろしのキム代理 利用規約',
  lead: <p>本規約は、{BUSINESS_INFO.nameEn}（以下「開発者」）が作った物語ゲーム「神降ろしのキム代理」（以下「本アプリ」）の利用条件を定めます。</p>,
  sections: [
    { id: 'fiction', heading: '1. 物語ゲーム', body: <p>本アプリの人物・物語・占い・お札・儀式はすべてフィクションであり、実際の占いや宗教行為、助言ではありません。本アプリの内容をもとに健康・財産・法律などの実際の判断をしないでください。</p> },
    { id: 'license', heading: '2. 利用の権利', body: <p>購入により、各ストアの規約に従って個人的・非商用に本アプリを使う権利を得ます。文章・画像・音楽の著作権は開発者または原著作者にあります。「名刺の共有」画像は個人的に自由に共有できます。</p> },
    { id: 'prohibited', heading: '3. 禁止事項', body: <p>本アプリの解析・改変、内容の複製・配布、他人や開発者に害を与える利用をしないでください。</p> },
    { id: 'data', heading: '4. 保存とプライバシー', body: <p>ゲームの進行は端末内にだけ保存されます。<a href="/apps/mudang/privacy">プライバシーポリシー</a>をご覧ください。</p> },
    { id: 'law', heading: '5. 支払い・変更・準拠法', body: <p>購入と返金は各ストアの規定に従います。本アプリと規約は更新されることがあり、変更はこのページに掲載します。法令の許す範囲で、開発者は間接的な損害について責任を負いません（故意・重過失を除く）。本規約は韓国法に従い、言語版に違いがある場合は韓国語版が優先します。お問い合わせ：{mail}</p> },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const DOCS = { ko, en, ja };

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/mudang/terms', { title: DOCS[lang].title });
}

export default async function MudangTermsPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} slug="mudang" path={`/${lang}/apps/mudang/terms`} />;
}
