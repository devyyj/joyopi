'use server';

import { db } from '@/db';
import { echoLogs } from '@/db/schema';
import { desc, lt } from 'drizzle-orm';

import { mapEventTypeToLogType } from '@/app/echo/utils/echo-logic';

const MAX_MESSAGE_LENGTH = 500;
const MAX_FIELD_LENGTH = 100;
const MAX_PAYLOAD_LENGTH = 2000;
const MAX_LOG_LIMIT = 100;
const LOG_RETENTION_DAYS = 30;

export interface CreateEchoLogParams {
  userId?: string;
  role: string;
  eventType: string;
  message: string;
  payload?: unknown;
}

// 에코는 로그인 없이 누구나 쓴다. 서버 액션도 누구나 부를 수 있으므로 저장하는 값의 크기를 여기서 제한한다.
function isShortText(value: unknown, required: boolean) {
  if (value === undefined || value === null) return !required;
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_FIELD_LENGTH;
}

// 보관 기간이 지난 로그는 저장할 때마다 함께 지워 테이블이 계속 커지지 않게 한다
async function pruneOldLogs() {
  try {
    const cutoff = new Date(Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    await db.delete(echoLogs).where(lt(echoLogs.createdAt, cutoff));
  } catch (error) {
    // 정리 실패는 저장 결과에 영향을 주지 않는다
    console.error('Failed to prune old echo logs:', error);
  }
}

export async function createEchoLog(params: CreateEchoLogParams) {
  const message = params.message?.trim();
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return { success: false, error: 'Invalid log' };
  }

  if (!isShortText(params.role, true) || !isShortText(params.eventType, true) || !isShortText(params.userId, false)) {
    return { success: false, error: 'Invalid log' };
  }

  const payload = params.payload ? JSON.stringify(params.payload) : null;
  if (payload && payload.length > MAX_PAYLOAD_LENGTH) {
    return { success: false, error: 'Invalid log' };
  }

  try {
    await db.insert(echoLogs).values({
      userId: params.userId,
      role: params.role,
      eventType: params.eventType,
      message,
      payload,
    });
    await pruneOldLogs();
    return { success: true };
  } catch (error) {
    console.error('Failed to create echo log:', error);
    return { success: false, error: 'Failed to save log' };
  }
}

export async function getEchoLogs(limit = 10) {
  const safeLimit = Math.min(Math.max(Math.floor(limit) || 1, 1), MAX_LOG_LIMIT);

  try {
    const logs = await db
      .select()
      .from(echoLogs)
      .orderBy(desc(echoLogs.createdAt))
      .limit(safeLimit);

    return {
      success: true,
      data: logs.reverse().map(log => ({
        id: log.id,
        timestamp: log.createdAt,
        message: log.message,
        type: mapEventTypeToLogType(log.eventType),
        userId: log.userId,
      }))
    };
  } catch (error) {
    console.error('Failed to fetch echo logs:', error);
    return { success: false, error: 'Failed to fetch logs' };
  }
}
