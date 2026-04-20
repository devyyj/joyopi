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

  it('createPost should handle images correctly', async () => {
    const mockUpload = vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null });
    const mockGetPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'http://test.com/img.webp' } });

    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      storage: {
        from: vi.fn().mockReturnValue({
          upload: mockUpload,
          getPublicUrl: mockGetPublicUrl,
        }),
      },
    });

    const formData = new FormData();
    formData.append('title', 'With Images');
    formData.append('content', 'Content');
    const mockFile = new File(['fake content'], 'test.webp', { type: 'image/webp' });
    formData.append('images', mockFile);

    const result = await createPost(formData);
    
    expect(mockUpload).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalledTimes(2); // 1. posts, 2. post_images
    expect(result.success).toBe(true);
  });

  it('createPost should continue even if image upload fails partially', async () => {
    const mockUpload = vi.fn().mockResolvedValue({ data: null, error: new Error('Upload fail') });

    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      storage: {
        from: vi.fn().mockReturnValue({
          upload: mockUpload,
        }),
      },
    });

    const formData = new FormData();
    formData.append('title', 'Fail Images');
    formData.append('content', 'Content');
    formData.append('images', new File([''], 'test.webp', { type: 'image/webp' }));

    const result = await createPost(formData);
    
    // 업로드가 실패해도 게시글 자체는 생성되어야 함 (현재 로직상)
    expect(result.success).toBe(true);
    expect(db.insert).toHaveBeenCalledTimes(1); // posts만 호출되고 post_images는 호출되지 않음
  });

  it('updatePost should handle image removal', async () => {
    const mockRemove = vi.fn().mockResolvedValue({ data: {}, error: null });
    
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      storage: {
        from: vi.fn().mockReturnValue({
          remove: mockRemove,
        }),
      },
    });

    // 기존 데이터 모킹 (이미지 2개 보유)
    (db.query.posts.findFirst as Mock).mockResolvedValue({
      id: 1,
      authorId: 'user-123',
      images: [{ id: 10, url: 'img1' }, { id: 11, url: 'img2' }]
    });

    const formData = new FormData();
    formData.append('title', 'Updated');
    formData.append('content', 'Updated');
    formData.append('removedImageIds', '10');

    const result = await updatePost(1, formData);
    
    expect(mockRemove).toHaveBeenCalled();
    expect(db.delete).toHaveBeenCalled(); // postImages 삭제 호출
    expect(result.success).toBe(true);
  });

  it('createPost should fail if title is too long', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
    });
    const formData = new FormData();
    formData.append('title', 'a'.repeat(51));
    formData.append('content', 'valid');

    const result = await createPost(formData);
    expect(result.success).toBe(false);
    expect(result.message).toContain('최대 50자');
  });

  it('createComment should fail if content is too long', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
    });
    const longContent = 'a'.repeat(201);
    const result = await createComment(1, longContent);
    expect(result.success).toBe(false);
    expect(result.message).toContain('최대 200자');
  });

  it('createComment should fail if content contains newline', async () => {
    mockCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
    });
    const multilineContent = 'line 1\nline 2';
    const result = await createComment(1, multilineContent);
    expect(result.success).toBe(false);
    expect(result.message).toContain('한 줄로만');
  });
});
