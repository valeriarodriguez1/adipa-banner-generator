'use client';

import { useState } from 'react';
import { InformationForm } from '@/components/InformationForm';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ResultsScreen } from '@/components/ResultsScreen';
import { generateBanners } from '@/lib/generateBanners';
import { BannerResult, DocenteData, emptyDocenteData } from '@/lib/types';
import { CountryNomenclatureCheck } from '@/lib/validation';

type Screen = 'form' | 'loading' | 'results';
type FormMode = 'new' | 'edit';

export default function Page() {
  const [screen, setScreen] = useState<Screen>('form');
  const [formMode, setFormMode] = useState<FormMode>('new');
  const [formKey, setFormKey] = useState(0);
  const [docente, setDocente] = useState<DocenteData>(emptyDocenteData());
  const [results, setResults] = useState<BannerResult[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);

  async function handleFormSubmit(data: DocenteData, checks: CountryNomenclatureCheck[]) {
    setDocente(data);
    setGenerationError(null);
    setScreen('loading');
    try {
      const generated = await generateBanners(data, checks);
      setResults(generated);
      setScreen('results');
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'Ocurrió un error inesperado generando los banners.');
      setScreen('form');
    }
  }

  function handleEdit() {
    setFormMode('edit');
    setFormKey((k) => k + 1);
    setScreen('form');
  }

  function handleBackToStart() {
    setDocente(emptyDocenteData());
    setResults([]);
    setGenerationError(null);
    setFormMode('new');
    setFormKey((k) => k + 1);
    setScreen('form');
  }

  if (screen === 'loading') return <LoadingScreen />;

  if (screen === 'results') {
    return (
      <ResultsScreen docente={docente} results={results} onEdit={handleEdit} onBackToStart={handleBackToStart} />
    );
  }

  return (
    <div className="min-h-screen">
      {generationError && (
        <div className="mx-auto mt-4 max-w-2xl rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {generationError}
        </div>
      )}
      <InformationForm key={formKey} mode={formMode} initialData={docente} onSubmit={handleFormSubmit} />
    </div>
  );
}
