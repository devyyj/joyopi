'use server';

import { db } from '@/db';
import { echoLogs } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/server';
import { isEchoAllowedEmail } from '@/utils/echo-access';

import { mapEventTypeToLogType } from '@/app/echo/utils/echo-logic';

const MAX_MESSAGE_LENGTH = 500;
const MAX_LOG_LIMIT = 100;

export interface CreateEchoLogParams {
  userId?: string;
  role: string;
  eventType: string;
  message: string;
  payload?: unknown;
}

// 서버 액션은 공개 엔드포인트이므로 페이지 접근 제어와 별개로 호출자를 직접 검증한다
async function isAuthorized() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return isEchoAllowedEmail(user?.email);
  } catch (error) {
    console.error('Failed to verify echo user:', error);
    return false;
  }
}

export async function createEchoLog(params: CreateEchoLogParams) {
  if (!(await isAuthorized())) {
    return { success: false, error: 'Unauthorized' };
  }

  const message = params.message?.trim();
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return { success: false, error: 'Invalid log' };
  }

  try {
    await db.insert(echoLogs).values({
      userId: params.userId,
      role: params.role,
      eventType: params.eventType,
      message,
      payload: params.payload ? JSON.stringify(params.payload) : null,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to create echo log:', error);
    return { success: false, error: 'Failed to save log' };
  }
}

export async function getEchoLogs(limit = 10) {
  if (!(await isAuthorized())) {
    return { success: false, error: 'Unauthorized' };
  }

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
