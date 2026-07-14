/**
 * Image format helpers shared by the CLI and the web app.
 *
 * We deliberately support only the three formats every browser can both decode
 * AND re-encode (so the web app can do everything locally): JPEG, PNG, WebP.
 */

/** A concrete output image format. */
export type ImageFormat = "jpeg" | "png" | "webp";

/** A preset/UI choice for the output format. "keep" means "same as input". */
export type OutputFormat = "keep" | ImageFormat;

/** File extension used for each output format. */
export const FORMAT_EXT: Record<ImageFormat, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

/** MIME type used for each output format. */
export const FORMAT_MIME: Record<ImageFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

/** Human label for each format. */
export const FORMAT_LABEL: Record<OutputFormat, string> = {
  keep: "Keep original",
  jpeg: "JPEG",
  png: "PNG",
  webp: "WebP",
};

/** PNG is lossless. The quality setting instead controls colour reduction. */
export function isLossless(format: ImageFormat): boolean {
  return format === "png";
}

/** Map a file name or extension to a known format, or undefined. */
export function formatFromExtension(nameOrExt: string): ImageFormat | undefined {
  const ext = nameOrExt.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "jpeg";
    case "png":
      return "png";
    case "webp":
      return "webp";
    default:
      return undefined;
  }
}

/** Map a MIME type to a known format, or undefined. */
export function formatFromMime(mime: string): ImageFormat | undefined {
  switch (mime) {
    case "image/jpeg":
      return "jpeg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return undefined;
  }
}

/** Format a byte count as a short human string, e.g. "1.4 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Percentage size reduction from `before` to `after`.
 * Positive = smaller. Can be negative if re-encoding made the file bigger.
 */
export function reductionPercent(before: number, after: number): number {
  if (before <= 0) return 0;
  return ((before - after) / before) * 100;
}
