import type { Metadata } from 'next';
import Link from 'next/link';
import { localePath, type Lang } from '@/app/_i18n/config';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// LikeLoop 지원 페이지(App Store 지원 URL).
// 일본어·영어는 한국어판을 옮긴 것이다(원어민 검수 전).
const DATE = '2026-11-18';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
const deleteHref = (lang: Lang) => localePath(lang, '/apps/likeloop/delete-account');

const ko: DocLocale = {
  lang: 'ko',
  title: 'LikeLoop 지원',
  lead: <p>LikeLoop은 좋아·싫어 질문에 답하고 남들과 비교하며, 친구·그룹과 취향 궁합을 보는 앱입니다.</p>,
  sections: [
    { id: 'contact', heading: '문의', body: <><p>궁금한 점이나 문제가 있으면 {mail}로 보내 주세요. 영업일 3일 이내에 답장합니다. 앱 「내 정보 · 설정」›「문의 · 의견 보내기」로도 보낼 수 있습니다.</p></> },
    { id: 'faq-records', heading: '기기를 바꿨더니 기록이 없어요', body: <><p>LikeLoop은 가입 없이 익명 계정으로 시작합니다. 「내 정보 · 설정」›「계정 연결하기」로 Apple·Google 계정을 연결해 두면, 새 기기에서 같은 계정으로 연결해 기록을 이어 쓸 수 있습니다. 연결하지 않은 기록은 되찾을 수 없습니다.</p></> },
    { id: 'faq-match', heading: '친구 궁합 점수가 안 보여요', body: <><p>둘 다 답한 질문(‘잘 모름’ 제외)이 10개가 되면 미리보기 궁합이, 30개가 되면 정밀 궁합과 가장 크게 갈린 답이 열립니다. ‘나만’으로 둔 답은 궁합에 쓰이지 않습니다.</p></> },
    { id: 'faq-invite', heading: '친구도 앱을 깔아야 하나요?', body: <><p>아니요. 초대 링크를 열면 설치 없이 웹에서 10문항에 답하고 미리보기 궁합을 볼 수 있습니다. 앱을 설치한 뒤 궁합 탭에서 초대 코드를 넣으면 이어서 볼 수 있습니다.</p></> },
    { id: 'faq-group', heading: '그룹은 몇 명까지인가요?', body: <><p>한 그룹에 30명까지 들어올 수 있습니다. 그룹 결과는 멤버들이 ‘궁합까지’로 둔 답으로만 계산합니다.</p></> },
    { id: 'faq-block', heading: '불쾌한 이름이나 그룹을 봤어요', body: <><p>궁합 화면에서 그 사람을 차단하거나 신고할 수 있습니다. 확인 후 이름을 바꾸거나 지우고, 반복되면 이용을 제한합니다.</p></> },
    { id: 'faq-delete', heading: '탈퇴하려면?', body: <><p><Link href={deleteHref('ko')}>계정·데이터 삭제 안내</Link>를 보세요.</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: 'LikeLoop サポート',
  lead: <p>LikeLoopは、好き・嫌いの質問に答えてほかの人と比べ、友だちやグループと好みの相性を見るアプリです。</p>,
  sections: [
    { id: 'contact', heading: 'お問い合わせ', body: <><p>ご質問や問題があれば{mail}までお送りください。3営業日以内にお返事します。アプリの「マイページ · 設定」›「お問い合わせ · ご意見」からも送れます。</p></> },
    { id: 'faq-records', heading: '機種変更したら記録がありません', body: <><p>LikeLoopは登録なしの匿名アカウントで始まります。「マイページ · 設定」›「アカウントを連携」でApple・Googleアカウントを連携しておくと、新しい端末で同じアカウントを連携して記録を引き継げます。連携していない記録は戻せません。</p></> },
    { id: 'faq-match', heading: '友だちとの相性スコアが表示されません', body: <><p>ふたりとも答えた質問（「わからない」を除く）が10問になるとプレビュー相性が、30問になると詳しい相性といちばん分かれた答えが表示されます。「自分だけ」にした答えは相性に使いません。</p></> },
    { id: 'faq-invite', heading: '友だちもアプリが必要ですか？', body: <><p>いいえ。招待リンクを開けば、インストールなしでWebで10問に答えてプレビュー相性を見られます。アプリをインストールしたあと、相性タブで招待コードを入れると続きを見られます。</p></> },
    { id: 'faq-group', heading: 'グループは何人までですか？', body: <><p>1つのグループに30人まで参加できます。グループの結果は、メンバーが「相性まで」にした答えだけで計算します。</p></> },
    { id: 'faq-block', heading: '不快な名前やグループを見つけました', body: <><p>相性画面からその人をブロック・通報できます。確認のうえ名前を変更または削除し、繰り返される場合は利用を制限します。</p></> },
    { id: 'faq-delete', heading: '退会するには？', body: <><p><Link href={deleteHref('ja')}>アカウント・データの削除</Link>をご覧ください。</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: 'LikeLoop Support',
  lead: <p>LikeLoop lets you answer like-or-dislike questions, see how you compare with everyone else, and check your taste match with friends and groups.</p>,
  sections: [
    { id: 'contact', heading: 'Contact', body: <><p>If you have a question or a problem, email {mail}. We reply within 3 business days. You can also write to us from Profile · Settings › Contact & feedback in the App.</p></> },
    { id: 'faq-records', heading: 'My records are gone after changing phones', body: <><p>LikeLoop starts with an anonymous account, no sign-up needed. Link an Apple or Google account under Profile · Settings › Link an account, and link the same account on your new device to keep your records. Records that were never linked cannot be recovered.</p></> },
    { id: 'faq-match', heading: 'I can’t see a match score with my friend', body: <><p>A preview match appears once you have both answered 10 of the same questions (“not sure” doesn’t count), and the full match with your biggest differences unlocks at 30. Answers set to “Only me” are not used for matches.</p></> },
    { id: 'faq-invite', heading: 'Does my friend need the App?', body: <><p>No. Opening your invite link lets them answer 10 questions on the web and see a preview match without installing anything. After installing the App, they can enter the invite code in the Match tab to keep going.</p></> },
    { id: 'faq-group', heading: 'How many people can join a group?', body: <><p>Up to 30 people per group. Group results use only the answers members set to “Matches too”.</p></> },
    { id: 'faq-block', heading: 'I saw an offensive name or group', body: <><p>You can block or report the person from the match screen. We review reports, change or remove names, and restrict accounts for repeated violations.</p></> },
    { id: 'faq-delete', heading: 'How do I delete my account?', body: <><p>See <Link href={deleteHref('en')}>Delete account & data</Link>.</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const DOCS: Record<Lang, DocLocale> = { ko, ja, en };

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/likeloop/support', { title: DOCS[lang].title, description: DOCS[lang].title });
}

export default async function LikeLoopSupportPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} />;
}
