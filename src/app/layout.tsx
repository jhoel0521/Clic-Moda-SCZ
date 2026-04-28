import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Clic Moda SCZ — Fast Fashion Santa Cruz',
    template: '%s | Clic Moda SCZ',
  },
  description:
    'Ropa trendy con envío a Santa Cruz de la Sierra. Tallas exactas, pagos simples y coordinación por WhatsApp. ¡Comprá rápido, llegá con estilo!',
  keywords: ['ropa', 'moda', 'Santa Cruz', 'fast fashion', 'Bolivia', 'tienda online'],
  openGraph: {
    siteName: 'Clic Moda SCZ',
    locale: 'es_BO',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
