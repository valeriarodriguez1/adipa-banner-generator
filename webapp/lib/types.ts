export type Gender = 'femenino' | 'masculino' | 'nb_otro';

export type Country = 'chile' | 'mexico' | 'colombia';

export const COUNTRIES: Country[] = ['chile', 'mexico', 'colombia'];

export const COUNTRY_LABELS: Record<Country, string> = {
  chile: 'Chile',
  mexico: 'México',
  colombia: 'Colombia',
};

export const GENDER_LABELS: Record<Gender, string> = {
  femenino: 'Femenino',
  masculino: 'Masculino',
  nb_otro: 'No binario u Otro',
};

/** The four fixed Grado académico checkboxes. Pregrado is mutually exclusive with the other three. */
export type GradoKey = 'doctorado' | 'magister' | 'especialidad' | 'pregrado';

export const GRADO_LABELS: Record<GradoKey, string> = {
  doctorado: 'Doctorado',
  magister: 'Magíster / Master',
  especialidad: 'Especialidad Médica',
  pregrado: 'Pregrado / Licenciatura',
};

/** Hierarchy for stacking grados in Chile/Colombia, highest first. */
export const GRADO_HIERARCHY: Exclude<GradoKey, 'pregrado'>[] = ['doctorado', 'magister', 'especialidad'];

/**
 * The source rectangle, in the uploaded image's natural pixel coordinates, that maps onto the
 * fixed 514x526 crop frame (BRIEF.md §5, "Fotografía"). Always keeps a 514:526 aspect ratio.
 * Smaller sWidth/sHeight = more zoomed in.
 */
export interface CropState {
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
}

export interface PhotoState {
  file: File;
  imageUrl: string; // object URL
  naturalWidth: number;
  naturalHeight: number;
  crop: CropState;
}

export interface DocenteData {
  nombre: string;
  genero: Gender | null;
  grados: GradoKey[];
  tituloProfesionalId: string | null;
  resumenTexto: string; // raw textarea contents, one bullet per line
  photo: PhotoState | null;
  paises: Country[];
}

export function emptyDocenteData(): DocenteData {
  return {
    nombre: '',
    genero: null,
    grados: [],
    tituloProfesionalId: null,
    resumenTexto: '',
    photo: null,
    paises: [],
  };
}

export interface BannerResult {
  country: Country;
  status: 'ok' | 'blocked';
  /** populated when status === 'ok' */
  blob?: Blob;
  objectUrl?: string;
  sizeBytes?: number;
  nomenclatureText?: string;
  /** populated when status === 'blocked' */
  blockReasons?: string[];
}
