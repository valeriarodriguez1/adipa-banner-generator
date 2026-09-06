/**
 * Header global de la app (BRIEF.md — lineamientos de UI ADIPA). Se muestra en todas las
 * pantallas y estados del journey (Información, Carga, Resultados, Edición manual); vive en
 * app/layout.tsx para no depender del estado interno de cada pantalla. No sticky.
 */
export function Header() {
  return (
    <header className="adipa-gradient w-full">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-4">
        {/* Asset oficial (logo-adipa-header.svg): ya incluye su propia envolvente blanca redondeada
            — se usa tal cual, sin wrapper adicional ni reconstrucción de sus paths/colores. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- logo estático, no necesita optimización de next/image */}
        <img src="/logo-adipa-header.svg" alt="ADIPA" className="h-7 w-auto shrink-0 sm:h-11" />
        <div className="h-5 w-px shrink-0 bg-white/80 sm:h-8" aria-hidden="true" />
        <h1 className="whitespace-nowrap text-base font-bold text-white sm:text-2xl">
          Generador de banners
        </h1>
      </div>
    </header>
  );
}
