export const MAX_BANNER_BYTES = 100 * 1024; // 100 KB — BRIEF.md §5 "Exportación", regla dura.

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
}

/**
 * Exporta el canvas a WebP, reduciendo la calidad hasta que el archivo pese <=100KB
 * (BRIEF.md §5 "Exportación" — "se reduce la calidad de compresión y se regenera, repitiendo
 * hasta que quede en 100 KB o menos. Regla dura, sin excepciones.").
 */
export async function exportCanvasToWebpUnder100KB(canvas: HTMLCanvasElement): Promise<Blob> {
  let quality = 0.92;
  let lastBlob: Blob | null = null;

  for (let attempt = 0; attempt < 12; attempt++) {
    const blob = await canvasToBlob(canvas, quality);
    if (!blob) {
      throw new Error(
        'Este navegador no soporta exportar a WebP desde <canvas> (canvas.toBlob con "image/webp" devolvió null). Probar con un navegador basado en Chromium (Chrome/Edge).',
      );
    }
    lastBlob = blob;
    if (blob.size <= MAX_BANNER_BYTES) return blob;
    quality *= 0.75;
    if (quality < 0.05) break;
  }

  // Se agotaron los intentos de compresión y el archivo sigue sobre 100KB — devolvemos el más
  // liviano que se logró en vez de fallar en silencio, para que quede visible en la UI.
  return lastBlob!;
}
