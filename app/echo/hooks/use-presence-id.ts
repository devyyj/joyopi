'use client';

import { useEffect, useState } from 'react';

export const PRESENCE_STORAGE_KEY = 'echo-presence-id';

function readOrCreatePresenceId(): string {
  const saved = sessionStorage.getItem(PRESENCE_STORAGE_KEY);
  if (saved) return saved;
  const id = crypto.randomUUID();
  sessionStorage.setItem(PRESENCE_STORAGE_KEY, id);
  return id;
}

/**
 * 탭마다 유지되는 메아리 접속자 ID.
 * 서버 렌더링 결과와 맞추기 위해 첫 렌더링은 빈 값으로 시작하고, 마운트 후에 읽는다 (AGENTS.md 6.6).
 */
export function usePresenceId(): string {
  const [presenceId, setPresenceId] = useState('');

  useEffect(() => {
    // 브라우저 저장소는 마운트 후에만 읽을 수 있어 effect 안에서 한 번 설정한다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPresenceId(readOrCreatePresenceId());
  }, []);

  return presenceId;
}
