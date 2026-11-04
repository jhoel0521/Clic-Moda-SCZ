import Link from 'next/link';
import { Clock } from 'lucide-react';
import { FlashSaleTimer } from '@src/shared/ui/FlashSaleTimer';
import { ROUTES } from '@src/routes';
import type { IProduct } from '@src/core/models';

interface FlashSaleBannerProps {
  products: IProduct[];
}

export function FlashSaleBanner({ products }: FlashSaleBannerProps) {
  const endsAt = products[0]?.flashSaleEndsAt;

  return (
    <Link
      href={ROUTES.CATALOG}
      className="flex items-center justify-between gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-white active:bg-black"
    >
      <span className="flex items-center gap-2 text-sm font-bold">
        <Clock size={16} className="shrink-0 text-pink-400" />
        Ofertas flash
      </span>
      {endsAt && (
        <span className="font-mono text-sm font-bold text-pink-300">
          <FlashSaleTimer endsAt={endsAt} variant="inline" />
        </span>
      )}
    </Link>
  );
}
