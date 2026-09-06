import { Poppins } from 'next/font/google';

/**
 * Tipografía oficial del banner (BRIEF.md §5, "Colores y tipografía"):
 * Poppins SemiBold (600) para el nombre, Poppins Medium (500) para el resumen docente.
 */
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
});

/** Ensures the given weights are loaded and ready before drawing text on a <canvas>. */
export async function ensureBannerFontsReady() {
  if (typeof document === 'undefined') return;
  const family = poppins.style.fontFamily;
  await Promise.all([
    document.fonts.load(`600 40px ${family}`),
    document.fonts.load(`500 14px ${family}`),
    document.fonts.load(`600 24px ${family}`),
  ]);
  await document.fonts.ready;
}
