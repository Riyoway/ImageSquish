import sharp from "sharp";
import type { ImageFormat } from "@image-compressor/core";

export interface CompressOptions {
  format: ImageFormat;
  /** 1 to 100. For PNG, drives palette colour reduction. */
  quality: number;
  /** Longest side in px. 0/undefined = no resize. */
  maxDimension?: number;
  /** Keep EXIF / ICC metadata (stripped by default). */
  keepMetadata?: boolean;
  /** Lossless encoding (webp only; png is always lossless). */
  lossless?: boolean;
}

export interface CompressResult {
  data: Buffer;
  width: number;
  height: number;
}

/** Compress (and optionally resize / convert) a single image buffer or path. */
export async function compress(
  input: string | Buffer,
  opts: CompressOptions,
): Promise<CompressResult> {
  // `.rotate()` with no args bakes in the EXIF orientation so the output is
  // upright regardless of how the camera stored it.
  let pipeline = sharp(input, { failOn: "none" }).rotate();

  if (opts.maxDimension && opts.maxDimension > 0) {
    pipeline = pipeline.resize({
      width: opts.maxDimension,
      height: opts.maxDimension,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  if (opts.keepMetadata) {
    pipeline = pipeline.withMetadata();
  }

  const q = Math.max(1, Math.min(100, Math.round(opts.quality)));
  switch (opts.format) {
    case "jpeg":
      pipeline = pipeline.jpeg({ quality: q, mozjpeg: true });
      break;
    case "webp":
      pipeline = pipeline.webp(
        opts.lossless ? { lossless: true } : { quality: q },
      );
      break;
    case "png":
      // PNG is lossless; `quality` drives sharp's palette quantization, which
      // is where the real savings come from.
      pipeline = pipeline.png({ quality: q, compressionLevel: 9, palette: true });
      break;
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Read an image's pixel dimensions without fully decoding it. */
export async function imageSize(
  input: string | Buffer,
): Promise<{ width: number; height: number }> {
  const meta = await sharp(input, { failOn: "none" }).metadata();
  // Account for EXIF orientation that swaps width/height (orientation 5 to 8).
  const swap = (meta.orientation ?? 0) >= 5;
  const width = (swap ? meta.height : meta.width) ?? 0;
  const height = (swap ? meta.width : meta.height) ?? 0;
  return { width, height };
}
