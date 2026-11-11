// Datos de demostración de la rama demo/movil-first (la demo de zapatos): 5 categorías y 9 productos.
// El stock es el real por color y talla (variantStock de la demo). Se dejaron fuera los 4 artículos de
// ropa que esa rama también trae (jean, blusa, chaqueta y conjunto). Generado por un script; editable.
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
  'Tacones',
  'Sandalias',
  'Botas',
  'Formales',
  'Zapatillas',
];

export const DEMO_PRODUCTS: readonly DemoProduct[] = [
  {
    name: 'Stiletto Luna',
    description:
      'Taco fino de 9 cm con punta almendrada y plantilla acolchada. Hecho para aguantar toda la noche sin sufrir.',
    category: 'Tacones',
    variants: [
      {
        size: '35',
        color: 'Azul marino',
        price: '420.00',
        stock: 0,
      },
      {
        size: '36',
        color: 'Azul marino',
        price: '420.00',
        stock: 4,
      },
      {
        size: '37',
        color: 'Azul marino',
        price: '420.00',
        stock: 1,
      },
      {
        size: '38',
        color: 'Azul marino',
        price: '420.00',
        stock: 6,
      },
      {
        size: '39',
        color: 'Azul marino',
        price: '420.00',
        stock: 2,
      },
      {
        size: '40',
        color: 'Azul marino',
        price: '420.00',
        stock: 3,
      },
      {
        size: '35',
        color: 'Floral',
        price: '420.00',
        stock: 1,
      },
      {
        size: '36',
        color: 'Floral',
        price: '420.00',
        stock: 6,
      },
      {
        size: '37',
        color: 'Floral',
        price: '420.00',
        stock: 2,
      },
      {
        size: '38',
        color: 'Floral',
        price: '420.00',
        stock: 3,
      },
      {
        size: '39',
        color: 'Floral',
        price: '420.00',
        stock: 4,
      },
      {
        size: '40',
        color: 'Floral',
        price: '420.00',
        stock: 3,
      },
    ],
  },
  {
    name: 'Stiletto Noche',
    description: 'El clásico negro que combina con todo. Taco de 10 cm y acabado satinado.',
    category: 'Tacones',
    variants: [
      {
        size: '35',
        color: 'Negro',
        price: '390.00',
        stock: 6,
      },
      {
        size: '36',
        color: 'Negro',
        price: '390.00',
        stock: 2,
      },
      {
        size: '37',
        color: 'Negro',
        price: '390.00',
        stock: 3,
      },
      {
        size: '38',
        color: 'Negro',
        price: '390.00',
        stock: 4,
      },
      {
        size: '39',
        color: 'Negro',
        price: '390.00',
        stock: 3,
      },
      {
        size: '40',
        color: 'Negro',
        price: '390.00',
        stock: 5,
      },
    ],
  },
  {
    name: 'Plataforma Sol',
    description:
      'Sandalia de plataforma con tiras cruzadas. Liviana y fresca para el calor de Santa Cruz.',
    category: 'Sandalias',
    variants: [
      {
        size: '35',
        color: 'Vino',
        price: '340.00',
        stock: 4,
      },
      {
        size: '36',
        color: 'Vino',
        price: '340.00',
        stock: 3,
      },
      {
        size: '37',
        color: 'Vino',
        price: '340.00',
        stock: 5,
      },
      {
        size: '38',
        color: 'Vino',
        price: '340.00',
        stock: 2,
      },
      {
        size: '39',
        color: 'Vino',
        price: '340.00',
        stock: 0,
      },
      {
        size: '40',
        color: 'Vino',
        price: '340.00',
        stock: 4,
      },
    ],
  },
  {
    name: 'Botín Urbano',
    description: 'Botín al tobillo con cierre lateral y suela antideslizante.',
    category: 'Botas',
    variants: [
      {
        size: '35',
        color: 'Camel',
        price: '490.00',
        stock: 2,
      },
      {
        size: '36',
        color: 'Camel',
        price: '490.00',
        stock: 0,
      },
      {
        size: '37',
        color: 'Camel',
        price: '490.00',
        stock: 4,
      },
      {
        size: '38',
        color: 'Camel',
        price: '490.00',
        stock: 1,
      },
      {
        size: '39',
        color: 'Camel',
        price: '490.00',
        stock: 6,
      },
      {
        size: '40',
        color: 'Camel',
        price: '490.00',
        stock: 2,
      },
    ],
  },
  {
    name: 'Bota Sierra',
    description: 'Bota de cuero con cordones y suela de goma cosida. Durabilidad para años.',
    category: 'Botas',
    variants: [
      {
        size: '38',
        color: 'Café oscuro',
        price: '620.00',
        stock: 1,
      },
      {
        size: '39',
        color: 'Café oscuro',
        price: '620.00',
        stock: 6,
      },
      {
        size: '40',
        color: 'Café oscuro',
        price: '620.00',
        stock: 2,
      },
      {
        size: '41',
        color: 'Café oscuro',
        price: '620.00',
        stock: 3,
      },
      {
        size: '42',
        color: 'Café oscuro',
        price: '620.00',
        stock: 4,
      },
      {
        size: '43',
        color: 'Café oscuro',
        price: '620.00',
        stock: 3,
      },
      {
        size: '44',
        color: 'Café oscuro',
        price: '620.00',
        stock: 5,
      },
    ],
  },
  {
    name: 'Bota Andes',
    description: 'Bota resistente con horma ancha, ideal para el trabajo y el fin de semana.',
    category: 'Botas',
    variants: [
      {
        size: '38',
        color: 'Coñac',
        price: '580.00',
        stock: 3,
      },
      {
        size: '39',
        color: 'Coñac',
        price: '580.00',
        stock: 4,
      },
      {
        size: '40',
        color: 'Coñac',
        price: '580.00',
        stock: 3,
      },
      {
        size: '41',
        color: 'Coñac',
        price: '580.00',
        stock: 5,
      },
      {
        size: '42',
        color: 'Coñac',
        price: '580.00',
        stock: 2,
      },
      {
        size: '43',
        color: 'Coñac',
        price: '580.00',
        stock: 0,
      },
      {
        size: '44',
        color: 'Coñac',
        price: '580.00',
        stock: 4,
      },
    ],
  },
  {
    name: 'Oxford Clásico',
    description: 'Zapato formal con costura a mano. Elegí el tono que va con tu estilo.',
    category: 'Formales',
    variants: [
      {
        size: '38',
        color: 'Coñac',
        price: '540.00',
        stock: 5,
      },
      {
        size: '39',
        color: 'Coñac',
        price: '540.00',
        stock: 2,
      },
      {
        size: '40',
        color: 'Coñac',
        price: '540.00',
        stock: 0,
      },
      {
        size: '41',
        color: 'Coñac',
        price: '540.00',
        stock: 4,
      },
      {
        size: '42',
        color: 'Coñac',
        price: '540.00',
        stock: 1,
      },
      {
        size: '43',
        color: 'Coñac',
        price: '540.00',
        stock: 6,
      },
      {
        size: '44',
        color: 'Coñac',
        price: '540.00',
        stock: 2,
      },
      {
        size: '38',
        color: 'Verde musgo',
        price: '540.00',
        stock: 0,
      },
      {
        size: '39',
        color: 'Verde musgo',
        price: '540.00',
        stock: 4,
      },
      {
        size: '40',
        color: 'Verde musgo',
        price: '540.00',
        stock: 1,
      },
      {
        size: '41',
        color: 'Verde musgo',
        price: '540.00',
        stock: 6,
      },
      {
        size: '42',
        color: 'Verde musgo',
        price: '540.00',
        stock: 2,
      },
      {
        size: '43',
        color: 'Verde musgo',
        price: '540.00',
        stock: 3,
      },
      {
        size: '44',
        color: 'Verde musgo',
        price: '540.00',
        stock: 4,
      },
    ],
  },
  {
    name: 'Monk Doble Hebilla',
    description: 'Formal con doble hebilla para ocasiones especiales.',
    category: 'Formales',
    variants: [
      {
        size: '38',
        color: 'Café',
        price: '560.00',
        stock: 0,
      },
      {
        size: '39',
        color: 'Café',
        price: '560.00',
        stock: 0,
      },
      {
        size: '40',
        color: 'Café',
        price: '560.00',
        stock: 0,
      },
      {
        size: '41',
        color: 'Café',
        price: '560.00',
        stock: 0,
      },
      {
        size: '42',
        color: 'Café',
        price: '560.00',
        stock: 0,
      },
      {
        size: '43',
        color: 'Café',
        price: '560.00',
        stock: 0,
      },
      {
        size: '44',
        color: 'Café',
        price: '560.00',
        stock: 0,
      },
    ],
  },
  {
    name: 'Zapatilla Arena',
    description: 'Urbana y liviana, con plantilla de memoria. Tu par para todos los días.',
    category: 'Zapatillas',
    variants: [
      {
        size: '36',
        color: 'Arena',
        price: '360.00',
        stock: 2,
      },
      {
        size: '37',
        color: 'Arena',
        price: '360.00',
        stock: 3,
      },
      {
        size: '38',
        color: 'Arena',
        price: '360.00',
        stock: 4,
      },
      {
        size: '39',
        color: 'Arena',
        price: '360.00',
        stock: 3,
      },
      {
        size: '40',
        color: 'Arena',
        price: '360.00',
        stock: 5,
      },
      {
        size: '41',
        color: 'Arena',
        price: '360.00',
        stock: 2,
      },
      {
        size: '42',
        color: 'Arena',
        price: '360.00',
        stock: 0,
      },
      {
        size: '43',
        color: 'Arena',
        price: '360.00',
        stock: 4,
      },
    ],
  },
];
