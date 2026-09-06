import { Country, Gender, GradoKey } from './types';

/**
 * Nomenclature data transcribed from BRIEF.md, sección 8 (Anexo — Tabla de nomenclaturas por país).
 * Do NOT invent abbreviations here — every value must trace back to BRIEF.md or its source PDFs.
 */

export type CountryAbbrev =
  | { kind: 'single'; value: string }
  /** Valid, but this country deliberately has no prefix for this profession (BRIEF §5, "sin prefijo estándar"). */
  | { kind: 'sinPrefijo' }
  /** Two or more non-gender abbreviations with no defined criterion (⚠ in BRIEF.md) — dependencia pendiente con ADIPA. */
  | { kind: 'ambiguous' }
  /** Varies by gender. `nbOtro` may be absent when the source material never documented that form. */
  | { kind: 'gender'; femenino: string; masculino: string; nbOtro?: string };

export interface AbbrevResolution {
  /** The abbreviation text to render, or empty string for `sinPrefijo`. Undefined when blocked. */
  value?: string;
  /** Present when the combination is not defined and must block generation for this country. */
  blockedReason?: string;
}

export function resolveAbbrev(entry: CountryAbbrev, gender: Gender, contextLabel: string): AbbrevResolution {
  switch (entry.kind) {
    case 'single':
      return { value: entry.value };
    case 'sinPrefijo':
      return { value: '' };
    case 'ambiguous':
      return {
        blockedReason: `${contextLabel}: existen dos o más abreviaturas posibles y ADIPA aún no confirmó cuál usar (dependencia pendiente, ver BRIEF.md §6).`,
      };
    case 'gender': {
      if (gender === 'femenino') return { value: entry.femenino };
      if (gender === 'masculino') return { value: entry.masculino };
      if (entry.nbOtro) return { value: entry.nbOtro };
      return {
        blockedReason: `${contextLabel}: no existe una forma definida para género No binario u Otro (el material fuente solo documenta femenino/masculino).`,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Grados académicos — BRIEF.md §8.1
// ---------------------------------------------------------------------------

export const GRADOS_ACADEMICOS: Record<
  Extract<GradoKey, 'doctorado' | 'magister' | 'especialidad'>,
  Record<Country, CountryAbbrev>
> = {
  doctorado: {
    chile: { kind: 'gender', femenino: 'Dra.', masculino: 'Dr.', nbOtro: 'Dre.' },
    colombia: { kind: 'gender', femenino: 'Dra.', masculino: 'Dr.', nbOtro: 'Dre.' },
    mexico: { kind: 'gender', femenino: 'Dra.', masculino: 'Dr.', nbOtro: 'Dre.' },
  },
  magister: {
    chile: { kind: 'gender', femenino: 'Mg.', masculino: 'Mg.', nbOtro: 'Mg.' },
    // Confirmado por ADIPA: siempre "Mag.", no varía por género (ver BRIEF.md, historial de
    // decisiones #12). OJO: "Mgtr." es de Argentina, fuera de alcance — no usar para Colombia.
    colombia: { kind: 'gender', femenino: 'Mag.', masculino: 'Mag.', nbOtro: 'Mag.' },
    mexico: { kind: 'gender', femenino: 'Mtra.', masculino: 'Mtro.', nbOtro: 'Mtre.' },
  },
  especialidad: {
    // El nombre de la especialidad (Chile/Colombia) se agrega aparte — ver buildNomenclature().
    chile: { kind: 'gender', femenino: 'Dra.', masculino: 'Dr.', nbOtro: 'Dre.' },
    colombia: { kind: 'gender', femenino: 'Dra.', masculino: 'Dr.', nbOtro: 'Dre.' },
    // México nunca muestra el nombre de la especialidad — solo el prefijo.
    mexico: { kind: 'gender', femenino: 'Dra.', masculino: 'Dr.', nbOtro: 'Dre.' },
  },
};

// ---------------------------------------------------------------------------
// Títulos profesionales (35) — BRIEF.md §8.2
// ---------------------------------------------------------------------------

export interface TituloProfesionalEntry {
  id: string;
  label: string;
  chile: CountryAbbrev;
  colombia: CountryAbbrev;
  mexico: CountryAbbrev;
}

const single = (value: string): CountryAbbrev => ({ kind: 'single', value });
const gender = (femenino: string, masculino: string, nbOtro?: string): CountryAbbrev => ({
  kind: 'gender',
  femenino,
  masculino,
  nbOtro,
});
const ambiguous = (): CountryAbbrev => ({ kind: 'ambiguous' });
const sinPrefijo = (): CountryAbbrev => ({ kind: 'sinPrefijo' });

export const TITULOS_PROFESIONALES: TituloProfesionalEntry[] = [
  { id: 'psicologia', label: 'Psicología', chile: single('Ps.'), colombia: single('Psic.'), mexico: single('Lic.') },
  { id: 'psiquiatria', label: 'Psiquiatría', chile: gender('Dra.', 'Dr.'), colombia: gender('Dra.', 'Dr.'), mexico: gender('Dra.', 'Dr.') },
  { id: 'psicopedagogia', label: 'Psicopedagogía', chile: single('Psicp.'), colombia: ambiguous(), mexico: single('Lic.') },
  { id: 'neuropsicologia', label: 'Neuropsicología', chile: single('Ps.'), colombia: ambiguous(), mexico: single('Lic.') },
  { id: 'psicoanalista', label: 'Psicoanalista', chile: single('Ps.'), colombia: single('Ps.'), mexico: single('Lic.') },
  { id: 'psicoterapeuta', label: 'Psicoterapeuta', chile: single('Ps.'), colombia: single('Ps.'), mexico: single('Lic.') },
  { id: 'medico_cirujano', label: 'Médico Cirujano', chile: gender('Dra.', 'Dr.'), colombia: gender('Dra.', 'Dr.'), mexico: gender('Dra.', 'Dr.') },
  { id: 'neurologia', label: 'Neurología', chile: gender('Dra.', 'Dr.'), colombia: gender('Dra.', 'Dr.'), mexico: gender('Dra.', 'Dr.') },
  { id: 'pediatria', label: 'Pediatría / Neuropediatría', chile: gender('Dra.', 'Dr.'), colombia: gender('Dra.', 'Dr.'), mexico: gender('Dra.', 'Dr.') },
  { id: 'ginecologia', label: 'Ginecología / Obstetricia', chile: gender('Dra.', 'Dr.'), colombia: gender('Dra.', 'Dr.'), mexico: gender('Dra.', 'Dr.') },
  { id: 'inmunologia', label: 'Inmunología / Reumatología', chile: gender('Dra.', 'Dr.'), colombia: gender('Dra.', 'Dr.'), mexico: gender('Dra.', 'Dr.') },
  { id: 'urologia', label: 'Urología', chile: gender('Dra.', 'Dr.'), colombia: gender('Dra.', 'Dr.'), mexico: gender('Dra.', 'Dr.') },
  { id: 'neurocirugia', label: 'Neurocirugía', chile: gender('Dra.', 'Dr.'), colombia: gender('Dra.', 'Dr.'), mexico: gender('Dra.', 'Dr.') },
  { id: 'fonoaudiologia', label: 'Fonoaudiología', chile: gender('Flga.', 'Flgo.'), colombia: gender('Flga.', 'Flgo.'), mexico: single('Lic.') },
  { id: 'terapia_ocupacional', label: 'Terapia Ocupacional', chile: single('TO.'), colombia: single('TO.'), mexico: ambiguous() },
  { id: 'kinesiologia', label: 'Kinesiología / Fisioterapia', chile: gender('Knslga.', 'Knslgo.'), colombia: gender('Fta.', 'Fto.'), mexico: ambiguous() },
  { id: 'enfermeria', label: 'Enfermería', chile: single('Enf.'), colombia: single('Enf.'), mexico: ambiguous() },
  { id: 'matrona', label: 'Matrona / Obstetricia', chile: single('Matr.'), colombia: sinPrefijo(), mexico: single('Lic.') },
  { id: 'nutricion', label: 'Nutrición', chile: gender('Nta.', 'Nto.'), colombia: single('Nut.'), mexico: ambiguous() },
  { id: 'educacion_diferencial', label: 'Educación Diferencial / Especial', chile: ambiguous(), colombia: ambiguous(), mexico: single('Lic.') },
  { id: 'educadora_parvulos', label: 'Educadora de Párvulos', chile: single('Ed.'), colombia: single('Lic.'), mexico: single('Lic.') },
  { id: 'profesor', label: 'Profesor/a (Básica, Media, Ed. Física)', chile: single('Prof.'), colombia: ambiguous(), mexico: ambiguous() },
  { id: 'trabajo_social', label: 'Trabajo Social', chile: single('TS.'), colombia: ambiguous(), mexico: ambiguous() },
  { id: 'asistente_social', label: 'Asistente Social', chile: single('AS.'), colombia: ambiguous(), mexico: ambiguous() },
  { id: 'abogacia', label: 'Abogacía / Derecho', chile: gender('Abgda.', 'Abgdo.'), colombia: single('Abg.'), mexico: single('Lic.') },
  { id: 'judicatura', label: 'Judicatura (Juez/a, Magistrado/a)', chile: gender('Jueza.', 'Juez.'), colombia: ambiguous(), mexico: ambiguous() },
  { id: 'sociologia', label: 'Sociología', chile: single('Soc.'), colombia: ambiguous(), mexico: single('Lic.') },
  { id: 'ciencia_politica', label: 'Ciencia Política', chile: sinPrefijo(), colombia: single('Lic.'), mexico: single('Lic.') },
  { id: 'periodismo', label: 'Periodismo / Comunicación', chile: ambiguous(), colombia: ambiguous(), mexico: single('Lic.') },
  { id: 'arte_visual', label: 'Arte Visual / Arteterapia', chile: single('AV.'), colombia: ambiguous(), mexico: single('Lic.') },
  { id: 'ingenieria', label: 'Ingeniería', chile: single('Ing.'), colombia: single('Ing.'), mexico: single('Ing.') },
  { id: 'arquitectura', label: 'Arquitectura', chile: single('Arq.'), colombia: single('Arq.'), mexico: single('Arq.') },
  { id: 'bioquimica', label: 'Bioquímica / Biología', chile: ambiguous(), colombia: ambiguous(), mexico: ambiguous() },
  { id: 'filosofia', label: 'Filosofía / Teología / Historia', chile: ambiguous(), colombia: single('Lic.'), mexico: single('Lic.') },
  { id: 'contador', label: 'Contador Público', chile: single('Cp.'), colombia: single('Cont.'), mexico: single('C.P.') },
];

export const TITULOS_PROFESIONALES_ALFABETICOS: TituloProfesionalEntry[] = [...TITULOS_PROFESIONALES].sort((a, b) =>
  a.label.localeCompare(b.label, 'es'),
);

export function getTituloById(id: string | null): TituloProfesionalEntry | undefined {
  if (!id) return undefined;
  return TITULOS_PROFESIONALES.find((t) => t.id === id);
}
