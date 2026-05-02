import { StoreNavbar } from '@src/shared/ui/StoreNavbar';
import { StoreFooter } from '@src/shared/ui/StoreFooter';
import { MobileBottomNav } from '@src/shared/ui/MobileBottomNav';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <StoreNavbar />

      {/* main ocupa el espacio disponible y tiene padding inferior para la barra móvil */}
      <main className="w-full flex-1 pb-20 md:pb-16">{children}</main>

      {/* Footer siempre al fondo gracias al flex-1 del main */}
      <StoreFooter />

      {/* Barra de navegación móvil fija */}
      <MobileBottomNav />
    </div>
  );
}
