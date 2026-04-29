import { StoreNavbar } from '@src/shared/ui/StoreNavbar';
import { StoreFooter } from '@src/shared/ui/StoreFooter';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // h-full toma el 100% del body congelado.
    <div className="flex flex-col h-full w-full bg-gray-50">

      {/* 1. NAVBAR FIJO: Al estar fuera de la zona de scroll, jamás se moverá */}
      <StoreNavbar />

      {/* 2. ZONA DE SCROLL INTERNO (overflow-y-auto): 
          Esta es la caja que generará la barra de desplazamiento. 
      */}
      <div className="flex-1 overflow-y-auto flex flex-col w-full">

        {/* El MAIN empuja al Footer hacia abajo si la página es corta (flex-1) */}
        <main className="flex-1 flex flex-col items-center w-full pt-8 pb-16">
          {children}
        </main>

        {/* El FOOTER vive al final del scroll */}
        <StoreFooter />

      </div>

    </div>
  );
}