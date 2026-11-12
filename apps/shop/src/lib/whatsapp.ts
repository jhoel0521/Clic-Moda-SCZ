// Todos los enlaces de WhatsApp salen del número de la configuración: la tienda no tiene números literales.
export const whatsappLink = (number: string, text = ''): string =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

// Solo se ofrece el botón si hay un número válido (solo dígitos con código de país).
export const hasWhatsapp = (number: string): boolean => /^[1-9]\d{9,14}$/.test(number);

// Para mostrarlo en grupos (Miller): "59171234567" → "+591 7123 4567"; otros países, solo el "+".
export function displayWhatsapp(number: string): string {
  const local = number.startsWith('591') ? number.slice(3) : null;
  if (local?.length === 8) return `+591 ${local.slice(0, 4)} ${local.slice(4)}`;
  return local ? `+591 ${local}` : `+${number}`;
}
