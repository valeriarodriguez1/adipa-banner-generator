'use client';

import { useMemo, useState } from 'react';
import { PhotoCropper } from './PhotoCropper';
import { COUNTRY_FLAGS } from '@/lib/countryFlags';
import { TITULOS_PROFESIONALES_ALFABETICOS } from '@/lib/nomenclatureData';
import {
  CountryNomenclatureCheck,
  FieldErrors,
  RESUMEN_MAX_CHARS,
  RESUMEN_VIÑETAS_RECOMENDADAS,
  checkNomenclaturePerCountry,
  hasErrors,
  parseResumenBullets,
  resumenCharCount,
  toggleGrado,
  validateRequiredFields,
} from '@/lib/validation';
import { COUNTRIES, COUNTRY_LABELS, DocenteData, GENDER_LABELS, GRADO_LABELS, Gender, GradoKey } from '@/lib/types';

interface InformationFormProps {
  mode: 'new' | 'edit';
  initialData: DocenteData;
  onSubmit: (docente: DocenteData, nomenclatureChecks: CountryNomenclatureCheck[]) => void;
}

const GRADO_ORDER: GradoKey[] = ['doctorado', 'magister', 'especialidad', 'pregrado'];
const GENDER_ORDER: Gender[] = ['femenino', 'masculino', 'nb_otro'];

// Estilos compartidos — cambios puramente visuales, no tocan el comportamiento de los campos.
// Los valores sin prefijo son solo para mobile (<640px); todo lo que lleva sm: reproduce
// exactamente el tamaño que ya tenían desktop/tablet antes de este ajuste, para no tocarlos.
const LABEL_CLASS = 'text-xs font-medium uppercase tracking-wide text-adipa-purple sm:text-sm';
const HELPER_CLASS = 'text-xs text-adipa-muted';
const INPUT_CLASS =
  'rounded-md border border-adipa-border bg-white px-2.5 py-1.5 text-sm text-adipa-ink outline-none focus:border-adipa-purple sm:px-3 sm:py-2';
const ERROR_CLASS = 'text-xs text-adipa-danger';
const OPTION_ROW_CLASS = 'flex items-center gap-2 text-xs text-adipa-ink sm:text-sm';

