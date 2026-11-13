import type { Metadata } from 'next';
import Link from 'next/link';
import { localePath, type Lang } from '@/app/_i18n/config';
import { localizedMetadata, resolveLang, type LangParams } from '@/app/_i18n/page';
import DocPage, { type DocLocale } from '@/app/apps/_components/doc-page';
import { BUSINESS_INFO, CONTACT_EMAIL } from '@/app/apps/_lib/business-info';

// 아기록(ベビろく / Agirok) 개인정보처리방침.
// 원고 기준: apps/agirok/docs/privacy-policy.md — 내용을 여기서 먼저 고치지 않는다.
// 원고가 바뀌면 한국어판을 그대로 다시 옮기고, 일본어·영어판도 같이 고친 뒤 날짜를 고친다. (docs/03_앱_스토어_페이지.md 5-1)
// 일본어·영어는 한국어판을 옮긴 것이다. ‘’ 안의 메뉴 이름은 앱 화면 문구(agirok src/i18n/{ko,ja,en}.ts)와 같게 쓴다.
// 원고는 6열 국외 이전 표지만, 모바일 폭(390px)에서 가로 스크롤이 생겨 받는 자별 2열 표로 옮긴다(AGENTS.md 6.11). 내용은 같다.
const EFFECTIVE_DATE = '2026-11-12';
const UPDATED_DATE = '2026-11-13';
/** 일본어·영어판을 처음 올린 날 */
const TRANSLATED_DATE = '2026-11-13';

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
const deleteHref = (lang: Lang) => localePath(lang, '/apps/agirok/delete-account');

