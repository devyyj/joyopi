// 서버(서버 액션·라우트 핸들러)에서만 import한다. 비공개 키를 읽으므로 클라이언트 컴포넌트에서 쓰지 않는다.
import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/** joyopi Firebase 프로젝트(공개 값). 비밀값은 서비스 계정의 이메일·비공개 키뿐이다 */
const PROJECT_ID = 'joyopi';
// 같은 서버에서 아기록 Admin 앱('agirok')도 쓰므로 기본 앱이 아닌 이름 있는 앱으로 만든다
const APP_NAME = 'joyopi';

/**
 * joyopi Firebase Admin 앱. 서비스 계정(joyopi-server)은 Firestore 읽기·쓰기(roles/datastore.user)만 갖는다.
 * 키는 환경 변수 FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY(줄바꿈은 \n으로)에 둔다.
 */
function joyopiApp(): App {
  if (getApps().some((a) => a.name === APP_NAME)) return getApp(APP_NAME);
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) throw new Error('FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY 없음');
  return initializeApp({ credential: cert({ projectId: PROJECT_ID, clientEmail, privateKey }), projectId: PROJECT_ID }, APP_NAME);
}

export function getDb(): Firestore {
  return getFirestore(joyopiApp());
}
