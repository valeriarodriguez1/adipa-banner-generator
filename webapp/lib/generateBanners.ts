import { renderBannerToCanvas } from './bannerRender';
import { ensureBannerFontsReady } from './fonts';
import { buildNomenclature } from './nomenclature';
import { CountryNomenclatureCheck, parseResumenBullets } from './validation';
import { exportCanvasToWebpUnder100KB } from './webpExport';
import { BannerResult, DocenteData } from './types';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Genera los banners para los países válidos (BRIEF.md §3 "Pantalla de carga" → §4.2 "Resultados").
 * Los países bloqueados por nomenclatura no definida se devuelven con status:'blocked' y no
 * consumen ningún recurso de render/exportación.
 */
export async function generateBanners(
  docente: DocenteData,
  checks: CountryNomenclatureCheck[],
): Promise<BannerResult[]> {
  if (!docente.photo) {
    throw new Error('Falta la fotografía del docente.');
  }

  await ensureBannerFontsReady();
  const photoImg = await loadImage(docente.photo.imageUrl);
  const bullets = parseResumenBullets(docente.resumenTexto);
  const canvas = document.createElement('canvas');

  const results: BannerResult[] = [];
  for (const check of checks) {
    if (check.status === 'blocked') {
      results.push({ country: check.country, status: 'blocked', blockReasons: check.blockReasons });
      continue;
    }

    const nomenclature = buildNomenclature(docente, check.country);
    if (nomenclature.status === 'blocked') {
      // No debería pasar si checkNomenclaturePerCountry ya validó, pero se maneja por seguridad.
      results.push({ country: check.country, status: 'blocked', blockReasons: nomenclature.blockReasons });
      continue;
    }

    renderBannerToCanvas(canvas, {
      photo: docente.photo,
      photoImg,
      nombreLineText: nomenclature.text!,
      resumenBullets: bullets,
    });
    const blob = await exportCanvasToWebpUnder100KB(canvas);
    results.push({
      country: check.country,
      status: 'ok',
      blob,
      objectUrl: URL.createObjectURL(blob),
      sizeBytes: blob.size,
      nomenclatureText: nomenclature.text,
    });
  }

  return results;
}
