'use client';

import { DownloadIcon, EditIcon, HomeIcon } from './icons';
import { COUNTRY_FLAGS } from '@/lib/countryFlags';
import { bannerFileName, downloadAll, downloadBlob } from '@/lib/download';
import { BannerResult, COUNTRY_LABELS, DocenteData } from '@/lib/types';

interface ResultsScreenProps {
  docente: DocenteData;
  results: BannerResult[];
  onEdit: () => void;
  onBackToStart: () => void;
}

const ACTION_BUTTON_BASE =
  'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-colors duration-200 sm:w-auto sm:px-5 sm:py-2.5 sm:text-base';
const SECONDARY_ACTION_CLASS = `${ACTION_BUTTON_BASE} border border-adipa-border bg-white text-adipa-purple hover:border-adipa-cyan hover:bg-adipa-cyan hover:text-white`;

export function ResultsScreen({ docente, results, onEdit, onBackToStart }: ResultsScreenProps) {
  const okResults = results.filter((r) => r.status === 'ok');
  const blockedResults = results.filter((r) => r.status === 'blocked');

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-5 sm:gap-6 sm:p-6">
      <header>
        <span className="inline-block rounded-[20px] bg-adipa-cyan px-4 py-1.5 text-xl font-semibold text-white sm:px-6 sm:py-2 sm:text-3xl">
          Resultados
        </span>
        <p className="mt-2 text-xs text-adipa-muted sm:mt-3 sm:text-base">
          {okResults.length} banner{okResults.length === 1 ? '' : 's'} generado{okResults.length === 1 ? '' : 's'} para{' '}
          {docente.nombre}.
        </p>
      </header>

      {blockedResults.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 sm:p-4">
          <p className="text-sm font-medium text-amber-800">No se generaron todos los países seleccionados:</p>
          <ul className="list-disc pl-5 text-sm text-amber-800">
            {blockedResults.map((r) => (
              <li key={r.country}>
                <span className="font-medium">{COUNTRY_LABELS[r.country]}</span>: {r.blockReasons?.join(' ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        {okResults.map((result) => (
          <div
            key={result.country}
            className="flex flex-col gap-1.5 rounded-xl border border-adipa-border bg-white p-3 shadow-sm sm:gap-2 sm:p-4"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-adipa-ink">
              {COUNTRY_LABELS[result.country]}
              {/* eslint-disable-next-line @next/next/no-img-element -- ícono estático pequeño, no necesita optimización de next/image */}
              <img src={COUNTRY_FLAGS[result.country]} alt="" aria-hidden="true" className="h-4 w-auto rounded-[2px] align-middle" />
            </p>
            {result.objectUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- banner generado en cliente, no un asset del proyecto
              <img
                src={result.objectUrl}
                alt={`Banner ${COUNTRY_LABELS[result.country]}`}
                className="w-full rounded-md border border-adipa-border"
              />
            )}
            <p className="text-sm text-adipa-muted">{result.nomenclatureText}</p>
            <p className="text-xs text-adipa-muted">{result.sizeBytes ? `${Math.round(result.sizeBytes / 1024)} KB` : ''}</p>
            <button
              type="button"
              onClick={() => result.blob && downloadBlob(result.blob, bannerFileName(result.country, docente.nombre))}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg border border-adipa-purple bg-white px-2.5 py-1.5 text-xs font-medium text-adipa-purple transition-colors duration-200 hover:border-adipa-cyan hover:bg-adipa-cyan hover:text-white sm:px-3 sm:py-2 sm:text-sm"
            >
              Descargar {COUNTRY_LABELS[result.country]}
              <DownloadIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-adipa-border pt-3 sm:gap-3 sm:pt-4">
        <button
          type="button"
          onClick={() => downloadAll(okResults, docente.nombre)}
          disabled={okResults.length === 0}
          className={`adipa-gradient ${ACTION_BUTTON_BASE} text-white hover:opacity-90 disabled:opacity-50`}
        >
          <DownloadIcon className="h-4 w-4" />
          Descargar todos
        </button>
        <button type="button" onClick={onEdit} className={SECONDARY_ACTION_CLASS}>
          <EditIcon className="h-4 w-4" />
          Editar datos
        </button>
        <button type="button" onClick={onBackToStart} className={SECONDARY_ACTION_CLASS}>
          <HomeIcon className="h-4 w-4" />
          Regresar al inicio
        </button>
      </div>
    </div>
  );
}
