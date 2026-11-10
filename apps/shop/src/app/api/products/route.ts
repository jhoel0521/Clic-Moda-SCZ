import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@src/backend/services/ProductService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || undefined;
    const filters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      sizes: searchParams.getAll('sizes'),
      colors: searchParams.getAll('colors'),
      etiquetaIds: searchParams.getAll('etiquetaIds'),
      onlyFlashSale: searchParams.get('onlyFlashSale') === 'true',
    };

    if (slug) {
      const product = await ProductService.getProductBySlug(slug);
      return NextResponse.json(product ? [product] : []);
    }

    const products = await ProductService.getProducts(filters);
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await ProductService.addProduct(body);
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
