import { envConfig } from '@src/core/config/env.config';

/**
 * Simula la latencia de una llamada a una API real.
 * Usa un rango aleatorio definido en la configuración del entorno.
 */
export function delay(
  minMs: number = envConfig.mockDelay.min,
  maxMs: number = envConfig.mockDelay.max,
): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
