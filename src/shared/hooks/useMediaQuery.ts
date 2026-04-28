'use client';

import { useState, useEffect } from 'react';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints: Record<Breakpoint, string> = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

/**
 * Retorna true si la ventana cumple la media query especificada.
 * Compatible con SSR (retorna false hasta la hidratación).
 *
 * @example
 * const isMobile = !useMediaQuery('md');
 * const isDesktop = useMediaQuery('lg');
 */
export function useMediaQuery(query: Breakpoint | string): boolean {
  const rawQuery = breakpoints[query as Breakpoint] ?? query;
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(rawQuery);
    setMatches(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [rawQuery]);

  return matches;
}
