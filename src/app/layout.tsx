import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  title: {
    default: 'Clic Moda SCZ — Zapatos y ropa en Santa Cruz (demo)',
    template: '%s | Clic Moda SCZ',
  },
  description: 'Demo de tienda móvil de calzado y ropa, con talla exacta y pedidos por WhatsApp.',
  robots: { index: false, follow: false },
  manifest: `${BASE_PATH}/manifest.webmanifest`,
  icons: { apple: `${BASE_PATH}/apple-touch-icon.png` },
  // Al agregarla a la pantalla de inicio del iPhone se abre como una app.
  appleWebApp: { capable: true, title: 'Clic Moda', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
