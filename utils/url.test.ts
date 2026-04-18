import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getURL } from './url'
import { headers } from 'next/headers'

// next/headers 모킹
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

describe('getURL', () => {
  const mockedHeaders = vi.mocked(headers)

  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', undefined)
    vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', undefined)
    // 기본적으로 headers()가 에러를 던지도록 설정 (클라이언트 환경 시뮬레이션)
    mockedHeaders.mockRejectedValue(new Error('Headers not available'))
  })

  it('환경 변수가 없을 때 localhost:3000을 반환해야 함', async () => {
    expect(await getURL()).toBe('http://localhost:3000')
  })

  it('NEXT_PUBLIC_SITE_URL이 설정되어 있을 때 해당 URL을 반환해야 함', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')
    expect(await getURL()).toBe('https://example.com')
  })

  it('URL 끝에 슬래시가 있으면 제거해야 함', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com/')
    expect(await getURL()).toBe('https://example.com')
  })

  it('서버 환경에서 host 헤더를 감지해야 함', async () => {
    mockedHeaders.mockResolvedValue({
      get: vi.fn((key: string) => {
        if (key === 'host') return 'my-app.com'
        if (key === 'x-forwarded-proto') return 'https'
        return null
      }),
    } as unknown as Awaited<ReturnType<typeof headers>>)

    expect(await getURL()).toBe('https://my-app.com')
  })

  it('로컬호스트인 경우 http 프로토콜을 사용해야 함', async () => {
    mockedHeaders.mockResolvedValue({
      get: vi.fn((key: string) => {
        if (key === 'host') return 'localhost:3000'
        return null
      }),
    } as unknown as Awaited<ReturnType<typeof headers>>)

    expect(await getURL()).toBe('http://localhost:3000')
  })

  it('프로토콜이 없는 환경 변수에 https://를 추가해야 함', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'my-dev-server.com')
    expect(await getURL()).toBe('https://my-dev-server.com')
  })
})
