/**
 * Coordenadas del template ADIPA (BRIEF.md §5 "Formato del banner" / "Colores y tipografía",
 * y las medidas anotadas en mapa banner generator.png).
 *
 * Los tamaños de caja (foto 514x526, nombre 714x50, resumen 738x208) vienen anotados en el mapa
 * conceptual. Las posiciones absolutas no están documentadas en ningún archivo de texto — se
 * midieron píxel a píxel sobre template-banner.jpg (muestreo de color con System.Drawing), ya que
 * el archivo fuente (template banner.ai) es un binario de Illustrator que no se puede leer
 * programáticamente. Si no calzan pixel-a-pixel con el diseño original, son el único elemento de
 * esta implementación pensado para ajustarse aquí, sin tocar ninguna regla de negocio.
 */

export const CANVAS_W = 1280;
export const CANVAS_H = 675;

export const COLOR_WHITE = '#FFFFFF';
export const COLOR_PURPLE = '#704EFD';
export const COLOR_CYAN = '#2CB7FF';

export const WHITE_BAND_HEIGHT = 367;

export const PHOTO_BOX = { x: 0, y: CANVAS_H - 526, w: 514, h: 526 };

// "COLUMNA DE OPINIÓN": medido en template-banner.jpg, bbox del texto cian x=830-1228, y=302-336.
export const COLUMNA_TEXT = { rightX: 1228, baselineY: 336, fontSize: 36 };

// Triángulo blanco: medido en template-banner.jpg, base x=1008-1053 en y=367 (borde blanco/morado),
// ápice en x≈1030, y≈396.
export const TRIANGLE = { leftX: 1008, rightX: 1053, apexX: 1030, topY: WHITE_BAND_HEIGHT, apexY: 396 };

// Nombre: medido en template-banner.jpg, bbox del texto blanco x=554-1122, y=420-456 (centro y≈438).
export const NAME_BOX = { x: 552, y: 413, w: 714, h: 50 };
export const NAME_FONT_SIZE = 40;

// Resumen: medido en template-banner.jpg, bbox del texto blanco x=554-1244, y=477-655. La altura
// se estiró levemente (190→200) para aprovechar el espacio vertical real disponible hasta el
// borde inferior del canvas (675) antes de necesitar achicar tipografía en resúmenes largos.
export const SUMMARY_BOX = { x: 552, y: 470, w: 700, h: 200 };
export const SUMMARY_FONT_SIZE = 14;
export const SUMMARY_LINE_HEIGHT = 20;
// Piso de interlineado (más compacto) y de tamaño de fuente antes de recortar contenido, usados
// solo cuando un resumen cercano al máximo de 550 caracteres no entra con el interlineado normal
// (BRIEF.md §5 "Resumen docente" — aprovechar el espacio vertical antes de reducir tamaño).
export const SUMMARY_MIN_LINE_HEIGHT = 15;
export const SUMMARY_MIN_FONT_SIZE = 11;
