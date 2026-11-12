// Todos los enlaces de WhatsApp salen del número de la configuración: la tienda no tiene números literales.
export const whatsappLink = (number: string, text = ''): string =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

// Solo se ofrece el botón si hay un número válido (solo dígitos con código de país).
export const hasWhatsapp = (number: string): boolean => /^[1-9]\d{9,14}$/.test(number);

// Para mostrarlo: "59171234567" → "+591 71234567" (código de país de Bolivia separado; otros países, solo el "+").
export const displayWhatsapp = (number: string): string =>
  number.startsWith('591') ? `+591 ${number.slice(3)}` : `+${number}`;
