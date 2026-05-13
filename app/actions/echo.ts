'use server';

import { db } from '@/db';
import { echoLogs } from '@/db/schema';
import { desc } from 'drizzle-orm';

import { mapEventTypeToLogType } from '@/app/echo/utils/echo-logic';

export interface CreateEchoLogParams {
  userId?: string;
  role: string;
  eventType: string;
  message: string;
  payload?: unknown;
}

export async function createEchoLog(params: CreateEchoLogParams) {
  try {
    await db.insert(echoLogs).values({
      userId: params.userId,
      role: params.role,
      eventType: params.eventType,
      message: params.message,
      payload: params.payload ? JSON.stringify(params.payload) : null,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to create echo log:', error);
    return { success: false, error: 'Failed to save log' };
  }
}

export async function getEchoLogs(limit = 10) {
  try {
    const logs = await db
      .select()
      .from(echoLogs)
      .orderBy(desc(echoLogs.createdAt))
      .limit(limit);
    
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
