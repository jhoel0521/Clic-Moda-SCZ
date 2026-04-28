/**
 * Centraliza el acceso a variables de entorno.
 * Solo las variables con prefijo NEXT_PUBLIC_ son accesibles en el cliente.
 */
export const envConfig = {
  /** Nombre de la tienda, visible en el cliente */
  storeName: process.env.NEXT_PUBLIC_STORE_NAME ?? 'Clic Moda SCZ',

  /** URL base de la API real (cuando se conecte el backend real) */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',

  /** Número de WhatsApp para el checkout (formato internacional) */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '59170000000',

  /** ¿Usar mock backend? true durante desarrollo sin API real */
  useMock: process.env.NEXT_PUBLIC_USE_MOCK !== 'false',

  /** Días que persiste el carrito en localStorage */
  cartPersistDays: 7,

  /** Latencia artificial del mock backend (ms) */
  mockDelay: {
    min: 300,
    max: 800,
  },
} as const;
