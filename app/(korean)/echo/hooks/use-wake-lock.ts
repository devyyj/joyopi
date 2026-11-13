'use client';

import { useEffect } from 'react';

interface WakeLockSentinelLike {
  release: () => Promise<void>;
  released?: boolean;
}

interface WakeLockLike {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>;
}

/**
 * active인 동안 화면이 꺼지지 않게 한다 (휴대폰 스피커가 재생 중 잠들지 않도록).
 * 브라우저는 탭이 백그라운드로 가면 자동 해제하므로, 다시 보일 때 재요청한다.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    const wakeLock = (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock;
    if (!active || !wakeLock) return;

    let sentinel: WakeLockSentinelLike | null = null;
    let disposed = false;

    const acquire = async () => {
      try {
        const next = await wakeLock.request('screen');
        if (disposed) {
          await next.release();
          return;
        }
        sentinel = next;
      } catch (err) {
        // 저전력 모드 등으로 거부될 수 있다. 재생 자체에는 영향이 없으므로 경고만 남긴다
        console.warn('Wake Lock request failed:', err);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && (!sentinel || sentinel.released)) {
        acquire();
      }
    };

    acquire();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, [active]);
}
