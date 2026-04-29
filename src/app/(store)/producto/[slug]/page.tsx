import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductService } from '@src/services/ProductService';
import { ReviewService } from '@src/services/ReviewService';
import { ProductDetailClient } from './ProductDetailClient';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await ProductService.getProductBySlug(slug);

  if (!product) {
    return { title: 'Producto no encontrado — Clic Moda SCZ' };
  }

  return {
    title: `${product.name} — Clic Moda SCZ`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await ProductService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const reviews = await ReviewService.getReviewsByProduct(product.id);

  return <ProductDetailClient product={product} reviews={reviews} />;
}
