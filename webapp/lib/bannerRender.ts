import {
  CANVAS_H,
  CANVAS_W,
  COLOR_CYAN,
  COLOR_PURPLE,
  COLOR_WHITE,
  COLUMNA_TEXT,
  NAME_BOX,
  NAME_FONT_SIZE,
  PHOTO_BOX,
  SUMMARY_BOX,
  SUMMARY_FONT_SIZE,
  SUMMARY_LINE_HEIGHT,
  SUMMARY_MIN_FONT_SIZE,
  SUMMARY_MIN_LINE_HEIGHT,
  TRIANGLE,
  WHITE_BAND_HEIGHT,
} from './bannerLayout';
import { poppins } from './fonts';
import { PhotoState } from './types';

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawPhoto(ctx: CanvasRenderingContext2D, img: HTMLImageElement, photo: PhotoState) {
  const { x, y, w, h } = PHOTO_BOX;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const { sx, sy, sWidth, sHeight } = photo.crop;
  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
  ctx.restore();
}

function drawNameLine(ctx: CanvasRenderingContext2D, text: string) {
  // Ajuste visual del template (BRIEF.md §5, "Mayúsculas en la línea de nombre"): la línea de
  // nomenclatura + nombre se dibuja siempre en mayúsculas. Es solo una transformación de render —
  // el dato original (`text`) no se modifica ni se usa en mayúsculas en ningún otro lugar.
  const upperText = text.toLocaleUpperCase('es');
  const family = poppins.style.fontFamily;
  let fontSize = NAME_FONT_SIZE;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = COLOR_WHITE;
  ctx.font = `600 ${fontSize}px ${family}`;
  // Shrink-to-fit so an unusually long stacked nomenclature never gets clipped (BRIEF.md keeps
  // the typography fixed at 40pt as the normal case; this is only a safety fallback).
  while (ctx.measureText(upperText).width > NAME_BOX.w && fontSize > 20) {
    fontSize -= 1;
    ctx.font = `600 ${fontSize}px ${family}`;
  }
  ctx.fillText(upperText, NAME_BOX.x, NAME_BOX.y + NAME_BOX.h / 2, NAME_BOX.w);
}

function wrapBullets(ctx: CanvasRenderingContext2D, bullets: string[], family: string, fontSize: number): string[] {
  ctx.font = `500 ${fontSize}px ${family}`;
  const lines: string[] = [];
  for (const bullet of bullets) {
    lines.push(...wrapText(ctx, `-  ${bullet}`, SUMMARY_BOX.w));
  }
  return lines;
}

/**
 * Dibuja el resumen docente ocupando primero el espacio vertical disponible en SUMMARY_BOX antes
 * de achicar la tipografía (BRIEF.md §5 "Resumen docente" — hasta 550 caracteres / ~6-10 viñetas):
 * 1) con el interlineado y tamaño normales (igual que siempre para resúmenes cortos);
 * 2) si no entra, se compacta el interlineado hasta un piso legible, sin tocar el tamaño de fuente;
 * 3) solo si aun así no entra, se reduce el tamaño de fuente (recalculando el ajuste de línea, ya
 *    que una fuente más chica cambia dónde se corta cada línea) hasta un piso mínimo.
 */
function drawSummary(ctx: CanvasRenderingContext2D, bullets: string[]) {
  const family = poppins.style.fontFamily;
  const maxHeight = SUMMARY_BOX.h;

  let fontSize = SUMMARY_FONT_SIZE;
  let lines = wrapBullets(ctx, bullets, family, fontSize);
  let lineHeight = SUMMARY_LINE_HEIGHT;

  while (lines.length * SUMMARY_MIN_LINE_HEIGHT > maxHeight && fontSize > SUMMARY_MIN_FONT_SIZE) {
    fontSize -= 1;
    lines = wrapBullets(ctx, bullets, family, fontSize);
  }

  if (lines.length > 0) {
    lineHeight = Math.min(SUMMARY_LINE_HEIGHT, Math.max(SUMMARY_MIN_LINE_HEIGHT, maxHeight / lines.length));
  }

  ctx.font = `500 ${fontSize}px ${family}`;
  ctx.fillStyle = COLOR_WHITE;
  ctx.textBaseline = 'top';

  let cursorY = SUMMARY_BOX.y;
  const bottomLimit = SUMMARY_BOX.y + maxHeight;
  for (const line of lines) {
    if (cursorY + lineHeight > bottomLimit) break;
    ctx.fillText(line, SUMMARY_BOX.x, cursorY, SUMMARY_BOX.w);
    cursorY += lineHeight;
  }
}

function drawStaticTemplate(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = COLOR_WHITE;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = COLOR_PURPLE;
  ctx.fillRect(0, WHITE_BAND_HEIGHT, CANVAS_W, CANVAS_H - WHITE_BAND_HEIGHT);

  const family = poppins.style.fontFamily;
  ctx.fillStyle = COLOR_CYAN;
  ctx.font = `600 ${COLUMNA_TEXT.fontSize}px ${family}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('COLUMNA DE OPINIÓN', COLUMNA_TEXT.rightX, COLUMNA_TEXT.baselineY);
  ctx.textAlign = 'left';

  // Triángulo blanco en la división blanco/morado, justo debajo de "COLUMNA DE OPINIÓN"
  // (BRIEF.md — template de referencia template-banner.jpg).
  ctx.fillStyle = COLOR_WHITE;
  ctx.beginPath();
  ctx.moveTo(TRIANGLE.leftX, TRIANGLE.topY);
  ctx.lineTo(TRIANGLE.rightX, TRIANGLE.topY);
  ctx.lineTo(TRIANGLE.apexX, TRIANGLE.apexY);
  ctx.closePath();
  ctx.fill();
}

export interface RenderBannerInput {
  photo: PhotoState;
  photoImg: HTMLImageElement;
  nombreLineText: string; // e.g. "Mg. Ps. Leonel Núñez Lagos" — already resolved nomenclature + nombre
  resumenBullets: string[];
}

export function renderBannerToCanvas(canvas: HTMLCanvasElement, input: RenderBannerInput) {
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo obtener el contexto 2D del canvas.');

  drawStaticTemplate(ctx);
  drawPhoto(ctx, input.photoImg, input.photo);
  drawNameLine(ctx, input.nombreLineText);
  drawSummary(ctx, input.resumenBullets);
}
