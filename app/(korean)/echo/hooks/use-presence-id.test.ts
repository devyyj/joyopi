import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { usePresenceId, PRESENCE_STORAGE_KEY } from './use-presence-id';

function Probe() {
  const id = usePresenceId();
  return createElement('span', null, id);
}

describe('usePresenceId', () => {
  beforeEach(() => sessionStorage.clear());

  it('첫 렌더링은 빈 값이라 서버 렌더링 결과와 일치한다', () => {
    sessionStorage.setItem(PRESENCE_STORAGE_KEY, 'saved-id');
    expect(renderToString(createElement(Probe))).toBe('<span></span>');
  });

  it('마운트 후 저장된 ID를 쓴다', () => {
    sessionStorage.setItem(PRESENCE_STORAGE_KEY, 'saved-id');
    const { result } = renderHook(() => usePresenceId());
    expect(result.current).toBe('saved-id');
  });

  it('저장된 ID가 없으면 새로 만들어 저장한다', () => {
    const { result } = renderHook(() => usePresenceId());
    expect(result.current).toMatch(/^[0-9a-f-]{36}$/);
    expect(sessionStorage.getItem(PRESENCE_STORAGE_KEY)).toBe(result.current);
  });
});
