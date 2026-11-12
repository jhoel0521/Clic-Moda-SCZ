// Nombre de la marca partido para el logotipo de texto: la primera palabra en tinta y el resto con el
// color de la marca ("Clic Moda SC" → "CLIC" + "MODA SC"). Con una sola palabra no hay resto.
export function splitBrand(name: string): { lead: string; accent: string } {
  const [lead = '', ...rest] = name.trim().split(/\s+/);
  return { lead: lead.toUpperCase(), accent: rest.join(' ').toUpperCase() };
}
