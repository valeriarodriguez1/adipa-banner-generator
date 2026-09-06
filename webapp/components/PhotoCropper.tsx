'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { applyZoom, initialCrop, panCrop, sWidthToZoom } from '@/lib/cropMath';
import { PhotoState } from '@/lib/types';

interface PhotoCropperProps {
  value: PhotoState | null;
  onChange: (photo: PhotoState | null) => void;
  error?: string;
}

const PREVIEW_DISPLAY_W = 220; // CSS px — el canvas interno sigue renderizando a 514x526 reales.
const PREVIEW_DISPLAY_H = Math.round((PREVIEW_DISPLAY_W * 526) / 514);

export function PhotoCropper({ value, onChange, error }: PhotoCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(0);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !value) return;
    canvas.width = 514;
    canvas.height = 526;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 514, 526);
    const { sx, sy, sWidth, sHeight } = value.crop;
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 514, 526);
  }, [value]);

  // Mantiene imgRef en sincronía con la foto activa (ej. al precargar Edición manual con la
  // foto de la última generación de la sesión), no solo cuando el usuario sube un archivo nuevo.
  useEffect(() => {
    if (!value) {
      imgRef.current = null;
      return;
    }
    if (imgRef.current?.src === value.imageUrl) {
      redraw();
      return;
    }
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setZoom(sWidthToZoom(value.crop.sWidth, value.naturalWidth, value.naturalHeight));
      redraw();
    };
    img.src = value.imageUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.imageUrl]);

  // Redibuja el canvas cada vez que cambia el recuadro de recorte (arrastre o zoom). El efecto de
  // arriba solo depende de la URL de la imagen (para no recargar el <img> en cada pan/zoom), así
  // que sin este efecto el canvas quedaba pintado una sola vez y nunca reflejaba el nuevo encuadre.
  useEffect(() => {
    redraw();
  }, [redraw]);

  function handleFile(file: File) {
    const imageUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const crop = initialCrop(img.naturalWidth, img.naturalHeight);
      setZoom(0);
      onChange({
        file,
        imageUrl,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        crop,
      });
    };
    img.src = imageUrl;
  }

  function handleZoomChange(nextZoom: number) {
    if (!value) return;
    setZoom(nextZoom);
    const nextCrop = applyZoom(value.crop, value.naturalWidth, value.naturalHeight, nextZoom);
    onChange({ ...value, crop: nextCrop });
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current || !value) return;
    const dxDisplay = e.clientX - dragRef.current.x;
    const dyDisplay = e.clientY - dragRef.current.y;
    dragRef.current = { x: e.clientX, y: e.clientY };
    // El arrastre se hace en pixeles de pantalla; se convierte a pixeles naturales de la imagen
    // según la escala actual del recorte (frame 514px representa crop.sWidth px naturales).
    const scaleNaturalPerDisplay = value.crop.sWidth / PREVIEW_DISPLAY_W;
    const nextCrop = panCrop(
      value.crop,
      -dxDisplay * scaleNaturalPerDisplay,
      -dyDisplay * scaleNaturalPerDisplay,
      value.naturalWidth,
      value.naturalHeight,
    );
    onChange({ ...value, crop: nextCrop });
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="photo-file-input" className="text-xs font-medium uppercase tracking-wide text-adipa-purple sm:text-sm">
        Fotografía <span className="text-adipa-danger">*</span>
      </label>
      <p className="text-xs text-adipa-muted">PNG sin fondo.</p>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <label
          htmlFor="photo-file-input"
          className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-adipa-purple px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 sm:px-4 sm:py-2 sm:text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
            <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Selecciona archivo
        </label>
        <span className="text-xs text-adipa-muted">{value?.file.name ?? 'Sin archivos seleccionados'}</span>
      </div>
      <input
        id="photo-file-input"
        type="file"
        accept="image/png"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="sr-only"
      />

      {value && (
        <div className="flex flex-col gap-2 items-start">
          <p className="text-xs text-adipa-muted">
            Arrastra la imagen para ajustar el encuadre y usa el control de zoom. El recuadro final
            mide siempre 514×526 px, igual que el espacio de foto del template.
          </p>
          <canvas
            ref={canvasRef}
            width={514}
            height={526}
            style={{ width: PREVIEW_DISPLAY_W, height: PREVIEW_DISPLAY_H, touchAction: 'none' }}
            className="cursor-move rounded-md border border-adipa-border bg-white"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
          <div className="flex w-full items-center gap-2 sm:gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-adipa-purple">Zoom</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={zoom}
              onChange={(e) => handleZoomChange(Number(e.target.value))}
              className="adipa-zoom-slider flex-1"
              style={{ background: `linear-gradient(to right, #2CB7FF 0%, #704EFD ${zoom * 100}%, #FFFFFF ${zoom * 100}%, #FFFFFF 100%)` }}
            />
          </div>
        </div>
      )}

      {error && <p className="text-xs text-adipa-danger">{error}</p>}
    </div>
  );
}
