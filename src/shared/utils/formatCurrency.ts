/**
 * Formatea un número como moneda boliviana.
 * Ejemplo: formatCurrency(1250) → "Bs. 1.250,00"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'BOB',
  locale: string = 'es-BO',
): string {
  if (currency === 'BOB') {
    // Intl no soporta bien BOB en todos los entornos; usamos formato manual
    const formatted = amount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `Bs. ${formatted}`;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea un porcentaje de descuento.
 * Ejemplo: formatDiscount(15) → "-15%"
 */
export function formatDiscount(percent: number): string {
  return `-${Math.round(percent)}%`;
}
