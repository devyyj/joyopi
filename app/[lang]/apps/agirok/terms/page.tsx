import type { Metadata } from 'next';
import Link from 'next/link';
import { localePath, type Lang } from '@/app/_i18n/config';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { BUSINESS_INFO, CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 아기록(ベビろく / Agirok) 이용약관.
// 원고 기준: apps/agirok/docs/terms.md — 내용을 여기서 먼저 고치지 않는다.
// 원고가 바뀌면 한국어판을 그대로 다시 옮기고, 일본어·영어판도 같이 고친 뒤 날짜를 고친다. (docs/03_앱_스토어_페이지.md 5-4)
// 일본어·영어는 한국어판을 옮긴 것이다. ‘’·「」·“” 안의 메뉴 이름은 앱 화면 문구(agirok src/i18n/{ko,ja,en}.ts)와 같게 쓴다.
const EFFECTIVE_DATE = '2026-11-14';
const UPDATED_DATE = '2026-11-14';

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
const privacyHref = (lang: Lang) => localePath(lang, '/apps/agirok/privacy');
const supportHref = (lang: Lang) => localePath(lang, '/apps/agirok/support');

const ko: DocLocale = {
  lang: 'ko',
  title: '아기록 이용약관',
  lead: (
    <p>
      아기록(이하 ‘앱’)은 {BUSINESS_INFO.nameKo}({BUSINESS_INFO.nameEn}, 이하 ‘회사’)가 만든 육아 기록 앱입니다. 앱을 쓰면 이
      약관에 동의한 것으로 봅니다.
    </p>
  ),
  sections: [
    {
      id: 'purpose',
      heading: '1. 목적',
      body: (
        <p>
          이 약관은 회사가 제공하는 앱과 그에 딸린 서비스(이하 ‘서비스’)를 이용하는 조건과, 회사와 이용자의 권리·의무를
          정합니다.
        </p>
      ),
    },
    {
      id: 'changes',
      heading: '2. 약관의 효력과 변경',
      body: (
        <ol>
          <li>약관은 앱의 로그인 화면과 설정에서 언제든 볼 수 있습니다.</li>
          <li>
            회사는 관련 법령을 어기지 않는 범위에서 약관을 바꿀 수 있습니다. 바꿀 때는 시행일 7일 전(이용자에게 불리하거나
            중요한 변경은 30일 전)부터 앱 공지나 이 페이지로 알립니다.
          </li>
          <li>
            바뀐 약관에 동의하지 않으면 탈퇴할 수 있습니다. 시행일 뒤에도 서비스를 계속 쓰면 바뀐 약관에 동의한 것으로
            봅니다.
          </li>
        </ol>
      ),
    },
    {
      id: 'account',
      heading: '3. 계정',
      body: (
        <ol>
          <li>서비스는 구글 계정 또는 Apple 계정으로 로그인해서 씁니다. 회사는 따로 비밀번호를 받지 않습니다.</li>
          <li>앱은 아기를 돌보는 보호자가 쓰는 앱입니다. 만 14세 미만은 이용할 수 없습니다.</li>
          <li>
            계정을 안전하게 관리할 책임은 이용자에게 있습니다. 다른 사람이 내 계정을 쓴 것을 알게 되면 바로 회사에 알려
            주세요.
          </li>
        </ol>
      ),
    },
    {
      id: 'service',
      heading: '4. 서비스 내용',
      body: (
        <ol>
          <li>서비스는 수유·수면·기저귀 기록, 요약과 차트, 공동양육자와의 기록 공유를 제공합니다.</li>
          <li>회사는 기능을 더하거나 바꾸거나 없앨 수 있습니다. 이용자에게 크게 영향을 주는 변경은 미리 알립니다.</li>
          <li>점검, 장애, 통신 문제, 외부 서비스(Google Firebase 등)의 사정으로 서비스가 잠시 멈출 수 있습니다.</li>
          <li>회사가 서비스를 끝내려면 끝내는 날 30일 전까지 앱 공지나 이 페이지로 알립니다.</li>
        </ol>
      ),
    },
    {
      id: 'medical',
      heading: '5. 의료 조언이 아닙니다',
      body: (
        <p>
          앱은 보호자가 남긴 기록을 모아 보여 주는 도구입니다. 진단·치료·건강 상태에 대한 판단이나 조언을 하지 않으며, 의료
          기기가 아닙니다. 아기의 건강이 걱정되면 의사 등 전문가와 상의하세요. 앱에 보이는 숫자와 차트만 믿고 내린 판단의
          책임은 이용자에게 있습니다.
        </p>
      ),
    },
    {
      id: 'sharing',
      heading: '6. 함께 쓰기(공동양육자)',
      body: (
        <ol>
          <li>이용자는 초대 코드로 다른 사람을 초대해 한 아기의 기록을 최대 5명이 함께 쓸 수 있습니다.</li>
          <li>
            초대 코드를 누구에게 줄지는 이용자가 정합니다. 코드를 받은 사람은 그 아기의 기록을 보고, 더하고, 고치고, 지울
            수 있습니다. 믿을 수 있는 사람에게만 주세요.
          </li>
          <li>아기를 등록한 사람은 함께 쓰는 사람을 내보낼 수 있고, 함께 쓰는 사람은 언제든 스스로 그만둘 수 있습니다.</li>
          <li>
            함께 쓰는 사람이 한 기록 추가·수정·삭제로 생긴 문제는 이용자들 사이에서 해결해야 하며, 회사는 책임지지
            않습니다.
          </li>
        </ol>
      ),
    },
    {
      id: 'records',
      heading: '7. 이용자의 기록',
      body: (
        <ol>
          <li>
            이용자가 입력한 기록의 권리는 이용자에게 있습니다. 회사는 서비스를 제공하는 데(저장, 기기 간 동기화, 함께 쓰는
            사람에게 보여 주기) 필요한 범위에서만 기록을 다룹니다.
          </li>
          <li>
            기록은 광고에 쓰지 않으며 광고 회사에 넘기지 않습니다. 개인정보를 어떻게 다루는지는{' '}
            <Link href={privacyHref('ko')}>개인정보처리방침</Link>에 적혀 있습니다.
          </li>
          <li>이용자가 지운 기록과 탈퇴로 지운 데이터는 되살릴 수 없습니다.</li>
        </ol>
      ),
    },
    {
      id: 'payment',
      heading: '8. 광고와 유료 결제',
      body: (
        <ol>
          <li>앱은 무료이며 광고를 보여 줍니다.</li>
          <li>
            ‘광고 제거’는 한 번 결제하는 상품입니다. 결제하면 그 아기를 함께 쓰는 모든 사람에게 광고가 보이지 않습니다.
            가격은 결제 화면에 표시된 금액입니다.
          </li>
          <li>
            결제와 환불은 App Store 또는 Google Play가 처리하며, 각 스토어의 정책을 따릅니다. 회사는 직접 환불해 줄 수
            없습니다. 환불 요청 방법은 <Link href={supportHref('ko')}>지원 페이지</Link>에 있습니다.
          </li>
          <li>
            구매는 결제한 스토어 계정에 남습니다. 기기를 바꾸거나 앱을 다시 설치하면 설정의 ‘구매 복원’으로 다시 적용할 수
            있습니다.
          </li>
          <li>법령이 정한 청약철회 등 소비자의 권리는 이 약관으로 제한되지 않습니다.</li>
        </ol>
      ),
    },
    {
      id: 'conduct',
      heading: '9. 해서는 안 되는 일',
      body: (
        <>
          <p>이용자는 아래 행동을 해서는 안 됩니다.</p>
          <ul>
            <li>다른 사람의 계정이나 초대 코드를 허락 없이 쓰는 일</li>
            <li>서비스나 서버에 무단으로 접근하거나, 정상 운영을 방해하거나, 자동화된 방법으로 지나친 부하를 주는 일</li>
            <li>앱을 분해·변조하거나 역설계하는 일(법령이 허용하는 경우는 제외)</li>
            <li>법령을 어기거나 다른 사람의 권리를 침해하는 내용을 기록에 넣는 일</li>
          </ul>
          <p>
            회사는 위 행동이 확인되면 미리 알린 뒤(급한 경우에는 먼저 조치하고 알립니다) 이용을 제한하거나 계정을 지울 수
            있습니다.
          </p>
        </>
      ),
    },
    {
      id: 'leave',
      heading: '10. 탈퇴',
      body: (
        <ol>
          <li>이용자는 설정의 ‘탈퇴하고 데이터 지우기’에서 언제든 탈퇴할 수 있습니다.</li>
          <li>
            혼자 쓰던 아기의 기록은 탈퇴와 함께 모두 지워집니다. 함께 쓰던 아기의 기록은 다른 사람에게 그대로 남습니다.
          </li>
        </ol>
      ),
    },
    {
      id: 'ip',
      heading: '11. 지식재산권',
      body: (
        <p>
          앱과 그 디자인, 상표, 캐릭터에 대한 권리는 회사에 있습니다. 회사는 이용자에게 이 약관에 따라 개인적·비상업적
          목적으로 앱을 쓸 수 있는 권리만 줍니다. 앱에 포함된 오픈소스 소프트웨어에는 각 라이선스가 적용되며, 목록은 설정의
          ‘오픈소스 라이선스’에 있습니다.
        </p>
      ),
    },
    {
      id: 'liability',
      heading: '12. 책임의 한계',
      body: (
        <ol>
          <li>회사는 서비스를 안정적으로 제공하려고 노력하지만, 서비스가 끊기지 않거나 오류가 없다고 보증하지 않습니다.</li>
          <li>
            회사는 천재지변, 통신 장애, 이용자의 기기·네트워크 문제, 이용자의 잘못, 외부 서비스의 장애처럼 회사가 통제할 수
            없는 이유로 생긴 손해에 책임지지 않습니다.
          </li>
          <li>
            무료로 제공하는 서비스와 관련해서는, 회사의 고의 또는 중대한 과실이 없으면 기록의 손실 등으로 생긴 손해에
            책임지지 않습니다.
          </li>
          <li>이 조항은 법령이 허용하는 범위에서만 적용되며, 법령상 제한할 수 없는 회사의 책임을 없애지 않습니다.</li>
        </ol>
      ),
    },
    {
      id: 'law',
      heading: '13. 준거법과 분쟁',
      body: (
        <ol>
          <li>
            이 약관은 대한민국 법을 따릅니다. 다만 이용자가 사는 나라의 소비자 보호 법령이 반드시 적용되어야 하는 경우에는
            그 보호를 받습니다.
          </li>
          <li>
            분쟁이 생기면 먼저 회사에 알려 주세요. 성실히 협의하겠습니다. 소송은 민사소송법에 따른 관할 법원에 냅니다.
          </li>
        </ol>
      ),
    },
    {
      id: 'contact',
      heading: '14. 문의',
      body: (
        <ul>
          <li>
            상호: {BUSINESS_INFO.nameKo}({BUSINESS_INFO.nameEn}) · 대표자: {BUSINESS_INFO.representative}
          </li>
          <li>이메일: {mail}</li>
        </ul>
      ),
    },
    {
      id: 'addendum',
      heading: '부칙',
      body: <p>이 약관은 {EFFECTIVE_DATE}부터 시행합니다.</p>,
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: 'ベビろく 利用規約',
  lead: (
    <p>
      ベビろく（韓国語名「아기록」、以下「本アプリ」）は、{BUSINESS_INFO.nameEn}（以下「当社」）が作った育児記録アプリです。本アプリを利用すると、この規約に同意したものとみなします。
    </p>
  ),
  notice: <p>この日本語版は韓国語版を翻訳したものです。内容に違いがある場合は、韓国語版が優先します。</p>,
  sections: [
    {
      id: 'purpose',
      heading: '1. 目的',
      body: (
        <p>
          この規約は、当社が提供する本アプリとそれに付随するサービス（以下「本サービス」）の利用条件と、当社と利用者の権利・義務を定めます。
        </p>
      ),
    },
    {
      id: 'changes',
      heading: '2. 規約の効力と変更',
      body: (
        <ol>
          <li>規約は、本アプリのログイン画面と設定からいつでも確認できます。</li>
          <li>
            当社は、関連法令に反しない範囲で規約を変更できます。変更するときは、施行日の7日前（利用者に不利な変更や重要な変更は30日前）から、アプリ内のお知らせまたはこのページでお知らせします。
          </li>
          <li>
            変更後の規約に同意しない場合は、退会できます。施行日以降も本サービスを使い続けた場合は、変更後の規約に同意したものとみなします。
          </li>
        </ol>
      ),
    },
    {
      id: 'account',
      heading: '3. アカウント',
      body: (
        <ol>
          <li>本サービスは、Google アカウントまたは Apple アカウントでログインして利用します。当社が別にパスワードを受け取ることはありません。</li>
          <li>本アプリは、赤ちゃんの世話をする保護者が使うアプリです。14歳未満の方は利用できません。</li>
          <li>
            アカウントを安全に管理する責任は利用者にあります。ほかの人が自分のアカウントを使ったことに気づいたときは、すぐに当社へお知らせください。
          </li>
        </ol>
      ),
    },
    {
      id: 'service',
      heading: '4. サービスの内容',
      body: (
        <ol>
          <li>本サービスは、授乳・睡眠・おむつの記録、まとめとグラフ、一緒に育児をする人との記録の共有を提供します。</li>
          <li>当社は、機能を追加・変更・廃止することがあります。利用者に大きな影響がある変更は、事前にお知らせします。</li>
          <li>点検、障害、通信の問題、外部サービス（Google Firebase など）の事情により、本サービスが一時的に止まることがあります。</li>
          <li>当社が本サービスを終了するときは、終了日の30日前までに、アプリ内のお知らせまたはこのページでお知らせします。</li>
        </ol>
      ),
    },
    {
      id: 'medical',
      heading: '5. 医療上の助言ではありません',
      body: (
        <p>
          本アプリは、保護者が残した記録をまとめて表示する道具です。診断・治療・健康状態についての判断や助言は行わず、医療機器でもありません。赤ちゃんの健康が心配なときは、医師などの専門家にご相談ください。本アプリに表示される数字やグラフだけを頼りに下した判断の責任は、利用者にあります。
        </p>
      ),
    },
    {
      id: 'sharing',
      heading: '6. 共有（一緒に育児をする人）',
      body: (
        <ol>
          <li>利用者は、招待コードでほかの人を招待し、1人の赤ちゃんの記録を最大5人で一緒に使えます。</li>
          <li>
            招待コードを誰に渡すかは利用者が決めます。コードを受け取った人は、その赤ちゃんの記録を見て、追加し、修正し、削除できます。信頼できる人にだけ渡してください。
          </li>
          <li>赤ちゃんを登録した人は一緒に使う人を外すことができ、一緒に使う人はいつでも自分で共有をやめられます。</li>
          <li>
            一緒に使う人による記録の追加・修正・削除で生じた問題は、利用者どうしで解決するものとし、当社は責任を負いません。
          </li>
        </ol>
      ),
    },
    {
      id: 'records',
      heading: '7. 利用者の記録',
      body: (
        <ol>
          <li>
            利用者が入力した記録の権利は利用者にあります。当社は、本サービスの提供（保存、端末間の同期、一緒に使う人への表示）に必要な範囲でのみ記録を取り扱います。
          </li>
          <li>
            記録は広告に使わず、広告会社にも渡しません。個人情報の取り扱いは
            <Link href={privacyHref('ja')}>プライバシーポリシー</Link>に記載しています。
          </li>
          <li>利用者が削除した記録と、退会によって削除されたデータは、元に戻せません。</li>
        </ol>
      ),
    },
    {
      id: 'payment',
      heading: '8. 広告と有料の購入',
      body: (
        <ol>
          <li>本アプリは無料で、広告を表示します。</li>
          <li>
            「広告を非表示」は、一度だけ購入する商品です。購入すると、その赤ちゃんの記録を一緒に使う全員に広告が表示されなくなります。価格は購入画面に表示される金額です。
          </li>
          <li>
            支払いと返金は App Store または Google Play が処理し、各ストアのポリシーに従います。当社が直接返金することはできません。返金のリクエスト方法は
            <Link href={supportHref('ja')}>サポートページ</Link>にあります。
          </li>
          <li>
            購入は、支払いをしたストアのアカウントに残ります。機種変更やアプリの再インストールをしたときは、設定の「購入を復元」でもう一度適用できます。
          </li>
          <li>法令が定める消費者の権利は、この規約によって制限されません。</li>
        </ol>
      ),
    },
    {
      id: 'conduct',
      heading: '9. 禁止事項',
      body: (
        <>
          <p>利用者は、次の行為をしてはいけません。</p>
          <ul>
            <li>ほかの人のアカウントや招待コードを許可なく使うこと</li>
            <li>本サービスやサーバーに不正にアクセスすること、正常な運営を妨げること、自動化された方法で過度な負荷をかけること</li>
            <li>本アプリを分解・改変・リバースエンジニアリングすること（法令が認める場合を除く）</li>
            <li>法令に違反する内容や、ほかの人の権利を侵害する内容を記録に入れること</li>
          </ul>
          <p>
            当社は、これらの行為を確認した場合、事前にお知らせしたうえで（緊急の場合は先に対応し、あとでお知らせします）、利用を制限したりアカウントを削除したりすることがあります。
          </p>
        </>
      ),
    },
    {
      id: 'leave',
      heading: '10. 退会',
      body: (
        <ol>
          <li>利用者は、設定の「退会してデータを削除」からいつでも退会できます。</li>
          <li>
            1人で使っていた赤ちゃんの記録は、退会と同時にすべて削除されます。一緒に使っていた赤ちゃんの記録は、ほかの人にそのまま残ります。
          </li>
        </ol>
      ),
    },
    {
      id: 'ip',
      heading: '11. 知的財産権',
      body: (
        <p>
          本アプリとそのデザイン、商標、キャラクターに関する権利は当社にあります。当社は利用者に対し、この規約に従って個人的かつ非商業的な目的で本アプリを使う権利のみを認めます。本アプリに含まれるオープンソースソフトウェアにはそれぞれのライセンスが適用され、一覧は設定の「オープンソースライセンス」にあります。
        </p>
      ),
    },
    {
      id: 'liability',
      heading: '12. 責任の制限',
      body: (
        <ol>
          <li>当社は本サービスを安定して提供するよう努めますが、本サービスが中断しないこと、誤りがないことを保証しません。</li>
          <li>
            当社は、天災、通信障害、利用者の端末・ネットワークの問題、利用者の過失、外部サービスの障害など、当社が制御できない理由で生じた損害について責任を負いません。
          </li>
          <li>
            無料で提供するサービスに関しては、当社に故意または重大な過失がない限り、記録の消失などによって生じた損害について責任を負いません。
          </li>
          <li>この条項は法令が認める範囲でのみ適用され、法令上制限できない当社の責任をなくすものではありません。</li>
        </ol>
      ),
    },
    {
      id: 'law',
      heading: '13. 準拠法と紛争',
      body: (
        <ol>
          <li>
            この規約は大韓民国の法律に従います。ただし、利用者が住む国の消費者保護法令が必ず適用されるべき場合は、その保護を受けられます。
          </li>
          <li>
            紛争が生じたときは、まず当社にお知らせください。誠実に協議します。訴訟は、韓国の民事訴訟法に基づく管轄裁判所に提起します。
          </li>
        </ol>
      ),
    },
    {
      id: 'contact',
      heading: '14. お問い合わせ',
      body: (
        <ul>
          <li>
            商号：{BUSINESS_INFO.nameEn} ・ 代表者：{BUSINESS_INFO.representativeEn}
          </li>
          <li>メール：{mail}</li>
        </ul>
      ),
    },
    {
      id: 'addendum',
      heading: '附則',
      body: <p>この規約は {EFFECTIVE_DATE} から施行します。</p>,
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: 'Agirok Terms of Use',
  lead: (
    <p>
      Agirok (아기록 in Korea; the “App”) is a baby log app made by {BUSINESS_INFO.nameEn} (the “Company”). By using the App,
      you agree to these terms.
    </p>
  ),
  notice: <p>This English version is a translation of the Korean version. If the two differ, the Korean version prevails.</p>,
  sections: [
    {
      id: 'purpose',
      heading: '1. Purpose',
      body: (
        <p>
          These terms set out the conditions for using the App and its related services (the “Service”), and the rights and
          duties of the Company and its users.
        </p>
      ),
    },
    {
      id: 'changes',
      heading: '2. Effect and changes',
      body: (
        <ol>
          <li>You can read these terms at any time from the App’s sign-in screen and from Settings.</li>
          <li>
            The Company may change these terms to the extent the law allows. Changes are announced in the App or on this page
            at least 7 days before they take effect (30 days for changes that are important or unfavorable to users).
          </li>
          <li>
            If you do not agree to the changed terms, you may delete your account. If you keep using the Service after the
            effective date, you are deemed to have agreed to them.
          </li>
        </ol>
      ),
    },
    {
      id: 'account',
      heading: '3. Account',
      body: (
        <ol>
          <li>You use the Service by signing in with a Google or Apple account. The Company does not collect a separate password.</li>
          <li>The App is for parents and caregivers looking after a baby. People under 14 may not use it.</li>
          <li>
            You are responsible for keeping your account safe. If you learn that someone else has used your account, tell the
            Company right away.
          </li>
        </ol>
      ),
    },
    {
      id: 'service',
      heading: '4. The Service',
      body: (
        <ol>
          <li>The Service lets you log feeding, sleep, and diapers, see summaries and charts, and share records with other caregivers.</li>
          <li>The Company may add, change, or remove features. Changes that significantly affect users are announced in advance.</li>
          <li>
            The Service may stop for a while because of maintenance, outages, network problems, or issues with outside
            services (such as Google Firebase).
          </li>
          <li>If the Company ends the Service, it will announce this in the App or on this page at least 30 days before the end date.</li>
        </ol>
      ),
    },
    {
      id: 'medical',
      heading: '5. Not medical advice',
      body: (
        <p>
          The App is a tool that collects and shows the records caregivers enter. It does not diagnose, treat, or give
          judgments or advice about health, and it is not a medical device. If you are worried about your baby’s health, talk
          to a doctor or another professional. You are responsible for decisions made by relying only on the numbers and
          charts in the App.
        </p>
      ),
    },
    {
      id: 'sharing',
      heading: '6. Sharing with caregivers',
      body: (
        <ol>
          <li>You can invite others with an invite code so that up to 5 people share one baby’s records.</li>
          <li>
            You decide who gets an invite code. Anyone who joins with the code can view, add, edit, and delete that baby’s
            records. Give it only to people you trust.
          </li>
          <li>The person who registered the baby can remove other caregivers, and any caregiver can stop sharing at any time.</li>
          <li>
            Problems caused by records that a caregiver added, edited, or deleted are to be settled among the users. The
            Company is not responsible for them.
          </li>
        </ol>
      ),
    },
    {
      id: 'records',
      heading: '7. Your records',
      body: (
        <ol>
          <li>
            The records you enter belong to you. The Company handles them only as needed to provide the Service (storing
            them, syncing them across devices, and showing them to the caregivers you share with).
          </li>
          <li>
            Records are not used for advertising and are not given to advertising companies. How personal data is handled is
            described in the <Link href={privacyHref('en')}>Privacy Policy</Link>.
          </li>
          <li>Records you delete, and data deleted when you delete your account, cannot be restored.</li>
        </ol>
      ),
    },
    {
      id: 'payment',
      heading: '8. Ads and purchases',
      body: (
        <ol>
          <li>The App is free and shows ads.</li>
          <li>
            “Remove ads” is a one-time purchase. Once purchased, ads are hidden for everyone who shares that baby’s records.
            The price is the amount shown on the purchase screen.
          </li>
          <li>
            Payments and refunds are handled by the App Store or Google Play under each store’s policies. The Company cannot
            issue refunds directly. See the <Link href={supportHref('en')}>Support page</Link> for how to request one.
          </li>
          <li>
            The purchase stays with the store account that paid for it. After switching devices or reinstalling the App, tap
            “Restore purchase” in Settings to apply it again.
          </li>
          <li>These terms do not limit consumer rights that the law guarantees.</li>
        </ol>
      ),
    },
    {
      id: 'conduct',
      heading: '9. What you must not do',
      body: (
        <>
          <p>You must not:</p>
          <ul>
            <li>use someone else’s account or invite code without permission;</li>
            <li>access the Service or its servers without authorization, disrupt normal operation, or place excessive load on it by automated means;</li>
            <li>disassemble, modify, or reverse engineer the App (except where the law allows);</li>
            <li>enter content in records that breaks the law or infringes someone else’s rights.</li>
          </ul>
          <p>
            If the Company confirms such conduct, it may restrict your use or delete your account after giving notice (in
            urgent cases, it may act first and notify you afterwards).
          </p>
        </>
      ),
    },
    {
      id: 'leave',
      heading: '10. Deleting your account',
      body: (
        <ol>
          <li>You can delete your account at any time from “Delete account and data” in Settings.</li>
          <li>
            Records of a baby that only you used are deleted together with your account. Records of a baby you shared stay
            with the other caregivers.
          </li>
        </ol>
      ),
    },
    {
      id: 'ip',
      heading: '11. Intellectual property',
      body: (
        <p>
          The Company owns the rights to the App and its design, trademarks, and characters. The Company grants you only the
          right to use the App for personal, non-commercial purposes under these terms. Open source software included in the
          App is covered by its own licenses, listed under “Open source licenses” in Settings.
        </p>
      ),
    },
    {
      id: 'liability',
      heading: '12. Limits of liability',
      body: (
        <ol>
          <li>The Company works to provide the Service reliably, but does not warrant that it will be uninterrupted or error-free.</li>
          <li>
            The Company is not liable for damage caused by reasons beyond its control, such as natural disasters, network
            failures, problems with your device or network, your own fault, or outages of outside services.
          </li>
          <li>
            For a Service provided free of charge, the Company is not liable for damage such as loss of records unless it
            acted intentionally or with gross negligence.
          </li>
          <li>
            This section applies only to the extent the law allows and does not remove any liability of the Company that
            cannot be limited by law.
          </li>
        </ol>
      ),
    },
    {
      id: 'law',
      heading: '13. Governing law and disputes',
      body: (
        <ol>
          <li>
            These terms are governed by the laws of the Republic of Korea. However, where the consumer protection laws of
            the country you live in must apply, you keep that protection.
          </li>
          <li>
            If a dispute arises, please contact the Company first; we will work on it in good faith. Lawsuits are brought
            before the court that has jurisdiction under the Korean Civil Procedure Act.
          </li>
        </ol>
      ),
    },
    {
      id: 'contact',
      heading: '14. Contact',
      body: (
        <ul>
          <li>
            Business name: {BUSINESS_INFO.nameEn} · Representative: {BUSINESS_INFO.representativeEn}
          </li>
          <li>Email: {mail}</li>
        </ul>
      ),
    },
    {
      id: 'addendum',
      heading: 'Addendum',
      body: <p>These terms take effect on {EFFECTIVE_DATE}.</p>,
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const DOCS: Record<Lang, DocLocale> = { ko, ja, en };
const DESCRIPTIONS: Record<Lang, string> = {
  ko: '아기록 이용약관 · 서비스 이용 조건',
  ja: 'ベビろく 利用規約・サービスの利用条件',
  en: 'Agirok terms of use · conditions for using the service',
};

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/agirok/terms', { title: DOCS[lang].title, description: DESCRIPTIONS[lang] });
}

export default async function AgirokTermsPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} />;
}
