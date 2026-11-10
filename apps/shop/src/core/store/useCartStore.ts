'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ICartItem } from '@src/core/models';
import { envConfig } from '@src/core/config/env.config';

interface CartState {
  items: ICartItem[];
  isOpen: boolean; // controla el drawer del carrito

  // Computed values (derivados)
  itemCount: number;
  subtotal: number;

  // Acciones
  addItem: (item: Omit<ICartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  /** Fusiona el carrito de localStorage con la cuenta recién autenticada */
  mergeGuestCart: (guestItems: ICartItem[]) => void;
}

function computeCartTotals(items: ICartItem[]) {
  return {
    itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
    subtotal: items.reduce((acc, i) => acc + i.price * i.quantity, 0),
  };
}

function isSameCartItem(a: ICartItem, b: Omit<ICartItem, 'quantity'>) {
  return (
    a.productId === b.productId &&
    a.selectedSize === b.selectedSize &&
    a.selectedColor === b.selectedColor
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      itemCount: 0,
      subtotal: 0,

      addItem: (newItem) => {
        const items = [...get().items];
        const existingIdx = items.findIndex((i) => isSameCartItem(i, newItem));

        if (existingIdx >= 0) {
          items[existingIdx] = {
            ...items[existingIdx],
            quantity: items[existingIdx].quantity + (newItem.quantity ?? 1),
          };
        } else {
          items.push({ ...newItem, quantity: newItem.quantity ?? 1 });
        }

        set({ items, ...computeCartTotals(items) });
      },

      removeItem: (productId, size, color) => {
        const items = get().items.filter(
          (i) =>
            !(i.productId === productId && i.selectedSize === size && i.selectedColor === color)
        );
        set({ items, ...computeCartTotals(items) });
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        const items = get().items.map((i) =>
          i.productId === productId && i.selectedSize === size && i.selectedColor === color
            ? { ...i, quantity }
            : i
        );
        set({ items, ...computeCartTotals(items) });
      },

      clearCart: () => set({ items: [], itemCount: 0, subtotal: 0 }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      mergeGuestCart: (guestItems) => {
        const currentItems = get().items;
        const merged = [...currentItems];

        for (const guestItem of guestItems) {
          const existingIdx = merged.findIndex((i) => isSameCartItem(i, guestItem));
          if (existingIdx >= 0) {
            merged[existingIdx].quantity += guestItem.quantity;
          } else {
            merged.push(guestItem);
          }
        }

        set({ items: merged, ...computeCartTotals(merged) });
      },
    }),
    {
      name: 'clic-moda-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      // Expiración: 7 días en ms
      version: 1,
      // onRehydrateStorage para recalcular totales al cargar de localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          const totals = computeCartTotals(state.items);
          state.itemCount = totals.itemCount;
          state.subtotal = totals.subtotal;
        }
      },
    }
  )
);

// Helpers para acceso directo sin selector
export const cartSelectors = {
  itemCount: (s: CartState) => s.itemCount,
  subtotal: (s: CartState) => s.subtotal,
  items: (s: CartState) => s.items,
};

void envConfig; // referencia para futura integración con días de expiración
