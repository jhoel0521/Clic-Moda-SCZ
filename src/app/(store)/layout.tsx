import { StoreNavbar } from '@src/shared/ui/StoreNavbar';
import { StoreFooter } from '@src/shared/ui/StoreFooter';
import { MobileBottomNav } from '@src/shared/ui/MobileBottomNav';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <StoreNavbar />

      {/* main ocupa el espacio disponible y tiene padding inferior para la barra móvil */}
      <main className="flex-1 w-full pb-20 md:pb-16">
        {children}
      </main>

      {/* Footer siempre al fondo gracias al flex-1 del main */}
      <StoreFooter />

      {/* Barra de navegación móvil fija */}
      <MobileBottomNav />
    </div>
  );
}