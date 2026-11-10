import { z } from 'zod';

export const checkoutSchema = z.object({
  fullName: z.string().min(3, 'Ingresá tu nombre completo'),
  phone: z.string().min(8, 'Teléfono inválido'),
  address: z.string().min(10, 'Ingresá una dirección más completa'),
  city: z.string().min(2, 'Ciudad requerida'),
  reference: z.string().optional(),
  paymentMethod: z.enum(['transferencia', 'qr_simple', 'efectivo_entrega', 'contra_entrega'], {
    message: 'Seleccioná un método de pago',
  }),
  notes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
