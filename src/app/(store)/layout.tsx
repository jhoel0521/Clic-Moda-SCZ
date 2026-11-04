import { StoreNavbar } from '@src/shared/ui/StoreNavbar';
import { StoreFooter } from '@src/shared/ui/StoreFooter';
import { MobileBottomNav } from '@src/shared/ui/MobileBottomNav';
import { DemoBar } from '@src/shared/ui/DemoBar';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-gray-50">
      <DemoBar />
      <StoreNavbar />

      {/* El espacio inferior deja libre la barra de navegación móvil */}
      <main className="page-with-nav w-full flex-1 md:pb-16">{children}</main>

      <div className="hidden md:block">
        <StoreFooter />
      </div>

      <MobileBottomNav />
    </div>
  );
}
