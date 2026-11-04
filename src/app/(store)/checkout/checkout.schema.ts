import { z } from 'zod';

export const checkoutSchema = z.object({
  fullName: z.string().min(3, 'Ingresá tu nombre completo'),
  phone: z.string().min(8, 'Teléfono inválido'),
  address: z.string().min(10, 'Ingresá una dirección más completa'),
  city: z.string().min(2, 'Ciudad requerida'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
