import Link from 'next/link';
import { ROUTES } from '@src/routes';

export function StoreFooter() {
  return (
    <footer className="mt-20 w-full bg-[#0a0a0a] text-gray-400">
      {/* SECCIÓN 1: BANDA DE SEPARACIÓN (Newsletter) 
          Esto crea una barrera visual perfecta entre el contenido de la web y el footer */}
      <div className="border-y border-gray-800 bg-[#111111]">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-8 px-6 py-12 md:flex-row lg:px-12">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-white">Únete a la comunidad Clic Moda</h3>
            <p className="mt-2 text-sm text-gray-400">
              Recibe alertas de Ventas Flash y nuevas colecciones.
            </p>
          </div>
          <div className="flex w-full max-w-md gap-2 md:w-auto">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="w-full rounded-full border border-gray-700 bg-black px-6 py-3 text-sm text-white transition-colors focus:border-pink-600 focus:outline-none"
            />
            <button className="rounded-full bg-pink-600 px-8 py-3 text-sm font-bold whitespace-nowrap text-white transition-all hover:bg-pink-700">
              Suscribirme
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: ENLACES PRINCIPALES (Ahora con extra espacio 'py-20' y 'gap-16') */}
      <div className="mx-auto w-full max-w-[1600px] px-6 py-16 lg:px-12">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Columna 1: Marca */}
          <div className="flex flex-col space-y-6">
            <span className="text-3xl font-black tracking-tighter text-white">
              CLIC MODA SCZ<span className="text-pink-600">.</span>
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              Tu destino de Fast Fashion en Santa Cruz de la Sierra. Tendencias de temporada con
              medidas milimétricas exactas para compras sin dudas.
            </p>
          </div>

          {/* Columna 2: Navegación */}
          <div className="flex flex-col space-y-8">
            <h3 className="inline-block w-max border-b border-gray-800 pb-4 text-sm font-bold tracking-widest text-white uppercase">
              Descubrir
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href={ROUTES.HOME}
                  className="inline-block transition-transform hover:translate-x-1 hover:text-pink-500"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.CATALOG}
                  className="inline-block transition-transform hover:translate-x-1 hover:text-pink-500"
                >
                  Catálogo de ropa
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.ABOUT}
                  className="inline-block transition-transform hover:translate-x-1 hover:text-pink-500"
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="inline-block transition-transform hover:translate-x-1 hover:text-pink-500"
                >
                  Mi Cuenta / Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Soporte al cliente */}
          <div className="flex flex-col space-y-8">
            <h3 className="inline-block w-max border-b border-gray-800 pb-4 text-sm font-bold tracking-widest text-white uppercase">
              Soporte
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href={ROUTES.CONTACT}
                  className="inline-block transition-transform hover:translate-x-1 hover:text-pink-500"
                >
                  Ayuda y Contacto
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="inline-block transition-transform hover:translate-x-1 hover:text-pink-500"
                >
                  Políticas de Devolución
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="inline-block transition-transform hover:translate-x-1 hover:text-pink-500"
                >
                  Guía de Tallas
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="inline-block transition-transform hover:translate-x-1 hover:text-pink-500"
                >
                  Términos y Condiciones
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto directo */}
          <div className="flex flex-col space-y-8">
            <h3 className="inline-block w-max border-b border-gray-800 pb-4 text-sm font-bold tracking-widest text-white uppercase">
              Contacto Directo
            </h3>
            <ul className="space-y-5 text-sm">
              <li className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-pink-600/50">
                <span className="text-2xl">📞</span>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Llámanos o WhatsApp</span>
                  <span className="font-bold text-white">+591 77 000-001</span>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <span className="text-xl text-pink-600">✉️</span>
                <span>contacto@clicmodascz.bo</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="text-xl text-pink-600">📍</span>
                <span>Santa Cruz de la Sierra, BO</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: COPYRIGHT */}
      <div className="border-t border-gray-900 bg-black">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-4 px-6 py-6 text-xs text-gray-600 md:flex-row md:text-sm lg:px-12">
          <p>© {new Date().getFullYear()} Clic Moda SCZ. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-white">
              Facebook
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Instagram
            </a>
            <a href="#" className="transition-colors hover:text-white">
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
