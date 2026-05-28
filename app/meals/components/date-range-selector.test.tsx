import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DateRangeSelector from './date-range-selector';
import { DateRange } from '../types';

describe('DateRangeSelector', () => {
  const today = new Date();
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const subDays = (d: Date, n: number) => {
    const result = new Date(d);
    result.setDate(result.getDate() - n);
    return result;
  };

  const defaultRange: DateRange = {
    period: '7days',
    from: formatYMD(subDays(today, 6)),
    to: formatYMD(today),
  };

  it('1. 기간 탭 버튼 4개가 렌더링되어야 함', () => {
    render(<DateRangeSelector range={defaultRange} onChange={() => {}} />);
    expect(screen.getByTestId('period-tab-7days')).toBeInTheDocument();
    expect(screen.getByTestId('period-tab-14days')).toBeInTheDocument();
    expect(screen.getByTestId('period-tab-30days')).toBeInTheDocument();
    expect(screen.getByTestId('period-tab-custom')).toBeInTheDocument();
  });

  it('2. 7일 탭 클릭 시 from = 6일 전, to = 오늘로 onChange 호출', () => {
    const onChange = vi.fn();
    render(<DateRangeSelector range={{ ...defaultRange, period: '30days' }} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('period-tab-7days'));
    expect(onChange).toHaveBeenCalledOnce();
    const called = onChange.mock.calls[0][0] as DateRange;
    expect(called.period).toBe('7days');
    expect(called.to).toBe(formatYMD(today));
    expect(called.from).toBe(formatYMD(subDays(today, 6)));
  });

  it('3. 직접 설정 탭 클릭 시 커스텀 날짜 input이 나타나야 함', () => {
    render(<DateRangeSelector range={defaultRange} onChange={() => {}} />);
    expect(screen.queryByTestId('custom-range-inputs')).toBeNull();
    fireEvent.click(screen.getByTestId('period-tab-custom'));
    expect(screen.getByTestId('custom-range-inputs')).toBeInTheDocument();
  });

  it('4. 현재 날짜 범위 요약 텍스트가 표시되어야 함', () => {
    render(<DateRangeSelector range={defaultRange} onChange={() => {}} />);
    const from = defaultRange.from.replace(/-/g, '.');
    const to = defaultRange.to.replace(/-/g, '.');
    expect(screen.getByText(new RegExp(from))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(to))).toBeInTheDocument();
  });
});
