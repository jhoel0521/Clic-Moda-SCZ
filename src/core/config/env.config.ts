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
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '',

  /** ¿Usar backend simulado? true durante desarrollo sin API real */
  useSimulatedBackend: process.env.NEXT_PUBLIC_USE_SIMULATED_BACKEND !== 'false',

  /** Días que persiste el carrito en localStorage */
  cartPersistDays: 7,

  /** Latencia artificial del backend simulado (ms) */
  simulatedDelay: {
    min: 300,
    max: 800,
  },
} as const;

/**
 * Enlace a WhatsApp. Sin número configurado abre el selector de contactos,
 * así la demo nunca le escribe a un número ajeno.
 */
export function whatsappHref(message: string): string {
  return `https://wa.me/${envConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
