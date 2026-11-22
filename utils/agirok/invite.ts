/**
 * 아기록 초대 링크(https://joyopi.com/agirok/i/{코드}) — 아기록 저장소 docs/decisions.md ‘초대 링크’,
 * 모든 앱 공통 business apps/common.md 11장.
 *
 * 미리보기 문구(previewText)는 아기록 앱 `src/domain/invite.ts`와 **같은 내용**이다. 앱 설정 화면의
 * 「받는 사람에게는 이렇게 보여요」 카드와 어긋나지 않게 한쪽을 고치면 다른 쪽도 고친다.
 */
export type InviteLang = 'ko' | 'ja' | 'en';

export const AGIROK_PROJECT_ID = 'agirok-db7b5';
export const APP_STORE_URL = 'https://apps.apple.com/app/id6834302496';
export const INVITE_SCHEME_PREFIX = 'agirok://i/';
export const ANDROID_PACKAGE = 'com.joyopi.agirok';
/** 모든 초대에 같은 미리보기 그림(1200×630). 원본은 아기록 design/og/invite.html. 바꾸면 ?v= 숫자를 올린다 */
export const OG_IMAGE_PATH = '/apps/agirok/og-invite.png?v=1';

export type Preview = { title: string; desc: string };

const TEXT: Record<InviteLang, { named: (baby: string, by: string) => Preview; generic: Preview }> = {
  ko: {
    named: (baby, by) => ({
      title: `${baby} 기록에 초대받았어요`,
      desc: by ? `${by}님이 아기록에서 함께 기록하자고 했어요. 24시간 동안 열 수 있어요.` : '아기록에서 함께 기록해요. 24시간 동안 열 수 있어요.',
    }),
    generic: { title: '아기록 · 함께 쓰는 육아 기록', desc: '수유·수면·기저귀를 가족과 함께 기록해요.' },
  },
  ja: {
    named: (baby, by) => ({
      title: `${baby}の記録に招待されました`,
      desc: by ? `${by}さんがベビろくで一緒に記録しようと招待しています。24時間有効です。` : 'ベビろくで一緒に記録しましょう。24時間有効です。',
    }),
    generic: { title: 'ベビろく · 家族で書く育児記録', desc: '授乳・睡眠・おむつを家族と一緒に記録できます。' },
  },
  en: {
    named: (baby, by) => ({
      title: `You're invited to ${baby}'s log`,
      desc: by ? `${by} invited you to log together on Agirok. The link works for 24 hours.` : 'Log together on Agirok. The link works for 24 hours.',
    }),
    generic: { title: 'Agirok · a baby log for the whole family', desc: 'Log feeding, sleep, and diapers together.' },
  },
};

/** 아기 이름을 모르면(없는 코드·만료) 일반 문구 */
export function previewText(lang: InviteLang, babyName?: string | null, inviterName?: string | null): Preview {
  const baby = babyName?.trim();
  const tx = TEXT[lang] ?? TEXT.en;
  return baby ? tx.named(baby, inviterName?.trim() ?? '') : tx.generic;
}

export function normalizeCode(raw: string | undefined): string | null {
  const code = (raw ?? '').trim().toUpperCase();
  return /^[A-Z0-9]{6}$/.test(code) ? code : null;
}

export function langOf(v: unknown): InviteLang {
  return v === 'ja' || v === 'en' ? v : 'ko';
}

export type Invite = { code: string; babyName: string; inviterName: string; lang: InviteLang; expiresAt: number };

type FsValue = { stringValue?: string; integerValue?: string; doubleValue?: number };

/** Firestore REST 응답(문서 하나) → 초대. 필드가 모자라면 null */
export function parseInviteDoc(code: string, doc: { fields?: Record<string, FsValue> } | null | undefined): Invite | null {
  const f = doc?.fields;
  if (!f?.babyId?.stringValue) return null;
  const num = (v?: FsValue) => Number(v?.integerValue ?? v?.doubleValue ?? 0);
  return {
    code,
    babyName: f.babyName?.stringValue ?? '',
    inviterName: f.inviterName?.stringValue ?? '',
    lang: langOf(f.lang?.stringValue),
    expiresAt: num(f.expiresAt),
  };
}

/**
 * 초대 한 건을 읽는다. 보안 규칙이 `invites/{코드}` 한 건 읽기를 로그인 없이 허용한다(목록은 막힘).
 * E2E는 AGIROK_FIRESTORE_EMULATOR_HOST(예: localhost:8090)로 로컬 에뮬레이터를 읽는다.
 * 찾지 못하거나 오류면 null(페이지는 일반 문구로 나간다, 404 금지).
 */
