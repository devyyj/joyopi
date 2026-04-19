import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { createPost, updatePost, createComment } from './board';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';

vi.mock('@/utils/supabase/server');
vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([{ id: 1 }])
      })),
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
        findFirst: vi.fn().mockResolvedValue({ nickname: '테스터' }),
      },
      posts: {
        findFirst: vi.fn().mockResolvedValue({ id: 1, authorId: 'user-123' }),
      },
      comments: {
        findFirst: vi.fn().mockResolvedValue({ id: 1, authorId: 'user-123' }),
      },
      likes: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
  },
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Board Actions', () => {
  const mockCreateClient = createClient as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createPost should work correctly', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
    });
    const formData = new FormData();
    formData.append('title', 'Test');
    formData.append('content', 'Content');

    const result = await createPost(formData);
    expect(db.insert).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('updatePost should verify ownership', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'other-user' } } }) },
    });
    const formData = new FormData();
    formData.append('title', 'Edit');
    formData.append('content', 'Edit');

    await expect(updatePost(1, formData)).rejects.toThrow('수정 권한이 없습니다.');
  });

  it('createPost should fail if title is too long', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
    });
    const formData = new FormData();
    formData.append('title', 'a'.repeat(51));
    formData.append('content', 'valid');

    await expect(createPost(formData)).rejects.toThrow('제목은 최대 50자까지 가능합니다.');
  });

  it('createComment should fail if content is too long', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
    });
    const longContent = 'a'.repeat(201);
    await expect(createComment(1, longContent)).rejects.toThrow('댓글은 최대 200자까지 작성 가능합니다.');
  });

  it('createComment should fail if content contains newline', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
    });
    const multilineContent = 'line 1\nline 2';
    await expect(createComment(1, multilineContent)).rejects.toThrow('댓글은 한 줄로만 작성 가능합니다.');
  });
});