/** 받는 자별 2열 표(제목 칸 + 값 칸) */
const KeyValueTable = ({ rows }: { rows: [string, string][] }) => (
  <table>
    <tbody>
      {rows.map(([k, v]) => (
        <tr key={k}>
          <th>{k}</th>
          <td>{v}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const ko: DocLocale = {
  lang: 'ko',
  title: '아기록 개인정보처리방침',
  lead: (
    <p>
      아기록(이하 ‘앱’)은 {BUSINESS_INFO.nameKo}({BUSINESS_INFO.nameEn}, 이하 ‘회사’)가 만든 육아 기록 앱입니다. 회사는 육아
      기록을 돕기 위해 꼭 필요한 정보만 처리합니다.
    </p>
  ),
  notice: (
    <p>
      아기 육아 기록은 광고에 쓰지 않으며 광고 회사에 넘기지 않습니다. 앱은 보호자가 쓰는 앱이며, 아기에 대한 정보는 아동의
      건강과 관련된 정보로 보아 신중하게 다룹니다.
    </p>
  ),
  sections: [
    {
      id: 'items',
      heading: '1. 처리하는 정보와 목적',
      body: (
        <>
          <table>
            <thead>
              <tr>
                <th>구분</th>
                <th>항목</th>
                <th>목적</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>계정</td>
                <td>구글 또는 Apple 계정 식별자, 이메일(Apple의 이메일 가리기를 쓰면 대체 주소), 이름</td>
                <td>로그인, 기기 변경 시 기록 복구</td>
              </tr>
              <tr>
                <td>아기 정보</td>
                <td>이름(태명), 태어난 날, 밤잠 시간대</td>
                <td>생후 일수 표시, 낮잠·밤잠 구분</td>
              </tr>
              <tr>
                <td>육아 기록</td>
                <td>수유(양·시간), 수면 시간, 기저귀, 메모, 기록한 사람 이름</td>
                <td>기록·요약·차트, 공동양육자와 공유</td>
              </tr>
              <tr>
                <td>기기·사용 정보</td>
                <td>
                  앱 사용 이벤트, 오류 정보, 기기 종류·운영체제 버전, 앱이 만든 무작위 식별자, IP 주소(접속 시 자동 전송)와 그로
                  추정한 대략적 위치(국가·도시)
                </td>
                <td>앱 개선, 오류 수정 (PostHog)</td>
              </tr>
              <tr>
                <td>광고</td>
                <td>광고 식별자(동의한 경우)</td>
                <td>광고 표시 (Google AdMob)</td>
              </tr>
              <tr>
                <td>결제</td>
                <td>광고 제거 구매 여부</td>
                <td>구매한 가족 계정에서 광고 숨기기</td>
              </tr>
            </tbody>
          </table>
          <ul>
            <li>위 정보는 앱을 쓰는 동안 이용자가 직접 입력하거나, 앱 이용 과정에서 자동으로 만들어집니다.</li>
            <li>
              앱 사용 이벤트와 오류 정보는 계정·이름·이메일과 연결하지 않고, 아기 이름·육아 기록 내용도 담지 않습니다. 화면
              녹화는 하지 않습니다.
            </li>
            <li>맞춤형 광고는 동의한 경우에만 표시합니다. 동의하지 않아도 앱을 쓸 수 있습니다.</li>
            <li>카드 번호 등 결제 정보는 Apple·Google이 처리하며 회사는 받지 않습니다.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'retention',
      heading: '2. 보유·이용 기간과 보관 장소',
      body: (
        <ul>
          <li>
            계정·아기 정보·육아 기록: <strong>탈퇴할 때까지</strong> 보유하며, 탈퇴하면 지체 없이 지웁니다.
          </li>
          <li>
            다른 공동양육자와 함께 쓰던 아기의 기록은 탈퇴한 뒤에도 그 사람들이 계속 볼 수 있습니다. 혼자 쓰던 아기의 기록은
            모두 지워집니다.
          </li>
          <li>
            앱 사용 이벤트·오류 정보·IP 주소와 대략적 위치: 수집일로부터 <strong>1년</strong> 보관한 뒤 지웁니다(PostHog, 독일).
            계정과 연결하지 않으므로 탈퇴해도 바로 지워지지 않고 이 기간이 지나면 지워집니다.
          </li>
          <li>기록은 Google Firebase(Cloud Firestore, 서울 리전)에 암호화된 연결로 저장합니다.</li>
          <li>
            관계 법령에 따라 보관해야 하는 정보가 있으면 그 기간 동안 따로 보관합니다. 결제 기록은 Apple·Google이 보관합니다.
          </li>
        </ul>
      ),
    },
    {
      id: 'destruction',
      heading: '3. 파기 절차와 방법',
      body: (
        <ul>
          <li>
            탈퇴하거나 처리 목적을 다한 정보는 지체 없이 파기합니다. 앱 사용 이벤트·오류 정보는 2장의 보유 기간(수집일로부터
            1년)이 지나면 파기합니다.
          </li>
          <li>
            전자 파일은 복구할 수 없도록 서버(Cloud Firestore)와 인증 계정에서 삭제합니다. 종이 문서는 만들지 않습니다.
          </li>
        </ul>
      ),
    },
    {
      id: 'third-party',
      heading: '4. 제3자 제공',
      body: (
        <p>
          회사는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 따라 수사기관 등이 적법한 절차로 요구하는 경우는
          예외입니다.
        </p>
      ),
    },
    {
      id: 'entrust',
      heading: '5. 처리 위탁',
      body: (
        <>
          <table>
            <thead>
              <tr>
                <th>받는 자</th>
                <th>맡기는 일</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Google LLC</td>
                <td>로그인(Firebase Authentication), 데이터 저장(Cloud Firestore), 광고(AdMob)</td>
              </tr>
              <tr>
                <td>PostHog Inc.</td>
                <td>앱 사용 통계·오류 수집</td>
              </tr>
              <tr>
                <td>Apple Inc.</td>
                <td>로그인(Apple로 로그인, iOS)</td>
              </tr>
            </tbody>
          </table>
          <p>결제(광고 제거)는 Apple App Store, Google Play가 각자의 방침에 따라 처리합니다.</p>
        </>
      ),
    },
    {
      id: 'overseas',
      heading: '6. 국외 이전',
      body: (
        <>
          <KeyValueTable
            rows={[
              ['받는 자', 'Google LLC'],
              ['이전 국가', '미국 등 Google 데이터센터가 있는 국가'],
              ['이전 항목', '계정 식별자·이메일·이름(Firebase Authentication), 광고 식별자(AdMob, 동의한 경우)'],
              ['이전 시기·방법', '앱을 쓰는 때에 암호화된 통신망으로 전송'],
              ['이용 목적', '로그인, 광고 표시'],
              ['보유 기간', '탈퇴 또는 위탁 계약 종료 시까지'],
            ]}
          />
          <KeyValueTable
            rows={[
              ['받는 자', 'PostHog Inc.'],
              ['이전 국가', '독일(EU)'],
              [
                '이전 항목',
                '앱 사용 이벤트, 오류 정보, 기기 종류·운영체제 버전, 앱이 만든 무작위 식별자, IP 주소(접속 시 자동 전송)와 그로 추정한 대략적 위치(국가·도시)',
              ],
              ['이전 시기·방법', '앱을 쓰는 때에 암호화된 통신망으로 전송'],
              ['이용 목적', '앱 개선·오류 수정'],
              ['보유 기간', '1년'],
            ]}
          />
          <KeyValueTable
            rows={[
              ['받는 자', 'Apple Inc.'],
              ['이전 국가', '미국'],
              ['이전 항목', 'Apple 계정 식별자, 이메일(또는 대체 주소), 이름'],
              ['이전 시기·방법', 'Apple로 로그인할 때 암호화된 통신망으로 전송'],
              ['이용 목적', '로그인'],
              ['보유 기간', '탈퇴 시까지(탈퇴하면 Apple 로그인 토큰을 취소)'],
            ]}
          />
          <ul>
            <li>아기 정보와 육아 기록은 서울 리전에 저장합니다.</li>
            <li>
              국외 이전을 원하지 않으면 앱을 쓰지 않거나 탈퇴하여 거부할 수 있습니다. 다만 로그인이 필요한 앱이라 이 경우 앱을
              쓸 수 없습니다. 맞춤형 광고에 쓰이는 광고 식별자는 설정 › ‘광고 개인정보 설정’에서 따로 거부할 수 있습니다.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'rights',
      heading: '7. 이용자의 권리와 행사 방법',
      body: (
        <ul>
          <li>이용자는 언제든지 자신의 개인정보를 열람·정정·삭제하거나 처리 정지를 요구할 수 있습니다.</li>
          <li>앱에서 기록과 아기 정보, 내 이름을 직접 보고 고칠 수 있습니다.</li>
          <li>
            앱의 설정 › ‘탈퇴하고 데이터 지우기’로 언제든 모든 정보를 지울 수 있습니다. 앱이 없어도 문의 메일로 삭제를 요청할
            수 있습니다(<Link href={deleteHref('ko')}>계정·데이터 삭제 안내</Link>).
          </li>
          <li>설정 › ‘광고 개인정보 설정’에서 맞춤형 광고 동의를 바꿀 수 있습니다.</li>
          <li>그 밖의 요청은 {mail}로 보내면 지체 없이 처리합니다.</li>
        </ul>
      ),
    },
    {
      id: 'security',
      heading: '8. 안전성 확보 조치',
      body: (
        <ul>
          <li>모든 통신은 암호화된 연결(TLS)로 주고받습니다.</li>
          <li>데이터베이스 보안 규칙으로, 그 아기의 양육자로 등록된 계정만 기록을 읽고 쓸 수 있게 합니다.</li>
          <li>공동양육자 초대 코드는 6자리이며 24시간 뒤에는 쓸 수 없습니다.</li>
          <li>운영 데이터에 접근할 수 있는 사람을 개인정보 보호책임자 한 명으로 제한합니다.</li>
        </ul>
      ),
    },
    {
      id: 'ad-id',
      heading: '9. 자동 수집 장치(광고 식별자)와 거부 방법',
      body: (
        <ul>
          <li>
            앱은 쿠키를 쓰지 않습니다. 사용 통계를 위해 앱이 기기 안에 무작위 식별자를 만들어 저장하며, 이 식별자는 광고
            식별자가 아니고 계정과 연결하지 않습니다. 앱을 지우면 함께 지워집니다.
          </li>
          <li>광고를 위해 기기의 광고 식별자(Android 광고 ID, iOS IDFA)를 동의한 경우에만 씁니다.</li>
          <li>
            거부 방법: 앱의 설정 › ‘광고 개인정보 설정’을 누르면, 유럽 등 광고 동의 창이 필요한 지역에서는 동의 창이 열리고, 그
            밖의 지역에서는 기기의 추적·광고 설정 화면이 열립니다. 기기에서 직접 바꿀 때는 iOS는 설정 › 개인정보 보호 및 보안 ›
            추적, Android는 설정 › Google › 광고에서 광고 ID를 지우거나 재설정할 수 있습니다.
          </li>
        </ul>
      ),
    },
    {
      id: 'children',
      heading: '10. 아동의 개인정보',
      body: (
        <p>
          앱은 보호자가 쓰는 앱이며 만 14세 미만 아동을 대상으로 하지 않습니다. 아기에 대한 정보는 보호자가 입력하며, 아동
          건강 관련 정보로 보아 신중하게 다룹니다.
        </p>
      ),
    },
    {
      id: 'officer',
      heading: '11. 개인정보 보호책임자와 문의',
      body: (
        <ul>
          <li>
            개인정보 보호책임자: {BUSINESS_INFO.privacyOfficer} ({BUSINESS_INFO.nameKo})
          </li>
          <li>연락처: {mail}</li>
          <li>
            개인정보 침해에 대한 신고·상담은 개인정보침해신고센터(privacy.kisa.or.kr, 국번 없이 118),
            개인정보분쟁조정위원회(www.kopico.go.kr, 1833-6972)에 할 수 있습니다.
          </li>
        </ul>
      ),
    },
    {
      id: 'international',
      heading: '12. 해외 이용자에 대한 추가 안내',
      body: (
        <>
          <p>
            앱은 한국어·일본어·영어로 전 세계에 제공됩니다. 1~11장은 모든 이용자에게 적용되며, 이 장은 사는 곳의 법이 따로
            요구하는 내용을 더합니다.
          </p>

          <h3 className="mt-4 font-bold">12-1. 유럽연합(EU)·유럽경제지역(EEA)·영국 이용자 (GDPR, UK GDPR)</h3>
          <p>
            <strong>개인정보 처리자(컨트롤러)</strong>: {BUSINESS_INFO.nameKo}({BUSINESS_INFO.nameEn}), 대표{' '}
            {BUSINESS_INFO.representative}, 대한민국 {BUSINESS_INFO.addressKo}, {mail}. 개인정보에 관한 문의는 개인정보
            보호책임자(11장)에게 같은 메일로 보낼 수 있습니다.
          </p>
          <p>
            <strong>처리의 법적 근거</strong>
          </p>
          <KeyValueTable
            rows={[
              [
                '계약 이행',
                '계정, 아기 정보, 육아 기록의 저장·동기화와 공동양육자 공유, 광고 제거 구매 여부(앱 이용 약정에 따라 서비스를 제공하기 위해 필요)',
              ],
              [
                '정당한 이익',
                '앱 사용 통계·오류 정보 수집(PostHog, 계정과 연결하지 않은 무작위 식별자, IP 주소와 그로 추정한 대략적 위치). 앱의 오류를 고치고 앱을 개선하기 위한 회사의 이익이며, 계정·이름·이메일과 육아 기록 내용은 담지 않습니다.',
              ],
              ['동의', '맞춤형 광고를 위한 광고 식별자 이용(Google AdMob, 앱의 광고 동의 창)'],
              ['법적 의무', '법령에 따른 보관'],
            ]}
          />
          <ul>
            <li>
              계정 정보를 주지 않으면 로그인이 필요한 앱이라 앱을 쓸 수 없습니다. 맞춤형 광고에 동의하지 않아도 앱을 쓸 수
              있으며, 이때는 맞춤형이 아닌 광고가 나올 수 있습니다.
            </li>
            <li>
              자동화된 결정(프로파일링 포함)으로 이용자에게 법적 효과나 그와 비슷한 중대한 영향을 주는 처리는 하지 않습니다.
            </li>
          </ul>
          <p>
            <strong>이용자의 권리</strong>
          </p>
          <ul>
            <li>
              자신의 개인정보에 대해 열람, 정정, 삭제, 처리 제한, 이동(기계가 읽을 수 있는 형식으로 받기)을 요구할 수 있습니다.
            </li>
            <li>정당한 이익을 근거로 하는 처리(앱 사용 통계·오류 수집)에 반대할 수 있습니다.</li>
            <li>
              맞춤형 광고 동의는 설정 › ‘광고 개인정보 설정’에서 언제든 철회할 수 있습니다. 철회해도 그 전에 동의에 따라 한
              처리는 영향을 받지 않습니다.
            </li>
            <li>
              사는 곳이나 일하는 곳, 침해가 일어난 곳의 개인정보 감독기관에 민원을 낼 수 있습니다(영국은 Information
              Commissioner’s Office).
            </li>
          </ul>
          <p>
            <strong>행사 방법</strong>
          </p>
          <ul>
            <li>{mail}로 요청하면 본인 확인 뒤 지체 없이, 늦어도 1개월 안에 답합니다.</li>
            <li>앱의 설정 › ‘탈퇴하고 데이터 지우기’로 계정과 기록을 바로 지울 수 있습니다(7장).</li>
          </ul>
          <p>
            <strong>국외 이전과 안전장치</strong>
          </p>
          <ul>
            <li>
              계정·아기 정보·육아 기록은 대한민국(서울 리전)에 저장합니다. 대한민국은 EU 집행위원회와 영국 정부로부터 개인정보
              보호 수준이 적정하다는 결정을 받은 나라입니다.
            </li>
            <li>앱 사용 통계·오류 정보는 EU(독일)의 PostHog에 저장합니다.</li>
            <li>
              로그인·광고를 위해 미국 등으로 가는 정보(Google LLC, Apple Inc., 6장 표)는 각 회사가 제공하는
              표준계약조항(EU 집행위원회가 승인한 표준 계약 문구) 등 GDPR이 인정하는 안전장치에 따라 이전됩니다. 안전장치의
              사본이나 내용은 문의 메일로 요청할 수 있습니다.
            </li>
          </ul>

          <h3 className="mt-4 font-bold">12-2. 일본 이용자 (개인정보 보호에 관한 법률, APPI)</h3>
          <ul>
            <li>
              외국에 있는 제3자에게 개인정보가 가는 경우, 받는 자와 이전 국가는 6장 표와 같습니다(Google LLC: 미국 등, Apple
              Inc.: 미국, PostHog Inc.: 독일). 회사는 대한민국에 있으며 계정·기록은 대한민국에 저장합니다.
            </li>
            <li>
              이전 국가의 개인정보 보호 제도와 받는 자가 취하는 보호 조치에 관한 정보는 문의 메일로 요청하면 제공합니다.
            </li>
            <li>
              보유 개인 데이터의 공개(열람), 정정·추가·삭제, 이용 정지·삭제, 제3자 제공 정지는 {mail}로 요청할 수 있습니다.
            </li>
          </ul>

          <h3 className="mt-4 font-bold">12-3. 미국 캘리포니아 이용자 (CCPA/CPRA)</h3>
          <ul>
            <li>회사는 개인정보를 돈이나 그 밖의 대가를 받고 팔지 않습니다.</li>
            <li>
              맞춤형 광고에 동의한 경우에만 기기의 광고 식별자가 맞춤형 광고를 위해 Google AdMob에 전달됩니다. 이는 캘리포니아
              법의 ‘공유(여러 서비스에 걸친 행동 기반 광고)’에 해당할 수 있습니다. 육아 기록과 아기 정보는 광고에 쓰지 않고
              광고 회사에 넘기지 않습니다.
            </li>
            <li>
              거부 방법: 앱의 설정 › ‘광고 개인정보 설정’에서 동의하지 않거나 철회하고, 기기에서 추적을 끄거나 광고 ID를
              지웁니다(9장).
            </li>
            <li>
              이용자는 수집한 개인정보의 범주와 내용을 알 권리, 삭제·정정을 요구할 권리, 판매·공유를 거부할 권리가 있으며,
              권리를 행사했다는 이유로 차별받지 않습니다. 요청은 {mail}로 보냅니다.
            </li>
            <li>회사는 16세 미만 이용자의 개인정보를 알면서 팔거나 공유하지 않습니다.</li>
          </ul>

          <h3 className="mt-4 font-bold">12-4. 아동</h3>
          <ul>
            <li>앱은 부모 등 보호자가 쓰는 앱이며, 아동이 직접 쓰도록 만든 앱이 아닙니다. 아동을 대상으로 한 서비스가 아닙니다.</li>
            <li>
              아기에 대한 정보(이름·태어난 날·육아 기록)는 보호자가 입력하며, 보호자는 7장과 이 장의 방법으로 언제든 고치거나
              지울 수 있습니다.
            </li>
            <li>아동이 직접 계정을 만든 사실을 알게 되면 그 계정과 정보를 지웁니다.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'changes',
      heading: '13. 방침의 변경',
      body: (
        <>
          <p>내용이 바뀌면 이 페이지에 올리고 시행일과 최종 수정일을 고칩니다.</p>
          <p>이 방침은 한국어·일본어·영어로 제공하며, 언어판 사이에 차이가 있으면 한국어판이 우선합니다.</p>
        </>
      ),
    },
  ],
  effectiveDate: EFFECTIVE_DATE,
  updatedDate: UPDATED_DATE,
};

const ja: DocLocale = {
  lang: 'ja',
  title: 'ベビろく プライバシーポリシー',
  lead: (
    <>
      <p>
        ベビろく（韓国語名「아기록」、以下「本アプリ」）は、{BUSINESS_INFO.nameEn}（以下「開発者」）が作った育児記録アプリです。開発者は、育児の記録を手助けするために本当に必要な情報だけを取り扱います。
      </p>
      <p>
        このページは韓国語版を翻訳したものです。言語版の間に違いがある場合は、韓国語版が優先します。
      </p>
    </>
  ),
  notice: (
    <p>
      赤ちゃんの育児記録は広告に使わず、広告会社に渡しません。本アプリは保護者が使うアプリであり、赤ちゃんに関する情報は子どもの健康に関わる情報として慎重に取り扱います。
    </p>
  ),
  sections: [
    {
      id: 'items',
      heading: '1. 取り扱う情報と目的',
      body: (
        <>
          <table>
            <thead>
              <tr>
                <th>区分</th>
                <th>項目</th>
                <th>目的</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>アカウント</td>
                <td>Google または Apple のアカウント識別子、メールアドレス（Apple の「メールを非公開」を使う場合は代わりのアドレス）、名前</td>
                <td>ログイン、機種変更時の記録の復元</td>
              </tr>
              <tr>
                <td>赤ちゃんの情報</td>
                <td>名前（または胎児ネーム）、生年月日、夜の睡眠の時間帯</td>
                <td>生後日数の表示、昼寝・夜の睡眠の区別</td>
              </tr>
              <tr>
                <td>育児記録</td>
                <td>授乳（量・時間）、睡眠時間、おむつ、メモ、記録した人の名前</td>
                <td>記録・まとめ・グラフ、一緒に使う家族との共有</td>
              </tr>
              <tr>
                <td>端末・利用情報</td>
                <td>
                  アプリの利用イベント、エラー情報、端末の機種・OS バージョン、アプリが作ったランダムな識別子、IP
                  アドレス（接続時に自動で送信）とそこから推定したおおよその位置（国・都市）
                </td>
                <td>アプリの改善、エラーの修正（PostHog）</td>
              </tr>
              <tr>
                <td>広告</td>
                <td>広告識別子（同意した場合）</td>
                <td>広告の表示（Google AdMob）</td>
              </tr>
              <tr>
                <td>購入</td>
                <td>「広告を非表示」の購入の有無</td>
                <td>購入した家族のアカウントで広告を非表示にする</td>
              </tr>
            </tbody>
          </table>
          <ul>
            <li>上記の情報は、アプリを使う間に利用者が直接入力するか、アプリの利用に伴って自動で作られます。</li>
            <li>
              アプリの利用イベントとエラー情報は、アカウント・名前・メールアドレスと結び付けず、赤ちゃんの名前や育児記録の内容も含みません。画面の録画は行いません。
            </li>
            <li>パーソナライズ広告は同意した場合にのみ表示します。同意しなくてもアプリを使えます。</li>
            <li>カード番号などの支払い情報は Apple・Google が取り扱い、開発者は受け取りません。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'retention',
      heading: '2. 保有・利用期間と保管場所',
      body: (
        <ul>
          <li>
            アカウント・赤ちゃんの情報・育児記録：<strong>退会するまで</strong>保有し、退会すると遅滞なく削除します。
          </li>
          <li>
            ほかの家族と一緒に使っていた赤ちゃんの記録は、退会後もその人たちが引き続き見られます。自分だけで使っていた赤ちゃんの記録はすべて削除されます。
          </li>
          <li>
            アプリの利用イベント・エラー情報・IP アドレスとおおよその位置：収集日から<strong>1年間</strong>
            保管したあと削除します（PostHog、ドイツ）。アカウントと結び付けていないため、退会してもすぐには削除されず、この期間が過ぎると削除されます。
          </li>
          <li>記録は Google Firebase（Cloud Firestore、ソウルリージョン）に暗号化された接続で保存します。</li>
          <li>
            関係法令により保管が必要な情報がある場合は、その期間、別に保管します。購入の記録は Apple・Google が保管します。
          </li>
        </ul>
      ),
    },
    {
      id: 'destruction',
      heading: '3. 廃棄の手順と方法',
      body: (
        <ul>
          <li>
            退会した場合や取り扱いの目的を果たした情報は、遅滞なく廃棄します。アプリの利用イベント・エラー情報は、第2項の保有期間（収集日から1年）が過ぎると廃棄します。
          </li>
          <li>
            電子ファイルは、復元できないようにサーバー（Cloud Firestore）と認証アカウントから削除します。紙の書類は作りません。
          </li>
        </ul>
      ),
    },
    {
      id: 'third-party',
      heading: '4. 第三者への提供',
      body: (
        <p>
          開発者は、利用者の個人情報を第三者に提供しません。ただし、法令に基づき捜査機関などが適法な手続きで求める場合は例外です。
        </p>
      ),
    },
    {
      id: 'entrust',
      heading: '5. 取り扱いの委託',
      body: (
        <>
          <table>
            <thead>
              <tr>
                <th>委託先</th>
                <th>委託する業務</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Google LLC</td>
                <td>ログイン（Firebase Authentication）、データの保存（Cloud Firestore）、広告（AdMob）</td>
              </tr>
              <tr>
                <td>PostHog Inc.</td>
                <td>アプリの利用統計・エラーの収集</td>
              </tr>
              <tr>
                <td>Apple Inc.</td>
                <td>ログイン（Apple でサインイン、iOS）</td>
              </tr>
            </tbody>
          </table>
          <p>支払い（「広告を非表示」）は、Apple App Store と Google Play がそれぞれの方針に従って取り扱います。</p>
        </>
      ),
    },
    {
      id: 'overseas',
      heading: '6. 国外への移転',
      body: (
        <>
          <KeyValueTable
            rows={[
              ['移転先', 'Google LLC'],
              ['移転先の国', 'アメリカなど Google のデータセンターがある国'],
              ['移転する項目', 'アカウント識別子・メールアドレス・名前（Firebase Authentication）、広告識別子（AdMob、同意した場合）'],
              ['移転の時期・方法', 'アプリを使うときに暗号化された通信で送信'],
              ['利用目的', 'ログイン、広告の表示'],
              ['保有期間', '退会または委託契約の終了まで'],
            ]}
          />
          <KeyValueTable
            rows={[
              ['移転先', 'PostHog Inc.'],
              ['移転先の国', 'ドイツ（EU）'],
              [
                '移転する項目',
                'アプリの利用イベント、エラー情報、端末の機種・OS バージョン、アプリが作ったランダムな識別子、IP アドレス（接続時に自動で送信）とそこから推定したおおよその位置（国・都市）',
              ],
              ['移転の時期・方法', 'アプリを使うときに暗号化された通信で送信'],
              ['利用目的', 'アプリの改善・エラーの修正'],
              ['保有期間', '1年'],
            ]}
          />
          <KeyValueTable
            rows={[
              ['移転先', 'Apple Inc.'],
              ['移転先の国', 'アメリカ'],
              ['移転する項目', 'Apple アカウント識別子、メールアドレス（または代わりのアドレス）、名前'],
              ['移転の時期・方法', 'Apple でサインインするときに暗号化された通信で送信'],
              ['利用目的', 'ログイン'],
              ['保有期間', '退会するまで（退会すると Apple のログイントークンを取り消します）'],
            ]}
          />
          <ul>
            <li>赤ちゃんの情報と育児記録は、ソウルリージョンに保存します。</li>
            <li>
              国外への移転を望まない場合は、アプリを使わないか退会することで拒否できます。ただし、ログインが必要なアプリのため、その場合はアプリを使えません。パーソナライズ広告に使われる広告識別子は、設定
              ›「広告のプライバシー設定」で個別に拒否できます。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'rights',
      heading: '7. 利用者の権利と行使の方法',
      body: (
        <ul>
          <li>利用者は、いつでも自分の個人情報の閲覧・訂正・削除や、取り扱いの停止を求めることができます。</li>
          <li>アプリで、記録・赤ちゃんの情報・自分の名前を直接確認して修正できます。</li>
          <li>
            アプリの設定 ›「退会してデータを削除」から、いつでもすべての情報を削除できます。アプリがなくても、お問い合わせメールで削除をリクエストできます（
            <Link href={deleteHref('ja')}>アカウント・データの削除について</Link>）。
          </li>
          <li>設定 ›「広告のプライバシー設定」で、パーソナライズ広告への同意を変更できます。</li>
          <li>そのほかのリクエストは {mail} までお送りいただければ、遅滞なく対応します。</li>
        </ul>
      ),
    },
    {
      id: 'security',
      heading: '8. 安全管理のための措置',
      body: (
        <ul>
          <li>すべての通信は暗号化された接続（TLS）でやり取りします。</li>
          <li>データベースのセキュリティルールにより、その赤ちゃんの保護者として登録されたアカウントだけが記録を読み書きできるようにしています。</li>
          <li>一緒に使う家族を招待するコードは6桁で、24時間を過ぎると使えません。</li>
          <li>運用データにアクセスできる人を、個人情報保護責任者1人に限定しています。</li>
        </ul>
      ),
    },
    {
      id: 'ad-id',
      heading: '9. 自動で収集する仕組み（広告識別子）と拒否の方法',
      body: (
        <ul>
          <li>
            本アプリは Cookie を使いません。利用統計のため、アプリが端末内にランダムな識別子を作って保存します。この識別子は広告識別子ではなく、アカウントと結び付けません。アプリを削除すると一緒に削除されます。
          </li>
          <li>広告のため、端末の広告識別子（Android 広告 ID、iOS IDFA）を同意した場合にのみ使います。</li>
          <li>
            拒否の方法：アプリの設定 ›「広告のプライバシー設定」をタップすると、ヨーロッパなど広告の同意画面が必要な地域では同意画面が開き、それ以外の地域では端末のトラッキング・広告の設定画面が開きます。端末で直接変更する場合、iOS は「設定」›「プライバシーとセキュリティ」›「トラッキング」、Android は「設定」›「Google」›「広告」で、広告 ID を削除またはリセットできます。
          </li>
        </ul>
      ),
    },
    {
      id: 'children',
      heading: '10. 子どもの個人情報',
      body: (
        <p>
          本アプリは保護者が使うアプリであり、14歳未満の子どもを対象としていません。赤ちゃんに関する情報は保護者が入力し、子どもの健康に関わる情報として慎重に取り扱います。
        </p>
      ),
    },
    {
      id: 'officer',
      heading: '11. 個人情報保護責任者とお問い合わせ',
      body: (
        <ul>
          <li>
            個人情報保護責任者：{BUSINESS_INFO.privacyOfficerEn}（{BUSINESS_INFO.nameEn}）
          </li>
          <li>連絡先：{mail}</li>
          <li>
            韓国では、個人情報の侵害に関する届け出・相談を、個人情報侵害申告センター（privacy.kisa.or.kr、韓国内から
            118）、個人情報紛争調停委員会（www.kopico.go.kr、1833-6972）に行うことができます。
          </li>
        </ul>
      ),
    },
    {
      id: 'international',
      heading: '12. 海外の利用者への追加のご案内',
      body: (
        <>
          <p>
            本アプリは韓国語・日本語・英語で世界中に提供しています。第1〜11項はすべての利用者に適用され、この項では、お住まいの地域の法律が別に求める内容を加えます。
          </p>

          <h3 className="mt-4 font-bold">12-1. 欧州連合（EU）・欧州経済領域（EEA）・英国の利用者（GDPR、UK GDPR）</h3>
          <p>
            <strong>管理者（コントローラー）</strong>：{BUSINESS_INFO.nameEn}（代表 {BUSINESS_INFO.representativeEn}）、
            {BUSINESS_INFO.addressEn}、{mail}。個人情報に関するお問い合わせは、個人情報保護責任者（第11項）に同じメールで送ることができます。
          </p>
          <p>
            <strong>取り扱いの法的根拠</strong>
          </p>
          <KeyValueTable
            rows={[
              [
                '契約の履行',
                'アカウント、赤ちゃんの情報、育児記録の保存・同期と一緒に使う家族との共有、「広告を非表示」の購入の有無（アプリの利用に関する約束に従ってサービスを提供するために必要）',
              ],
              [
                '正当な利益',
                'アプリの利用統計・エラー情報の収集（PostHog、アカウントと結び付けないランダムな識別子、IP アドレスとそこから推定したおおよその位置）。アプリのエラーを直し、アプリを改善するための開発者の利益であり、アカウント・名前・メールアドレスと育児記録の内容は含みません。',
              ],
              ['同意', 'パーソナライズ広告のための広告識別子の利用（Google AdMob、アプリの広告の同意画面）'],
              ['法的義務', '法令に基づく保管'],
            ]}
          />
          <ul>
            <li>
              アカウント情報を提供いただけない場合、ログインが必要なアプリのため、アプリを使えません。パーソナライズ広告に同意しなくてもアプリを使えます。その場合、パーソナライズされていない広告が表示されることがあります。
            </li>
            <li>自動化された決定（プロファイリングを含む）によって、利用者に法的効果やそれと同様の重大な影響を与える取り扱いは行いません。</li>
          </ul>
          <p>
            <strong>利用者の権利</strong>
          </p>
          <ul>
            <li>
              自分の個人情報について、アクセス（閲覧）、訂正、削除、取り扱いの制限、データポータビリティ（機械で読める形式で受け取ること）を求めることができます。
            </li>
            <li>正当な利益を根拠とする取り扱い（アプリの利用統計・エラーの収集）に異議を述べることができます。</li>
            <li>
              パーソナライズ広告への同意は、設定 ›「広告のプライバシー設定」でいつでも撤回できます。撤回しても、それ以前に同意に基づいて行った取り扱いには影響しません。
            </li>
            <li>
              お住まいの国や勤務地、侵害が起きた場所の個人情報保護の監督機関に苦情を申し立てることができます（英国は
              Information Commissioner’s Office）。
            </li>
          </ul>
          <p>
            <strong>行使の方法</strong>
          </p>
          <ul>
            <li>{mail} までリクエストいただければ、本人確認のうえ遅滞なく、遅くとも1か月以内にお答えします。</li>
            <li>アプリの設定 ›「退会してデータを削除」から、アカウントと記録をすぐに削除できます（第7項）。</li>
          </ul>
          <p>
            <strong>国外への移転と保護措置</strong>
          </p>
          <ul>
            <li>
              アカウント・赤ちゃんの情報・育児記録は大韓民国（ソウルリージョン）に保存します。大韓民国は、EU
              の欧州委員会と英国政府から、個人情報の保護水準が十分であるとの決定を受けた国です。
            </li>
            <li>アプリの利用統計・エラー情報は、EU（ドイツ）の PostHog に保存します。</li>
            <li>
              ログイン・広告のためにアメリカなどへ移転する情報（Google LLC、Apple Inc.、第6項の表）は、各社が提供する標準契約条項（欧州委員会が承認した標準の契約文言）など、GDPR
              が認める保護措置に従って移転されます。保護措置の写しや内容は、お問い合わせメールでリクエストできます。
            </li>
          </ul>

          <h3 className="mt-4 font-bold">12-2. 日本の利用者（個人情報の保護に関する法律）</h3>
          <ul>
            <li>
              外国にある第三者に個人情報が移転する場合の移転先と移転先の国は、第6項の表のとおりです（Google
              LLC：アメリカなど、Apple Inc.：アメリカ、PostHog Inc.：ドイツ）。開発者は大韓民国にあり、アカウントと記録は大韓民国に保存します。
            </li>
            <li>
              移転先の国の個人情報の保護に関する制度と、移転先が講じる保護のための措置に関する情報は、お問い合わせメールでリクエストいただければ提供します。
            </li>
            <li>
              保有個人データの開示、訂正・追加・削除、利用停止・消去、第三者提供の停止は、{mail} までリクエストできます。
            </li>
          </ul>

          <h3 className="mt-4 font-bold">12-3. 米国カリフォルニア州の利用者（CCPA/CPRA）</h3>
          <ul>
            <li>開発者は、個人情報をお金やそのほかの対価と引き換えに販売しません。</li>
            <li>
              パーソナライズ広告に同意した場合にのみ、端末の広告識別子がパーソナライズ広告のために Google AdMob
              に送られます。これはカリフォルニア州法の「共有（複数のサービスにまたがる行動ターゲティング広告）」に当たる場合があります。育児記録と赤ちゃんの情報は広告に使わず、広告会社に渡しません。
            </li>
            <li>
              拒否の方法：アプリの設定 ›「広告のプライバシー設定」で同意しないか撤回し、端末でトラッキングをオフにするか広告
              ID を削除します（第9項）。
            </li>
            <li>
              利用者には、収集した個人情報の種類と内容を知る権利、削除・訂正を求める権利、販売・共有を拒否する権利があり、権利を行使したことを理由に差別的な扱いを受けることはありません。リクエストは
              {mail} までお送りください。
            </li>
            <li>開発者は、16歳未満の利用者の個人情報を、知りながら販売または共有することはありません。</li>
          </ul>

          <h3 className="mt-4 font-bold">12-4. 子ども</h3>
          <ul>
            <li>本アプリは、親などの保護者が使うアプリであり、子どもが自分で使うためのアプリではありません。子どもを対象としたサービスではありません。</li>
            <li>
              赤ちゃんに関する情報（名前・生年月日・育児記録）は保護者が入力し、保護者は第7項とこの項の方法でいつでも修正・削除できます。
            </li>
            <li>子どもが自分でアカウントを作ったことが分かった場合は、そのアカウントと情報を削除します。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'changes',
      heading: '13. ポリシーの変更',
      body: (
        <>
          <p>内容が変わった場合は、このページに掲載し、施行日と最終更新日を改めます。</p>
          <p>このポリシーは韓国語・日本語・英語で提供しており、言語版の間に違いがある場合は韓国語版が優先します。</p>
        </>
      ),
    },
  ],
  effectiveDate: TRANSLATED_DATE,
  updatedDate: TRANSLATED_DATE,
};

const en: DocLocale = {
  lang: 'en',
  title: 'Agirok Privacy Policy',
  lead: (
    <>
      <p>
        Agirok (아기록 in Korea, the “app”) is a baby log app made by {BUSINESS_INFO.nameEn} (the “developer”). The
        developer handles only the information that is truly needed to help you keep your baby’s records.
      </p>
      <p>This page is a translation of the Korean version. If the language versions differ, the Korean version prevails.</p>
    </>
  ),
  notice: (
    <p>
      Your baby’s care records are never used for advertising and are never handed to advertising companies. The app is
      used by parents and caregivers, and information about the baby is treated with care as information related to a
      child’s health.
    </p>
  ),
  sections: [
    {
      id: 'items',
      heading: '1. Information we handle and why',
      body: (
        <>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Items</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Account</td>
                <td>Google or Apple account identifier, email address (a relay address if you use Apple’s Hide My Email), name</td>
                <td>Sign-in, restoring records when you change devices</td>
              </tr>
              <tr>
                <td>Baby information</td>
                <td>Name (or nickname), date of birth, night sleep hours</td>
                <td>Showing the baby’s age in days, telling naps from night sleep</td>
              </tr>
              <tr>
                <td>Care records</td>
                <td>Feeding (amount and time), sleep times, diapers, notes, name of the person who logged it</td>
                <td>Logs, summaries and charts, sharing with other caregivers</td>
              </tr>
              <tr>
                <td>Device and usage information</td>
                <td>
                  App usage events, error information, device model and OS version, a random identifier created by the app,
                  IP address (sent automatically when connecting) and the approximate location estimated from it (country
                  and city)
                </td>
                <td>Improving the app, fixing errors (PostHog)</td>
              </tr>
              <tr>
                <td>Advertising</td>
                <td>Advertising identifier (if you consent)</td>
                <td>Showing ads (Google AdMob)</td>
              </tr>
              <tr>
                <td>Purchases</td>
                <td>Whether “Remove ads” has been purchased</td>
                <td>Hiding ads for the family that purchased it</td>
              </tr>
            </tbody>
          </table>
          <ul>
            <li>This information is entered by you while using the app or created automatically as you use it.</li>
            <li>
              App usage events and error information are not linked to your account, name, or email address, and do not
              contain your baby’s name or the content of your care records. The screen is not recorded.
            </li>
            <li>Personalized ads are shown only if you consent. You can use the app without consenting.</li>
            <li>Payment details such as card numbers are handled by Apple and Google. The developer does not receive them.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'retention',
      heading: '2. How long we keep it and where',
      body: (
        <ul>
          <li>
            Account, baby information, and care records: kept <strong>until you delete your account</strong>, and deleted
            without delay when you do.
          </li>
          <li>
            Records of a baby you shared with other caregivers remain visible to them after you delete your account. Records
            of a baby only you used are all deleted.
          </li>
          <li>
            App usage events, error information, IP address and approximate location: kept for <strong>1 year</strong> from
            collection and then deleted (PostHog, Germany). Because they are not linked to your account, they are not deleted
            right away when you delete your account; they are deleted when this period ends.
          </li>
          <li>Records are stored in Google Firebase (Cloud Firestore, Seoul region) over encrypted connections.</li>
          <li>
            If the law requires certain information to be kept, it is stored separately for that period. Purchase records
            are kept by Apple and Google.
          </li>
        </ul>
      ),
    },
    {
      id: 'destruction',
      heading: '3. How we delete it',
      body: (
        <ul>
          <li>
            Information is deleted without delay when you delete your account or when its purpose has been fulfilled. App
            usage events and error information are deleted when the retention period in section 2 (1 year from collection)
            ends.
          </li>
          <li>
            Electronic files are deleted from the server (Cloud Firestore) and the authentication account so that they cannot
            be recovered. No paper documents are made.
          </li>
        </ul>
      ),
    },
    {
      id: 'third-party',
      heading: '4. Sharing with third parties',
      body: (
        <p>
          The developer does not provide your personal information to third parties, except when law enforcement or other
          authorities request it through lawful procedures.
        </p>
      ),
    },
    {
      id: 'entrust',
      heading: '5. Service providers',
      body: (
        <>
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Work entrusted</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Google LLC</td>
                <td>Sign-in (Firebase Authentication), data storage (Cloud Firestore), ads (AdMob)</td>
              </tr>
              <tr>
                <td>PostHog Inc.</td>
                <td>Collecting app usage statistics and errors</td>
              </tr>
              <tr>
                <td>Apple Inc.</td>
                <td>Sign-in (Sign in with Apple, iOS)</td>
              </tr>
            </tbody>
          </table>
          <p>Payments (“Remove ads”) are handled by the Apple App Store and Google Play under their own policies.</p>
        </>
      ),
    },
    {
      id: 'overseas',
      heading: '6. International transfers',
      body: (
        <>
          <KeyValueTable
            rows={[
              ['Recipient', 'Google LLC'],
              ['Country', 'United States and other countries where Google has data centers'],
              ['Items', 'Account identifier, email address, and name (Firebase Authentication); advertising identifier (AdMob, if you consent)'],
              ['When and how', 'Sent over encrypted connections while you use the app'],
              ['Purpose', 'Sign-in, showing ads'],
              ['Retention', 'Until you delete your account or the service contract ends'],
            ]}
          />
          <KeyValueTable
            rows={[
              ['Recipient', 'PostHog Inc.'],
              ['Country', 'Germany (EU)'],
              [
                'Items',
                'App usage events, error information, device model and OS version, a random identifier created by the app, IP address (sent automatically when connecting) and the approximate location estimated from it (country and city)',
              ],
              ['When and how', 'Sent over encrypted connections while you use the app'],
              ['Purpose', 'Improving the app, fixing errors'],
              ['Retention', '1 year'],
            ]}
          />
          <KeyValueTable
            rows={[
              ['Recipient', 'Apple Inc.'],
              ['Country', 'United States'],
              ['Items', 'Apple account identifier, email address (or relay address), name'],
              ['When and how', 'Sent over encrypted connections when you sign in with Apple'],
              ['Purpose', 'Sign-in'],
              ['Retention', 'Until you delete your account (the Apple sign-in token is revoked when you do)'],
            ]}
          />
          <ul>
            <li>Baby information and care records are stored in the Seoul region.</li>
            <li>
              If you do not want your information transferred abroad, you can refuse by not using the app or by deleting your
              account. Because the app requires sign-in, you cannot use it in that case. You can separately refuse the
              advertising identifier used for personalized ads in Settings › “Ad privacy settings”.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'rights',
      heading: '7. Your rights and how to use them',
      body: (
        <ul>
          <li>You can ask at any time to access, correct, or delete your personal information, or to stop processing it.</li>
          <li>You can view and edit your records, baby information, and your own name directly in the app.</li>
          <li>
            You can delete all your information at any time from Settings › “Delete account and data” in the app. Even
            without the app, you can request deletion by email (
            <Link href={deleteHref('en')}>Deleting your account and data</Link>).
          </li>
          <li>You can change your consent to personalized ads in Settings › “Ad privacy settings”.</li>
          <li>For any other request, email {mail} and it will be handled without delay.</li>
        </ul>
      ),
    },
    {
      id: 'security',
      heading: '8. Security measures',
      body: (
        <ul>
          <li>All communication uses encrypted connections (TLS).</li>
          <li>Database security rules allow only accounts registered as that baby’s caregivers to read and write its records.</li>
          <li>Invite codes for other caregivers have 6 digits and cannot be used after 24 hours.</li>
          <li>Access to operational data is limited to one person, the privacy officer.</li>
        </ul>
      ),
    },
    {
      id: 'ad-id',
      heading: '9. Automatic collection (advertising identifier) and how to opt out',
      body: (
        <ul>
          <li>
            The app does not use cookies. For usage statistics, the app creates and stores a random identifier on your
            device. This identifier is not an advertising identifier and is not linked to your account. It is removed when
            you delete the app.
          </li>
          <li>For ads, the device’s advertising identifier (Android Advertising ID, iOS IDFA) is used only if you consent.</li>
          <li>
            How to opt out: tap Settings › “Ad privacy settings” in the app. In regions that require an ad consent form, such
            as Europe, the consent form opens; elsewhere, your device’s tracking and ad settings open. To change it on the
            device directly, go to Settings › Privacy &amp; Security › Tracking on iOS, or Settings › Google › Ads on Android
            to delete or reset your advertising ID.
          </li>
        </ul>
      ),
    },
    {
      id: 'children',
      heading: '10. Children’s information',
      body: (
        <p>
          The app is used by parents and caregivers and is not directed at children under 14. Information about the baby is
          entered by the caregiver and is treated with care as information related to a child’s health.
        </p>
      ),
    },
    {
      id: 'officer',
      heading: '11. Privacy officer and contact',
      body: (
        <ul>
          <li>
            Privacy officer: {BUSINESS_INFO.privacyOfficerEn} ({BUSINESS_INFO.nameEn})
          </li>
          <li>Contact: {mail}</li>
          <li>
            In Korea, you can report or seek advice about privacy violations to the Personal Information Infringement Report
            Center (privacy.kisa.or.kr, 118 within Korea) and the Personal Information Dispute Mediation Committee
            (www.kopico.go.kr, 1833-6972).
          </li>
        </ul>
      ),
    },
    {
      id: 'international',
      heading: '12. Additional information for users outside Korea',
      body: (
        <>
          <p>
            The app is offered worldwide in Korean, Japanese, and English. Sections 1–11 apply to all users; this section
            adds what the laws where you live specifically require.
          </p>

          <h3 className="mt-4 font-bold">12-1. Users in the EU, EEA, and UK (GDPR, UK GDPR)</h3>
          <p>
            <strong>Controller</strong>: {BUSINESS_INFO.nameEn} (representative: {BUSINESS_INFO.representativeEn}),{' '}
            {BUSINESS_INFO.addressEn}, {mail}. You can also send privacy questions to the privacy officer (section 11) at the
            same address.
          </p>
          <p>
            <strong>Legal bases for processing</strong>
          </p>
          <KeyValueTable
            rows={[
              [
                'Performance of a contract',
                'Storing and syncing your account, baby information, and care records, sharing them with other caregivers, and whether “Remove ads” has been purchased (needed to provide the service under the terms of using the app)',
              ],
              [
                'Legitimate interests',
                'Collecting app usage statistics and error information (PostHog, a random identifier not linked to your account, IP address and the approximate location estimated from it). This is the developer’s interest in fixing errors and improving the app; it does not include your account, name, email address, or the content of your care records.',
              ],
              ['Consent', 'Using the advertising identifier for personalized ads (Google AdMob, the app’s ad consent form)'],
              ['Legal obligation', 'Keeping information as required by law'],
            ]}
          />
          <ul>
            <li>
              Because the app requires sign-in, you cannot use it without providing account information. You can use the app
              without consenting to personalized ads; in that case, non-personalized ads may be shown.
            </li>
            <li>
              We do not make decisions based solely on automated processing (including profiling) that produce legal or
              similarly significant effects on you.
            </li>
          </ul>
          <p>
            <strong>Your rights</strong>
          </p>
          <ul>
            <li>
              You have the right to access, correct, and delete your personal information, to restrict its processing, and to
              data portability (receiving it in a machine-readable format).
            </li>
            <li>You have the right to object to processing based on legitimate interests (app usage statistics and error collection).</li>
            <li>
              You can withdraw your consent to personalized ads at any time in Settings › “Ad privacy settings”. Withdrawing
              consent does not affect processing carried out based on consent before the withdrawal.
            </li>
            <li>
              You have the right to lodge a complaint with a data protection supervisory authority where you live, where you
              work, or where the alleged infringement took place (in the UK, the Information Commissioner’s Office).
            </li>
          </ul>
          <p>
            <strong>How to exercise your rights</strong>
          </p>
          <ul>
            <li>Email {mail}. After verifying your identity, we will respond without delay and within one month at the latest.</li>
            <li>You can delete your account and records right away from Settings › “Delete account and data” in the app (section 7).</li>
          </ul>
          <p>
            <strong>International transfers and safeguards</strong>
          </p>
          <ul>
            <li>
              Your account, baby information, and care records are stored in the Republic of Korea (Seoul region). The Republic
              of Korea has received adequacy decisions from the European Commission and the UK government, recognizing that it
              provides an adequate level of data protection.
            </li>
            <li>App usage statistics and error information are stored with PostHog in the EU (Germany).</li>
            <li>
              Information sent to the United States and other countries for sign-in and ads (Google LLC, Apple Inc.; see the
              tables in section 6) is transferred under safeguards recognized by the GDPR, such as the standard contractual
              clauses (standard contract terms approved by the European Commission) offered by each company. You can request a
              copy or details of these safeguards by email.
            </li>
          </ul>

          <h3 className="mt-4 font-bold">12-2. Users in Japan (Act on the Protection of Personal Information, APPI)</h3>
          <ul>
            <li>
              When personal information goes to a third party in a foreign country, the recipients and countries are as listed
              in the tables in section 6 (Google LLC: United States and others; Apple Inc.: United States; PostHog Inc.:
              Germany). The developer is located in the Republic of Korea, and accounts and records are stored there.
            </li>
            <li>
              Information on the personal information protection systems of those countries and the measures the recipients
              take is available on request by email.
            </li>
            <li>
              You can request disclosure, correction, addition, or deletion of retained personal data, suspension of its use or
              its erasure, and suspension of its provision to third parties by emailing {mail}.
            </li>
          </ul>

          <h3 className="mt-4 font-bold">12-3. Users in California, USA (CCPA/CPRA)</h3>
          <ul>
            <li>The developer does not sell personal information for money or other valuable consideration.</li>
            <li>
              Only if you consent to personalized ads is your device’s advertising identifier sent to Google AdMob for
              personalized advertising. This may count as “sharing” (cross-context behavioral advertising) under California
              law. Your care records and baby information are never used for ads or handed to advertising companies.
            </li>
            <li>
              How to opt out: decline or withdraw consent in Settings › “Ad privacy settings” in the app, and turn off tracking
              or delete your advertising ID on your device (section 9).
            </li>
            <li>
              You have the right to know the categories and specific pieces of personal information collected, to request
              deletion and correction, and to opt out of sale or sharing. You will not be discriminated against for exercising
              these rights. Send requests to {mail}.
            </li>
            <li>The developer does not knowingly sell or share the personal information of users under 16.</li>
          </ul>

          <h3 className="mt-4 font-bold">12-4. Children</h3>
          <ul>
            <li>
              The app is for parents and other caregivers. It is not made for children to use themselves, and it is not a
              service directed at children.
            </li>
            <li>
              Information about the baby (name, date of birth, care records) is entered by the caregiver, who can edit or
              delete it at any time as described in section 7 and in this section.
            </li>
            <li>If we learn that a child has created an account themselves, we will delete that account and its information.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'changes',
      heading: '13. Changes to this policy',
      body: (
        <>
          <p>When the content changes, we post it on this page and update the effective date and last updated date.</p>
          <p>
            This policy is provided in Korean, Japanese, and English. If the language versions differ, the Korean version
            prevails.
          </p>
        </>
      ),
    },
  ],
  effectiveDate: TRANSLATED_DATE,
  updatedDate: TRANSLATED_DATE,
};

const DOCS: Record<Lang, DocLocale> = { ko, ja, en };
const DESCRIPTIONS: Record<Lang, string> = {
  ko: '아기록 개인정보처리방침',
  ja: 'ベビろく（아기록）プライバシーポリシー',
  en: 'Agirok (아기록) Privacy Policy',
};

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await resolveLang(params);
  return localizedMetadata(lang, '/apps/agirok/privacy', { title: DOCS[lang].title, description: DESCRIPTIONS[lang] });
}

export default async function AgirokPrivacyPage({ params }: LangParams) {
  const lang = await resolveLang(params);
  return <DocPage doc={DOCS[lang]} />;
}
