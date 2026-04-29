'use client';

import { create } from 'zustand';
import type { IOrder, IAplicacionCupon } from '@src/core/models';

interface CheckoutState {
  lastOrder: IOrder | null;
  appliedCoupon: IAplicacionCupon | null;

  setLastOrder: (order: IOrder) => void;
  setAppliedCoupon: (coupon: IAplicacionCupon | null) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  lastOrder: null,
  appliedCoupon: null,

  setLastOrder: (order) => set({ lastOrder: order }),
  setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
  clearCheckout: () => set({ lastOrder: null, appliedCoupon: null }),
}));
