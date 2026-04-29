'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@src/core/store/useAuthStore';

const COOKIE_NAME = 'clic-moda-session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

export function useSyncSession() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    } else {
      document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    }
  }, [isAuthenticated]);
}
