import type { Metadata } from 'next';

import { type Lang } from '@/app/_i18n/config';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// LikeLoop 이용약관. 원고 기준: likeloop/docs/legal/terms.md — 여기서 먼저 고치지 않는다.
// 일본어·영어는 한국어판을 옮긴 것이다(원어민 검수 전).
const DATE = '2026-11-18';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const ko: DocLocale = {
  lang: 'ko',
  title: 'LikeLoop 이용약관',
  lead: <p>LikeLoop(이하 ‘서비스’)은 조요피(JOYOPI, 이하 ‘회사’)가 제공하는 취향 비교·궁합 서비스입니다.</p>,
  sections: [
    { id: 'price', heading: '1. 요금', body: <><p>서비스는 무료입니다. 앞으로 일부 기능을 유료로 더할 수 있으며, 그때도 지금 무료인 기능은 계속 무료로 둡니다. 유료 기능을 더할 때는 30일 전에 알립니다.</p></> },
    { id: 'account', heading: '2. 계정', body: <><p>가입 없이 익명 계정으로 시작하고, 원하면 Apple·Google 계정을 연결합니다. 계정을 연결하지 않은 채 기기를 바꾸거나 앱을 지우면 기록을 되찾을 수 없습니다. 만 14세 이상만 쓸 수 있습니다.</p></> },
    { id: 'content', heading: '3. 이용자의 콘텐츠', body: <><p>이름과 그룹 이름은 이용자가 정하며, 다른 사람이 볼 수 있습니다. 답을 어디까지 쓸지는 답마다 공개 범위로 정합니다.</p></> },
    { id: 'prohibited', heading: '4. 금지 행위', body: <><p>다른 사람을 사칭하거나 괴롭히는 이름·그룹 이름, 혐오·성적·불법 표현, 다른 사람의 개인정보 노출, 서비스 방해(자동화된 대량 요청 등), 법령 위반, 다른 사람의 권리 침해를 금지합니다.</p></> },
    { id: 'report', heading: '5. 신고·차단·제재', body: <><p>이용자는 앱에서 다른 사람을 차단하거나 신고할 수 있습니다. 회사는 신고를 확인해 이름·그룹 이름을 바꾸거나 지우고, 반복되면 계정 이용을 제한할 수 있습니다.</p></> },
    { id: 'results', heading: '6. 결과의 성격', body: <><p>궁합 점수·성향·통계는 이용자들의 답으로 계산한 재미와 참고용 정보이며, 과학적·심리학적 진단이 아닙니다.</p></> },
    { id: 'change', heading: '7. 서비스의 변경·중단', body: <><p>회사는 서비스를 고치거나 일부를 멈출 수 있습니다. 서비스를 끝낼 때는 30일 전에 알립니다.</p></> },
    { id: 'liability', heading: '8. 책임의 한계', body: <><p>회사는 서비스를 성실히 운영하지만, 통신 장애·기기 문제·이용자 사이의 일에 대해서는 고의·중과실이 없는 한 책임지지 않습니다.</p></> },
    { id: 'leave', heading: '9. 탈퇴', body: <><p>앱 「내 정보 · 설정」›「계정 삭제」로 언제든 탈퇴할 수 있습니다.</p></> },
    { id: 'law', heading: '10. 준거법·관할', body: <><p>대한민국 법을 따르며, 분쟁은 민사소송법에 따른 관할 법원에서 해결합니다. 일본 이용자에게는 일본 소비자계약법 등 강행 규정이 우선합니다. 문의: {mail}</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: 'LikeLoop 利用規約',
  lead: <p>LikeLoop（以下「本サービス」）は、JOYOPI（以下「当社」）が提供する好みくらべ・相性サービスです。</p>,
  sections: [
    { id: 'price', heading: '1. 料金', body: <><p>本サービスは無料です。今後、一部の機能を有料で追加することがありますが、その場合も現在無料の機能は引き続き無料です。有料機能を追加するときは30日前にお知らせします。</p></> },
    { id: 'account', heading: '2. アカウント', body: <><p>登録なしで匿名アカウントで始め、必要に応じてApple・Googleアカウントを連携します。連携しないまま機種変更やアプリの削除をすると、記録は戻せません。14歳以上の方のみ利用できます。</p></> },
    { id: 'content', heading: '3. 利用者のコンテンツ', body: <><p>名前とグループ名は利用者が決め、ほかの人にも表示されます。答えをどこまで使うかは、答えごとの公開範囲で決めます。</p></> },
    { id: 'prohibited', heading: '4. 禁止事項', body: <><p>他人へのなりすましや嫌がらせとなる名前・グループ名、差別的・性的・違法な表現、他人の個人情報の公開、サービスの妨害（自動化された大量のリクエストなど）、法令違反、他人の権利の侵害を禁止します。</p></> },
    { id: 'report', heading: '5. 通報・ブロック・措置', body: <><p>利用者はアプリでほかの人をブロック・通報できます。当社は通報を確認し、名前・グループ名を変更または削除し、繰り返される場合はアカウントの利用を制限することがあります。</p></> },
    { id: 'results', heading: '6. 結果について', body: <><p>相性スコア・傾向・統計は、利用者の答えから計算した楽しみと参考のための情報であり、科学的・心理学的な診断ではありません。</p></> },
    { id: 'change', heading: '7. サービスの変更・終了', body: <><p>当社はサービスを変更し、または一部を停止することがあります。サービスを終了するときは30日前にお知らせします。</p></> },
    { id: 'liability', heading: '8. 責任の制限', body: <><p>当社はサービスを誠実に運営しますが、通信障害・端末の問題・利用者間のできごとについては、故意または重大な過失がない限り責任を負いません。</p></> },
    { id: 'leave', heading: '9. 退会', body: <><p>アプリの「マイページ · 設定」›「アカウント削除」からいつでも退会できます。</p></> },
    { id: 'law', heading: '10. 準拠法・管轄', body: <><p>大韓民国の法律に準拠し、紛争は民事訴訟法に基づく管轄裁判所で解決します。日本の利用者には、日本の消費者契約法などの強行規定が優先して適用されます。お問い合わせ: {mail}</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: 'LikeLoop Terms of Use',
  lead: <p>LikeLoop (the “Service”) is a taste-comparison and match service provided by JOYOPI (“we”).</p>,
  sections: [
    { id: 'price', heading: '1. Price', body: <><p>The Service is free. We may add paid features in the future; features that are free now will stay free. We will give 30 days’ notice before adding paid features.</p></> },
    { id: 'account', heading: '2. Account', body: <><p>You start with an anonymous account and can link an Apple or Google account if you wish. If you change devices or delete the App without linking an account, your records cannot be recovered. You must be 14 or older to use the Service.</p></> },
    { id: 'content', heading: '3. Your content', body: <><p>You choose your name and group names, and other people can see them. You decide how each answer is used with its visibility setting.</p></> },
    { id: 'prohibited', heading: '4. Prohibited conduct', body: <><p>Names or group names that impersonate or harass others, hateful, sexual or illegal content, exposing other people’s personal information, disrupting the Service (such as automated bulk requests), breaking the law, and infringing other people’s rights are prohibited.</p></> },
    { id: 'report', heading: '5. Reports, blocking and enforcement', body: <><p>You can block or report other people in the App. We review reports and may change or remove names and group names, and may restrict accounts for repeated violations.</p></> },
    { id: 'results', heading: '6. About results', body: <><p>Match scores, traits and statistics are calculated from users’ answers for fun and reference. They are not scientific or psychological assessments.</p></> },
    { id: 'change', heading: '7. Changes and discontinuation', body: <><p>We may change the Service or stop parts of it. We will give 30 days’ notice before ending the Service.</p></> },
    { id: 'liability', heading: '8. Limitation of liability', body: <><p>We run the Service in good faith, but unless we act intentionally or with gross negligence, we are not liable for network outages, device problems, or matters between users.</p></> },
    { id: 'leave', heading: '9. Leaving', body: <><p>You can delete your account at any time in the App under Profile · Settings › Delete account.</p></> },
    { id: 'law', heading: '10. Governing law', body: <><p>These terms are governed by the laws of the Republic of Korea, and disputes are resolved in the court with jurisdiction under the Korean Civil Procedure Act. Mandatory consumer protection laws of your country of residence still apply. Contact: {mail}</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const DOCS: Record<Lang, DocLocale> = { ko, ja, en };

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/likeloop/terms', { title: DOCS[lang].title, description: DOCS[lang].title });
}

export default async function LikeLoopTermsPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} slug="likeloop" path={`/${lang}/apps/likeloop/terms`} />;
}
