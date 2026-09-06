import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { poppins } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Generador de Banners ADIPA',
  description: 'Genera banners de columna de opinión para Chile, México y Colombia.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${poppins.className} h-full antialiased`}>
      <body className="min-h-full bg-adipa-bg text-adipa-ink">
        <Header />
        {children}
      </body>
    </html>
  );
}
