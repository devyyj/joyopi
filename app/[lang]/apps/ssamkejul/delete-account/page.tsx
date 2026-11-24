import type { Metadata } from 'next';

import { type Lang } from '@/app/_i18n/config';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 쌤케줄 계정·데이터 삭제 안내(Google Play 계정 삭제 URL).
// 일본어·영어는 한국어판을 옮긴 것이다(원어민 검수 전). 개인정보처리방침(privacy/page.tsx)의 보유 기간과 맞춘다.
const DATE = '2026-11-16';
const UPDATED = '2026-11-24';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const ko: DocLocale = {
  lang: 'ko',
  title: '쌤케줄 계정·데이터 삭제',
  lead: <p>쌤케줄 계정과 데이터를 지우는 방법입니다.</p>,
  sections: [
    { id: 'teacher', heading: '선생님', body: <><p>앱에서 「설정」›「계정 삭제(탈퇴)」를 누르고 확인하면 계정과 모든 수강생·일정·기록, 수강생 연결과 초대 링크, 약관 동의 기록이 바로 지워지고 카카오·Apple 로그인 연결도 끊깁니다. 되돌릴 수 없습니다.</p></> },
    { id: 'student', heading: '수강생', body: <><p>수강생 웹 아래의 「연결 끊기」를 누르면 그 레슨과의 연결이 지워집니다. 수강생 웹 메뉴의 계정 삭제를 누르면 로그인 계정과 모든 레슨 연결, 약관 동의 기록이 바로 지워집니다. 선생님이 입력한 이름·메모의 삭제는 선생님께 요청하거나 {mail}로 문의해 주세요.</p></> },
    { id: 'email', heading: '앱·웹을 쓸 수 없을 때', body: <><p>로그인한 계정 종류(카카오·LINE·Apple·Google)와 선생님 이름을 적어 {mail}로 보내 주시면 본인 확인 후 10일 이내에 지웁니다.</p></> },
    { id: 'kept', heading: '남는 것', body: <><ul><li>사용 기록·오류 기록(로그인 계정과 연결되지 않음, 이름·로그인 ID 없음): 1년 뒤 자동으로 지워집니다. 설정이나 수강생 웹 메뉴에서 끄면 기기의 무작위 ID가 바로 지워집니다.</li><li>보낸 의견과 답장 받을 이메일: 받은 날부터 1년 뒤 자동으로 지워집니다(Slack 알림 사본 포함). 더 일찍 지우려면 {mail}로 요청해 주세요.</li><li>수강생이 계정을 지워도, 선생님이 입력한 이름·지난 레슨 기록은 선생님이 지우거나 탈퇴할 때까지 선생님 쪽에 남습니다.</li></ul></> },
  ],
  effectiveDate: DATE,
  updatedDate: UPDATED,
};

const ja: DocLocale = {
  lang: 'ja',
  title: 'せんせジュール アカウント・データの削除',
  lead: <p>せんせジュールのアカウントとデータを削除する方法です。</p>,
  sections: [
    { id: 'teacher', heading: '先生', body: <><p>アプリの「設定」›「アカウント削除（退会）」を押して確認すると、アカウントとすべての生徒・予定・記録、生徒との連携と招待リンク、利用規約への同意記録がすぐに削除され、カカオ・Appleログインの連携も解除されます。元に戻せません。</p></> },
    { id: 'student', heading: '生徒', body: <><p>生徒用Web下の「連携を解除」を押すと、そのレッスンとの連携が削除されます。生徒用Webのメニューでアカウントを削除すると、ログインアカウントとすべてのレッスンとの連携、利用規約への同意記録がすぐに削除されます。先生が入力した名前・メモの削除は、先生にお願いするか{mail}までお問い合わせください。</p></> },
    { id: 'email', heading: 'アプリ・Webを使えない場合', body: <><p>ログインに使ったアカウントの種類（カカオ・LINE・Apple・Google）と先生の名前を書いて{mail}までお送りください。ご本人確認のうえ、10日以内に削除します。</p></> },
    { id: 'kept', heading: '残るもの', body: <><ul><li>利用記録・エラーの記録（ログインアカウントと結び付けず、名前・ログインIDなし）：1年後に自動で削除されます。設定または生徒用Webのメニューでオフにすると、端末のランダムなIDはすぐに削除されます。</li><li>送られたご意見と返信用メールアドレス：受け取った日から1年後に自動で削除されます（Slack通知の写しを含む）。早く削除したい場合は{mail}までご依頼ください。</li><li>生徒がアカウントを削除しても、先生が入力した名前・過去のレッスン記録は、先生が削除するか退会するまで先生の側に残ります。</li></ul></> },
  ],
  effectiveDate: DATE,
  updatedDate: UPDATED,
};

const en: DocLocale = {
  lang: 'en',
  title: 'Delete Your Teachedule Account and Data',
  lead: <p>How to delete your Teachedule account and data.</p>,
  sections: [
    { id: 'teacher', heading: 'Teachers', body: <><p>In the App, go to Settings › Delete account and confirm. Your account and all students, schedules, records, student links, invite links and your record of accepting the terms are deleted immediately, and your Apple (or Kakao) sign-in link is revoked. This cannot be undone.</p></> },
    { id: 'student', heading: 'Students', body: <><p>Tap Unlink at the bottom of the student web page to remove your link to that teacher. To delete your sign-in account, all your lesson links and your record of accepting the terms immediately, use Delete account in the student web menu. To have the name or notes your teacher entered about you deleted, ask your teacher or email {mail}.</p></> },
    { id: 'email', heading: 'If you can’t use the App or the web', body: <><p>Email {mail} with the type of account you signed in with (Kakao, LINE, Apple, Google) and your teacher’s name, and we will delete your data within 10 days after verifying your identity.</p></> },
    { id: 'kept', heading: 'What remains', body: <><ul><li>Usage events and error reports (not linked to your account; no names or sign-in IDs): deleted automatically after 1 year. If you turn them off in Settings or the student web menu, the random device ID is deleted at once.</li><li>Feedback and the reply email: deleted automatically 1 year after we receive them (including the Slack notification copy). Email {mail} to have them deleted sooner.</li><li>If a student deletes their account, the name and past lesson records the teacher entered stay with the teacher until the teacher deletes them or their account.</li></ul></> },
  ],
  effectiveDate: DATE,
  updatedDate: UPDATED,
};

const DOCS: Record<Lang, DocLocale> = { ko, ja, en };
const TITLES: Record<Lang, string> = { ko: '쌤케줄 계정·데이터 삭제', ja: 'せんせジュール アカウント・データの削除', en: 'Delete Your Teachedule Account and Data' };

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/ssamkejul/delete-account', { title: DOCS[lang].title, description: TITLES[lang] });
}

export default async function SsamkejulDeleteAccountPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} slug="ssamkejul" path={`/${lang}/apps/ssamkejul/delete-account`} />;
}
