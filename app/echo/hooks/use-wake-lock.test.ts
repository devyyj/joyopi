import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWakeLock } from './use-wake-lock';

describe('useWakeLock', () => {
  const release = vi.fn().mockResolvedValue(undefined);
  const request = vi.fn();

  beforeEach(() => {
    release.mockClear();
    request.mockReset().mockImplementation(async () => ({ release, released: false }));
    Object.defineProperty(navigator, 'wakeLock', { value: { request }, configurable: true });
  });
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'wakeLock');
  });

  it('활성화되면 화면 꺼짐 방지를 요청하고, 비활성화되면 해제한다', async () => {
    const { rerender } = renderHook(({ active }) => useWakeLock(active), { initialProps: { active: true } });
    await act(async () => {});
    expect(request).toHaveBeenCalledWith('screen');
    rerender({ active: false });
    await act(async () => {});
    expect(release).toHaveBeenCalled();
  });

  it('비활성 상태에서는 요청하지 않는다', async () => {
    renderHook(() => useWakeLock(false));
    await act(async () => {});
    expect(request).not.toHaveBeenCalled();
  });

  it('탭이 다시 보이면 다시 요청한다 (브라우저가 백그라운드에서 자동 해제하므로)', async () => {
    renderHook(() => useWakeLock(true));
    await act(async () => {});
    // 백그라운드로 가면 브라우저가 잠금을 자동 해제한다
    const sentinel = await request.mock.results[0].value;
    sentinel.released = true;
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('지원하지 않는 브라우저에서는 아무것도 하지 않는다', async () => {
    Reflect.deleteProperty(navigator, 'wakeLock');
    expect(() => renderHook(() => useWakeLock(true))).not.toThrow();
  });
});
