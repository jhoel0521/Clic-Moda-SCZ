// Todos los enlaces de WhatsApp salen del número de la configuración: la tienda no tiene números literales.
export const whatsappLink = (number: string, text = ''): string =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

// Solo se ofrece el botón si hay un número válido (solo dígitos con código de país).
export const hasWhatsapp = (number: string): boolean => /^[1-9]\d{9,14}$/.test(number);
