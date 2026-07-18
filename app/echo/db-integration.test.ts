import 'dotenv/config';
import { describe, it, expect, afterAll } from 'vitest';
import { createEchoLog, getEchoLogs } from '@/app/actions/echo';
import { parseSeconds } from '@/app/echo/utils/echo-logic';
import { db } from '@/db';
import { echoLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 메아리 10분(+600초) 연장 DB 연동 실제 데이터 통합 테스트 (Real DB Access Integration Test)
 * 
 * 목적:
 * 단순히 프론트엔드/메모리 상의 코드 검증에 그치지 않고,
 * 샌더 및 스피커에서 발생한 10분 연장 이벤트(+600초)가 실제 데이터베이스(Database)에
 * 정확한 메시지 및 payload({ seconds: 600 }) 형태로 영속화(Persist)되고
 * DB 조회 시 600초가 1분(60초)으로 손실되지 않고 정상 복원되는지 직접 검증합니다.
 */

describe('Echo 10분 연장 DB 연동 실데이터 통합 테스트 (Real DB Integration Test)', () => {
  const testUserId = `test-db-user-${Date.now()}`;

  afterAll(async () => {
    // 테스트 후 DB에 생성된 테스트용 로그 데이터 클린업
    try {
      await db.delete(echoLogs).where(eq(echoLogs.userId, testUserId));
    } catch (e) {
      console.error('Failed to cleanup integration test data:', e);
    }
  });

  it('10분 보내기(+600초) 요청 시 실제 DB에 저장되고, DB에서 조회한 payload에서 600초가 정확하게 복원되어야 한다', async () => {
    // 1. 10분 보내기 클릭 시 발생하는 DB 로그 파라미터 준비
    const logPayload = { senderId: testUserId, seconds: 600 };
    const logParams = {
      userId: testUserId,
      role: 'sender',
      eventType: 'request',
      message: '사용자가 메아리를 보냈습니다. (+10분)',
      payload: logPayload,
    };

    // 2. 실제 DB에 echoLog 저장 (createEchoLog Server Action / DB insert)
    const saveResult = await createEchoLog(logParams);
    expect(saveResult.success).toBe(true);

    // 3. 실제 DB에서 직접 최신 로그 목록 조회 (getEchoLogs 또는 Drizzle 직접 조회)
    const dbLogs = await db
      .select()
      .from(echoLogs)
      .where(eq(echoLogs.userId, testUserId))
      .orderBy(echoLogs.createdAt);

    // DB에 레코드가 1개 이상 영속화되었는지 검증
    expect(dbLogs.length).toBeGreaterThan(0);

    const latestDbLog = dbLogs[dbLogs.length - 1];

    // 4. DB 컬럼 데이터 및 메시지 검증
    expect(latestDbLog.userId).toBe(testUserId);
    expect(latestDbLog.role).toBe('sender');
    expect(latestDbLog.eventType).toBe('request');
    expect(latestDbLog.message).toContain('+10분');

    // 5. DB에 저장된 payload JSON 텍스트 검증 및 파싱 검증
    expect(latestDbLog.payload).not.toBeNull();
    const parsedPayloadFromDb = JSON.parse(latestDbLog.payload!);
    
    // DB의 payload 내부 seconds 필드가 60초가 아닌 600초(10분)로 정확히 저장되었는지 검증
    expect(parsedPayloadFromDb.seconds).toBe(600);

    // 6. DB 데이터를 parseSeconds 로직에 전달했을 때 600초로 복원되는지 실데이터 검증
    const restoredSeconds = parseSeconds(parsedPayloadFromDb);
    expect(restoredSeconds).toBe(600);
  });

  it('스피커의 10분 보내기(+600초) 수신 이벤트도 실제 DB에 정상 저장 및 조회되어야 한다', async () => {
    const speakerPayload = { senderId: testUserId, seconds: 600, remainingTime: 660 };
    const logParams = {
      userId: testUserId,
      role: 'speaker',
      eventType: 'sync',
      message: '메아리를 재생합니다. (남은 시간: 11:00)',
      payload: speakerPayload,
    };

    const saveResult = await createEchoLog(logParams);
    expect(saveResult.success).toBe(true);

    // Server Action getEchoLogs 로 조회
    const fetchResult = await getEchoLogs(20);
    expect(fetchResult.success).toBe(true);
    expect(fetchResult.data).toBeDefined();

    const matchedLog = fetchResult.data?.find((l) => l.userId === testUserId && l.message.includes('11:00'));
    expect(matchedLog).toBeDefined();
  });
});