export async function fetchInvite(code: string, fetchImpl: typeof fetch = fetch): Promise<Invite | null> {
  const emu = process.env.AGIROK_FIRESTORE_EMULATOR_HOST;
  const base = emu ? `http://${emu}/v1` : 'https://firestore.googleapis.com/v1';
  const url = `${base}/projects/${AGIROK_PROJECT_ID}/databases/(default)/documents/invites/${encodeURIComponent(code)}`;
  try {
    const res = await fetchImpl(url, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    return parseInviteDoc(code, await res.json());
  } catch (e) {
    console.error('[agirok/invite] 초대 읽기 실패', e);
    return null;
  }
}

/** 카카오톡·인스타그램·네이버·라인·페이스북 같은 앱 안 브라우저. iOS 유니버설 링크를 따르지 않는다 */
export function isInAppBrowser(ua: string): boolean {
  return /KAKAOTALK|Instagram|NAVER\(inapp|Line\/|FBAN|FBAV|DaumApps|everytimeApp|BAND\//i.test(ua);
}

export function isAndroid(ua: string): boolean {
  return /Android/i.test(ua);
}

/** 「앱에서 열기」 주소. Android Chrome은 사용자 탭이 있어도 스킴 주소를 막을 때가 있어 intent:// 를 쓴다 */
export function openAppHref(code: string, ua: string): string {
  return isAndroid(ua) ? `intent://i/${code}#Intent;scheme=agirok;package=${ANDROID_PACKAGE};end` : `${INVITE_SCHEME_PREFIX}${code}`;
}

/** 페이지 본문 문구(언어별). 미리보기(previewText)와 따로 둔다 */
export const PAGE_TEXT: Record<
  InviteLang,
  {
    titleNamed: (baby: string) => string;
    titleGeneric: string;
    by: (name: string) => string;
    byGeneric: string;
    open: string;
    openNote: string;
    noApp: string;
    store: string;
    codeNote: string;
    copy: string;
    copied: string;
    expires: (when: string) => string;
    expired: string;
    notFound: string;
    androidNote: string;
    newWindow: string;
  }
> = {
  ko: {
    titleNamed: (b) => `${b} 기록에\n초대받았어요`,
    titleGeneric: '아기록 초대',
    by: (n) => `${n}님이 수유·수면·기저귀 기록을 함께 쓰자고 했어요`,
    byGeneric: '수유·수면·기저귀 기록을 함께 써요',
    open: '아기록 앱에서 열기',
    openNote: '‘아기록에서 열겠습니까?’가 나오면 ‘열기’를 눌러 주세요',
    noApp: '앱이 없나요?',
    store: 'App Store에서 받기',
    codeNote: '설치 뒤 이 링크를 다시 누르거나 앱에서 ‘초대 코드를 받았어요’에 코드를 넣어요',
    copy: '복사',
    copied: '복사했어요',
    expires: (w) => `초대는 ${w}까지 쓸 수 있어요`,
    expired: '초대 시간이 지났어요. 보낸 사람에게 새 링크를 부탁해 주세요.',
    notFound: '초대를 찾을 수 없어요. 링크가 잘렸거나 지워진 초대예요.',
    androidNote: '아기록은 지금 iPhone에서만 쓸 수 있어요.',
    newWindow: '(새 창에서 열려요)',
  },
  ja: {
    titleNamed: (b) => `${b}の記録に\n招待されました`,
    titleGeneric: 'ベビろくへの招待',
    by: (n) => `${n}さんが授乳・睡眠・おむつの記録を一緒につけようと誘っています`,
    byGeneric: '授乳・睡眠・おむつの記録を一緒につけましょう',
    open: 'ベビろくアプリで開く',
    openNote: '「ベビろくで開きますか？」と表示されたら「開く」を押してください',
    noApp: 'アプリをお持ちでないですか？',
    store: 'App Storeで入手',
    codeNote: 'インストール後、このリンクをもう一度タップするか、アプリの「招待コードを受け取りました」にコードを入力してください',
    copy: 'コピー',
    copied: 'コピーしました',
    expires: (w) => `招待は${w}まで有効です`,
    expired: '招待の期限が切れました。送った人に新しいリンクを頼んでください。',
    notFound: '招待が見つかりません。リンクが途中で切れたか、削除された招待です。',
    androidNote: 'ベビろくは現在iPhoneでのみご利用いただけます。',
    newWindow: '（新しいウィンドウで開きます）',
  },
  en: {
    titleNamed: (b) => `You're invited to\n${b}'s log`,
    titleGeneric: 'Agirok invite',
    by: (n) => `${n} wants to log feeding, sleep, and diapers together`,
    byGeneric: 'Log feeding, sleep, and diapers together',
    open: 'Open in Agirok',
    openNote: 'If asked “Open in Agirok?”, tap Open',
    noApp: "Don't have the app?",
    store: 'Download on the App Store',
    codeNote: 'After installing, tap this link again or enter the code under “I have an invite code” in the app',
    copy: 'Copy',
    copied: 'Copied',
    expires: (w) => `This invite works until ${w}`,
    expired: 'This invite has expired. Ask for a new link.',
    notFound: "Couldn't find this invite. The link may be cut off or the invite was removed.",
    androidNote: 'Agirok is currently available on iPhone only.',
    newWindow: '(opens in a new window)',
  },
};
