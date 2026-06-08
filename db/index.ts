import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import http from 'http';
import net from 'net';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("[WARNING] DATABASE_URL 환경 변수가 설정되지 않았습니다. 로컬 DB 연결을 시도합니다.");
}

const url = connectionString || 'postgresql://postgres:password@localhost:5432/postgres';

// 프록시 설정 확인
const proxyUrlStr = process.env.HTTP_PROXY || process.env.http_proxy || process.env.HTTPS_PROXY || process.env.https_proxy;

function getProxiedSocket(targetHost: string, targetPort: number) {
  if (!proxyUrlStr) return undefined;

  const proxyUrl = new URL(proxyUrlStr);

  return () => new Promise<net.Socket>((resolve, reject) => {
    const req = http.request({
      host: proxyUrl.hostname,
      port: proxyUrl.port,
      method: 'CONNECT',
      path: `${targetHost}:${targetPort}`,
    });

    req.on('connect', (res, socket) => {
      if (res.statusCode === 200) {
        resolve(socket as net.Socket);
      } else {
        reject(new Error(`Proxy CONNECT failed with status ${res.statusCode}`));
      }
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

// URL 파싱하여 호스트와 포트 추출
let targetHost = 'localhost';
let targetPort = 5432;
try {
  const parsed = new URL(url.replace('postgresql:', 'http:').replace('postgres:', 'http:'));
  targetHost = parsed.hostname;
  targetPort = parseInt(parsed.port || '5432');
} catch (e) {
  console.error("Failed to parse DATABASE_URL:", e);
}

// Next.js HMR(Hot Module Replacement) 환경에서 DB 커넥션이 무한히 생성되는 것을 방지하기 위해 globalThis 사용
const globalForDb = globalThis as unknown as {
  postgresClient: postgres.Sql | undefined;
};

// 프록시 소켓 생성 함수 설정
const socket = getProxiedSocket(targetHost, targetPort);

const options: Record<string, unknown> = {
  prepare: false,
  ssl: targetPort === 443 ? 'require' : false
};

if (socket) {
  options.socket = socket;
}

// Disable prefetch as it is not supported for "Transaction" pool mode in Supabase by default
const client = globalForDb.postgresClient ?? postgres(url, options);

// 프로덕션 환경에서도 싱글톤 유지 (서버리스 환경이 아닐 경우 유효)
globalForDb.postgresClient = client;

export const db = drizzle(client, { schema });


