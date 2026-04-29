'use client';

import { useState, useEffect } from 'react';

/**
 * Retrasa la actualización de un valor hasta que el usuario deja de cambiar el input.
 * Útil para búsquedas en tiempo real sin saturar el servicio.
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 400);
 * useEffect(() => { fetchProducts(debouncedSearch); }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
