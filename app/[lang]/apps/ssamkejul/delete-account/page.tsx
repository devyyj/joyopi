import type { Metadata } from 'next';

import { type Lang } from '@/app/_i18n/config';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 쌤케줄 계정·데이터 삭제 안내(Google Play 계정 삭제 URL).
// 일본어·영어는 한국어판을 옮긴 것이다(원어민 검수 전).
const DATE = '2026-11-16';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;


const ko: DocLocale = {
  lang: 'ko',
  title: "쌤케줄 계정·데이터 삭제",
  lead: <p>쌤케줄 계정과 데이터를 지우는 방법입니다.</p>,
  sections: [
    { id: "teacher", heading: "선생님", body: <><p>앱에서 「설정」›「계정 삭제(탈퇴)」를 누르고 확인하면 계정과 모든 수강생·일정·기록, 수강생 연결과 초대 링크가 바로 지워집니다. 되돌릴 수 없습니다.</p></> },
    { id: "student", heading: "수강생", body: <><p>수강생 페이지 아래의 「연결 끊기」를 누르면 그 레슨과의 연결이 지워집니다. 선생님이 입력한 이름·메모의 삭제는 선생님께 요청하거나 {mail}로 문의해 주세요.</p></> },
    { id: "email", heading: "앱을 쓸 수 없을 때", body: <><p>로그인한 계정 종류(카카오·LINE·Apple·Google)와 선생님 이름을 적어 {mail}로 보내 주시면 확인 후 지웁니다.</p></> },
    { id: "kept", heading: "남는 것", body: <><p>익명 사용 기록(이름·로그인 ID 없음)은 1년 뒤 자동으로 지워집니다.</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: "せんせジュール アカウント・データの削除",
  lead: <p>せんせジュールのアカウントとデータを削除する方法です。</p>,
  sections: [
    { id: "teacher", heading: "先生", body: <><p>アプリの「設定」›「アカウント削除（退会）」を押して確認すると、アカウントとすべての生徒・予定・記録、生徒との連携と招待リンクがすぐに削除されます。元に戻せません。</p></> },
    { id: "student", heading: "生徒", body: <><p>生徒ページ下の「連携を解除」を押すと、そのレッスンとの連携が削除されます。先生が入力した名前・メモの削除は、先生にお願いするか{mail}までお問い合わせください。</p></> },
    { id: "email", heading: "アプリを使えない場合", body: <><p>ログインに使ったアカウントの種類（カカオ・LINE・Apple・Google）と先生の名前を書いて{mail}までお送りください。確認後に削除します。</p></> },
    { id: "kept", heading: "残るもの", body: <><p>匿名の利用記録（名前・ログインIDなし）は1年後に自動で削除されます。</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: "Delete Your Teachedule Account and Data",
  lead: <p>How to delete your Teachedule account and data.</p>,
  sections: [
    { id: "teacher", heading: "Teachers", body: <><p>In the App, go to Settings › Delete account and confirm. Your account and all students, schedules, records, student links and invite links are deleted immediately. This cannot be undone.</p></> },
    { id: "student", heading: "Students", body: <><p>Tap Unlink at the bottom of the student page to remove your link to that teacher. To have the name or notes your teacher entered about you deleted, ask your teacher or email {mail}.</p></> },
    { id: "email", heading: "If you can’t use the App", body: <><p>Email {mail} with the type of account you signed in with (Kakao, LINE, Apple, Google) and your teacher’s name, and we will delete your data after verifying your identity.</p></> },
    { id: "kept", heading: "What remains", body: <><p>Anonymous usage events and error reports (no names or sign-in IDs) are deleted automatically after 1 year.</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: '2026-11-24',
};

const DOCS: Record<Lang, DocLocale> = { ko, ja, en };
const TITLES: Record<Lang, string> = {"ko": "쌤케줄 계정·데이터 삭제", "ja": "せんせジュール アカウント・データの削除", "en": "Delete Your Teachedule Account and Data"};

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/ssamkejul/delete-account', { title: DOCS[lang].title, description: TITLES[lang] });
}

export default async function SsamkejulDeleteAccountPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} slug="ssamkejul" path={`/${lang}/apps/ssamkejul/delete-account`} />;
}
