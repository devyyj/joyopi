import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { localePath, type Lang } from '@/app/_i18n/config';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { BUSINESS_INFO, CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 쌤케줄 이용약관. 원고 기준: ssamkejul/docs/legal/terms.md(한국어 정본), terms.ja.md, terms.en.md — 여기서 먼저 고치지 않는다.
// 일본어·영어는 한국어판을 옮긴 것이다. 영어는 2026-11-24 원어민 문구 검수 반영, 일본어는 원어민 검수 전. 변호사 검토 전.
// 2026-11-24 공고, 2026-12-01 시행(7일 전 공고). 이전 약관 전문은 「개정 이력」에 남긴다.
const EFFECTIVE = '2026-12-01';
const PUBLISHED = '2026-11-24';
const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
const privacy = (lang: Lang, label: string) => <Link href={localePath(lang, '/apps/ssamkejul/privacy')}>{label}</Link>;
const B = BUSINESS_INFO;

/** 이전 약관 전문(접어 둔다). */
const previous = (summary: string, items: [string, string][]): ReactNode => (
  <details>
    <summary>{summary}</summary>
    {items.map(([h, p]) => (
      <p key={h}><strong>{h}</strong> {p}</p>
    ))}
  </details>
);

const ko: DocLocale = {
  lang: 'ko',
  title: "쌤케줄 이용약관",
  lead: <p>쌤케줄(せんせジュール·Teachedule, 이하 ‘서비스’)은 {B.nameKo}({B.nameEn}, 대표 {B.representative}, 사업자등록번호 {B.registrationNumber}{B.mailOrderNumber ? `, 통신판매업 신고 ${B.mailOrderNumber}` : ''}, 이하 ‘회사’)가 제공하는 레슨 일정 관리 서비스입니다.</p>,
  notice: <p>개정 약관 공고: 이 약관은 {EFFECTIVE}부터 시행됩니다({PUBLISHED} 공고). 그 전까지는 이전 약관이 적용되며, 이전 약관 전문은 맨 아래 「개정 이력」에서 볼 수 있습니다.</p>,
  sections: [
    { id: "service", heading: "1. 서비스", body: <><p>선생님은 앱으로 레슨 시간과 수강생을 관리하고, 수강생은 선생님이 보낸 링크로 웹에서 일정을 보고 신청·변경·취소를 요청합니다.</p></> },
    { id: "price", heading: "2. 요금", body: <><p>서비스는 지금 무료입니다. 앞으로 일부 기능이나 일정 수 이상의 수강생 등록을 유료로 바꿀 수 있으며, 그때는 30일 전에 알리고, 이미 등록한 수강생은 계속 쓸 수 있게 합니다.</p></> },
    { id: "account", heading: "3. 계정과 이용 연령", body: <><ul><li>카카오·LINE·Apple·Google 계정으로 로그인합니다(언어·지역에 따라 고를 수 있는 방법이 다릅니다). 계정은 본인만 쓰고, 다른 사람의 계정을 쓰면 안 됩니다. 수강생 초대 링크는 처음 연결한 계정에서만 쓰입니다.</li><li>로그인하면 이 약관에 동의한 것으로 보며, 회사는 동의한 약관의 버전과 시각을 기록합니다. 개인정보는 {privacy('ko', '개인정보처리방침')}에 따라 처리합니다.</li><li>만 14세(거주 국가의 법이 더 높은 연령을 정한 경우 그 연령) 미만은 보호자가 대신 로그인하거나 보호자의 동의를 받아 이용해야 합니다.</li></ul></> },
    { id: "teacher", heading: "4. 선생님의 책임", body: <><ul><li>수강생 정보(이름·메모 등)를 입력하기 전에 수강생에게 알리고 필요한 동의를 받습니다.</li><li>만 14세(거주 국가의 법이 더 높은 연령을 정한 경우 그 연령) 미만 수강생의 초대 링크는 보호자에게 보냅니다.</li><li>레슨 계약·수강료·환불은 선생님과 수강생 사이의 일이며, 회사는 그 당사자가 아닙니다.</li><li>자동 확정·마감 설정은 선생님이 정하고, 그 결과에 대한 안내는 선생님이 합니다.</li></ul></> },
    { id: "content", heading: "5. 이용자 콘텐츠와 권리", body: <><p>이용자가 입력한 일정·메모·공지의 권리는 이용자에게 있습니다. 회사는 서비스를 제공하는 데 필요한 범위에서만 이를 저장·처리하고 연결된 수강생에게 보여 줍니다. 다른 사람의 권리를 침해하거나 불법인 내용은 {mail}로 신고해 주세요. 서비스의 소프트웨어·디자인의 권리는 회사에 있습니다.</p></> },
    { id: "prohibited", heading: "6. 금지 행위와 이용 제한", body: <><p>남의 계정 사용, 서비스 방해(자동화된 대량 요청 등), 법령 위반, 다른 사람의 권리 침해, 서비스를 레슨 일정 관리 외의 목적(광고·스팸 등)으로 쓰는 행위를 금지합니다.</p><p>이용자가 이런 행위를 하면 회사는 미리 알린 뒤(긴급하면 사후에) 이용을 제한하거나 계정을 정지할 수 있으며, 그 사유를 알립니다. 이의는 {mail}로 받습니다.</p></> },
    { id: "change", heading: "7. 서비스의 변경·중단", body: <><p>회사는 서비스 개선, 점검, 장애 대응, 법령 준수 등 필요한 경우 서비스를 고치거나 일부를 멈출 수 있으며, 이용에 큰 영향이 있는 변경은 미리 알립니다. 서비스를 끝낼 때는 30일 전에 알리고, 선생님이 일정 기록을 옮길 수 있게 돕습니다.</p></> },
    { id: "liability", heading: "8. 책임의 한계", body: <><p>회사는 서비스를 성실히 운영하며, 회사의 고의·중과실로 생긴 손해는 배상합니다. 통신 장애·기기 문제·이용자의 잘못된 입력처럼 회사에 고의·중과실이 없는 사유로 생긴 레슨 일정 문제에 대해서는 책임지지 않습니다. 레슨 자체의 내용과 질은 선생님의 책임입니다.</p><p>이 약관은 이용자가 사는 나라의 소비자 보호 강행 규정에 따른 권리를 제한하지 않습니다.</p></> },
    { id: "leave", heading: "9. 탈퇴", body: <><p>선생님은 앱 「설정」›「계정 삭제(탈퇴)」로 언제든 탈퇴할 수 있으며, 데이터는 {privacy('ko', '개인정보처리방침')}에 따라 지웁니다. 수강생은 「연결 끊기」로 언제든 연결을 해제할 수 있고, 수강생 페이지 메뉴에서 계정을 삭제할 수 있습니다.</p></> },
    { id: "apple", heading: "10. Apple 앱 사용권", body: <><p>iOS 앱의 사용권은 Apple의 표준 최종 사용자 사용권 계약(<a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Licensed Application EULA</a>)을 따르고, 서비스 이용은 이 약관을 따릅니다. Apple은 이 약관의 당사자가 아니며 서비스와 그 지원에 책임지지 않습니다.</p></> },
    { id: "terms-change", heading: "11. 약관의 변경", body: <><p>회사는 약관을 바꿀 때 바뀐 내용과 시행일을 시행 7일 전(이용자에게 불리한 변경은 30일 전)부터 앱 공지와 이 페이지에 알리고, 불리한 변경은 앱 알림 등으로 따로 알립니다. 바뀐 약관에 동의하지 않으면 시행일 전까지 탈퇴(수강생은 연결 끊기·계정 삭제)할 수 있습니다. 회사가 이 내용을 함께 알렸는데도 시행일까지 거부 의사를 밝히지 않으면 바뀐 약관에 동의한 것으로 봅니다.</p></> },
    { id: "law", heading: "12. 준거법·관할·문의", body: <><p>대한민국 법을 따르며, 분쟁은 민사소송법에 따른 관할 법원에서 해결합니다. 다만 일본 이용자에게는 일본 소비자계약법 등 강행 규정이 우선하고, EU·영국 등 법이 허용하는 나라에 사는 소비자는 그 나라 법원에도 소송을 낼 수 있습니다. 분쟁이 생기면 먼저 {mail}로 알려 주세요. 30일 안에 해결하도록 노력합니다.</p><p>문의: {mail}. EU 디지털서비스법(DSA)에 따른 이용자·당국 연락창구도 같은 주소입니다(한국어·일본어·영어).</p></> },
    { id: "history", heading: "13. 개정 이력", body: <><ul><li>{EFFECTIVE} 시행({PUBLISHED} 공고): 운영자 표시, 서비스 설명, 이용 연령, 이용자 콘텐츠, 이용 제한, 서비스 변경 사유, 책임의 한계, Apple 앱 사용권, 약관 변경 절차, 관할·연락창구를 보완했습니다.</li><li>2026-11-16 시행(2026-11-24 문구 수정): 최초 약관.</li></ul>{previous('이전 약관 전문(2026-11-16 시행)', [
      ['1. 요금', '서비스는 지금 무료입니다. 앞으로 일부 기능이나 일정 수 이상의 수강생 등록을 유료로 바꿀 수 있으며, 그때는 30일 전에 알리고 이미 등록한 수강생은 계속 쓸 수 있게 합니다.'],
      ['2. 계정', '카카오·LINE·Apple·Google 계정으로 로그인합니다. 계정은 본인만 씁니다. 수강생 초대 링크는 처음 연결한 계정에서만 쓰입니다.'],
      ['3. 선생님의 책임', '수강생 정보를 입력하기 전에 수강생에게 알리고 필요한 동의를 받습니다. 레슨 계약·수강료·환불은 선생님과 수강생 사이의 일이며, 회사는 그 당사자가 아닙니다. 자동 확정·마감 설정은 선생님이 정하고, 그 결과의 안내는 선생님이 합니다.'],
      ['4. 금지 행위', '남의 계정 사용, 서비스 방해(자동화된 대량 요청 등), 법령 위반, 다른 사람의 권리 침해, 레슨 일정 관리 외의 목적(광고·스팸 등)으로 쓰는 행위를 금지합니다.'],
      ['5. 서비스의 변경·중단', '회사는 서비스를 고치거나 일부를 멈출 수 있습니다. 서비스를 끝낼 때는 30일 전에 알립니다.'],
      ['6. 책임의 한계', '회사는 서비스를 성실히 운영하지만, 통신 장애·기기 문제·이용자의 잘못된 입력으로 생긴 일정 문제에 대해서는 고의·중과실이 없는 한 책임지지 않습니다. 레슨 자체의 내용과 질은 선생님의 책임입니다.'],
      ['7. 탈퇴', '선생님은 앱 「설정」›「계정 삭제(탈퇴)」로 언제든 탈퇴할 수 있습니다. 수강생은 「연결 끊기」로 언제든 연결을 해제할 수 있습니다.'],
      ['8. 약관의 변경', '약관을 바꿀 때는 시행 7일 전(이용자에게 불리하면 30일 전)에 알립니다.'],
      ['9. 준거법·관할', '대한민국 법을 따르며, 분쟁은 민사소송법에 따른 관할 법원에서 해결합니다. 일본 이용자에게는 일본 소비자계약법 등 강행 규정이 우선합니다.'],
    ])}</> },
  ],
  effectiveDate: EFFECTIVE,
  updatedDate: PUBLISHED,
};

const ja: DocLocale = {
  lang: 'ja',
  title: "せんせジュール 利用規約",
  lead: <p>せんせジュール（쌤케줄・Teachedule、以下「本サービス」）は、{B.nameEn}（代表 {B.representativeEn}、韓国事業者登録番号 {B.registrationNumber}、以下「当社」）が提供するレッスンの予定管理サービスです。</p>,
  notice: <p>規約改定のお知らせ: 本規約は{EFFECTIVE}から適用されます（{PUBLISHED}公表）。それまでは改定前の規約が適用されます。改定前の規約の全文は末尾の「改定履歴」でご覧いただけます。</p>,
  sections: [
    { id: "service", heading: "1. 本サービス", body: <><p>先生はアプリでレッスンの時間と生徒を管理し、生徒は先生から届いたリンクからWebで予定を確認し、予約・振替・キャンセルをリクエストします。</p></> },
    { id: "price", heading: "2. 料金", body: <><p>本サービスは現在無料です。今後、一部の機能や一定数以上の生徒の登録を有料にすることがあります。その場合は30日前までにお知らせし、登録済みの生徒は引き続きご利用いただけるようにします。</p></> },
    { id: "account", heading: "3. アカウントと利用年齢", body: <><ul><li>カカオ・LINE・Apple・Googleのアカウントでログインします（選べる方法は言語・地域により異なります）。アカウントはご本人だけが使い、他人のアカウントを使ってはいけません。生徒の招待リンクは最初に連携したアカウントでのみ使えます。</li><li>ログインすると本規約に同意したものとみなされ、当社は同意した規約のバージョンと日時を記録します。個人情報は{privacy('ja', 'プライバシーポリシー')}に従って取り扱います。</li><li>14歳（お住まいの国の法律がより高い年齢を定める場合はその年齢）未満の方は、保護者が代わりにログインするか、保護者の同意を得てご利用ください。</li></ul></> },
    { id: "teacher", heading: "4. 先生の責任", body: <><ul><li>生徒の情報（名前・メモなど）を入力する前に生徒に知らせ、必要な同意を得てください。</li><li>14歳（お住まいの国の法律がより高い年齢を定める場合はその年齢）未満の生徒の招待リンクは、保護者に送ってください。</li><li>レッスンの契約・受講料・返金は先生と生徒の間のことであり、当社は当事者ではありません。</li><li>自動確定・締切の設定は先生が決め、その結果のご案内は先生が行います。</li></ul></> },
    { id: "content", heading: "5. 利用者のコンテンツと権利", body: <><p>利用者が入力した予定・メモ・お知らせの権利は利用者に帰属します。当社は本サービスの提供に必要な範囲でのみ保存・処理し、連携した生徒に表示します。他人の権利を侵害する内容や違法な内容は{mail}までご連絡ください。本サービスのソフトウェア・デザインの権利は当社に帰属します。</p></> },
    { id: "prohibited", heading: "6. 禁止事項と利用制限", body: <><p>他人のアカウントの使用、サービスの妨害（自動化された大量のリクエストなど）、法令違反、他人の権利の侵害、レッスンの予定管理以外の目的（広告・スパムなど）での利用を禁止します。</p><p>利用者がこれらの行為をした場合、当社は事前に（緊急の場合は事後に）通知のうえ利用を制限し、またはアカウントを停止することがあり、その理由をお知らせします。異議は{mail}で受け付けます。</p></> },
    { id: "change", heading: "7. サービスの変更・終了", body: <><p>当社は、サービスの改善、点検、障害対応、法令の遵守など必要な場合に本サービスを変更し、または一部を停止することがあり、利用に大きな影響がある変更は事前にお知らせします。本サービスを終了する場合は30日前までにお知らせし、先生が予定の記録を移せるようお手伝いします。</p></> },
    { id: "liability", heading: "8. 責任の制限", body: <><p>当社は、当社の故意または重大な過失により利用者に生じた損害を賠償します。当社の軽過失（重大な過失を除く過失をいいます）により利用者に損害が生じた場合、当社は、通常生ずべき直接の損害に限り賠償し、本サービスが無料である間はその額を1万円を上限とします。通信障害・端末の問題・利用者の誤入力による予定の問題で当社に過失がないものについては、責任を負いません。レッスンの内容と質は先生の責任です。</p><p>本規約は、利用者がお住まいの国の消費者保護に関する強行規定に基づく権利を制限しません。</p></> },
    { id: "leave", heading: "9. 退会", body: <><p>先生はアプリ「設定」›「アカウント削除（退会）」からいつでも退会でき、データは{privacy('ja', 'プライバシーポリシー')}に従って削除します。生徒は「連携を解除」からいつでも連携を解除でき、生徒ページのメニューからアカウントを削除できます。</p></> },
    { id: "apple", heading: "10. Appleのアプリ使用許諾", body: <><p>iOSアプリの使用許諾はAppleの標準使用許諾契約（<a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Licensed Application EULA</a>）に従い、本サービスの利用は本規約に従います。Appleは本規約の当事者ではなく、本サービスとそのサポートについて責任を負いません。</p></> },
    { id: "terms-change", heading: "11. 規約の変更", body: <><p>当社は、民法第548条の4に基づき、本規約の変更が利用者の一般の利益に適合する場合、または契約の目的に反せず、変更の必要性、変更後の内容の相当性その他の事情に照らして合理的な場合に、本規約を変更することがあります。その場合、変更する旨、変更後の内容および効力発生日を、効力発生日の7日前（利用者に不利な変更は30日前）までに、本サービス内のお知らせおよび本ページで周知します。変更に同意しない場合は、効力発生日までに退会（生徒は連携の解除・アカウントの削除）できます。</p></> },
    { id: "law", heading: "12. 準拠法・管轄・お問い合わせ", body: <><p>大韓民国の法律に準拠し、紛争は同国の民事訴訟法に基づく管轄裁判所で解決します。ただし、日本の利用者には日本の消費者契約法などの強行規定が優先して適用され、EU・英国など法律が認める国にお住まいの消費者は、その国の裁判所にも訴えを提起できます。紛争が生じた場合は、まず{mail}までご連絡ください。30日以内の解決に努めます。</p><p>お問い合わせ: {mail}。EUデジタルサービス法（DSA）に基づく利用者・当局の連絡窓口も同じアドレスです（韓国語・日本語・英語）。</p></> },
    { id: "history", heading: "13. 改定履歴", body: <><ul><li>{EFFECTIVE}適用（{PUBLISHED}公表）: 事業者の表示、サービスの説明、利用年齢、利用者のコンテンツ、利用制限、サービス変更の理由、責任の制限、Appleの使用許諾、規約変更の手続き、管轄・連絡窓口を補いました。</li><li>2026-11-16適用（2026-11-24に「規約の変更」を追加）: 最初の規約。</li></ul>{previous('改定前の規約の全文（2026-11-16適用）', [
      ['1. 料金', '本サービスは現在無料です。今後、一部の機能や一定数以上の生徒の登録を有料にすることがあります。その場合は30日前までにお知らせし、登録済みの生徒は引き続きご利用いただけるようにします。'],
      ['2. アカウント', 'カカオ・LINE・Apple・Googleのアカウントでログインします。アカウントはご本人だけが使ってください。生徒の招待リンクは最初に連携したアカウントでのみ使えます。'],
      ['3. 先生の責任', '生徒の情報を入力する前に生徒に知らせ、必要な同意を得てください。レッスンの契約・受講料・返金は先生と生徒の間のことであり、当社は当事者ではありません。自動確定・締切の設定は先生が決め、その結果のご案内は先生が行います。'],
      ['4. 禁止事項', '他人のアカウントの使用、サービスの妨害（自動化された大量のリクエストなど）、法令違反、他人の権利の侵害、レッスンの予定管理以外の目的（広告・スパムなど）での利用を禁止します。'],
      ['5. サービスの変更・終了', '当社は本サービスを変更し、一部を停止することがあります。本サービスを終了する場合は30日前までにお知らせします。'],
      ['6. 責任の制限', '当社は本サービスを誠実に運営しますが、通信障害・端末の問題・利用者の誤入力による予定の問題については、故意または重大な過失がない限り責任を負いません。レッスンの内容と質は先生の責任です。'],
      ['7. 退会', '先生はアプリ「設定」›「アカウント削除（退会）」からいつでも退会できます。生徒は「連携を解除」からいつでも連携を解除できます。'],
      ['8. 規約の変更', '本規約を変更する場合は、施行の7日前（利用者に不利な変更は30日前）までにお知らせします。'],
      ['9. 準拠法・管轄', '大韓民国の法律に準拠し、紛争は同国の民事訴訟法に基づく管轄裁判所で解決します。日本の利用者には、日本の消費者契約法などの強行規定が優先して適用されます。'],
    ])}</> },
  ],
  effectiveDate: EFFECTIVE,
  updatedDate: PUBLISHED,
};

const en: DocLocale = {
  lang: 'en',
  title: "Teachedule Terms of Service",
  lead: <p>Teachedule (Korean name 쌤케줄 “Ssamkejul”, Japanese name せんせジュール; the “Service”) is a lesson-scheduling service provided by {B.nameEn} (owner: {B.representativeEn}; Korean business registration no. {B.registrationNumber}; “we”).</p>,
  notice: <p>Notice of updated terms: these terms take effect on December 1, 2026 (published November 24, 2026). Until then, the previous terms apply; their full text is under “Revision history” at the bottom of this page. The warranty disclaimer and liability cap in Section 8 take effect on December 24, 2026, 30 days after notice.</p>,
  sections: [
    { id: "service", heading: "1. The Service", body: <><p>Teachers manage lesson times and students in the app. Students use a link from their teacher to see their schedule on the web and book, reschedule or cancel lessons.</p></> },
    { id: "price", heading: "2. Fees", body: <><p>The Service is free for now. We may later charge for some features or for registering more than a certain number of students. If we do, we will give 30 days’ notice, and students you have already registered will remain available to you.</p></> },
    { id: "account", heading: "3. Accounts and age", body: <><ul><li>You sign in with a Kakao, LINE, Apple or Google account. Available sign-in options depend on your language and region. You may use only your own account. Each student invite link can be used by only one account: the first one that signs in with it.</li><li>By signing in, you agree to these terms, and we record which version of the terms you accepted and when. We handle personal information as described in the {privacy('en', 'Privacy Policy')}.</li><li>If you are under 14, or under the higher age required by the law of the country where you live, a parent or guardian must sign in for you or give consent before you use the Service.</li></ul></> },
    { id: "teacher", heading: "4. Teacher responsibilities", body: <><ul><li>Tell your students and obtain any required consent before entering their information (name, note and so on).</li><li>Send invite links for students under 14 (or under the higher age required by the law of the country where they live) to their parent or guardian.</li><li>Lesson contracts, fees and refunds are between teacher and student; we are not a party to them.</li><li>Teachers choose the auto-confirm and deadline settings and are responsible for explaining to students how these settings apply.</li></ul></> },
    { id: "content", heading: "5. Your content", body: <><p>You keep the rights to the schedules, notes and announcements you enter. We store and process them only as needed to provide the Service and show them to linked students. To report content that infringes someone’s rights or is illegal, email {mail}. We own the rights to the Service’s software and design.</p></> },
    { id: "prohibited", heading: "6. Prohibited use and suspension", body: <><p>Do not use others’ accounts, disrupt the Service (such as with automated mass requests), break the law, infringe others’ rights, or use the Service for anything other than managing lesson schedules (such as ads or spam).</p><p>If you do, we may restrict your use or suspend your account after notifying you (or afterwards in urgent cases), and we will tell you why. You can appeal by emailing {mail}.</p></> },
    { id: "change", heading: "7. Changes to the Service", body: <><p>We may change or suspend parts of the Service when needed, such as to improve it, for maintenance, to fix outages or to comply with the law, and we will tell you in advance about changes that significantly affect your use. We will give 30 days’ notice before ending the Service and help teachers export their schedule records.</p></> },
    { id: "liability", heading: "8. Disclaimer and limitation of liability", body: <><p>To the extent permitted by law, the Service is provided “as is” and “as available,” without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose and non-infringement. To the extent permitted by law, we are not liable for indirect, incidental, special or consequential damages or lost profits, and our total liability for any claim relating to the Service will not exceed the greater of US$50 or the amount you paid us in the 12 months before the claim. These limits do not apply to death or personal injury caused by our negligence, fraud, intent or gross negligence, or where applicable law does not allow them. The content and quality of lessons are the teacher’s responsibility.</p><p>Nothing in these terms limits rights you have under mandatory consumer protection law where you live.</p><p>The disclaimer and cap in the first paragraph apply from December 24, 2026. Until then, the following applies instead: we operate the Service with care, but, except in cases of intent or gross negligence, we are not liable for schedule problems caused by network outages, device issues or incorrect information entered by users.</p></> },
    { id: "leave", heading: "9. Deleting your account", body: <><p>Teachers can delete their account at any time in Settings › Delete account, and their data is deleted as described in the {privacy('en', 'Privacy Policy')}. Students can unlink at any time by tapping Unlink, and can delete their account from the menu on the student page.</p></> },
    { id: "apple", heading: "10. Apple", body: <><p>Your license to use the iOS app is governed by Apple’s <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Licensed Application End User License Agreement</a>; these terms govern the Service. Apple is not a party to these terms and is not responsible for the Service or its support.</p></> },
    { id: "terms-change", heading: "11. Changes to these terms", body: <><p>We may change these terms for valid reasons, such as new features, legal requirements or security. We will post the changed terms and their effective date on this page and announce them in the app at least 7 days before they take effect, or at least 30 days before for changes that are unfavorable to you, which we will also tell you about separately, such as by in-app notification. If you do not agree, you may stop using the Service and delete your account (students: unlink or delete your account) before the change takes effect. If we have clearly told you this and you do not object by the effective date, you are treated as agreeing to the changed terms.</p></> },
    { id: "law", heading: "12. Governing law, disputes and contact", body: <><p>These terms are governed by the laws of the Republic of Korea, and disputes will be brought before the court having jurisdiction under the Civil Procedure Act of the Republic of Korea. For users in Japan, mandatory provisions such as the Consumer Contract Act take priority. For users in the EU, the UK and other regions, the mandatory consumer protection laws of your country of residence also continue to apply. If you are a consumer in the EU, the UK or another country whose law gives you this right, you may also bring proceedings in the courts of your country of residence. Before filing a claim, please contact us so we can try to resolve it informally within 30 days.</p><p>Contact: {mail}. This is also our point of contact for users and authorities under the EU Digital Services Act (Korean, Japanese, English).</p></> },
    { id: "history", heading: "13. Revision history", body: <><ul><li>Effective December 1, 2026 (published November 24, 2026; the disclaimer and cap in Section 8 from December 24, 2026): added operator details, a description of the Service, age requirements, your content, suspension, reasons for changing the Service, a warranty disclaimer and liability cap, the Apple license, the procedure for changing these terms, and dispute and contact details.</li><li>Effective November 16, 2026 (wording updated November 24, 2026): first version.</li></ul>{previous('Previous terms in full (effective November 16, 2026)', [
      ['1. Fees', 'The Service is free for now. We may later charge for some features or for registering more than a certain number of students. If we do, we will give 30 days’ notice, and students you have already registered will remain available to you.'],
      ['2. Accounts', 'You sign in with a Kakao, LINE, Apple or Google account (the English version offers Apple and Google). You may use only your own account. Each student invite link can be used by only one account: the first one that signs in with it.'],
      ['3. Teacher responsibilities', 'Tell your students and obtain any required consent before entering their information. Lesson contracts, fees and refunds are between teacher and student; we are not a party to them. Teachers choose the auto-confirm and deadline settings and are responsible for explaining to students how these settings apply.'],
      ['4. Prohibited use', 'Do not use others’ accounts, disrupt the Service (such as with automated mass requests), break the law, infringe others’ rights, or use the Service for anything other than managing lesson schedules (such as ads or spam).'],
      ['5. Changes to the Service', 'We may change or suspend parts of the Service. We will give 30 days’ notice before ending it and help teachers export their schedule records.'],
      ['6. Limitation of liability', 'We operate the Service with care, but, except in cases of intent or gross negligence, we are not liable for schedule problems caused by network outages, device issues or incorrect information entered by users. The content and quality of lessons are the teacher’s responsibility. Nothing in these terms limits rights you have under mandatory consumer protection law where you live.'],
      ['7. Deleting your account', 'Teachers can delete their account at any time in Settings › Delete account. Students can unlink at any time by tapping Unlink.'],
      ['8. Changes to these terms', 'We will notify you at least 7 days before changes to these terms take effect, or at least 30 days before if the changes are unfavorable to you.'],
      ['9. Governing law and disputes', 'These terms are governed by the laws of the Republic of Korea, and disputes will be brought before the court having jurisdiction under the Civil Procedure Act of the Republic of Korea. For users in Japan, mandatory provisions such as the Consumer Contract Act take priority. For users in the EU, the UK and other regions, the mandatory consumer protection laws of your country of residence also continue to apply.'],
    ])}</> },
  ],
  effectiveDate: EFFECTIVE,
  updatedDate: PUBLISHED,
};

const DOCS: Record<Lang, DocLocale> = { ko, ja, en };
const TITLES: Record<Lang, string> = {"ko": "쌤케줄 이용약관", "ja": "せんせジュール 利用規約", "en": "Teachedule Terms of Service"};

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/ssamkejul/terms', { title: DOCS[lang].title, description: TITLES[lang] });
}

export default async function SsamkejulTermsPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} slug="ssamkejul" path={`/${lang}/apps/ssamkejul/terms`} />;
}
