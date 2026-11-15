'use server';

import { FieldValue, Timestamp } from 'firebase-admin/firestore';

import { getDb } from '@/utils/firebase/admin';

import { mapEventTypeToLogType } from '@/app/(korean)/echo/utils/echo-logic';

const MAX_MESSAGE_LENGTH = 500;
const MAX_FIELD_LENGTH = 100;
const MAX_PAYLOAD_LENGTH = 2000;
const MAX_LOG_LIMIT = 100;
const LOG_RETENTION_DAYS = 30;
// 한 번에 지우는 최대 개수 (Firestore 일괄 쓰기 한도 500 이내)
const PRUNE_BATCH_SIZE = 200;
const COLLECTION = 'echo_logs';

/** Firestore echo_logs 문서. createdAt은 서버 시각으로 채운다 */
interface EchoLogDoc {
  userId: string | null;
  role: string;
  eventType: string;
  message: string;
  payload: string | null;
  createdAt: Timestamp;
}

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

// 보관 기간이 지난 로그는 저장할 때마다 함께 지워 컬렉션이 계속 커지지 않게 한다.
// (Firestore TTL 정책은 유료 요금제에서만 쓸 수 있어 직접 지운다)
async function pruneOldLogs() {
  try {
    const db = getDb();
    const cutoff = Timestamp.fromDate(new Date(Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000));
    const old = await db.collection(COLLECTION).where('createdAt', '<', cutoff).limit(PRUNE_BATCH_SIZE).get();
    if (old.empty) return;
    const batch = db.batch();
    old.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
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
    await getDb().collection(COLLECTION).add({
      userId: params.userId ?? null,
      role: params.role,
      eventType: params.eventType,
      message,
      payload,
      createdAt: FieldValue.serverTimestamp(),
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
    const snapshot = await getDb().collection(COLLECTION).orderBy('createdAt', 'desc').limit(safeLimit).get();

    return {
      success: true,
      data: snapshot.docs.reverse().map((doc) => {
        const log = doc.data() as EchoLogDoc;
        return {
          id: doc.id,
          timestamp: log.createdAt.toDate(),
          message: log.message,
          type: mapEventTypeToLogType(log.eventType),
          userId: log.userId,
        };
      }),
    };
  } catch (error) {
    console.error('Failed to fetch echo logs:', error);
    return { success: false, error: 'Failed to fetch logs' };
  }
}
