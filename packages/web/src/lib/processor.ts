import {
  FORMAT_EXT,
  formatFromMime,
  formatFromExtension,
  type ImageFormat,
  type OutputFormat,
} from "@image-compressor/core";
import { compressImage } from "../image/compress";

export interface ProcessSettings {
  format: OutputFormat;
  quality: number;
  maxDimension: number;
  /** If > 0, compress to land under this many bytes. */
  targetBytes: number;
}

export interface ProcessResult {
  blob: Blob;
  outputName: string;
  format: ImageFormat;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  /** Quality actually used. */
  quality: number;
  /** A target size was requested but could not be reached. */
  overTarget: boolean;
}

/** Resolve "keep" against the input file's actual format. */
function resolveFormat(file: File, output: OutputFormat): ImageFormat {
  if (output !== "keep") return output;
  return formatFromMime(file.type) ?? formatFromExtension(file.name) ?? "jpeg";
}

function outputName(inputName: string, format: ImageFormat): string {
  const dot = inputName.lastIndexOf(".");
  const base = dot >= 0 ? inputName.slice(0, dot) : inputName;
  return `${base}-min.${FORMAT_EXT[format]}`;
}

export async function processFile(
  file: File,
  settings: ProcessSettings,
): Promise<ProcessResult> {
  const format = resolveFormat(file, settings.format);
  const out = await compressImage(file, {
    format,
    quality: settings.quality,
    maxDimension: settings.maxDimension,
    targetBytes: settings.targetBytes,
  });

  return {
    blob: out.blob,
    outputName: outputName(file.name, format),
    format,
    originalSize: file.size,
    compressedSize: out.blob.size,
    width: out.width,
    height: out.height,
    originalWidth: out.originalWidth,
    originalHeight: out.originalHeight,
    quality: out.quality,
    overTarget: out.overTarget,
  };
}
