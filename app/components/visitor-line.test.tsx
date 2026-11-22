import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import VisitorLine from './visitor-line';

const recordVisit = vi.fn();
vi.mock('@/app/actions/visits', () => ({ recordVisit: (count: boolean) => recordVisit(count) }));

const KEY = 'joyopi:visit-day';

describe('VisitorLine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-22T03:00:00Z')); // 한국 날짜 2026-11-22
    recordVisit.mockResolvedValue({ today: 1284, total: 52903, since: '2026-11-22' });
  });

  it('오늘 처음이면 세어 달라고 하고, 오늘 날짜를 남긴다', async () => {
    render(<VisitorLine />);

    expect(await screen.findByText('1,284')).toBeInTheDocument();
    expect(screen.getByText('52,903')).toBeInTheDocument();
    expect(screen.getByText('2026-11-22')).toBeInTheDocument();
    expect(recordVisit).toHaveBeenCalledWith(true);
    expect(localStorage.getItem(KEY)).toBe('2026-11-22');
  });

  it('오늘 이미 센 브라우저는 읽기만 한다', async () => {
    localStorage.setItem(KEY, '2026-11-22');
    render(<VisitorLine />);

    await screen.findByText('1,284');
    expect(recordVisit).toHaveBeenCalledWith(false);
  });

  it('어제 센 브라우저는 오늘 다시 센다', async () => {
    localStorage.setItem(KEY, '2026-11-21');
    render(<VisitorLine />);

    await screen.findByText('1,284');
    expect(recordVisit).toHaveBeenCalledWith(true);
  });

  it('서버가 실패하면 줄을 숨기고 날짜를 남기지 않는다', async () => {
    recordVisit.mockResolvedValue(null);
    const { container } = render(<VisitorLine />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
