import { GRADOS_ACADEMICOS, getTituloById, resolveAbbrev } from './nomenclatureData';
import { Country, DocenteData, GRADO_HIERARCHY, GRADO_LABELS, GradoKey } from './types';

export interface NomenclatureResult {
  status: 'ok' | 'blocked';
  text?: string;
  blockReasons?: string[];
}

/**
 * Builds the academic-nomenclature line for one country, following BRIEF.md §5 "Nomenclatura académica".
 * Never guesses a value that the source data marks as undefined — returns status:'blocked' instead,
 * per BRIEF.md §5 (el sistema avisa... bloquea únicamente el país afectado).
 */
export function buildNomenclature(docente: DocenteData, country: Country): NomenclatureResult {
  const { genero, grados, nombre } = docente;
  if (!genero) return { status: 'blocked', blockReasons: ['Falta seleccionar Género.'] };
  if (grados.length === 0) return { status: 'blocked', blockReasons: ['Falta seleccionar Grado académico.'] };

  const titulo = getTituloById(docente.tituloProfesionalId);
  if (!titulo) return { status: 'blocked', blockReasons: ['Falta seleccionar Título profesional.'] };

  const isPregradoOnly = grados.includes('pregrado');

  // ---------------------------------------------------------------------
  // México: [Solo el grado más alto]. [Nombre completo] — nunca muestra el título profesional.
  // ---------------------------------------------------------------------
  if (country === 'mexico') {
    if (isPregradoOnly) {
      // Lic. es genérico en México: no varía por profesión ni por género (BRIEF §5).
      return { status: 'ok', text: `Lic. ${nombre}` };
    }
    const highest = GRADO_HIERARCHY.find((g) => grados.includes(g)) as
      | Exclude<GradoKey, 'pregrado'>
      | undefined;
    if (!highest) return { status: 'blocked', blockReasons: ['Falta seleccionar Grado académico.'] };

    const abbrevEntry = GRADOS_ACADEMICOS[highest].mexico;
    const resolved = resolveAbbrev(abbrevEntry, genero, GRADO_LABELS[highest]);
    if (resolved.blockedReason) {
      return { status: 'blocked', blockReasons: [resolved.blockedReason] };
    }
    // México nunca muestra el nombre de la especialidad, aunque el grado sea Especialidad Médica.
    return { status: 'ok', text: `${resolved.value} ${nombre}` };
  }

  // ---------------------------------------------------------------------
  // Chile / Colombia: [Grado1]. [Grado2]. [Grado3]. [Título profesional]. [Nombre completo]
  // ---------------------------------------------------------------------
  if (isPregradoOnly) {
    // Sin prefijo de grado — solo [Título profesional]. [Nombre completo].
    const tituloAbbrev = resolveAbbrev(titulo[country], genero, `Título profesional (${titulo.label})`);
    if (tituloAbbrev.blockedReason) {
      return { status: 'blocked', blockReasons: [tituloAbbrev.blockedReason] };
    }
    const prefix = tituloAbbrev.value ? `${tituloAbbrev.value} ` : '';
    return { status: 'ok', text: `${prefix}${nombre}` };
  }

  const gradosPresentes = GRADO_HIERARCHY.filter((g) => grados.includes(g));
  const blockReasons: string[] = [];
  const segments: string[] = [];
  let especialidadIncluida = false;

  for (const grado of gradosPresentes) {
    const resolved = resolveAbbrev(GRADOS_ACADEMICOS[grado][country], genero, GRADO_LABELS[grado]);
    if (resolved.blockedReason) {
      blockReasons.push(resolved.blockedReason);
      continue;
    }
    if (grado === 'especialidad') {
      // El "nombre de la especialidad" es el valor ya elegido en Título profesional (BRIEF §5,
      // "Origen del nombre de la especialidad") — no se vuelve a mostrar como segmento aparte.
      segments.push(`${resolved.value} ${titulo.label}`);
      especialidadIncluida = true;
    } else {
      segments.push(resolved.value ?? '');
    }
  }

  if (!especialidadIncluida) {
    const tituloAbbrev = resolveAbbrev(titulo[country], genero, `Título profesional (${titulo.label})`);
    if (tituloAbbrev.blockedReason) {
      blockReasons.push(tituloAbbrev.blockedReason);
    } else if (tituloAbbrev.value) {
      segments.push(tituloAbbrev.value);
    }
    // tituloAbbrev.value === '' (sinPrefijo): se omite el segmento, no es un bloqueo (BRIEF §5).
  }

  if (blockReasons.length > 0) {
    return { status: 'blocked', blockReasons };
  }

  const text = [...segments, nombre].filter(Boolean).join(' ');
  return { status: 'ok', text };
}
