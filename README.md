# ADIPA — Generador de Banners

Herramienta interna de ADIPA para el equipo de diseño: a partir de los datos de un docente, genera automáticamente el banner de columna de opinión (1280×675, formato WebP) para Chile, México y Colombia en un solo paso, aplicando en cada país la abreviatura de grado/título correcta según sus reglas de nomenclatura académica.

## Entregables de esta prueba

- **Brief funcional**: [`BRIEF.md`](BRIEF.md) — problema, pantallas, reglas de negocio, tabla de nomenclaturas por país, dependencias pendientes con ADIPA y retrospectiva.
- **Mapa del journey**: [`mapa banner generator.png`](mapa%20banner%20generator.png).
- **Aplicación desplegada**: [`webapp/`](webapp/) es el código fuente de la app Next.js.

## Cómo ejecutarla localmente

Requisitos: Node.js 20+ y npm.

```bash
cd webapp
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — recomendado en un navegador basado en Chromium (Chrome/Edge), ya que la exportación a WebP depende de `canvas.toBlob('image/webp', …)`, que Safari/Firefox no soportan de forma confiable.

```bash
npm run build     # build de producción
npx tsc --noEmit  # type-check
```

## Deploy

La aplicación está desplegada en Vercel (modo preview, acceso público sin login):

**https://webapp-1v68lwuw1-valeria-8449s-projects.vercel.app**

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, 100% client-side (sin backend ni base de datos). El motor de nomenclatura, el recorte de fotografía y el render/exportación del banner viven en `webapp/lib/`; las pantallas del journey en `webapp/components/`.
