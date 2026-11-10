// Datos de demostración tomados de la demo aprobada (tag demo-aprobada): 7 categorías y 8 productos.
// El stock de la demo era por talla; cada talla se reparte entre sus colores. Generado por un script
// a partir de la base de la demo; se puede editar a mano.
export interface DemoVariant {
  readonly size: string;
  readonly color: string;
  readonly price: string;
  readonly stock: number;
}

export interface DemoProduct {
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly variants: readonly DemoVariant[];
}

export const DEMO_CATEGORIES: readonly string[] = [
  'Vestidos',
  'Blusas',
  'Pantalones',
  'Conjuntos',
  'Chaquetas',
  'Faldas',
  'Accesorios',
];

export const DEMO_PRODUCTS: readonly DemoProduct[] = [
  {
    name: 'Vestido Floral Primavera',
    description:
      'Vestido midi con estampado floral vibrante, perfecto para el verano cruceño. Tela liviana y fresca de algodón 100%.',
    category: 'Vestidos',
    variants: [
      {
        size: 'S',
        color: 'Rosa',
        price: '300.00',
        stock: 1,
      },
      {
        size: 'S',
        color: 'Celeste',
        price: '300.00',
        stock: 1,
      },
      {
        size: 'S',
        color: 'Blanco',
        price: '300.00',
        stock: 1,
      },
      {
        size: 'M',
        color: 'Rosa',
        price: '300.00',
        stock: 2,
      },
      {
        size: 'M',
        color: 'Celeste',
        price: '300.00',
        stock: 1,
      },
      {
        size: 'M',
        color: 'Blanco',
        price: '300.00',
        stock: 1,
      },
      {
        size: 'L',
        color: 'Rosa',
        price: '300.00',
        stock: 1,
      },
      {
        size: 'L',
        color: 'Celeste',
        price: '300.00',
        stock: 1,
      },
      {
        size: 'L',
        color: 'Blanco',
        price: '300.00',
        stock: 1,
      },
      {
        size: 'XL',
        color: 'Rosa',
        price: '300.00',
        stock: 1,
      },
      {
        size: 'XL',
        color: 'Celeste',
        price: '300.00',
        stock: 1,
      },
      {
        size: 'XL',
        color: 'Blanco',
        price: '300.00',
        stock: 1,
      },
    ],
  },
  {
    name: 'Blusa Off-Shoulder Tule',
    description:
      'Blusa elegante con hombros descubiertos y tela de tul bordado. Ideal para salidas y eventos especiales.',
    category: 'Blusas',
    variants: [
      {
        size: 'XS',
        color: 'Blanco',
        price: '185.00',
        stock: 1,
      },
      {
        size: 'XS',
        color: 'Negro',
        price: '185.00',
        stock: 0,
      },
      {
        size: 'XS',
        color: 'Beige',
        price: '185.00',
        stock: 0,
      },
      {
        size: 'S',
        color: 'Blanco',
        price: '185.00',
        stock: 1,
      },
      {
        size: 'S',
        color: 'Negro',
        price: '185.00',
        stock: 0,
      },
      {
        size: 'S',
        color: 'Beige',
        price: '185.00',
        stock: 0,
      },
      {
        size: 'M',
        color: 'Blanco',
        price: '185.00',
        stock: 1,
      },
      {
        size: 'M',
        color: 'Negro',
        price: '185.00',
        stock: 0,
      },
      {
        size: 'M',
        color: 'Beige',
        price: '185.00',
        stock: 0,
      },
      {
        size: 'L',
        color: 'Blanco',
        price: '185.00',
        stock: 1,
      },
      {
        size: 'L',
        color: 'Negro',
        price: '185.00',
        stock: 0,
      },
      {
        size: 'L',
        color: 'Beige',
        price: '185.00',
        stock: 0,
      },
    ],
  },
  {
    name: 'Jeans Mom Fit Vintage',
    description:
      'Jean clásico de tiro alto con lavado vintage. Corte mom fit que favorece todas las figuras.',
    category: 'Pantalones',
    variants: [
      {
        size: 'S',
        color: 'Azul claro',
        price: '320.00',
        stock: 1,
      },
      {
        size: 'S',
        color: 'Azul oscuro',
        price: '320.00',
        stock: 1,
      },
      {
        size: 'S',
        color: 'Negro',
        price: '320.00',
        stock: 1,
      },
      {
        size: 'M',
        color: 'Azul claro',
        price: '320.00',
        stock: 2,
      },
      {
        size: 'M',
        color: 'Azul oscuro',
        price: '320.00',
        stock: 2,
      },
      {
        size: 'M',
        color: 'Negro',
        price: '320.00',
        stock: 1,
      },
      {
        size: 'L',
        color: 'Azul claro',
        price: '320.00',
        stock: 2,
      },
      {
        size: 'L',
        color: 'Azul oscuro',
        price: '320.00',
        stock: 2,
      },
      {
        size: 'L',
        color: 'Negro',
        price: '320.00',
        stock: 1,
      },
      {
        size: 'XL',
        color: 'Azul claro',
        price: '320.00',
        stock: 2,
      },
      {
        size: 'XL',
        color: 'Azul oscuro',
        price: '320.00',
        stock: 2,
      },
      {
        size: 'XL',
        color: 'Negro',
        price: '320.00',
        stock: 1,
      },
      {
        size: 'XXL',
        color: 'Azul claro',
        price: '320.00',
        stock: 1,
      },
      {
        size: 'XXL',
        color: 'Azul oscuro',
        price: '320.00',
        stock: 1,
      },
      {
        size: 'XXL',
        color: 'Negro',
        price: '320.00',
        stock: 1,
      },
    ],
  },
  {
    name: 'Conjunto Crop + Falda Plisada',
    description:
      'Conjunto de dos piezas con top crop y falda plisada midi. Un look completo y moderno para cualquier ocasión.',
    category: 'Conjuntos',
    variants: [
      {
        size: 'S',
        color: 'Mostaza',
        price: '420.00',
        stock: 1,
      },
      {
        size: 'S',
        color: 'Verde oliva',
        price: '420.00',
        stock: 1,
      },
      {
        size: 'S',
        color: 'Terracota',
        price: '420.00',
        stock: 0,
      },
      {
        size: 'M',
        color: 'Mostaza',
        price: '420.00',
        stock: 1,
      },
      {
        size: 'M',
        color: 'Verde oliva',
        price: '420.00',
        stock: 1,
      },
      {
        size: 'M',
        color: 'Terracota',
        price: '420.00',
        stock: 0,
      },
      {
        size: 'L',
        color: 'Mostaza',
        price: '420.00',
        stock: 1,
      },
      {
        size: 'L',
        color: 'Verde oliva',
        price: '420.00',
        stock: 0,
      },
      {
        size: 'L',
        color: 'Terracota',
        price: '420.00',
        stock: 0,
      },
    ],
  },
  {
    name: 'Chaqueta Denim Oversize',
    description:
      'Chaqueta de jean oversize con parches bordados. El básico perfecto para elevar cualquier look casual.',
    category: 'Chaquetas',
    variants: [
      {
        size: 'S',
        color: 'Azul claro',
        price: '390.00',
        stock: 2,
      },
      {
        size: 'S',
        color: 'Negro',
        price: '390.00',
        stock: 1,
      },
      {
        size: 'M',
        color: 'Azul claro',
        price: '390.00',
        stock: 2,
      },
      {
        size: 'M',
        color: 'Negro',
        price: '390.00',
        stock: 1,
      },
      {
        size: 'L',
        color: 'Azul claro',
        price: '390.00',
        stock: 2,
      },
      {
        size: 'L',
        color: 'Negro',
        price: '390.00',
        stock: 1,
      },
      {
        size: 'XL',
        color: 'Azul claro',
        price: '390.00',
        stock: 2,
      },
      {
        size: 'XL',
        color: 'Negro',
        price: '390.00',
        stock: 1,
      },
    ],
  },
  {
    name: 'Falda Mini Plisada Colores',
    description:
      'Falda mini plisada en colores vibrantes. Ligera y cómoda para el calor de Santa Cruz.',
    category: 'Faldas',
    variants: [
      {
        size: 'XS',
        color: 'Rojo',
        price: '145.00',
        stock: 2,
      },
      {
        size: 'XS',
        color: 'Azul',
        price: '145.00',
        stock: 2,
      },
      {
        size: 'XS',
        color: 'Verde',
        price: '145.00',
        stock: 2,
      },
      {
        size: 'XS',
        color: 'Amarillo',
        price: '145.00',
        stock: 2,
      },
      {
        size: 'S',
        color: 'Rojo',
        price: '145.00',
        stock: 2,
      },
      {
        size: 'S',
        color: 'Azul',
        price: '145.00',
        stock: 2,
      },
      {
        size: 'S',
        color: 'Verde',
        price: '145.00',
        stock: 2,
      },
      {
        size: 'S',
        color: 'Amarillo',
        price: '145.00',
        stock: 2,
      },
      {
        size: 'M',
        color: 'Rojo',
        price: '145.00',
        stock: 2,
      },
      {
        size: 'M',
        color: 'Azul',
        price: '145.00',
        stock: 2,
      },
      {
        size: 'M',
        color: 'Verde',
        price: '145.00',
        stock: 2,
      },
      {
        size: 'M',
        color: 'Amarillo',
        price: '145.00',
        stock: 2,
      },
      {
        size: 'L',
        color: 'Rojo',
        price: '145.00',
        stock: 2,
      },
      {
        size: 'L',
        color: 'Azul',
        price: '145.00',
        stock: 2,
      },
      {
        size: 'L',
        color: 'Verde',
        price: '145.00',
        stock: 1,
      },
      {
        size: 'L',
        color: 'Amarillo',
        price: '145.00',
        stock: 1,
      },
    ],
  },
  {
    name: 'Vestido Lencero Satinado',
    description:
      'Vestido de corte lencero en tela satinada. Sensual y elegante, ideal para noches especiales.',
    category: 'Vestidos',
    variants: [
      {
        size: 'XS',
        color: 'Champagne',
        price: '340.00',
        stock: 1,
      },
      {
        size: 'XS',
        color: 'Negro',
        price: '340.00',
        stock: 1,
      },
      {
        size: 'XS',
        color: 'Vino',
        price: '340.00',
        stock: 0,
      },
      {
        size: 'S',
        color: 'Champagne',
        price: '340.00',
        stock: 1,
      },
      {
        size: 'S',
        color: 'Negro',
        price: '340.00',
        stock: 1,
      },
      {
        size: 'S',
        color: 'Vino',
        price: '340.00',
        stock: 0,
      },
      {
        size: 'M',
        color: 'Champagne',
        price: '340.00',
        stock: 1,
      },
      {
        size: 'M',
        color: 'Negro',
        price: '340.00',
        stock: 1,
      },
      {
        size: 'M',
        color: 'Vino',
        price: '340.00',
        stock: 0,
      },
      {
        size: 'L',
        color: 'Champagne',
        price: '340.00',
        stock: 1,
      },
      {
        size: 'L',
        color: 'Negro',
        price: '340.00',
        stock: 0,
      },
      {
        size: 'L',
        color: 'Vino',
        price: '340.00',
        stock: 0,
      },
    ],
  },
  {
    name: 'Bolso Bucket Piel Sintética',
    description: 'Bolso tipo bucket en piel sintética premium. Amplio, práctico y muy trendy.',
    category: 'Accesorios',
    variants: [
      {
        size: 'Único',
        color: 'Camel',
        price: '210.00',
        stock: 6,
      },
      {
        size: 'Único',
        color: 'Negro',
        price: '210.00',
        stock: 6,
      },
      {
        size: 'Único',
        color: 'Blanco',
        price: '210.00',
        stock: 6,
      },
    ],
  },
];
