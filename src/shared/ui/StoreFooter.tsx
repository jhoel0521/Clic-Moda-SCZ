import Link from 'next/link';
import { ROUTES } from '@src/routes';

export function StoreFooter() {
  return (
    <footer className="w-full bg-[#0a0a0a] text-gray-400 py-16 border-t border-gray-900">
      <div className="mx-auto max-w-[1600px] w-full px-6 lg:px-12">

        {/* Grilla de 4 columnas para distribuir bien la información */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Columna 1: Marca */}
          <div className="flex flex-col space-y-6">
            <span className="text-2xl font-black text-white tracking-tighter">
              CLIC MODA SCZ<span className="text-pink-600">.</span>
            </span>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Tu destino de Fast Fashion en Santa Cruz de la Sierra. Tendencias de temporada con medidas milimétricas exactas para compras sin dudas.
            </p>
          </div>

          {/* Columna 2: Navegación */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Descubrir</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href={ROUTES.HOME} className="hover:text-pink-500 transition-colors">Inicio</Link></li>
              <li><Link href={ROUTES.CATALOG} className="hover:text-pink-500 transition-colors">Catálogo de ropa</Link></li>
              <li><Link href={ROUTES.ABOUT} className="hover:text-pink-500 transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/login" className="hover:text-pink-500 transition-colors">Mi Cuenta / Login</Link></li>
            </ul>
          </div>

          {/* Columna 3: Soporte al cliente */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Soporte</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href={ROUTES.CONTACT} className="hover:text-pink-500 transition-colors">Ayuda y Contacto</Link></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Políticas de Devolución</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Guía de Tallas</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Términos y Condiciones</a></li>
            </ul>
          </div>

          {/* Columna 4: Contacto directo */}
          <div className="flex flex-col space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Contacto Directo</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <span className="text-pink-600">📞</span>
                <span className="font-medium text-white">+591 77 000-001</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-pink-600">✉️</span>
                <span>contacto@clicmodascz.bo</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-pink-600">📍</span>
                <span>Santa Cruz de la Sierra, BO</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Separador final */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Clic Moda SCZ. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            {/* Íconos sociales falsos por ahora */}
            <span className="hover:text-white cursor-pointer">Facebook</span>
            <span className="hover:text-white cursor-pointer">Instagram</span>
            <span className="hover:text-white cursor-pointer">TikTok</span>
          </div>
        </div>

      </div>
    </footer>
  );
}