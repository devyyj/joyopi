// 서버(라우트 핸들러)에서만 import한다. 비공개 키를 읽으므로 클라이언트 컴포넌트에서 쓰지 않는다.
import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

import type { DeleteAccountDeps } from './delete-account';

/** 아기록 Firebase 프로젝트(공개 값). 비밀값은 서비스 계정의 이메일·비공개 키뿐이다 */
const PROJECT_ID = 'agirok-db7b5';
const APP_NAME = 'agirok';

/**
 * 아기록 Firebase Admin 앱. 서비스 계정은 ‘Firebase Authentication 관리자’ 권한만 준다.
 * 키는 Vercel 환경 변수 AGIROK_FIREBASE_CLIENT_EMAIL, AGIROK_FIREBASE_PRIVATE_KEY(줄바꿈은 \n으로)에 둔다.
 */
function agirokApp(): App {
  if (getApps().some((a) => a.name === APP_NAME)) return getApp(APP_NAME);
  const clientEmail = process.env.AGIROK_FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.AGIROK_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) throw new Error('AGIROK_FIREBASE_CLIENT_EMAIL / AGIROK_FIREBASE_PRIVATE_KEY 없음');
  return initializeApp({ credential: cert({ projectId: PROJECT_ID, clientEmail, privateKey }), projectId: PROJECT_ID }, APP_NAME);
}

export function agirokAuthDeps(): DeleteAccountDeps {
  const auth = getAuth(agirokApp());
  return {
    // 폐기된 토큰(비밀번호 변경·강제 로그아웃 뒤)도 거절한다.
    verifyIdToken: (token) => auth.verifyIdToken(token, true),
    deleteUser: (uid) => auth.deleteUser(uid),
  };
}
