import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getURL } from './url'

describe('getURL', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', undefined)
    vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', undefined)
  })

  it('환경 변수가 없을 때 localhost:3000을 반환해야 함', () => {
    expect(getURL()).toBe('http://localhost:3000')
  })

  it('NEXT_PUBLIC_SITE_URL이 설정되어 있을 때 해당 URL을 반환해야 함', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com')
    expect(getURL()).toBe('https://example.com')
  })

  it('URL 끝에 슬래시가 있으면 제거해야 함', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com/')
    expect(getURL()).toBe('https://example.com')
  })

  it('NEXT_PUBLIC_VERCEL_URL이 설정되어 있고 SITE_URL이 없을 때 Vercel URL을 사용해야 함', () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_URL', 'joyopi.vercel.app')
    expect(getURL()).toBe('https://joyopi.vercel.app')
  })

  it('프로토콜이 없는 URL에 https://를 추가해야 함', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'my-dev-server.com')
    expect(getURL()).toBe('https://my-dev-server.com')
  })
})
