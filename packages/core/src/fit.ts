/**
 * "Fit under a target file size" search, shared by the CLI and the web app.
 *
 * The encoding itself is surface-specific (sharp vs. canvas), so this takes an
 * `encode(quality, scale)` callback and drives it. Strategy:
 *
 *  1. At full resolution, binary-search the highest quality that fits.
 *  2. If even the lowest quality is still too big, downscale a step and retry.
 *
 * That preserves resolution for as long as possible (dropping quality first),
 * which is what you want for "just get it under the limit".
 */

export interface FitOptions {
  /** Lowest quality to consider (default 35). */
  minQuality?: number;
  /** Highest quality to consider (default 92). */
  maxQuality?: number;
  /** Resolution scales to try, largest first (default 1 → 0.3). */
  scaleSteps?: number[];
}

export interface FitOutcome<T> {
  /** Quality of the chosen result. */
  quality: number;
  /** Resolution scale of the chosen result (1 = original). */
  scale: number;
  /** Final encoded size in bytes. */
  size: number;
  /** The encoded artifact (Blob, Buffer, …). */
  value: T;
  /** True if even the smallest attempt still exceeded the target. */
  overTarget: boolean;
}

export async function fitToSize<T>(
  targetBytes: number,
  encode: (quality: number, scale: number) => Promise<{ size: number; value: T }>,
  options: FitOptions = {},
): Promise<FitOutcome<T>> {
  const minQ = options.minQuality ?? 35;
  const maxQ = options.maxQuality ?? 92;
  const scales = options.scaleSteps ?? [1, 0.85, 0.72, 0.6, 0.5, 0.4, 0.3];

  // The smallest output we've produced anywhere, as a fallback if nothing fits.
  let smallest: Omit<FitOutcome<T>, "overTarget"> | null = null;

  for (const scale of scales) {
    let lo = minQ;
    let hi = maxQ;
    let best: Omit<FitOutcome<T>, "overTarget"> | null = null;

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const r = await encode(mid, scale);
      const candidate = { quality: mid, scale, size: r.size, value: r.value };
      if (!smallest || candidate.size < smallest.size) smallest = candidate;

      if (r.size <= targetBytes) {
        best = candidate;
        lo = mid + 1; // it fits, so try to push quality higher
      } else {
        hi = mid - 1; // too big, so back off
      }
    }

    if (best) return { ...best, overTarget: false };
  }

  return { ...(smallest as Omit<FitOutcome<T>, "overTarget">), overTarget: true };
}
