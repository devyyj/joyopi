'use client';

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';

/** joyopi Firebase 웹 앱 설정. 브라우저에 그대로 내려가는 공개 값이다 (접근 제어는 보안 규칙이 맡는다) */
const firebaseConfig = {
  apiKey: 'AIzaSyD4DQORXAIrqJDwvW-e8CVYV9XLU0R9KJo',
  authDomain: 'joyopi.firebaseapp.com',
  databaseURL: 'https://joyopi-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'joyopi',
  storageBucket: 'joyopi.firebasestorage.app',
  messagingSenderId: '914984488392',
  appId: '1:914984488392:web:7dcffc575fdb6c940a04fd',
};

// HMR로 모듈이 다시 읽혀도 앱을 한 번만 만든다
function joyopiApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

/** 메아리 실시간 통신(접속자·이벤트)에 쓰는 Realtime Database */
export function getEchoDatabase(): Database {
  return getDatabase(joyopiApp());
}
