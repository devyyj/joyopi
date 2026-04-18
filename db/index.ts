import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("⚠️ DATABASE_URL 환경 변수가 설정되지 않았습니다. 로컬 DB 연결을 시도합니다.");
}

// Disable prefetch as it is not supported for "Transaction" pool mode in Supabase by default
const client = postgres(connectionString || 'postgresql://postgres:password@localhost:5432/postgres', { prepare: false });
export const db = drizzle(client, { schema });
