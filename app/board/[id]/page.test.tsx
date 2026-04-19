import { render, screen } from '@testing-library/react';
import PostDetailPage from './page';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

// Mocking
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([{
          id: 1,
          title: 'TEST POST TITLE',
          content: 'TEST POST CONTENT',
          authorId: 'author-123',
          authorName: 'AUTHOR NAME',
          createdAt: new Date('2026-04-19'),
        }]),
      })),
    })),
  },
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'author-123' } } }),
    },
  }),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// MainHeader mock to simplify test
vi.mock('@/app/components/main-header', () => ({
  default: () => <div data-testid="main-header">Mock Header</div>,
}));

describe('PostDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('게시글 상세 정보를 올바르게 렌더링해야 한다', async () => {
    const params = Promise.resolve({ id: '1' });
    
    // Server Component rendering
    const Component = await PostDetailPage({ params });
    render(Component);

    expect(screen.getByText('TEST POST TITLE')).toBeInTheDocument();
    expect(screen.getByText('TEST POST CONTENT')).toBeInTheDocument();
    // Author name appears in header and comment header
    expect(screen.getAllByText(/AUTHOR NAME/).length).toBeGreaterThan(0);
  });

  it('작성자일 경우 수정 및 삭제 버튼을 표시해야 한다', async () => {
    const params = Promise.resolve({ id: '1' });
    
    const Component = await PostDetailPage({ params });
    render(Component);

    expect(screen.getByText('수정')).toBeInTheDocument();
    expect(screen.getByText('삭제')).toBeInTheDocument();
  });
});
