import { describe, it, expect, vi, type Mock, beforeEach } from 'vitest'
import { getCurrentUser, getCurrentUserRole, isAdmin, requireRole } from './auth'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/db'
import { redirect } from 'next/navigation'

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/db', () => ({
  db: {
    query: {
      profiles: {
        findFirst: vi.fn(),
      },
    },
  },
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('RBAC Auth Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentUser', () => {
    it('로그인하지 않은 사용자의 경우 null을 반환해야 함', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      };
      (createClient as Mock).mockResolvedValue(mockSupabase)

      const user = await getCurrentUser()
      expect(user).toBeNull()
    })

    it('로그인한 사용자의 경우 user 객체를 반환해야 함', async () => {
      const mockUser = { id: 'user-id-123', email: 'test@example.com' }
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      };
      (createClient as Mock).mockResolvedValue(mockSupabase)

      const user = await getCurrentUser()
      expect(user).toEqual(mockUser)
    })
  })

  describe('getCurrentUserRole', () => {
    it('로그인하지 않은 경우 guest 역할을 반환해야 함', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      };
      (createClient as Mock).mockResolvedValue(mockSupabase)

      const role = await getCurrentUserRole()
      expect(role).toBe('guest')
    })

    it('로그인되어 있으나 프로필이 조회되지 않는 경우 guest 역할을 반환해야 함', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
        },
      };
      (createClient as Mock).mockResolvedValue(mockSupabase);
      (db.query.profiles.findFirst as Mock).mockResolvedValue(null)

      const role = await getCurrentUserRole()
      expect(role).toBe('guest')
    })

    it('프로필의 role이 올바르게 반환되어야 함', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
        },
      };
      (createClient as Mock).mockResolvedValue(mockSupabase);
      (db.query.profiles.findFirst as Mock).mockResolvedValue({ role: 'admin' })

      const role = await getCurrentUserRole()
      expect(role).toBe('admin')
    })
  })

  describe('isAdmin', () => {
    it('역할이 admin일 경우 true를 반환해야 함', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
        },
      };
      (createClient as Mock).mockResolvedValue(mockSupabase);
      (db.query.profiles.findFirst as Mock).mockResolvedValue({ role: 'admin' })

      const adminCheck = await isAdmin()
      expect(adminCheck).toBe(true)
    })

    it('역할이 user일 경우 false를 반환해야 함', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
        },
      };
      (createClient as Mock).mockResolvedValue(mockSupabase);
      (db.query.profiles.findFirst as Mock).mockResolvedValue({ role: 'user' })

      const adminCheck = await isAdmin()
      expect(adminCheck).toBe(false)
    })
  })

  describe('requireRole', () => {
    it('허용된 역할에 포함될 경우 리다이렉트하지 않음', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
        },
      };
      (createClient as Mock).mockResolvedValue(mockSupabase);
      (db.query.profiles.findFirst as Mock).mockResolvedValue({ role: 'admin' })

      await requireRole(['admin'])
      expect(redirect).not.toHaveBeenCalled()
    })

    it('허용된 역할에 포함되지 않을 경우 기본 경로로 리다이렉트함', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
        },
      };
      (createClient as Mock).mockResolvedValue(mockSupabase);
      (db.query.profiles.findFirst as Mock).mockResolvedValue({ role: 'user' })

      await requireRole(['admin'])
      expect(redirect).toHaveBeenCalledWith('/')
    })
  })
})
