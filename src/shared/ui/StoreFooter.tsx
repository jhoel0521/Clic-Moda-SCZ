import Link from 'next/link';
import { ROUTES } from '@src/routes';

export function StoreFooter() {
  return (
    <footer className="w-full bg-[#0a0a0a] text-gray-400 mt-20">

      {/* SECCIÓN 1: BANDA DE SEPARACIÓN (Newsletter) 
          Esto crea una barrera visual perfecta entre el contenido de la web y el footer */}
      <div className="border-y border-gray-800 bg-[#111111]">
        <div className="mx-auto max-w-[1600px] w-full px-6 lg:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-white">Únete a la comunidad Clic Moda</h3>
            <p className="mt-2 text-sm text-gray-400">Recibe alertas de Ventas Flash y nuevas colecciones.</p>
          </div>
          <div className="flex w-full md:w-auto max-w-md gap-2">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="w-full rounded-full bg-black border border-gray-700 px-6 py-3 text-sm text-white focus:outline-none focus:border-pink-600 transition-colors"
            />
            <button className="whitespace-nowrap rounded-full bg-pink-600 px-8 py-3 text-sm font-bold text-white hover:bg-pink-700 transition-all">
              Suscribirme
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: ENLACES PRINCIPALES (Ahora con extra espacio 'py-20' y 'gap-16') */}
      <div className="mx-auto max-w-[1600px] w-full px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">

          {/* Columna 1: Marca */}
          <div className="flex flex-col space-y-6">
            <span className="text-3xl font-black text-white tracking-tighter">
              CLIC MODA SCZ<span className="text-pink-600">.</span>
            </span>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Tu destino de Fast Fashion en Santa Cruz de la Sierra. Tendencias de temporada con medidas milimétricas exactas para compras sin dudas.
            </p>
          </div>

          {/* Columna 2: Navegación */}
          <div className="flex flex-col space-y-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-4 inline-block w-max">
              Descubrir
            </h3>
            <ul className="space-y-4 text-sm">
              <li><Link href={ROUTES.HOME} className="hover:text-pink-500 hover:translate-x-1 inline-block transition-transform">Inicio</Link></li>
              <li><Link href={ROUTES.CATALOG} className="hover:text-pink-500 hover:translate-x-1 inline-block transition-transform">Catálogo de ropa</Link></li>
              <li><Link href={ROUTES.ABOUT} className="hover:text-pink-500 hover:translate-x-1 inline-block transition-transform">Sobre Nosotros</Link></li>
              <li><Link href="/login" className="hover:text-pink-500 hover:translate-x-1 inline-block transition-transform">Mi Cuenta / Login</Link></li>
            </ul>
          </div>

          {/* Columna 3: Soporte al cliente */}
          <div className="flex flex-col space-y-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-4 inline-block w-max">
              Soporte
            </h3>
            <ul className="space-y-4 text-sm">
              <li><Link href={ROUTES.CONTACT} className="hover:text-pink-500 hover:translate-x-1 inline-block transition-transform">Ayuda y Contacto</Link></li>
              <li><a href="#" className="hover:text-pink-500 hover:translate-x-1 inline-block transition-transform">Políticas de Devolución</a></li>
              <li><a href="#" className="hover:text-pink-500 hover:translate-x-1 inline-block transition-transform">Guía de Tallas</a></li>
              <li><a href="#" className="hover:text-pink-500 hover:translate-x-1 inline-block transition-transform">Términos y Condiciones</a></li>
            </ul>
          </div>

          {/* Columna 4: Contacto directo */}
          <div className="flex flex-col space-y-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-gray-800 pb-4 inline-block w-max">
              Contacto Directo
            </h3>
            <ul className="space-y-5 text-sm">
              <li className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl border border-gray-800 hover:border-pink-600/50 transition-colors">
                <span className="text-2xl">📞</span>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Llámanos o WhatsApp</span>
                  <span className="font-bold text-white">+591 77 000-001</span>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <span className="text-pink-600 text-xl">✉️</span>
                <span>contacto@clicmodascz.bo</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="text-pink-600 text-xl">📍</span>
                <span>Santa Cruz de la Sierra, BO</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* SECCIÓN 3: COPYRIGHT */}
      <div className="border-t border-gray-900 bg-black">
        <div className="mx-auto max-w-[1600px] w-full px-6 lg:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Clic Moda SCZ. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">TikTok</a>
          </div>
        </div>
      </div>

    </footer>
  );
}