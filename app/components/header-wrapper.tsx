'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

export default function HeaderWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isShingeki = pathname?.startsWith('/shingeki');

  if (isShingeki) {
    return null;
  }

  return <>{children}</>;
}