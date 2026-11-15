import { config } from 'dotenv';
import { describe, it, expect, afterAll } from 'vitest';

import { createEchoLog, getEchoLogs } from '@/app/actions/echo';
import { parseSeconds } from './utils/echo-logic';
import { getDb } from '@/utils/firebase/admin';

config({ path: '.env.local' });

// 서비스 계정 키가 있는 개발 PC에서만 실제 Firestore로 돌린다 (키가 없는 환경은 건너뛴다)
const hasCredentials = Boolean(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);

/**
 * 메아리 10분(+600초) 연장 로그 Firestore 실데이터 통합 테스트
 *
 * 목적:
 * 샌더 및 스피커에서 발생한 10분 연장 이벤트(+600초)가 실제 Firestore(echo_logs)에
 * 정확한 메시지 및 payload({ seconds: 600 }) 형태로 저장되고,
 * 조회 시 600초가 1분(60초)으로 손실되지 않고 정상 복원되는지 직접 검증합니다.
 */
describe.skipIf(!hasCredentials)('Echo 10분 연장 Firestore 실데이터 통합 테스트', () => {
  const testUserId = `test-db-user-${Date.now()}`;

  async function logsOfTestUser() {
    const snapshot = await getDb().collection('echo_logs').where('userId', '==', testUserId).get();
    return snapshot.docs.map((doc) => doc.data() as { userId: string; role: string; eventType: string; message: string; payload: string | null });
  }

  afterAll(async () => {
    // 테스트로 만든 로그 정리
    try {
      const snapshot = await getDb().collection('echo_logs').where('userId', '==', testUserId).get();
      await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
    } catch (e) {
      console.error('Failed to cleanup integration test data:', e);
    }
  });

  it('10분 보내기(+600초) 요청 시 실제 Firestore에 저장되고, 조회한 payload에서 600초가 정확하게 복원되어야 한다', async () => {
    const saveResult = await createEchoLog({
      userId: testUserId,
      role: 'sender',
      eventType: 'request',
      message: '사용자가 메아리를 보냈습니다. (+10분)',
      payload: { senderId: testUserId, seconds: 600 },
    });
    expect(saveResult.success).toBe(true);

    const log = (await logsOfTestUser()).find((l) => l.message.includes('+10분'));
    expect(log).toBeDefined();
    expect(log!.role).toBe('sender');
    expect(log!.eventType).toBe('request');
    expect(log!.payload).not.toBeNull();

    const parsed = JSON.parse(log!.payload!);
    expect(parsed.seconds).toBe(600);
    expect(parseSeconds(parsed)).toBe(600);
  });

  it('스피커의 10분 보내기(+600초) 수신 이벤트도 저장되고 getEchoLogs로 조회된다', async () => {
    const saveResult = await createEchoLog({
      userId: testUserId,
      role: 'speaker',
      eventType: 'sync',
      message: '메아리를 재생합니다. (남은 시간: 11:00)',
      payload: { senderId: testUserId, seconds: 600, remainingTime: 660 },
    });
    expect(saveResult.success).toBe(true);

    const fetchResult = await getEchoLogs(20);
    expect(fetchResult.success).toBe(true);
    const matched = fetchResult.data?.find((l) => l.userId === testUserId && l.message.includes('11:00'));
    expect(matched).toBeDefined();
    expect(matched!.timestamp).toBeInstanceOf(Date);
  });

  it('"메아리를 재생합니다. (남은 시간: 10:00)" 로그의 payload 600초가 그대로 조회된다', async () => {
    const saveResult = await createEchoLog({
      userId: testUserId,
      role: 'speaker',
      eventType: 'sync',
      message: '메아리를 재생합니다. (남은 시간: 10:00)',
      payload: { senderId: testUserId, seconds: 600, remainingTime: 600 },
    });
    expect(saveResult.success).toBe(true);

    const log = (await logsOfTestUser()).find((l) => l.message === '메아리를 재생합니다. (남은 시간: 10:00)');
    expect(log).toBeDefined();
    const parsed = JSON.parse(log!.payload!);
    expect(parsed.seconds).toBe(600);
    expect(parsed.remainingTime).toBe(600);
  });
});
