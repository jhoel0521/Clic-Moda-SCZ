import { Injectable } from '@nestjs/common';
import type { ClockPort } from '../../application/ports/inventory.ports.js';

// Reloj del servidor: única fuente de la hora para el orden de llegada y los reintentos.
@Injectable()
export class SystemClock implements ClockPort {
  now(): Date {
    return new Date();
  }
}
