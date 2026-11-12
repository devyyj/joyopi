import { describe, it, expect, vi } from 'vitest';

vi.mock('@/utils/supabase/middleware', () => ({ updateSession: vi.fn() }));

import { config } from './middleware';

// Next.js matcher는 경로 전체에 맞아야 미들웨어를 실행한다.
const runsMiddleware = (path: string) => config.matcher.some((m) => new RegExp(`^${m}$`).test(path));

describe('middleware matcher', () => {
  it('app-ads.txt 같은 정적 텍스트 파일은 미들웨어를 거치지 않는다', () => {
    expect(runsMiddleware('/app-ads.txt')).toBe(false);
  });

  it('이미지·Next 정적 자원은 거치지 않는다', () => {
    expect(runsMiddleware('/og-image.png')).toBe(false);
    expect(runsMiddleware('/_next/static/chunk.js')).toBe(false);
  });

  it('일반 페이지와 앱 문서 페이지는 세션 갱신을 위해 거친다(로그인으로 보내지는 않는다)', () => {
    expect(runsMiddleware('/')).toBe(true);
    expect(runsMiddleware('/board')).toBe(true);
    expect(runsMiddleware('/apps/agirok/privacy')).toBe(true);
  });
});
