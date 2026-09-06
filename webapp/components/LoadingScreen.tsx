export function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      <p className="text-lg font-medium text-slate-700">Ya casi está listo…</p>
      <p className="text-sm text-slate-500">Generando los banners y ajustando el peso del archivo.</p>
    </div>
  );
}
