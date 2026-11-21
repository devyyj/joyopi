import type { Metadata } from 'next';

import { type Lang } from '@/app/_i18n/config';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// LikeLoop 계정·데이터 삭제 안내(Google Play 계정 삭제 URL).
// 일본어·영어는 한국어판을 옮긴 것이다(원어민 검수 전).
const DATE = '2026-11-18';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const ko: DocLocale = {
  lang: 'ko',
  title: 'LikeLoop 계정·데이터 삭제',
  lead: <p>LikeLoop 계정과 데이터를 지우는 방법입니다.</p>,
  sections: [
    { id: 'in-app', heading: '앱에서', body: <><p>「내 정보 · 설정」›「계정 삭제」를 누르고 확인하면 이름·답·궁합·초대 코드가 바로 지워지고, 그룹에서 빠지며, 집계 통계에서도 내 몫이 빠집니다. 되돌릴 수 없습니다. Apple 계정을 연결했다면 Apple 확인 창이 한 번 더 뜨고, Apple 로그인 연결도 함께 끊깁니다.</p></> },
    { id: 'email', heading: '앱을 쓸 수 없을 때', body: <><p>연결한 계정 종류(Apple·Google)와 이메일, 또는 앱에서 쓰던 이름과 초대 코드를 적어 {mail}로 보내 주시면 확인 후 지웁니다. 계정을 연결하지 않은 채 앱을 지웠다면 찾을 수 있는 범위에서 지웁니다.</p></> },
    { id: 'kept', heading: '남는 것', body: <><p>신고 기록은 악용 방지를 위해 처리 후 1년, 익명 사용 기록(이름·답·계정 ID 없음)은 1년 뒤 지워집니다. 친구가 초대 웹에서 남긴 답은 친구의 기록이라 지워지지 않습니다.</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: 'LikeLoop アカウント・データの削除',
  lead: <p>LikeLoopのアカウントとデータを削除する方法です。</p>,
  sections: [
    { id: 'in-app', heading: 'アプリから', body: <><p>「マイページ · 設定」›「アカウント削除」を押して確認すると、名前・答え・相性・招待コードがすぐに削除され、グループから抜け、集計統計からもあなたの分が除かれます。元に戻せません。Appleアカウントを連携している場合はAppleの確認画面がもう一度表示され、Appleでサインインの連携も解除されます。</p></> },
    { id: 'email', heading: 'アプリを使えないとき', body: <><p>連携したアカウントの種類（Apple・Google）とメールアドレス、またはアプリで使っていた名前と招待コードを書いて{mail}までお送りください。確認のうえ削除します。連携しないままアプリを削除した場合は、確認できる範囲で削除します。</p></> },
    { id: 'kept', heading: '残るもの', body: <><p>通報の記録は不正利用防止のため対応後1年、匿名の利用記録（名前・答え・アカウントIDを含まない）は1年後に削除されます。友だちが招待Webで残した答えは友だちの記録のため削除されません。</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: 'LikeLoop: Delete account & data',
  lead: <p>How to delete your LikeLoop account and data.</p>,
  sections: [
    { id: 'in-app', heading: 'In the App', body: <><p>Go to Profile · Settings › Delete account and confirm. Your name, answers, matches and invite code are deleted right away, you leave your groups, and your share is removed from aggregate statistics. This cannot be undone. If you linked an Apple account, Apple asks you to confirm once more and Sign in with Apple is disconnected too.</p></> },
    { id: 'email', heading: 'If you can’t use the App', body: <><p>Email {mail} with the account type you linked (Apple or Google) and its email, or the name and invite code you used in the App. We will confirm and delete your data. If you removed the App without linking an account, we delete what we can find.</p></> },
    { id: 'kept', heading: 'What remains', body: <><p>Report records are kept for 1 year after they are handled to prevent abuse, and anonymous usage events (no names, answers or account IDs) are deleted after 1 year. Answers a friend left on the invite web belong to that friend and are not deleted.</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const DOCS: Record<Lang, DocLocale> = { ko, ja, en };

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/likeloop/delete-account', { title: DOCS[lang].title, description: DOCS[lang].title });
}

export default async function LikeLoopDeleteAccountPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} slug="likeloop" path={`/${lang}/apps/likeloop/delete-account`} />;
}
