import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { createPost, updatePost, deletePost } from './board';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Mocking
vi.mock('@/utils/supabase/server');
vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue({}),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue({}),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn().mockResolvedValue({}),
    })),
    query: {
      profiles: {
        findFirst: vi.fn().mockResolvedValue({ nickname: '테스트유저' }),
      },
    },
  },
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Board Actions', () => {
  const mockCreateClient = createClient as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPost', () => {
    it('로그인하지 않은 경우 에러를 던져야 한다', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      });

      const formData = new FormData();
      formData.append('title', '테스트 제목');
      formData.append('content', '테스트 내용');

      await expect(createPost(formData)).rejects.toThrow('로그인이 필요합니다.');
    });

    it('제목이나 내용이 없는 경우 에러를 던져야 한다', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: { id: 'user-123', user_metadata: { full_name: '테스터' } } } 
          }),
        },
      });

      const formData = new FormData();
      formData.append('content', '테스트 내용');

      await expect(createPost(formData)).rejects.toThrow('제목과 내용을 입력해주세요.');
    });

    it('성공적으로 게시글을 생성하고 리다이렉트해야 한다', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: { id: 'user-123', user_metadata: { full_name: '테스터' } } } 
          }),
        },
      });

      const formData = new FormData();
      formData.append('title', '테스트 제목');
      formData.append('content', '테스트 내용');

      await createPost(formData);

      expect(db.insert).toHaveBeenCalled();
      expect(revalidatePath).toHaveBeenCalledWith('/board');
      expect(redirect).toHaveBeenCalledWith('/board');
    });
  });

  describe('updatePost', () => {
    it('제목이나 내용이 공백인 경우 에러를 던져야 한다', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: { id: 'user-123' } } 
          }),
        },
      });

      const formData = new FormData();
      formData.append('title', '   ');
      formData.append('content', '테스트 내용');

      await expect(updatePost(100, formData)).rejects.toThrow('제목과 내용을 입력해주세요.');
    });

    it('작성자가 아닌 경우 수정을 시도해도 DB가 업데이트되지 않아야 한다', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: { id: 'other-user' } } 
          }),
        },
      });

      const formData = new FormData();
      formData.append('title', '수정된 제목');
      formData.append('content', '수정된 내용');

      await updatePost(100, formData);

      expect(db.update).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/board/100');
    });
  });

  describe('deletePost', () => {
    it('성공적으로 게시글을 삭제하고 리다이렉트해야 한다', async () => {
      mockCreateClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ 
            data: { user: { id: 'user-123' } } 
          }),
        },
      });

      await deletePost(100);

      expect(db.delete).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/board');
    });
  });
});
