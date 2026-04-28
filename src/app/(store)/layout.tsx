import { StoreNavbar } from '@src/shared/ui/StoreNavbar';
import { StoreFooter } from '@src/shared/ui/StoreFooter';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <StoreNavbar />
      {/* flex-grow asegura que el main ocupe el espacio, flex y flex-col aseguran que el contenido interno pueda alinearse */}
      <main className="flex-grow flex flex-col w-full">
        {children}
      </main>
      <StoreFooter />
    </div>
  );
}