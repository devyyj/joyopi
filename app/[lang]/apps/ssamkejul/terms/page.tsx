import type { Metadata } from 'next';

import { type Lang } from '@/app/_i18n/config';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 쌤케줄 이용약관. 원고 기준: ssamkejul/docs/legal/terms.md — 여기서 먼저 고치지 않는다.
// 일본어·영어는 한국어판을 옮긴 것이다(원어민 검수 전).
const DATE = '2026-11-16';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;


const ko: DocLocale = {
  lang: 'ko',
  title: "쌤케줄 이용약관",
  lead: <p>쌤케줄(이하 ‘서비스’)은 조요피(JOYOPI, 이하 ‘회사’)가 제공하는 레슨 일정 관리 서비스입니다.</p>,
  sections: [
    { id: "price", heading: "1. 요금", body: <><p>서비스는 지금 무료입니다. 앞으로 일부 기능이나 일정 수 이상의 수강생 등록을 유료로 바꿀 수 있으며, 그때는 30일 전에 알리고 이미 등록한 수강생은 계속 쓸 수 있게 합니다.</p></> },
    { id: "account", heading: "2. 계정", body: <><p>카카오·LINE·Apple·Google 계정으로 로그인합니다. 계정은 본인만 씁니다. 수강생 초대 링크는 처음 연결한 계정에서만 쓰입니다.</p></> },
    { id: "teacher", heading: "3. 선생님의 책임", body: <><ul><li>수강생 정보를 입력하기 전에 수강생에게 알리고 필요한 동의를 받습니다.</li><li>레슨 계약·수강료·환불은 선생님과 수강생 사이의 일이며, 회사는 그 당사자가 아닙니다.</li><li>자동 확정·마감 설정은 선생님이 정하고, 그 결과의 안내는 선생님이 합니다.</li></ul></> },
    { id: "prohibited", heading: "4. 금지 행위", body: <><p>남의 계정 사용, 서비스 방해(자동화된 대량 요청 등), 법령 위반, 다른 사람의 권리 침해, 레슨 일정 관리 외의 목적(광고·스팸 등)으로 쓰는 행위를 금지합니다.</p></> },
    { id: "change", heading: "5. 서비스의 변경·중단", body: <><p>회사는 서비스를 고치거나 일부를 멈출 수 있습니다. 서비스를 끝낼 때는 30일 전에 알립니다.</p></> },
    { id: "liability", heading: "6. 책임의 한계", body: <><p>회사는 서비스를 성실히 운영하지만, 통신 장애·기기 문제·이용자의 잘못된 입력으로 생긴 일정 문제에 대해서는 고의·중과실이 없는 한 책임지지 않습니다. 레슨 자체의 내용과 질은 선생님의 책임입니다.</p></> },
    { id: "leave", heading: "7. 탈퇴", body: <><p>선생님은 앱 「설정」›「계정 삭제(탈퇴)」로 언제든 탈퇴할 수 있습니다. 수강생은 「연결 끊기」로 언제든 연결을 해제할 수 있습니다.</p></> },
    { id: "law", heading: "8. 준거법·관할", body: <><p>대한민국 법을 따르며, 분쟁은 민사소송법에 따른 관할 법원에서 해결합니다. 일본 이용자에게는 일본 소비자계약법 등 강행 규정이 우선합니다. 문의: {mail}</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: "せんせジュール 利用規約",
  lead: <p>せんせジュール（以下「本サービス」）は、JOYOPI（以下「当社」）が提供するレッスンの予定管理サービスです。</p>,
  sections: [
    { id: "price", heading: "1. 料金", body: <><p>本サービスは現在無料です。今後、一部の機能や一定数以上の生徒の登録を有料にすることがあります。その場合は30日前までにお知らせし、登録済みの生徒は引き続きご利用いただけるようにします。</p></> },
    { id: "account", heading: "2. アカウント", body: <><p>カカオ・LINE・Apple・Googleのアカウントでログインします。アカウントはご本人だけが使ってください。生徒の招待リンクは最初に連携したアカウントでのみ使えます。</p></> },
    { id: "teacher", heading: "3. 先生の責任", body: <><ul><li>生徒の情報を入力する前に生徒に知らせ、必要な同意を得てください。</li><li>レッスンの契約・受講料・返金は先生と生徒の間のことであり、当社は当事者ではありません。</li><li>自動確定・締切の設定は先生が決め、その結果のご案内は先生が行います。</li></ul></> },
    { id: "prohibited", heading: "4. 禁止事項", body: <><p>他人のアカウントの使用、サービスの妨害（自動化された大量のリクエストなど）、法令違反、他人の権利の侵害、レッスンの予定管理以外の目的（広告・スパムなど）での利用を禁止します。</p></> },
    { id: "change", heading: "5. サービスの変更・終了", body: <><p>当社は本サービスを変更し、一部を停止することがあります。本サービスを終了する場合は30日前までにお知らせします。</p></> },
    { id: "liability", heading: "6. 責任の制限", body: <><p>当社は本サービスを誠実に運営しますが、通信障害・端末の問題・利用者の誤入力による予定の問題については、故意または重大な過失がない限り責任を負いません。レッスンの内容と質は先生の責任です。</p></> },
    { id: "leave", heading: "7. 退会", body: <><p>先生はアプリ「設定」›「アカウント削除（退会）」からいつでも退会できます。生徒は「連携を解除」からいつでも連携を解除できます。</p></> },
    { id: "law", heading: "8. 準拠法・管轄", body: <><p>大韓民国の法律に準拠し、紛争は同国の民事訴訟法に基づく管轄裁判所で解決します。日本の利用者には、日本の消費者契約法などの強行規定が優先して適用されます。お問い合わせ: {mail}</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: "Teachedule Terms of Use",
  lead: <p>Teachedule (Korean name 쌤케줄 “Ssamkejul”, Japanese name せんせジュール; the “Service”) is a lesson-scheduling service provided by JOYOPI (“we”).</p>,
  sections: [
    { id: "price", heading: "1. Price", body: <><p>The Service is free for now. We may later charge for some features or for registering more than a certain number of students; we will give 30 days’ notice and keep already-registered students usable.</p></> },
    { id: "account", heading: "2. Accounts", body: <><p>You sign in with a Kakao, LINE, Apple or Google account (in English, the App offers Apple and Google), which only you may use. A student invite link works only for the first account that links it.</p></> },
    { id: "teacher", heading: "3. Teacher responsibilities", body: <><ul><li>Tell your students and obtain any required consent before entering their information.</li><li>Lesson contracts, fees and refunds are between teacher and student; we are not a party to them.</li><li>Teachers choose auto-confirmation and deadline settings and are responsible for communicating their results.</li></ul></> },
    { id: "prohibited", heading: "4. Prohibited use", body: <><p>Do not use others’ accounts, disrupt the Service (e.g. automated mass requests), break the law, infringe others’ rights, or use the Service for anything other than managing lesson schedules (e.g. ads or spam).</p></> },
    { id: "change", heading: "5. Changes to the Service", body: <><p>We may change or suspend parts of the Service. We will give 30 days’ notice before ending it and help teachers move their schedule records.</p></> },
    { id: "liability", heading: "6. Limitation of liability", body: <><p>We operate the Service with care, but unless we act intentionally or with gross negligence we are not liable for schedule problems caused by network outages, device issues or incorrect input. The content and quality of lessons are the teacher’s responsibility.</p><p>Nothing in these terms limits rights you have under mandatory consumer protection law where you live.</p></> },
    { id: "leave", heading: "7. Leaving", body: <><p>Teachers can delete their account at any time in Settings › Delete account. Students can unlink at any time with “Unlink”.</p></> },
    { id: "law", heading: "8. Governing law", body: <><p>These terms are governed by the laws of the Republic of Korea, and disputes are resolved in the competent court under its Civil Procedure Act. For users in Japan, mandatory provisions such as the Consumer Contract Act take priority. For users in the EU, the UK and other regions, the mandatory consumer protection laws of your country of residence also continue to apply. Contact: {mail}</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: '2026-11-23',
};

const DOCS: Record<Lang, DocLocale> = { ko, ja, en };
const TITLES: Record<Lang, string> = {"ko": "쌤케줄 이용약관", "ja": "せんせジュール 利用規約", "en": "Teachedule Terms of Use"};

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/ssamkejul/terms', { title: DOCS[lang].title, description: TITLES[lang] });
}

export default async function SsamkejulTermsPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} slug="ssamkejul" path={`/${lang}/apps/ssamkejul/terms`} />;
}
