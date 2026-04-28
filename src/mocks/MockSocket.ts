import productsData from '@src/mocks/data/products.json';
import type { IProduct } from '@src/core/models';

/** Tipo de evento que emite el MockSocket */
export type MockSocketEvent =
  | { type: 'STOCK_LOW'; product: Pick<IProduct, 'id' | 'name' | 'stock'>; threshold: number }
  | { type: 'NEW_ORDER'; orderId: string; ticketId: string }
  | { type: 'ORDER_STATUS_CHANGED'; orderId: string; newStatus: string }
  | { type: 'FLASH_SALE_ENDING'; productId: string; minutesLeft: number };

export type MockSocketListener = (event: MockSocketEvent) => void;

/**
 * Emulador de WebSocket para eventos en tiempo real.
 * Usa setInterval para disparar eventos periódicos simulados.
 *
 * Uso:
 *   const socket = new MockSocket();
 *   const unsub = socket.on((event) => console.log(event));
 *   socket.connect();
 *   // Cuando ya no se necesite:
 *   unsub();
 *   socket.disconnect();
 */
export class MockSocket {
  private listeners: Set<MockSocketListener> = new Set();
  private intervals: ReturnType<typeof setInterval>[] = [];
  private isConnected = false;

  /** Registra un listener de eventos. Retorna una función de unsuscripción. */
  on(listener: MockSocketListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: MockSocketEvent) {
    this.listeners.forEach((listener) => listener(event));
  }

  /** Inicia la emisión de eventos periódicos */
  connect() {
    if (this.isConnected) return;
    this.isConnected = true;

    // 1. Alerta de stock bajo cada 15 segundos
    const stockInterval = setInterval(() => {
      const products = productsData as unknown as IProduct[];
      const lowStockProducts = products.filter((p) => p.stock <= 5 && p.stock > 0);
      if (lowStockProducts.length > 0) {
        const randomProduct =
          lowStockProducts[Math.floor(Math.random() * lowStockProducts.length)];
        this.emit({
          type: 'STOCK_LOW',
          product: {
            id: randomProduct.id,
            name: randomProduct.name,
            stock: randomProduct.stock,
          },
          threshold: 5,
        });
      }
    }, 15_000);

    // 2. Simula nuevo pedido cada 45 segundos (para el dashboard del admin)
    const orderInterval = setInterval(() => {
      const ticketId = `TICK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const orderId = `ord_${Date.now()}`;
      this.emit({ type: 'NEW_ORDER', orderId, ticketId });
    }, 45_000);

    // 3. Flash sale ending warning cada 30 segundos
    const flashInterval = setInterval(() => {
      const products = productsData as unknown as IProduct[];
      const flashProducts = products.filter(
        (p) =>
          p.isFlashSale &&
          p.flashSaleEndsAt &&
          new Date(p.flashSaleEndsAt) > new Date(),
      );
      if (flashProducts.length > 0) {
        const product = flashProducts[0];
        const minutesLeft = Math.floor(
          (new Date(product.flashSaleEndsAt!).getTime() - Date.now()) / 60_000,
        );
        this.emit({
          type: 'FLASH_SALE_ENDING',
          productId: product.id,
          minutesLeft: Math.max(0, minutesLeft),
        });
      }
    }, 30_000);

    this.intervals.push(stockInterval, orderInterval, flashInterval);
  }

  /** Detiene todos los eventos */
  disconnect() {
    this.intervals.forEach(clearInterval);
    this.intervals = [];
    this.isConnected = false;
  }

  get connected() {
    return this.isConnected;
  }
}

/** Instancia singleton del MockSocket para uso global */
export const mockSocket = new MockSocket();
