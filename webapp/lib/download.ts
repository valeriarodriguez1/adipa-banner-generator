import { BannerResult, Country } from './types';

export function bannerFileName(country: Country, nombre: string): string {
  const slug = nombre
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `banner-${country}-${slug || 'docente'}.webp`;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** "Descargar todos" (BRIEF.md §4.2): dispara la descarga individual de cada banner generado. */
export async function downloadAll(results: BannerResult[], nombre: string) {
  for (const result of results) {
    if (result.status !== 'ok' || !result.blob) continue;
    downloadBlob(result.blob, bannerFileName(result.country, nombre));
    // Pequeña espera entre descargas: varios navegadores bloquean descargas múltiples disparadas
    // en el mismo tick de evento.
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}
