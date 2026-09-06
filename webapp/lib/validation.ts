import { buildNomenclature } from './nomenclature';
import { Country, DocenteData, GradoKey } from './types';

/** Máximo duro de caracteres del resumen docente, contando espacios (BRIEF.md §5). */
export const RESUMEN_MAX_CHARS = 550;
/** Recomendación de cantidad de viñetas — guía, no bloqueo, nunca un segundo límite duro (BRIEF.md §5). */
export const RESUMEN_VIÑETAS_RECOMENDADAS = { min: 6, max: 10 };

/**
 * Bullet o guion inicial que el diseñador puede haber escrito a mano (-, •, *, – , —), seguido de
 * espacio opcional. Se normaliza antes de agregar el bullet visual del template para que el
 * resultado final tenga un solo bullet por línea, nunca dos (BRIEF.md §5 "Resumen docente").
 */
const MANUAL_BULLET_PREFIX_RE = /^[-•*–—]\s*/;

export function parseResumenBullets(resumenTexto: string): string[] {
  return resumenTexto
    .split('\n')
    .map((line) => line.trim().replace(MANUAL_BULLET_PREFIX_RE, '').trim())
    .filter((line) => line.length > 0);
}

export function resumenCharCount(resumenTexto: string): number {
  return parseResumenBullets(resumenTexto).join(' ').length;
}

/**
 * Toggles a Grado académico checkbox honoring the exclusivity rule (BRIEF.md §5):
 * Pregrado/Licenciatura is mutually exclusive with the other three, and the other three
 * can coexist (up to 3 of 4 total).
 */
export function toggleGrado(current: GradoKey[], key: GradoKey): GradoKey[] {
  const isSelected = current.includes(key);
  if (isSelected) {
    return current.filter((g) => g !== key);
  }
  if (key === 'pregrado') {
    return ['pregrado'];
  }
  const withoutPregrado = current.filter((g) => g !== 'pregrado');
  return [...withoutPregrado, key];
}

export interface FieldErrors {
  nombre?: string;
  genero?: string;
  grados?: string;
  tituloProfesionalId?: string;
  resumenTexto?: string;
  photo?: string;
  paises?: string;
}

/** Campos obligatorios completos (BRIEF.md §4.1) — validación de "¿Datos completos?". */
export function validateRequiredFields(docente: DocenteData): FieldErrors {
  const errors: FieldErrors = {};

  if (!docente.nombre.trim()) errors.nombre = 'El nombre es obligatorio.';
  if (!docente.genero) errors.genero = 'Selecciona un género.';
  if (docente.grados.length === 0) errors.grados = 'Selecciona al menos un grado académico.';
  if (!docente.tituloProfesionalId) errors.tituloProfesionalId = 'Selecciona un título profesional.';

  const bullets = parseResumenBullets(docente.resumenTexto);
  const charCount = resumenCharCount(docente.resumenTexto);
  if (bullets.length === 0) {
    errors.resumenTexto = 'El resumen docente es obligatorio (al menos una viñeta).';
  } else if (charCount > RESUMEN_MAX_CHARS) {
    errors.resumenTexto = `El resumen supera el máximo de ${RESUMEN_MAX_CHARS} caracteres (tiene ${charCount}).`;
  }

  if (!docente.photo) errors.photo = 'Sube una fotografía y ajusta el recorte.';
  if (docente.paises.length === 0) errors.paises = 'Selecciona al menos un país.';

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export interface CountryNomenclatureCheck {
  country: Country;
  status: 'ok' | 'blocked';
  blockReasons?: string[];
}

/**
 * Checks nomenclature availability per selected country (BRIEF.md §3 y §5): runs at the
 * Información screen, before advancing — bloquea únicamente el país afectado.
 */
export function checkNomenclaturePerCountry(docente: DocenteData): CountryNomenclatureCheck[] {
  return docente.paises.map((country) => {
    const result = buildNomenclature(docente, country);
    if (result.status === 'blocked') {
      return { country, status: 'blocked', blockReasons: result.blockReasons };
    }
    return { country, status: 'ok' };
  });
}
