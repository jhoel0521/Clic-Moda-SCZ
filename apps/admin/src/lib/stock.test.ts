import { describe, expect, it, vi } from 'vitest';
import { newIdempotencyKey, rejectLabel, waitForCommand, type StockCommand } from './stock';

const command = (status: StockCommand['status']): StockCommand => ({
  id: 'c1',
  status,
  rejectReason: status === 'REJECTED' ? 'INSUFFICIENT_STOCK' : null,
  type: 'WITHDRAW',
  typeCode: 'WITHDRAW',
  units: 1,
});

describe('waitForCommand', () => {
  it('devuelve el comando en cuanto llega a un estado final, esperando entre consultas', async () => {
    const answers = [command('PENDING'), command('PENDING'), command('APPLIED')];
    const fetchCommand = vi.fn(async () => answers.shift() as StockCommand);
    const sleep = vi.fn(async () => undefined);

    const result = await waitForCommand('c1', { fetchCommand, sleep });

    expect(result?.status).toBe('APPLIED');
    expect([fetchCommand.mock.calls.length, sleep.mock.calls.length]).toEqual([3, 2]);
  });

  it('un rechazo también es un estado final', async () => {
    const result = await waitForCommand('c1', {
      fetchCommand: async () => command('REJECTED'),
      sleep: async () => undefined,
    });

    expect(result?.rejectReason).toBe('INSUFFICIENT_STOCK');
  });
});

describe('waitForCommand (2)', () => {
  it('devuelve null si sigue en cola al agotar el tiempo', async () => {
    const fetchCommand = vi.fn(async () => command('PENDING'));
    const result = await waitForCommand('c1', {
      fetchCommand,
      sleep: async () => undefined,
      intervalMs: 1000,
      timeoutMs: 3000,
    });

    expect(result).toBeNull();
    expect(fetchCommand.mock.calls.length).toBe(4);
  });
});

describe('textos y claves', () => {
  it('explica cada motivo de rechazo y tiene un texto para uno desconocido', () => {
    expect(rejectLabel('INSUFFICIENT_STOCK')).toContain('stock suficiente');
    expect(rejectLabel('BELOW_RESERVED')).toContain('reservado');
    expect(rejectLabel('OTRO')).toBe('El movimiento fue rechazado');
    expect(rejectLabel(null)).toBe('El movimiento fue rechazado');
  });

  it('cada clave de idempotencia es distinta y cabe en el límite de 64 caracteres', () => {
    const [a, b] = [newIdempotencyKey(), newIdempotencyKey()];

    expect(a).not.toBe(b);
    expect(a.length).toBeLessThanOrEqual(64);
    expect(a).toMatch(/^[A-Za-z0-9._:-]{8,64}$/);
  });
});
