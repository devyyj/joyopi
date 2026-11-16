import type { Metadata } from 'next';
import Link from 'next/link';
import { localePath, type Lang } from '@/app/_i18n/config';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { BUSINESS_INFO, CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 쌤케줄 개인정보처리방침. 원고 기준: ssamkejul/docs/legal/privacy-policy.md — 여기서 먼저 고치지 않는다.
// 일본어·영어는 한국어판을 옮긴 것이다(원어민 검수 전).
const DATE = '2026-11-16';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
const deleteHref = (lang: Lang) => localePath(lang, '/apps/ssamkejul/delete-account');

const ko: DocLocale = {
  lang: 'ko',
  title: "쌤케줄 개인정보처리방침",
  lead: <p>쌤케줄(이하 ‘앱’)은 조요피(JOYOPI, 이하 ‘회사’)가 만든 1인 레슨 선생님용 일정 앱입니다. 선생님은 앱을 설치하고, 수강생은 선생님이 보낸 링크로 앱 설치 없이 웹에서 일정을 봅니다. 회사는 레슨 일정 관리에 꼭 필요한 정보만 처리하며, 앱에는 광고가 없습니다.</p>,
  sections: [
    { id: "items", heading: "1. 처리하는 정보와 목적", body: <><table><thead><tr><th>누구</th><th>항목</th><th>목적</th></tr></thead><tbody><tr><td>선생님</td><td>로그인 계정 식별자(카카오·LINE·Apple·Google), Apple·Google이 주는 경우 이메일</td><td>로그인, 계정 구분</td></tr><tr><td>선생님</td><td>선생님이 입력한 이름, 레슨 설정(가능 시간·길이·정책·레슨비), 공지</td><td>수강생에게 일정·공지 표시, 빈 시간 계산, 통계</td></tr><tr><td>선생님</td><td>기기 푸시 토큰, 기기 종류</td><td>수강생 요청 알림</td></tr><tr><td>수강생(선생님이 입력)</td><td>이름, 메모, 남은 횟수</td><td>선생님의 레슨 관리</td></tr><tr><td>수강생</td><td>로그인 계정 식별자(카카오·LINE·Apple·Google), Apple·Google이 주는 경우 이메일·이름</td><td>로그인, 초대받은 레슨에 연결</td></tr><tr><td>수강생</td><td>레슨 신청·변경·취소 요청과 메모</td><td>일정 조정</td></tr><tr><td>모두</td><td>레슨 일정(날짜·시각·상태)</td><td>일정 관리</td></tr><tr><td>모두(자동)</td><td>익명 사용 기록(앱 실행·기능 사용 이벤트, 무작위 기기 ID, 기기 종류, 언어), IP 주소와 그로 추정한 대략적 위치</td><td>서비스 개선(사람 프로필을 만들지 않으며 이름·메모·로그인 ID는 보내지 않음)</td></tr><tr><td>웹 이용자(자동)</td><td>브라우저·기기 신호와 상호작용 정보(Google reCAPTCHA가 수집)</td><td>자동화된 악용·부정 요청 차단</td></tr></tbody></table><p>카카오·LINE에서 받는 닉네임은 저장하지 않습니다. 수강생 정보는 선생님이 입력하므로, 선생님은 수강생에게 알리고 필요한 동의를 받은 뒤 입력해야 합니다.</p></> },
    { id: "retention", heading: "2. 보유 기간", body: <><ul><li>선생님 계정과 모든 수강생·일정 정보: 선생님이 탈퇴할 때까지. 탈퇴하면 바로 지웁니다(앱 「설정」›「계정 삭제(탈퇴)」).</li><li>수강생 연결 정보: 수강생이나 선생님이 연결을 끊거나 선생님이 수강생을 삭제할 때까지.</li><li>선생님이 삭제한 수강생: 지난 일정 표시를 위해 이름과 지난 레슨 기록만 남고, 선생님 탈퇴 때 모두 지웁니다.</li><li>수강생 로그인 계정: 레슨 연결이 모두 끊긴 뒤에도 남을 수 있으며, 요청하면 지웁니다.</li><li>익명 사용 기록: 1년.</li></ul></> },
    { id: "transfer", heading: "3. 처리 위탁과 국외 이전", body: <><table><thead><tr><th>받는 자</th><th>하는 일</th><th>위치</th></tr></thead><tbody><tr><td>Google LLC (Firebase)</td><td>로그인, 데이터베이스·서버(서울 리전), 푸시 알림, 원격 설정, 웹 호스팅, 악용 방지(reCAPTCHA)</td><td>대한민국(데이터베이스), 미국</td></tr><tr><td>PostHog Inc.</td><td>익명 사용 기록</td><td>독일(EU)</td></tr><tr><td>Kakao Corp.</td><td>카카오 로그인</td><td>대한민국</td></tr><tr><td>LY Corporation</td><td>LINE 로그인</td><td>일본</td></tr><tr><td>Apple Inc.</td><td>Apple 로그인, iOS 푸시</td><td>미국</td></tr></tbody></table><p>국외 이전은 이용자가 서비스를 쓸 때 네트워크로 이루어집니다. 이전을 원하지 않으면 앱을 쓰지 않거나 탈퇴할 수 있습니다.</p></> },
    { id: "rights", heading: "4. 이용자의 권리", body: <><p>언제든 자기 정보를 보거나 고치거나 지우도록 요청할 수 있습니다. 선생님은 앱에서 직접 고치고 탈퇴할 수 있고, 수강생은 수강생 페이지에서 연결을 끊을 수 있습니다. 자세한 방법은 <Link href={deleteHref('ko')}>계정·데이터 삭제 안내</Link>를 보세요. 문의: {mail}</p></> },
    { id: "children", heading: "5. 만 14세 미만 아동", body: <><p>초대 화면에서 자녀의 레슨은 보호자 계정으로 연결하도록 안내합니다(계정 하나에 여러 수강생을 연결할 수 있습니다). 보호자는 언제든 연결을 끊고 삭제를 요청할 수 있습니다.</p></> },
    { id: "security", heading: "6. 안전 조치", body: <><p>데이터는 접근 규칙으로 선생님 본인만 볼 수 있고, 수강생은 서버를 거쳐 자기 일정만 봅니다. 통신은 HTTPS로 암호화되고, 로그인 비밀키는 서버에만 둡니다.</p></> },
    { id: "officer", heading: "7. 개인정보 보호책임자", body: <><p>개인정보 보호책임자: {BUSINESS_INFO.privacyOfficer} ({BUSINESS_INFO.nameKo}), 문의 {mail}</p></> },
    { id: "changes", heading: "8. 바뀔 때", body: <><p>이 방침이 바뀌면 시행 7일 전에 이 페이지와 앱 업데이트 안내로 알립니다.</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: "せんせジュール プライバシーポリシー",
  lead: <p>せんせジュール（以下「本アプリ」）は、JOYOPI（以下「当社」）が提供する個人レッスンの先生向けスケジュールアプリです。先生はアプリをインストールし、生徒は先生が送ったリンクからインストール不要でWebで予定を確認します。当社はレッスンの予定管理に必要な情報だけを扱い、本アプリに広告はありません。</p>,
  sections: [
    { id: "items", heading: "1. 取り扱う情報と目的", body: <><table><thead><tr><th>対象</th><th>項目</th><th>目的</th></tr></thead><tbody><tr><td>先生</td><td>ログインアカウントの識別子（カカオ・LINE・Apple・Google）、Apple・Googleから提供される場合はメールアドレス</td><td>ログイン、アカウントの識別</td></tr><tr><td>先生</td><td>先生が入力した名前、レッスン設定（可能な時間・長さ・ルール・レッスン料）、お知らせ</td><td>生徒への予定・お知らせの表示、空き時間の計算、統計</td></tr><tr><td>先生</td><td>端末のプッシュ通知トークン、端末の種類</td><td>生徒からのリクエストの通知</td></tr><tr><td>生徒（先生が入力）</td><td>名前、メモ、残り回数</td><td>先生のレッスン管理</td></tr><tr><td>生徒</td><td>ログインアカウントの識別子（カカオ・LINE・Apple・Google）、Apple・Googleから提供される場合はメールアドレス・名前</td><td>ログイン、招待されたレッスンとの連携</td></tr><tr><td>生徒</td><td>レッスンの予約・振替・キャンセルのリクエストとメモ</td><td>予定の調整</td></tr><tr><td>全員</td><td>レッスンの予定（日付・時刻・状態）</td><td>予定管理</td></tr><tr><td>全員（自動）</td><td>匿名の利用記録（起動・機能の利用イベント、ランダムな端末ID、端末の種類、言語）、IPアドレスとそこから推定したおおよその地域</td><td>サービス改善（個人のプロフィールは作らず、名前・メモ・ログインIDは送りません）</td></tr><tr><td>Webの利用者（自動）</td><td>ブラウザ・端末の情報と操作の情報（Google reCAPTCHAが収集）</td><td>自動化された不正利用の防止</td></tr></tbody></table><p>カカオ・LINEから受け取るニックネームは保存しません。生徒の情報は先生が入力するため、先生は生徒に知らせ、必要な同意を得たうえで入力してください。</p></> },
    { id: "retention", heading: "2. 保存期間", body: <><ul><li>先生のアカウントとすべての生徒・予定の情報: 先生が退会するまで。退会するとすぐに削除します（アプリ「設定」›「アカウント削除（退会）」）。</li><li>生徒の連携情報: 生徒または先生が連携を解除するか、先生が生徒を削除するまで。</li><li>先生が削除した生徒: 過去の予定表示のため名前と過去のレッスン記録だけが残り、先生の退会時にすべて削除します。</li><li>生徒のログインアカウント: レッスンとの連携がすべて解除された後も残ることがあり、ご依頼があれば削除します。</li><li>匿名の利用記録: 1年。</li></ul></> },
    { id: "transfer", heading: "3. 取扱いの委託と国外移転", body: <><table><thead><tr><th>委託先</th><th>内容</th><th>所在地</th></tr></thead><tbody><tr><td>Google LLC （Firebase）</td><td>ログイン、データベース・サーバー（ソウルリージョン）、プッシュ通知、リモート設定、Webホスティング、不正利用の防止（reCAPTCHA）</td><td>大韓民国（データベース）、米国</td></tr><tr><td>PostHog Inc.</td><td>匿名の利用記録</td><td>ドイツ（EU）</td></tr><tr><td>Kakao Corp.</td><td>カカオログイン</td><td>大韓民国</td></tr><tr><td>LY Corporation</td><td>LINEログイン</td><td>日本</td></tr><tr><td>Apple Inc.</td><td>Appleでサインイン、iOSのプッシュ通知</td><td>米国</td></tr></tbody></table><p>上記の委託先には、外国（大韓民国・米国・ドイツ）にある事業者が含まれます。各国の個人情報の保護に関する制度は、個人情報保護委員会のウェブサイトで確認できます。各委託先は、個人情報の保護のために必要な体制を整備しています。</p></> },
    { id: "rights", heading: "4. 利用者の権利", body: <><p>ご自身の情報の開示・訂正・削除をいつでも求めることができます。先生はアプリで直接修正・退会でき、生徒は生徒ページで連携を解除できます。詳しくは<Link href={deleteHref('ja')}>アカウント・データの削除</Link>をご覧ください。お問い合わせ: {mail}</p></> },
    { id: "children", heading: "5. 子どもの情報", body: <><p>招待画面で、お子さまのレッスンは保護者のアカウントで連携するようご案内しています（1つのアカウントに複数の生徒を連携できます）。保護者はいつでも連携を解除し、削除を求めることができます。</p></> },
    { id: "security", heading: "6. 安全管理措置", body: <><p>データはアクセスルールにより先生本人だけが閲覧でき、生徒はサーバーを通して自分の予定だけを見ます。通信はHTTPSで暗号化され、ログイン用の秘密鍵はサーバーにのみ保管します。</p></> },
    { id: "officer", heading: "7. 個人情報保護責任者", body: <><p>個人情報保護責任者：{BUSINESS_INFO.privacyOfficerEn}（{BUSINESS_INFO.nameEn}）、お問い合わせ {mail}</p></> },
    { id: "changes", heading: "8. 変更", body: <><p>本ポリシーを変更する場合は、施行の7日前までに本ページとアプリのアップデート案内でお知らせします。</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: "Ssamkejul Privacy Policy",
  lead: <p>Ssamkejul (the “App”) is a lesson-scheduling app for independent teachers, made by JOYOPI (“we”). Teachers install the App; students view their schedule on the web through a link from their teacher, with nothing to install. We handle only the information needed to manage lesson schedules, and the App shows no ads.</p>,
  sections: [
    { id: "items", heading: "1. Information we handle and why", body: <><table><thead><tr><th>Who</th><th>Information</th><th>Purpose</th></tr></thead><tbody><tr><td>Teachers</td><td>Sign-in account identifier (Kakao, LINE, Apple, Google); email if Apple or Google provides it</td><td>Sign-in and account identification</td></tr><tr><td>Teachers</td><td>Name you enter, lesson settings (available hours, length, rules, lesson fee), notices</td><td>Showing schedules and notices to students, finding open slots, statistics</td></tr><tr><td>Teachers</td><td>Device push token and device type</td><td>Notifying you of student requests</td></tr><tr><td>Students (entered by the teacher)</td><td>Name, memo, remaining lessons</td><td>The teacher’s lesson management</td></tr><tr><td>Students</td><td>Sign-in account identifier (Kakao, LINE, Apple, Google); email and name if Apple or Google provides them</td><td>Sign-in and linking to the lessons you were invited to</td></tr><tr><td>Students</td><td>Booking, rescheduling and cancellation requests and memos</td><td>Arranging the schedule</td></tr><tr><td>Everyone</td><td>Lesson schedule (date, time, status)</td><td>Schedule management</td></tr><tr><td>Everyone (automatic)</td><td>Anonymous usage events (app opens, feature use, random device ID, device type, language), IP address and approximate location derived from it</td><td>Improving the service (no person profiles; names, memos and sign-in IDs are never sent)</td></tr><tr><td>Web users (automatic)</td><td>Browser and device signals and interaction data (collected by Google reCAPTCHA)</td><td>Blocking automated abuse</td></tr></tbody></table><p>We do not store nicknames received from Kakao or LINE. Because teachers enter student information, teachers must tell their students and obtain any required consent before entering it.</p></> },
    { id: "retention", heading: "2. How long we keep it", body: <><ul><li>Teacher accounts and all student and schedule data: until the teacher deletes the account, then deleted immediately (Settings › Delete account).</li><li>Student links: until the student or teacher unlinks, or the teacher deletes the student.</li><li>Students deleted by a teacher: only the name and past lesson records remain so past schedules display, and are removed when the teacher deletes the account.</li><li>Student sign-in accounts: may remain after all lesson links are removed; we delete them on request.</li><li>Anonymous usage events: 1 year.</li></ul></> },
    { id: "transfer", heading: "3. Service providers and international transfers", body: <><table><thead><tr><th>Provider</th><th>Purpose</th><th>Location</th></tr></thead><tbody><tr><td>Google LLC (Firebase)</td><td>Sign-in, database and server functions (Seoul region), push notifications, remote config, web hosting, abuse prevention (reCAPTCHA)</td><td>South Korea (database), USA</td></tr><tr><td>PostHog Inc.</td><td>Anonymous usage events</td><td>Germany (EU)</td></tr><tr><td>Kakao Corp.</td><td>Kakao sign-in</td><td>South Korea</td></tr><tr><td>LY Corporation</td><td>LINE sign-in</td><td>Japan</td></tr><tr><td>Apple Inc.</td><td>Sign in with Apple, iOS push</td><td>USA</td></tr></tbody></table><p>Transfers happen over the network when you use the service. If you do not want your information transferred, you can stop using the App or delete your account.</p></> },
    { id: "rights", heading: "4. Your rights", body: <><p>You can ask to access, correct or delete your information at any time. Teachers can edit their data and delete their account in the App; students can unlink on the student page. See <Link href={deleteHref('en')}>Delete account & data</Link> for details. Contact: {mail}</p></> },
    { id: "children", heading: "5. Children", body: <><p>On the invite screen we ask parents to link their children’s lessons with the parent’s own account (one account can link several students). Parents can unlink and request deletion at any time.</p></> },
    { id: "security", heading: "6. Security", body: <><p>Access rules let only the teacher read their data; students see only their own schedule through our server. Traffic is encrypted with HTTPS, and sign-in secrets are kept only on the server.</p></> },
    { id: "officer", heading: "7. Privacy officer", body: <><p>Privacy officer: {BUSINESS_INFO.privacyOfficerEn} ({BUSINESS_INFO.nameEn}), contact {mail}</p></> },
    { id: "changes", heading: "8. Changes", body: <><p>If this policy changes, we will announce it on this page and in the App’s update notes at least 7 days before it takes effect.</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const DOCS: Record<Lang, DocLocale> = { ko, ja, en };
const TITLES: Record<Lang, string> = {"ko": "쌤케줄 개인정보처리방침", "ja": "せんせジュール プライバシーポリシー", "en": "Ssamkejul Privacy Policy"};

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/ssamkejul/privacy', { title: DOCS[lang].title, description: TITLES[lang] });
}

export default async function SsamkejulPrivacyPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} />;
}
