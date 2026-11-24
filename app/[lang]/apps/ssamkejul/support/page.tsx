import type { Metadata } from 'next';
import Link from 'next/link';
import { localePath, type Lang } from '@/app/_i18n/config';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 쌤케줄 지원 페이지.
// 일본어·영어는 한국어판을 옮긴 것이다(원어민 검수 전).
const DATE = '2026-11-16';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
const deleteHref = (lang: Lang) => localePath(lang, '/apps/ssamkejul/delete-account');

const ko: DocLocale = {
  lang: 'ko',
  title: "쌤케줄 지원",
  lead: <p>쌤케줄은 1인 레슨 선생님을 위한 일정 앱입니다. 수강생은 앱 설치 없이 링크로 일정을 봅니다.</p>,
  sections: [
    { id: "contact", heading: "문의", body: <><p>궁금한 점이나 문제가 있으면 {mail}로 보내 주세요. 영업일 3일 이내에 답장합니다.</p></> },
    { id: "faq-student", heading: "수강생도 앱을 설치해야 하나요?", body: <><p>아니요. 선생님이 보낸 초대 링크를 열고 카카오(한국)·LINE(일본) 등으로 로그인하면 웹에서 바로 씁니다.</p></> },
    { id: "faq-link", heading: "초대 링크가 열리지 않아요", body: <><p>초대 링크는 처음 연결한 계정에서만 쓰입니다. 다른 계정으로 연결해야 하면 선생님께 새 링크를 부탁해 주세요(새 링크를 만들면 이전 링크는 쓸 수 없습니다).</p></> },
    { id: "faq-deadline", heading: "시간 바꾸기 버튼이 보이지 않아요", body: <><p>선생님이 정한 변경·취소 마감이 지났거나 그 레슨에 보낸 요청을 선생님이 확인 중이면 버튼 대신 안내가 보입니다. 이때는 선생님께 직접 연락해 주세요.</p></> },
    { id: "faq-delete", heading: "탈퇴하려면?", body: <><p><Link href={deleteHref('ko')}>계정·데이터 삭제 안내</Link>를 보세요.</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: "せんせジュール サポート",
  lead: <p>せんせジュールは個人レッスンの先生のためのスケジュールアプリです。生徒はアプリをインストールせず、リンクから予定を確認します。</p>,
  sections: [
    { id: "contact", heading: "お問い合わせ", body: <><p>ご質問や問題があれば{mail}までお送りください。3営業日以内に返信します。</p></> },
    { id: "faq-student", heading: "生徒もアプリをインストールする必要がありますか?", body: <><p>いいえ。先生から届いた招待リンクを開き、LINEなどでログインすればWebですぐに使えます。</p></> },
    { id: "faq-link", heading: "招待リンクが開けません", body: <><p>招待リンクは最初に連携したアカウントでのみ使えます。別のアカウントで連携する必要がある場合は、先生に新しいリンクをお願いしてください（新しいリンクを作ると前のリンクは使えなくなります）。</p></> },
    { id: "faq-deadline", heading: "振替ボタンが表示されません", body: <><p>先生が決めた振替・キャンセルの締切を過ぎたか、そのレッスンへのリクエストを先生が確認中の場合は、ボタンの代わりに案内が表示されます。その場合は先生に直接ご連絡ください。</p></> },
    { id: "faq-delete", heading: "退会するには?", body: <><p><Link href={deleteHref('ja')}>アカウント・データの削除</Link>をご覧ください。</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: "Teachedule Support",
  lead: <p>Teachedule is a scheduling app for private lesson teachers. Students view their schedule from a link, with nothing to install.</p>,
  sections: [
    { id: "contact", heading: "Contact", body: <><p>If you have a question or problem, email {mail}. We reply within 3 business days.</p></> },
    { id: "faq-student", heading: "Do students need to install the app?", body: <><p>No. Open the invite link from your teacher and sign in with Apple or Google to use it on the web.</p></> },
    { id: "faq-link", heading: "My invite link doesn’t work", body: <><p>An invite link works only for the first account that links it. If you need to link a different account, ask your teacher for a new link (creating a new link disables the old one).</p></> },
    { id: "faq-deadline", heading: "I can’t see the Reschedule button", body: <><p>If the teacher’s change/cancel deadline has passed, or the teacher is reviewing a request you sent for that lesson, a notice appears instead of the button. Please contact your teacher directly.</p></> },
    { id: "faq-delete", heading: "How do I delete my account?", body: <><p>See <Link href={deleteHref('en')}>Delete account & data</Link>.</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: '2026-11-24',
};

const DOCS: Record<Lang, DocLocale> = { ko, ja, en };
const TITLES: Record<Lang, string> = {"ko": "쌤케줄 지원", "ja": "せんせジュール サポート", "en": "Teachedule Support"};

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/ssamkejul/support', { title: DOCS[lang].title, description: TITLES[lang] });
}

export default async function SsamkejulSupportPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} slug="ssamkejul" path={`/${lang}/apps/ssamkejul/support`} />;
}
