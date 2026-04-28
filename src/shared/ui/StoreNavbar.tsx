import Link from 'next/link';
import { ROUTES } from '@src/routes';

export function StoreNavbar() {
  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      {/* Usamos un max-w-[1600px] para que no se estire de forma fea en pantallas gigantes, pero se mantenga centrado */}
      <div className="mx-auto max-w-[1600px] w-full px-6 lg:px-12 h-20 flex items-center justify-between">
        
        {/* LOGO: Restaurado a CLIC MODA SCZ */}
        <div className="flex-shrink-0">
          <Link href={ROUTES.HOME} className="text-2xl lg:text-3xl font-black tracking-tighter text-gray-900">
            CLIC MODA SCZ<span className="text-pink-600">.</span>
          </Link>
        </div>

        {/* MENÚ CENTRAL */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8 lg:gap-12">
          <Link href={ROUTES.HOME} className="text-sm font-bold text-gray-500 hover:text-pink-600 transition-colors">
            INICIO
          </Link>
          <Link href={ROUTES.CATALOG} className="text-sm font-bold text-gray-500 hover:text-pink-600 transition-colors">
            CATÁLOGO
          </Link>
          <Link href={ROUTES.ABOUT} className="text-sm font-bold text-gray-500 hover:text-pink-600 transition-colors">
            NOSOTROS
          </Link>
          <Link href={ROUTES.CONTACT} className="hidden lg:block text-sm 2xl:text-base font-medium text-gray-500 hover:text-gray-900 transition-colors">
            CONTACTO
          </Link>
        </nav>

        {/* DERECHA: LOGIN Y CARRITO */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* NUEVO BOTÓN DE LOGIN */}
          <Link 
            href="/login" 
            className="hidden sm:flex items-center text-sm font-bold text-gray-600 hover:text-pink-600 transition-colors"
          >
            Iniciar sesión
          </Link>
          
          <div className="hidden sm:block w-px h-6 bg-gray-200"></div> {/* Línea separadora */}
          
          <Link 
            href={ROUTES.CART} 
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-pink-600 transition-all shadow-md font-medium text-sm hover:-translate-y-0.5"
          >
            <span>🛒</span>
            <span className="hidden lg:inline">Carrito</span>
            <span className="bg-white text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              0
            </span>
          </Link>
        </div>

      </div>
    </header>
  );
}