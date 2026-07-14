import { FORMAT_MIME, fitToSize, type ImageFormat } from "@image-compressor/core";

export interface CompressOptions {
  format: ImageFormat;
  /**
   * 1 to 100. For JPEG/WebP this is the encoder quality. For PNG it controls
   * how far the colours are reduced. Overridden when targetBytes is set.
   */
  quality: number;
  /** Longest side in px. 0/undefined = no resize. */
  maxDimension?: number;
  /** If > 0, iterate quality/scale to land under this many bytes. */
  targetBytes?: number;
}

export interface CompressOutput {
  blob: Blob;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  /** Quality actually used. */
  quality: number;
  /** A target size was requested but could not be reached. */
  overTarget: boolean;
}

async function decode(file: File): Promise<ImageBitmap> {
  try {
    // "from-image" respects EXIF rotation.
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Could not read this image. It may be corrupt or unsupported.");
  }
}

/** Dimensions after applying the (optional) max-dimension cap. */
function baseSize(bitmap: ImageBitmap, maxDimension?: number) {
  let width = bitmap.width;
  let height = bitmap.height;
  const max = maxDimension ?? 0;
  if (max > 0 && Math.max(width, height) > max) {
    const scale = max / Math.max(width, height);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }
  return { width, height };
}

/** Map a 1 to 100 quality to a per-channel colour-level count for PNG. */
function pngLevels(quality: number): number {
  if (quality >= 98) return 256; // no reduction
  return Math.max(2, Math.round((quality / 100) * 30) + 2);
}

/**
 * Reduce the number of distinct colours in place (posterize). Fewer colours
 * compress far better as PNG, without changing the format.
 */
function reduceColors(data: Uint8ClampedArray, levels: number): void {
  if (levels >= 256) return;
  const step = 255 / (levels - 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(Math.round(data[i] / step) * step);
    data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step);
    data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step);
    // alpha is left untouched
  }
}

function encodeCanvas(
  bitmap: ImageBitmap,
  format: ImageFormat,
  quality: number,
  width: number,
  height: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");

  // JPEG has no alpha, so flatten transparency onto white to avoid going black.
  if (format === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);

  // PNG is lossless, so the only lever that keeps the format is colour count.
  if (format === "png") {
    const levels = pngLevels(quality);
    if (levels < 256) {
      const imageData = ctx.getImageData(0, 0, width, height);
      reduceColors(imageData.data, levels);
      ctx.putImageData(imageData, 0, 0);
    }
  }

  const mime = FORMAT_MIME[format];
  const q = format === "png" ? undefined : quality / 100;
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Encoding failed."))),
      mime,
      q,
    );
  });
}

/**
 * Decode, optionally resize/fit-to-size, and re-encode an image entirely in the
 * browser. Nothing leaves the device.
 */
export async function compressImage(
  file: File,
  opts: CompressOptions,
): Promise<CompressOutput> {
  const bitmap = await decode(file);
  const originalWidth = bitmap.width;
  const originalHeight = bitmap.height;
  const base = baseSize(bitmap, opts.maxDimension);

  try {
    if (opts.targetBytes && opts.targetBytes > 0) {
      const outcome = await fitToSize<Blob>(
        opts.targetBytes,
        async (quality, scale) => {
          const w = Math.max(1, Math.round(base.width * scale));
          const h = Math.max(1, Math.round(base.height * scale));
          const blob = await encodeCanvas(bitmap, opts.format, quality, w, h);
          return { size: blob.size, value: blob };
        },
      );
      return {
        blob: outcome.value,
        width: Math.max(1, Math.round(base.width * outcome.scale)),
        height: Math.max(1, Math.round(base.height * outcome.scale)),
        originalWidth,
        originalHeight,
        quality: outcome.quality,
        overTarget: outcome.overTarget,
      };
    }

    const blob = await encodeCanvas(
      bitmap,
      opts.format,
      opts.quality,
      base.width,
      base.height,
    );
    return {
      blob,
      width: base.width,
      height: base.height,
      originalWidth,
      originalHeight,
      quality: opts.quality,
      overTarget: false,
    };
  } finally {
    bitmap.close?.();
  }
}
