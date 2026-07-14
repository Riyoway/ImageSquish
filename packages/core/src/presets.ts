/**
 * Compression presets shared by the CLI and the web app.
 *
 * The default keeps the original format and just makes the file smaller, since
 * that is what most people want. Converting to WebP is offered as an explicit
 * choice. Every surface also lets you override the format, quality and resize
 * on their own, so a preset is only a starting point.
 */

import type { OutputFormat } from "./format";

export interface Preset {
  /** Stable id used on the CLI (`--preset <id>`) and in the web UI. */
  id: string;
  /** Human readable name. */
  label: string;
  /** Short explanation of when to use it. */
  description: string;
  /** Target output format ("keep" = same format as the input). */
  format: OutputFormat;
  /**
   * Encode quality, 1 to 100. For JPEG and WebP this is the encoder quality.
   * For PNG it drives how far the colours are reduced (fewer colours, smaller
   * file). 100 keeps every colour.
   */
  quality: number;
}

export const PRESETS: Preset[] = [
  {
    id: "balanced",
    label: "Balanced",
    description:
      "Keep the original format at 80% quality. Smaller files with no visible loss on most images.",
    format: "keep",
    quality: 80,
  },
  {
    id: "small",
    label: "Smaller",
    description:
      "Keep the original format at 60% quality. A stronger squeeze for when you really need the size down.",
    format: "keep",
    quality: 60,
  },
  {
    id: "high",
    label: "High quality",
    description:
      "Keep the original format at 92% quality. Barely any loss, with modest savings.",
    format: "keep",
    quality: 92,
  },
  {
    id: "webp",
    label: "Convert to WebP",
    description:
      "Switch to WebP at 80% quality. Usually the smallest result, if you are fine changing the format.",
    format: "webp",
    quality: 80,
  },
];

export const DEFAULT_PRESET_ID = "balanced";

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
