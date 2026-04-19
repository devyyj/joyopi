import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("⚠️ DATABASE_URL 환경 변수가 설정되지 않았습니다. 로컬 DB 연결을 시도합니다.");
}

const url = connectionString || 'postgresql://postgres:password@localhost:5432/postgres';

// Next.js HMR(Hot Module Replacement) 환경에서 DB 커넥션이 무한히 생성되는 것을 방지하기 위해 globalThis 사용
const globalForDb = globalThis as unknown as {
  postgresClient: postgres.Sql | undefined;
};

// Disable prefetch as it is not supported for "Transaction" pool mode in Supabase by default
const client = globalForDb.postgresClient ?? postgres(url, { prepare: false });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.postgresClient = client;
}

export const db = drizzle(client, { schema });

