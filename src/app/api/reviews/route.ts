import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@src/backend/services/ReviewService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const pending = searchParams.get('pending') === 'true';

    if (pending) {
      const reviews = await ReviewService.getPendingReviews();
      return NextResponse.json(reviews);
    }

    if (productId) {
      const reviews = await ReviewService.getReviewsByProduct(productId);
      return NextResponse.json(reviews);
    }

    return NextResponse.json({ error: 'ProductId or pending flag required' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const review = await ReviewService.createReview(body);
    return NextResponse.json(review);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
