import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MockProductService } from '@src/mocks/services/MockProductService';
import { MockReviewService } from '@src/mocks/services/MockReviewService';
import { ProductDetailClient } from './ProductDetailClient';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await MockProductService.getProductBySlug(slug);

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
  const product = await MockProductService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const reviews = await MockReviewService.getReviewsByProduct(product.id);

  return <ProductDetailClient product={product} reviews={reviews} />;
}
