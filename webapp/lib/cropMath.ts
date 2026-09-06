import { CropState } from './types';

export const CROP_FRAME_W = 514;
export const CROP_FRAME_H = 526;
const FRAME_ASPECT = CROP_FRAME_W / CROP_FRAME_H;

/** Largest source rect (covering the whole frame, no letterboxing) centered on the image. */
export function initialCrop(naturalWidth: number, naturalHeight: number): CropState {
  const imageAspect = naturalWidth / naturalHeight;
  let sWidth: number;
  let sHeight: number;
  if (imageAspect > FRAME_ASPECT) {
    // image relatively wider than frame -> full height, cropped width
    sHeight = naturalHeight;
    sWidth = sHeight * FRAME_ASPECT;
  } else {
    sWidth = naturalWidth;
    sHeight = sWidth / FRAME_ASPECT;
  }
  return {
    sx: (naturalWidth - sWidth) / 2,
    sy: (naturalHeight - sHeight) / 2,
    sWidth,
    sHeight,
  };
}

/** Max zoom-out: the full initial (cover) crop. Min sWidth (max zoom-in): 15% of the image. */
export function zoomBounds(naturalWidth: number, naturalHeight: number) {
  const cover = initialCrop(naturalWidth, naturalHeight);
  const maxSWidth = cover.sWidth;
  const minSWidth = maxSWidth * 0.15;
  return { minSWidth, maxSWidth };
}

/** Applies a new zoom level (0 = fully zoomed out/cover, 1 = max zoom-in), keeping the crop centered. */
export function applyZoom(crop: CropState, naturalWidth: number, naturalHeight: number, zoom: number): CropState {
  const { minSWidth, maxSWidth } = zoomBounds(naturalWidth, naturalHeight);
  const sWidth = maxSWidth - zoom * (maxSWidth - minSWidth);
  const sHeight = sWidth / FRAME_ASPECT;
  const centerX = crop.sx + crop.sWidth / 2;
  const centerY = crop.sy + crop.sHeight / 2;
  return clampCrop({ sx: centerX - sWidth / 2, sy: centerY - sHeight / 2, sWidth, sHeight }, naturalWidth, naturalHeight);
}

/** Pans the crop by a delta expressed in natural-image pixels, clamped to the image bounds. */
export function panCrop(crop: CropState, dx: number, dy: number, naturalWidth: number, naturalHeight: number): CropState {
  return clampCrop({ ...crop, sx: crop.sx + dx, sy: crop.sy + dy }, naturalWidth, naturalHeight);
}

export function clampCrop(crop: CropState, naturalWidth: number, naturalHeight: number): CropState {
  const sWidth = Math.min(crop.sWidth, naturalWidth);
  const sHeight = Math.min(crop.sHeight, naturalHeight);
  const sx = Math.min(Math.max(crop.sx, 0), Math.max(naturalWidth - sWidth, 0));
  const sy = Math.min(Math.max(crop.sy, 0), Math.max(naturalHeight - sHeight, 0));
  return { sx, sy, sWidth, sHeight };
}

/** Converts an sWidth back into the [0,1] zoom slider value. */
export function sWidthToZoom(sWidth: number, naturalWidth: number, naturalHeight: number): number {
  const { minSWidth, maxSWidth } = zoomBounds(naturalWidth, naturalHeight);
  if (maxSWidth === minSWidth) return 0;
  return (maxSWidth - sWidth) / (maxSWidth - minSWidth);
}
