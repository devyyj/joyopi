import type { Metadata } from 'next';
import Link from 'next/link';
import { localePath, type Lang } from '@/app/_i18n/config';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { BUSINESS_INFO, CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// LikeLoop 개인정보처리방침. 원고 기준: likeloop/docs/legal/privacy-policy.md — 여기서 먼저 고치지 않는다.
// 일본어·영어는 한국어판을 옮긴 것이다(원어민 검수 전).
const DATE = '2026-11-18';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
const deleteHref = (lang: Lang) => localePath(lang, '/apps/likeloop/delete-account');

const ko: DocLocale = {
  lang: 'ko',
  title: 'LikeLoop 개인정보처리방침',
  lead: <p>LikeLoop(이하 ‘앱’)은 조요피(JOYOPI, 이하 ‘회사’)가 만든 취향 비교 앱입니다. 좋아·싫어 질문에 답하면 다른 사람들의 답과 바로 비교되고, 친구·그룹과 취향 궁합을 볼 수 있습니다. 회사는 이용자의 답을 팔지 않으며, 앱에는 광고가 없습니다.</p>,
  sections: [
    { id: 'data', heading: '1. 처리하는 정보와 목적', body: <><table><thead><tr><th>누구</th><th>항목</th><th>목적</th></tr></thead><tbody>
      <tr><td>모든 이용자</td><td>앱이 자동으로 만든 무작위 계정 ID(익명 계정)</td><td>가입 없이 기록 저장</td></tr>
      <tr><td>모든 이용자</td><td>이름(별명), 나이대(선택), 주간 목표, 언어, 공개 범위 기본값, 알림 설정</td><td>화면 표시, 궁합·그룹에서 친구에게 이름 표시, 나이대별 비교</td></tr>
      <tr><td>모든 이용자</td><td>질문에 대한 답(5단계 또는 ‘잘 모름’), 답한 시각과 이전 답, 답마다 고른 공개 범위</td><td>다른 사람과의 비교, 리포트·성향·변화 기록, 궁합 계산</td></tr>
      <tr><td>계정을 연결한 이용자</td><td>Apple·Google 계정 식별자, 제공되는 경우 이메일</td><td>기기를 바꿔도 기록 유지</td></tr>
      <tr><td>궁합·그룹 이용자</td><td>초대 코드, 연결된 친구, 궁합 결과(같이 답한 질문 수, 점수, 둘 다 좋아·싫어한 질문, 크게 갈린 답), 그룹 이름과 멤버</td><td>궁합·그룹 기능</td></tr>
      <tr><td>차단·신고한 이용자</td><td>차단한 사람, 신고 대상과 사유</td><td>괴롭힘·악용 방지</td></tr>
      <tr><td>알림을 켠 이용자</td><td>기기 푸시 토큰, 기기 종류</td><td>친구·그룹 소식, 매일 질문 알림(기본 꺼짐)</td></tr>
      <tr><td>모든 이용자(자동)</td><td>익명 사용 기록(기능 사용 이벤트, 무작위 기기 ID, 기기 종류, 언어, 앱 버전), IP 주소와 그로 추정한 대략적 위치</td><td>서비스 개선(사람 프로필을 만들지 않으며 이름·답·계정 ID는 보내지 않음)</td></tr>
      <tr><td>초대 웹 이용자(설치 없이)</td><td>무작위 계정 ID, 이름, 답한 질문</td><td>미리보기 궁합</td></tr>
    </tbody></table>
      <ul><li>답은 공개 범위에 따라 쓰입니다. ‘나만’은 본인 화면에만, ‘통계만’은 개인을 알아볼 수 없는 집계 통계에도, ‘궁합까지’(기본)는 친구·그룹 궁합 계산에도 쓰입니다.</li>
      <li>다른 사람에게는 집계 통계(질문별 응답 수, 성향 분포)와, 궁합을 맺은 친구에게 궁합 결과만 보입니다. 친구라도 이용자의 답 하나하나의 목록은 볼 수 없습니다.</li></ul></> },
    { id: 'retention', heading: '2. 보유 기간', body: <><ul>
      <li>계정과 답·궁합·그룹 정보: 이용자가 계정을 삭제할 때까지. 삭제하면 바로 지우고, 집계 통계에서도 그 사람의 몫을 뺍니다(앱 「내 정보」›「계정 삭제」).</li>
      <li>계정을 연결하지 않은 채 앱을 지우면 그 익명 계정에 다시 들어갈 수 없습니다. 앱을 지우기 전에 앱에서 계정을 삭제해 주세요. 이미 지웠다면 {mail}로 이름과 초대 코드를 알려 주시면 찾을 수 있는 범위에서 지웁니다.</li>
      <li>신고 기록: 처리 후 1년.</li>
      <li>익명 사용 기록: 1년.</li></ul></> },
    { id: 'transfer', heading: '3. 처리 위탁과 국외 이전', body: <><table><thead><tr><th>받는 자</th><th>하는 일</th><th>위치</th></tr></thead><tbody>
      <tr><td>Google LLC (Firebase)</td><td>로그인, 데이터베이스·서버(서울 리전), 초대 웹 호스팅, Android 푸시</td><td>대한민국(데이터베이스), 미국</td></tr>
      <tr><td>PostHog Inc.</td><td>익명 사용 기록</td><td>독일(EU)</td></tr>
      <tr><td>650 Industries, Inc. (Expo)</td><td>푸시 알림 전달</td><td>미국</td></tr>
      <tr><td>Apple Inc.</td><td>Apple 로그인, iOS 푸시</td><td>미국</td></tr>
    </tbody></table><p>국외 이전은 이용자가 서비스를 쓸 때 네트워크로 이루어집니다. 이전을 원하지 않으면 앱을 쓰지 않거나 계정을 삭제할 수 있습니다.</p></> },
    { id: 'rights', heading: '4. 이용자의 권리', body: <><p>언제든 자기 정보를 보거나 고치거나 지우도록 요청할 수 있습니다. 이름·공개 범위·알림은 앱에서 바로 고치고, 「내 답 내보내기」로 답을 받을 수 있고, 「계정 삭제」로 모두 지울 수 있습니다. 자세한 방법은 <Link href={deleteHref('ko')}>계정·데이터 삭제 안내</Link>를 보세요. 문의: {mail}</p></> },
    { id: 'children', heading: '5. 만 14세 미만 아동', body: <><p>만 14세 미만은 앱을 쓸 수 없습니다. 시작할 때 만 14세 이상인지 확인하며, 만 14세 미만의 정보가 처리된 것을 알게 되면 바로 지웁니다.</p></> },
    { id: 'security', heading: '6. 안전 조치', body: <><p>데이터는 접근 규칙으로 본인만 볼 수 있고, 궁합·그룹 결과는 서버가 계산해 당사자에게만 보입니다. 통신은 HTTPS로 암호화됩니다.</p></> },
    { id: 'officer', heading: '7. 개인정보 보호책임자', body: <><p>개인정보 보호책임자: {BUSINESS_INFO.privacyOfficer} ({BUSINESS_INFO.nameKo}), 문의 {mail}</p></> },
    { id: 'changes', heading: '8. 바뀔 때', body: <><p>이 방침이 바뀌면 시행 7일 전에 이 페이지와 앱의 「새 소식」으로 알립니다.</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: 'LikeLoop プライバシーポリシー',
  lead: <p>LikeLoop（以下「本アプリ」）は、JOYOPI（以下「当社」）が提供する好みくらべアプリです。好き・嫌いの質問に答えるとほかの人の答えとすぐに比べられ、友だちやグループと好みの相性を見ることができます。当社は利用者の答えを販売せず、本アプリに広告はありません。</p>,
  sections: [
    { id: 'data', heading: '1. 取り扱う情報と目的', body: <><table><thead><tr><th>対象</th><th>項目</th><th>目的</th></tr></thead><tbody>
      <tr><td>すべての利用者</td><td>本アプリが自動で作るランダムなアカウントID（匿名アカウント）</td><td>登録なしで記録を保存</td></tr>
      <tr><td>すべての利用者</td><td>名前（ニックネーム）、年代（任意）、週の目標、言語、公開範囲の初期設定、通知設定</td><td>画面表示、相性・グループで友だちに名前を表示、年代別の比較</td></tr>
      <tr><td>すべての利用者</td><td>質問への答え（5段階または「わからない」）、答えた日時と以前の答え、答えごとの公開範囲</td><td>ほかの人との比較、レポート・傾向・変化の記録、相性の計算</td></tr>
      <tr><td>アカウントを連携した利用者</td><td>Apple・Googleアカウントの識別子、提供される場合はメールアドレス</td><td>機種変更後も記録を引き継ぐ</td></tr>
      <tr><td>相性・グループの利用者</td><td>招待コード、つながった友だち、相性の結果（一緒に答えた質問の数、スコア、ふたりとも好き・嫌いな質問、大きく分かれた答え）、グループ名とメンバー</td><td>相性・グループ機能</td></tr>
      <tr><td>ブロック・通報した利用者</td><td>ブロックした相手、通報の対象と理由</td><td>嫌がらせ・不正利用の防止</td></tr>
      <tr><td>通知をオンにした利用者</td><td>端末のプッシュ通知トークン、端末の種類</td><td>友だち・グループのお知らせ、毎日の質問のお知らせ（初期設定はオフ）</td></tr>
      <tr><td>すべての利用者（自動）</td><td>匿名の利用記録（機能の利用イベント、ランダムな端末ID、端末の種類、言語、アプリのバージョン）、IPアドレスとそこから推定したおおよその地域</td><td>サービス改善（個人のプロフィールは作らず、名前・答え・アカウントIDは送りません）</td></tr>
      <tr><td>招待Webの利用者（インストールなし）</td><td>ランダムなアカウントID、名前、答えた質問</td><td>プレビュー相性</td></tr>
    </tbody></table>
      <ul><li>答えは公開範囲に応じて使います。「自分だけ」は本人の画面だけ、「統計のみ」は個人を特定できない集計統計にも、「相性まで」（初期設定）は友だち・グループの相性計算にも使います。</li>
      <li>ほかの人に見えるのは集計統計（質問ごとの回答数、傾向の分布）と、相性をつないだ友だちへの相性の結果だけです。友だちでも、あなたの答えを一つずつ並べた一覧は見られません。</li></ul></> },
    { id: 'retention', heading: '2. 保存期間', body: <><ul>
      <li>アカウントと答え・相性・グループの情報: 利用者がアカウントを削除するまで。削除するとすぐに消し、集計統計からもその人の分を除きます（アプリ「マイページ · 設定」›「アカウント削除」）。</li>
      <li>アカウントを連携しないままアプリを削除すると、その匿名アカウントには戻れません。アプリを削除する前に、アプリでアカウントを削除してください。すでに削除した場合は、名前と招待コードを{mail}にお知らせいただければ、確認できる範囲で削除します。</li>
      <li>通報の記録: 対応後1年。</li>
      <li>匿名の利用記録: 1年。</li></ul></> },
    { id: 'transfer', heading: '3. 取扱いの委託と国外移転', body: <><table><thead><tr><th>委託先</th><th>内容</th><th>所在地</th></tr></thead><tbody>
      <tr><td>Google LLC （Firebase）</td><td>ログイン、データベース・サーバー（ソウルリージョン）、招待Webのホスティング、Androidのプッシュ通知</td><td>大韓民国（データベース）、米国</td></tr>
      <tr><td>PostHog Inc.</td><td>匿名の利用記録</td><td>ドイツ（EU）</td></tr>
      <tr><td>650 Industries, Inc. （Expo）</td><td>プッシュ通知の配信</td><td>米国</td></tr>
      <tr><td>Apple Inc.</td><td>Appleでサインイン、iOSのプッシュ通知</td><td>米国</td></tr>
    </tbody></table><p>上記の委託先には、外国（大韓民国・米国・ドイツ）にある事業者が含まれます。各国の個人情報の保護に関する制度は、個人情報保護委員会のウェブサイトで確認できます。各委託先は、個人情報の保護のために必要な体制を整備しています。</p></> },
    { id: 'rights', heading: '4. 利用者の権利', body: <><p>ご自身の情報の開示・訂正・削除をいつでも求めることができます。名前・公開範囲・通知はアプリですぐに変更でき、「答えをエクスポート」で答えを受け取り、「アカウント削除」ですべて消せます。詳しくは<Link href={deleteHref('ja')}>アカウント・データの削除</Link>をご覧ください。お問い合わせ: {mail}</p></> },
    { id: 'children', heading: '5. 14歳未満の方', body: <><p>14歳未満の方は本アプリを利用できません。開始時に14歳以上であることを確認し、14歳未満の方の情報を取り扱っていることがわかった場合はすぐに削除します。</p></> },
    { id: 'security', heading: '6. 安全管理措置', body: <><p>データはアクセスルールにより本人だけが閲覧でき、相性・グループの結果はサーバーが計算して当事者にだけ表示します。通信はHTTPSで暗号化されます。</p></> },
    { id: 'officer', heading: '7. 個人情報保護責任者', body: <><p>個人情報保護責任者：{BUSINESS_INFO.privacyOfficerEn}（{BUSINESS_INFO.nameEn}）、お問い合わせ {mail}</p></> },
    { id: 'changes', heading: '8. 変更', body: <><p>本ポリシーを変更する場合は、施行の7日前までに本ページとアプリの「お知らせ」でお知らせします。</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: 'LikeLoop Privacy Policy',
  lead: <p>LikeLoop (the “App”) is a taste-comparison app made by JOYOPI (“we”). Answer like-or-dislike questions to see right away how you compare with everyone else, and check your taste match with friends and groups. We never sell your answers, and the App shows no ads.</p>,
  sections: [
    { id: 'data', heading: '1. Information we handle and why', body: <><table><thead><tr><th>Who</th><th>Information</th><th>Purpose</th></tr></thead><tbody>
      <tr><td>Everyone</td><td>A random account ID the App creates automatically (anonymous account)</td><td>Saving your records without sign-up</td></tr>
      <tr><td>Everyone</td><td>Name (nickname), age group (optional), weekly goal, language, default visibility, notification settings</td><td>Display, showing your name to friends in matches and groups, comparison by age group</td></tr>
      <tr><td>Everyone</td><td>Your answers (5 levels or “not sure”), when you answered and your previous answers, the visibility you chose for each answer</td><td>Comparing with others, reports, traits and change history, match calculation</td></tr>
      <tr><td>People who link an account</td><td>Apple or Google account identifier; email if provided</td><td>Keeping your records when you change devices</td></tr>
      <tr><td>Match and group users</td><td>Invite codes, connected friends, match results (number of shared questions, score, questions you both like or dislike, biggest differences), group names and members</td><td>Match and group features</td></tr>
      <tr><td>People who block or report</td><td>People you blocked; report target and reason</td><td>Preventing harassment and abuse</td></tr>
      <tr><td>People with notifications on</td><td>Device push token and device type</td><td>Friend and group updates, daily question reminders (off by default)</td></tr>
      <tr><td>Everyone (automatic)</td><td>Anonymous usage events (feature use, random device ID, device type, language, app version), IP address and approximate location derived from it</td><td>Improving the service (no person profiles; names, answers and account IDs are never sent)</td></tr>
      <tr><td>Invite web users (no install)</td><td>Random account ID, name, answered questions</td><td>Preview match</td></tr>
    </tbody></table>
      <ul><li>Each answer is used according to its visibility: “Only me” stays on your screen, “Stats only” also counts toward anonymous aggregate statistics, and “Matches too” (default) is also used for friend and group matches.</li>
      <li>Other people see only aggregate statistics (answer counts per question, trait distributions), and friends you matched with see only your match result. Even friends cannot see a list of your individual answers.</li></ul></> },
    { id: 'retention', heading: '2. How long we keep it', body: <><ul>
      <li>Your account, answers, matches and groups: until you delete your account. We delete them right away and remove your share from aggregate statistics (Profile · Settings › Delete account in the App).</li>
      <li>If you delete the App without linking an account, you cannot get back into that anonymous account. Please delete your account in the App before removing the App. If you already removed it, email {mail} with your name and invite code and we will delete what we can find.</li>
      <li>Report records: 1 year after they are handled.</li>
      <li>Anonymous usage events: 1 year.</li></ul></> },
    { id: 'transfer', heading: '3. Service providers and international transfers', body: <><table><thead><tr><th>Provider</th><th>Purpose</th><th>Location</th></tr></thead><tbody>
      <tr><td>Google LLC (Firebase)</td><td>Sign-in, database and server functions (Seoul region), invite web hosting, Android push</td><td>South Korea (database), USA</td></tr>
      <tr><td>PostHog Inc.</td><td>Anonymous usage events</td><td>Germany (EU)</td></tr>
      <tr><td>650 Industries, Inc. (Expo)</td><td>Push notification delivery</td><td>USA</td></tr>
      <tr><td>Apple Inc.</td><td>Sign in with Apple, iOS push</td><td>USA</td></tr>
    </tbody></table><p>Transfers happen over the network when you use the service. If you do not want your information transferred, you can stop using the App or delete your account.</p></> },
    { id: 'rights', heading: '4. Your rights', body: <><p>You can ask to access, correct or delete your information at any time. You can change your name, visibility and notifications in the App, download your answers with “Export my answers”, and delete everything with “Delete account”. See <Link href={deleteHref('en')}>Delete account & data</Link> for details. Contact: {mail}</p></> },
    { id: 'children', heading: '5. Children', body: <><p>People under 14 may not use the App. We ask you to confirm you are 14 or older when you start, and we delete information from anyone under 14 as soon as we learn of it.</p></> },
    { id: 'security', heading: '6. Security', body: <><p>Access rules let only you read your data, and match and group results are calculated on our server and shown only to the people involved. Traffic is encrypted with HTTPS.</p></> },
    { id: 'officer', heading: '7. Privacy officer', body: <><p>Privacy officer: {BUSINESS_INFO.privacyOfficerEn} ({BUSINESS_INFO.nameEn}), contact {mail}</p></> },
    { id: 'changes', heading: '8. Changes', body: <><p>If this policy changes, we will announce it on this page and in the App’s “What’s New” at least 7 days before it takes effect.</p></> },
  ],
  effectiveDate: DATE,
  updatedDate: DATE,
};

const DOCS: Record<Lang, DocLocale> = { ko, ja, en };

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/likeloop/privacy', { title: DOCS[lang].title, description: DOCS[lang].title });
}

export default async function LikeLoopPrivacyPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} />;
}
