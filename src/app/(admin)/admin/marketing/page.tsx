'use client';

import { useState } from 'react';
import { AdminHeader } from '@src/app/(admin)/AdminHeader';
import { ReviewModerationTable } from './ReviewModerationTable';
import { CouponManager } from './CouponManager';
import { BannerManager } from './BannerManager';
import { FlashSaleConfig } from './FlashSaleConfig';

type Tab = 'resenas' | 'cupones' | 'banners' | 'flash';

const TABS: { id: Tab; label: string }[] = [
  { id: 'resenas', label: 'Reseñas' },
  { id: 'cupones', label: 'Cupones' },
  { id: 'banners', label: 'Banners' },
  { id: 'flash', label: 'Flash Sale' },
];

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('resenas');

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader title="Marketing" />

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)]">
        <nav className="-mb-px flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'rounded-t-lg border-b-2 px-5 py-2.5 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-[var(--color-brand)] text-[var(--color-brand)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'resenas' && <ReviewModerationTable />}
        {activeTab === 'cupones' && <CouponManager />}
        {activeTab === 'banners' && <BannerManager />}
        {activeTab === 'flash' && <FlashSaleConfig />}
      </div>
    </div>
  );
}