export function InformationForm({ mode, initialData, onSubmit }: InformationFormProps) {
  const [docente, setDocente] = useState<DocenteData>(initialData);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [nomenclatureWarnings, setNomenclatureWarnings] = useState<CountryNomenclatureCheck[]>([]);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const bullets = useMemo(() => parseResumenBullets(docente.resumenTexto), [docente.resumenTexto]);
  const charCount = useMemo(() => resumenCharCount(docente.resumenTexto), [docente.resumenTexto]);
  const overCharLimit = charCount > RESUMEN_MAX_CHARS;

  function update<K extends keyof DocenteData>(key: K, value: DocenteData[K]) {
    setDocente((prev) => ({ ...prev, [key]: value }));
    // Los mensajes de error/aviso se recalculan en el próximo intento de Generar — se limpian acá
    // para que no queden mensajes obsoletos mientras el diseñador sigue editando.
    setFieldErrors({});
    setNomenclatureWarnings([]);
  }

  function handleGradoToggle(key: GradoKey) {
    update('grados', toggleGrado(docente.grados, key));
  }

  function handlePaisToggle(country: (typeof COUNTRIES)[number]) {
    const exists = docente.paises.includes(country);
    update('paises', exists ? docente.paises.filter((p) => p !== country) : [...docente.paises, country]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttemptedSubmit(true);

    const errors = validateRequiredFields(docente);
    setFieldErrors(errors);
    if (hasErrors(errors)) {
      setNomenclatureWarnings([]);
      return;
    }

    const checks = checkNomenclaturePerCountry(docente);
    setNomenclatureWarnings(checks);

    const validCountries = checks.filter((c) => c.status === 'ok');
    if (validCountries.length === 0) {
      // Todos los países seleccionados quedaron bloqueados — no hay nada que generar todavía.
      return;
    }

    onSubmit(docente, checks);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 sm:px-6 sm:py-10">
      <div className="mb-4 flex flex-col items-start gap-2 sm:mb-6 sm:gap-3">
        <div>
          <h1 className="text-xl font-semibold text-adipa-purple sm:text-3xl">
            {mode === 'new' ? '¡Hola!' : 'Editar datos'}
          </h1>
          <p className="mt-1 text-xs text-adipa-muted sm:text-sm">
            {mode === 'new'
              ? 'Completa los datos del docente para generar los banners de columna de opinión'
              : 'Ajusta los datos que necesites y vuelve a generar los banners.'}
          </p>
        </div>
        {mode === 'new' && (
          <span className="inline-block rounded-[20px] bg-adipa-cyan px-3 py-1 text-sm font-semibold text-white sm:px-5 sm:py-2 sm:text-base">
            Información docente
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6">
        {/* Nombre */}
        <div className="flex flex-col gap-1">
          <label className={LABEL_CLASS} htmlFor="nombre">
            Nombre completo <span className="text-adipa-danger">*</span>
          </label>
          <input
            id="nombre"
            type="text"
            value={docente.nombre}
            onChange={(e) => update('nombre', e.target.value)}
            className={INPUT_CLASS}
            placeholder="Ej. María González"
          />
          {fieldErrors.nombre && <p className={ERROR_CLASS}>{fieldErrors.nombre}</p>}
        </div>

        {/* Género */}
        <fieldset className="flex flex-col gap-2">
          <legend className={LABEL_CLASS}>
            Género <span className="text-adipa-danger">*</span>
          </legend>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 sm:gap-4">
            {GENDER_ORDER.map((g) => (
              <label key={g} className={OPTION_ROW_CLASS}>
                <input
                  type="radio"
                  name="genero"
                  checked={docente.genero === g}
                  onChange={() => update('genero', g)}
                  className="accent-adipa-purple"
                />
                {GENDER_LABELS[g]}
              </label>
            ))}
          </div>
          {fieldErrors.genero && <p className={ERROR_CLASS}>{fieldErrors.genero}</p>}
        </fieldset>

        {/* Grado académico */}
        <fieldset className="flex flex-col gap-1">
          <legend className={LABEL_CLASS}>
            Grado académico <span className="text-adipa-danger">*</span>
          </legend>
          <p className={HELPER_CLASS}>Hasta 3 de 4 — Pregrado/Licenciatura es excluyente con los demás.</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1.5 sm:gap-x-4 sm:gap-y-2">
            {GRADO_ORDER.map((g) => (
              <label key={g} className={OPTION_ROW_CLASS}>
                <input
                  type="checkbox"
                  checked={docente.grados.includes(g)}
                  onChange={() => handleGradoToggle(g)}
                  className="accent-adipa-purple"
                />
                {GRADO_LABELS[g]}
              </label>
            ))}
          </div>
          {fieldErrors.grados && <p className={ERROR_CLASS}>{fieldErrors.grados}</p>}
        </fieldset>

        {/* Título profesional */}
        <div className="flex flex-col gap-1">
          <label className={LABEL_CLASS} htmlFor="titulo">
            Título profesional <span className="text-adipa-danger">*</span>
          </label>
          <select
            id="titulo"
            value={docente.tituloProfesionalId ?? ''}
            onChange={(e) => update('tituloProfesionalId', e.target.value || null)}
            className={INPUT_CLASS}
          >
            <option value="">Selecciona una profesión…</option>
            {TITULOS_PROFESIONALES_ALFABETICOS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          {docente.grados.includes('especialidad') && (
            <p className={HELPER_CLASS}>
              Como marcaste Especialidad Médica: en Chile/Colombia esta profesión se usará también como el
              nombre de la especialidad dentro del grado (ej. &quot;Dr. Neurología&quot;).
            </p>
          )}
          {fieldErrors.tituloProfesionalId && <p className={ERROR_CLASS}>{fieldErrors.tituloProfesionalId}</p>}
        </div>

        {/* Resumen docente */}
        <div className="flex flex-col gap-1">
          <label className={LABEL_CLASS} htmlFor="resumen">
            Resumen docente <span className="text-adipa-danger">*</span>
          </label>
          <p className={HELPER_CLASS}>Un bullet por línea.</p>
          <textarea
            id="resumen"
            rows={7}
            value={docente.resumenTexto}
            onChange={(e) => update('resumenTexto', e.target.value)}
            className={`${INPUT_CLASS} font-mono`}
            placeholder={'Licenciado en Psicología, Universidad X.\nMagíster en...\nDocente por 10 años en...'}
          />
          <div className="flex items-center justify-between text-xs">
            <span className={overCharLimit ? 'font-medium text-adipa-danger' : 'text-adipa-muted'}>
              {charCount} / {RESUMEN_MAX_CHARS} caracteres {overCharLimit && '— supera el máximo permitido'}
            </span>
            <span
              className={
                bullets.length > 0 &&
                (bullets.length < RESUMEN_VIÑETAS_RECOMENDADAS.min || bullets.length > RESUMEN_VIÑETAS_RECOMENDADAS.max)
                  ? 'text-amber-600'
                  : 'text-adipa-muted'
              }
            >
              {bullets.length} viñetas (recomendado {RESUMEN_VIÑETAS_RECOMENDADAS.min}–
              {RESUMEN_VIÑETAS_RECOMENDADAS.max})
            </span>
          </div>
          {fieldErrors.resumenTexto && <p className={ERROR_CLASS}>{fieldErrors.resumenTexto}</p>}
        </div>

        {/* Fotografía */}
        <PhotoCropper value={docente.photo} onChange={(photo) => update('photo', photo)} error={fieldErrors.photo} />

        {/* País */}
        <fieldset className="flex flex-col gap-1">
          <legend className={LABEL_CLASS}>
            País <span className="text-adipa-danger">*</span>
          </legend>
          <p className={HELPER_CLASS}>Selecciona uno o varios.</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1.5 sm:gap-4">
            {COUNTRIES.map((c) => (
              <label key={c} className={OPTION_ROW_CLASS}>
                <input
                  type="checkbox"
                  checked={docente.paises.includes(c)}
                  onChange={() => handlePaisToggle(c)}
                  className="accent-adipa-purple"
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- ícono estático pequeño, no necesita optimización de next/image */}
                <img src={COUNTRY_FLAGS[c]} alt="" aria-hidden="true" className="h-4 w-auto rounded-[2px] align-middle" />
                {COUNTRY_LABELS[c]}
              </label>
            ))}
          </div>
          {fieldErrors.paises && <p className={ERROR_CLASS}>{fieldErrors.paises}</p>}
        </fieldset>

        {/* Avisos de nomenclatura no definida */}
        {attemptedSubmit && nomenclatureWarnings.some((w) => w.status === 'blocked') && (
          <div className="flex flex-col gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 sm:p-4">
            <p className="text-sm font-medium text-amber-800">
              Nomenclatura no definida para {nomenclatureWarnings.filter((w) => w.status === 'blocked').length === 1 ? 'este país' : 'estos países'}:
            </p>
            <ul className="list-disc pl-5 text-sm text-amber-800">
              {nomenclatureWarnings
                .filter((w) => w.status === 'blocked')
                .map((w) => (
                  <li key={w.country}>
                    <span className="font-medium">{COUNTRY_LABELS[w.country]}</span>: {w.blockReasons?.join(' ')}
                  </li>
                ))}
            </ul>
            {nomenclatureWarnings.some((w) => w.status === 'ok') ? (
              <p className="text-xs text-amber-700">
                Los demás países seleccionados sí se generarán con normalidad.
              </p>
            ) : (
              <p className="text-xs text-amber-700">
                Ningún país quedó disponible para generar — ajusta género, grado o título profesional, o
                selecciona otro país.
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          className="adipa-gradient rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 sm:py-3 sm:text-base"
        >
          Generar
        </button>
      </form>
    </div>
  );
}
