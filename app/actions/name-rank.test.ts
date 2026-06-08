import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { getBabyNames, createBabyName, deleteBabyName, reorderBabyNames } from './name-rank';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([{ id: 'mock-uuid-1' }]),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn().mockResolvedValue([
            { id: '1', name: '우주', role: 'dad', rank: 1 },
            { id: '2', name: '도윤', role: 'dad', rank: 2 },
          ]),
          limit: vi.fn(() => ({
            get: vi.fn().mockResolvedValue({ role: 'admin' }),
          })),
        })),
        orderBy: vi.fn().mockResolvedValue([
          { id: '1', name: '우주', role: 'dad', rank: 1 },
          { id: '2', name: '도윤', role: 'dad', rank: 2 },
        ]),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([{ id: 'mock-uuid-1' }]),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([{ id: 'mock-uuid-1' }]),
      })),
    })),
    transaction: vi.fn((callback) => callback(db)),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Name Ranks Server Actions (TDD)', () => {
  const mockDadUser = { id: '3b327caa-5db3-468d-85c9-3cb83aad81c1', email: 'devyyj@gmail.com' };
  const mockMomUser = { id: '9b692904-a898-4d24-a833-6c728d731a30', email: 'noticeably34@gmail.com' };
  const mockRegularUser = { id: 'regular-user-id', email: 'user@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupMockUser = (user: { id: string; email: string } | null, profileRole: string = 'user') => {
    (createClient as Mock).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user } }),
      },
    });

    const mockSelectFrom = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([user ? { id: user.id, email: user.email, role: profileRole } : null]),
      orderBy: vi.fn().mockResolvedValue([
        { id: '1', name: '우주', role: 'dad', rank: 1 },
        { id: '2', name: '도윤', role: 'dad', rank: 2 },
      ]),
    };

    (db.select as Mock).mockReturnValue(mockSelectFrom);
  };

  describe('Security Check', () => {
    it('로그인하지 않은 유저가 조회하면 에러를 반환한다', async () => {
      setupMockUser(null);
      await expect(getBabyNames('dad')).rejects.toThrow('Unauthorized');
    });

    it('관리자가 아닌 일반 유저가 이름 추가를 하면 에러를 반환한다', async () => {
      setupMockUser(mockRegularUser, 'user');
      await expect(createBabyName('우주', 'dad')).rejects.toThrow('Forbidden: Admin role required');
    });

    it('관리자가 아닌 일반 유저가 순서를 변경하면 에러를 반환한다', async () => {
      setupMockUser(mockRegularUser, 'user');
      await expect(reorderBabyNames('dad', ['1', '2'])).rejects.toThrow('Forbidden: Admin role required');
    });

    it('아빠 유저(devyyj)가 엄마 선호도 이름을 추가하려고 하면 에러를 반환한다', async () => {
      setupMockUser(mockDadUser, 'admin');
      await expect(createBabyName('서하', 'mom')).rejects.toThrow('Forbidden: Only mom user can manage mom list');
    });

    it('엄마 유저(notice)가 아빠 선호도 이름을 추가하려고 하면 에러를 반환한다', async () => {
      setupMockUser(mockMomUser, 'admin');
      await expect(createBabyName('우주', 'dad')).rejects.toThrow('Forbidden: Only dad user can manage dad list');
    });
  });

  describe('Admin Operations', () => {
    it('아빠 유저(devyyj)가 아빠 선호도 이름을 추가하면 성공한다', async () => {
      setupMockUser(mockDadUser, 'admin');
      
      const result = await createBabyName('우주', 'dad');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('mock-uuid-1');
    });

    it('엄마 유저(notice)가 엄마 선호도 이름을 추가하면 성공한다', async () => {
      setupMockUser(mockMomUser, 'admin');
      
      const result = await createBabyName('서하', 'mom');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('mock-uuid-1');
    });

    it('아빠 유저(devyyj)가 아빠 순서를 정렬하면 성공한다', async () => {
      setupMockUser(mockDadUser, 'admin');

      const result = await reorderBabyNames('dad', ['2', '1']);
      expect(result.success).toBe(true);
      expect(db.transaction).toHaveBeenCalled();
    });

    it('엄마 유저(notice)가 엄마 순서를 정렬하면 성공한다', async () => {
      setupMockUser(mockMomUser, 'admin');

      const result = await reorderBabyNames('mom', ['2', '1']);
      expect(result.success).toBe(true);
      expect(db.transaction).toHaveBeenCalled();
    });
  });
});
