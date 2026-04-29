import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@src/backend/services/ReviewService';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const review = await ReviewService.moderateReview(id, body.decision);
    return NextResponse.json(review);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
