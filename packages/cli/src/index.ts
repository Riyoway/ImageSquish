import { resolve, dirname, basename, extname, join } from "node:path";
import { stat, mkdir, readFile, writeFile } from "node:fs/promises";
import { glob } from "tinyglobby";
import {
  PRESETS,
  getPreset,
  DEFAULT_PRESET_ID,
  FORMAT_EXT,
  formatFromExtension,
  formatBytes,
  reductionPercent,
  parseSize,
  getSizeTarget,
  SIZE_TARGETS,
  fitToSize,
  type OutputFormat,
  type ImageFormat,
  type Preset,
} from "@image-compressor/core";
import { compress, imageSize, type CompressResult } from "./compress.js";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

interface Options {
  inputs: string[];
  presetId: string;
  outDir?: string;
  suffix: string;
  format?: OutputFormat; // override the preset's format
  quality?: number; // override the preset's quality
  maxDimension?: number;
  targetBytes?: number; // fit under this many bytes
  keepMetadata: boolean;
  lossless: boolean;
  dryRun: boolean;
}

function parseArgs(
  argv: string[],
): Options | { help: true } | { listPresets: true } | { listTargets: true } {
  const opts: Options = {
    inputs: [],
    presetId: DEFAULT_PRESET_ID,
    suffix: "-min",
    keepMetadata: false,
    lossless: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case "-h":
      case "--help":
        return { help: true };
      case "--list-presets":
        return { listPresets: true };
      case "--list-targets":
        return { listTargets: true };
      case "-p":
      case "--preset":
        opts.presetId = next();
        break;
      case "-q":
      case "--quality":
        opts.quality = parseInt(next(), 10);
        break;
      case "-f":
      case "--format": {
        const f = next().replace(/^\./, "").toLowerCase();
        if (!["keep", "jpeg", "jpg", "png", "webp"].includes(f)) {
          throw new Error(`Unsupported format "${f}". Use keep, jpeg, png or webp.`);
        }
        opts.format = (f === "jpg" ? "jpeg" : f) as OutputFormat;
        break;
      }
      case "-m":
      case "--max":
        opts.maxDimension = parseInt(next(), 10);
        break;
      case "-s":
      case "--max-size": {
        const raw = next();
        // Allow a platform name (e.g. "discord") or a size (e.g. "10MB").
        const target = getSizeTarget(raw);
        const bytes = target ? target.bytes : parseSize(raw);
        if (!bytes) {
          throw new Error(
            `Invalid size "${raw}". Use a size like 500KB / 10MB, or a target name (run --list-targets).`,
          );
        }
        opts.targetBytes = bytes;
        break;
      }
      case "-o":
      case "--out":
        opts.outDir = next();
        break;
      case "--suffix":
        opts.suffix = next();
        break;
      case "--keep-metadata":
        opts.keepMetadata = true;
        break;
      case "--lossless":
        opts.lossless = true;
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      default:
        if (a.startsWith("-")) {
          throw new Error(`Unknown option: ${a}`);
        }
        opts.inputs.push(a);
    }
  }
  return opts;
}

function printHelp(): void {
  const presetList = PRESETS.map(
    (p) =>
      `    ${p.id.padEnd(10)} ${p.label} · ${p.format === "keep" ? "keep format" : p.format}, q${p.quality}`,
  ).join("\n");
  console.log(`
imgsquish · compress and resize JPEG / PNG / WebP images

USAGE
  npx imgsquish [options] <files|globs|folders...>

EXAMPLES
  npx imgsquish photo.jpg                        # keep the format, just smaller
  npx imgsquish ./images -o ./images-min
  npx imgsquish -p small "shots/*.png"           # fewer PNG colors
  npx imgsquish -q 70 -m 1600 hero.jpg
  npx imgsquish --max-size 10MB clip.png         # fit under Discord's limit
  npx imgsquish -s github-avatar -m 500 me.png   # fit a 1MB square avatar
  npx imgsquish --dry-run ./images

OPTIONS
  -p, --preset <id>     Compression preset (default: ${DEFAULT_PRESET_ID})
  -q, --quality <1-100> Override the preset's quality (for PNG, the color count)
  -f, --format <fmt>    Output format: keep, jpeg, png, webp (default: preset)
  -m, --max <px>        Resize so the longest side is at most <px>
  -s, --max-size <size> Fit under a size limit: a size (500KB, 10MB) or a
                        target name (discord, github-avatar, …). Quality is
                        chosen automatically.
  -o, --out <dir>       Output directory (default: alongside each input)
      --suffix <str>    Filename suffix for outputs (default: "-min")
      --keep-metadata   Preserve EXIF / ICC metadata (stripped by default)
      --lossless        Lossless WebP output
      --dry-run         Report savings without writing files
      --list-presets    List presets and exit
      --list-targets    List size targets and exit
  -h, --help            Show this help

PRESETS
${presetList}
`);
}

async function resolveInputs(inputs: string[]): Promise<string[]> {
  const files = new Set<string>();
  for (const input of inputs) {
    let isDir = false;
    try {
      isDir = (await stat(input)).isDirectory();
    } catch {
      // not a plain path, so treat as a glob below
    }
    if (isDir) {
      const found = await glob(
        IMAGE_EXTENSIONS.map((e) => `*${e}`),
        { cwd: resolve(input), absolute: true },
      );
      found.forEach((f) => files.add(f));
    } else if (/[*?{}[\]]/.test(input)) {
      const found = await glob(input, { absolute: true });
      found.forEach((f) => files.add(f));
    } else {
      files.add(resolve(input));
    }
  }
  return [...files].filter((f) => IMAGE_EXTENSIONS.includes(extname(f).toLowerCase()));
}

function resolveFormat(input: string, preset: Preset, opts: Options): ImageFormat {
  const choice: OutputFormat = opts.format ?? preset.format;
  if (choice !== "keep") return choice;
  const fromExt = formatFromExtension(input);
  return fromExt ?? "jpeg";
}

function outputPathFor(input: string, format: ImageFormat, opts: Options): string {
  const ext = `.${FORMAT_EXT[format]}`;
  const name = basename(input, extname(input)) + opts.suffix + ext;
  const dir = opts.outDir ? resolve(opts.outDir) : dirname(input);
  return join(dir, name);
}

async function ensureDir(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

async function compressOnce(
  original: Buffer,
  format: ImageFormat,
  opts: Options,
): Promise<{ result: CompressResult; quality: number; overTarget: boolean }> {
  // Fit-under-a-size mode: search quality (and downscale if needed).
  if (opts.targetBytes && opts.targetBytes > 0) {
    const { width, height } = await imageSize(original);
    const longest = Math.max(width, height);
    const startLongest =
      opts.maxDimension && opts.maxDimension > 0
        ? Math.min(opts.maxDimension, longest)
        : longest;
    const isPng = format === "png";

    const outcome = await fitToSize<CompressResult>(
      opts.targetBytes,
      async (quality, scale) => {
        const dim = Math.max(1, Math.round(startLongest * scale));
        const r = await compress(original, {
          format,
          quality,
          maxDimension: dim,
          keepMetadata: opts.keepMetadata,
          lossless: opts.lossless,
        });
        return { size: r.data.length, value: r };
      },
      isPng ? { minQuality: 80, maxQuality: 80 } : { minQuality: 35, maxQuality: 92 },
    );

    return { result: outcome.value, quality: outcome.quality, overTarget: outcome.overTarget };
  }

  // Plain mode: a single encode at the requested quality.
  const quality = opts.quality ?? getPreset(opts.presetId)!.quality;
  const result = await compress(original, {
    format,
    quality,
    maxDimension: opts.maxDimension,
    keepMetadata: opts.keepMetadata,
    lossless: opts.lossless,
  });
  return { result, quality, overTarget: false };
}

async function processFile(
  input: string,
  preset: Preset,
  opts: Options,
): Promise<{ before: number; after: number }> {
  const label = basename(input);
  const format = resolveFormat(input, preset, opts);

  const original = await readFile(input);
  const { result, quality, overTarget } = await compressOnce(original, format, opts);

  const before = original.length;
  const after = result.data.length;
  const pct = reductionPercent(before, after);
  const arrow = `${formatBytes(before)} → ${formatBytes(after)}`;
  const delta = `${pct >= 0 ? "−" : "+"}${Math.abs(pct).toFixed(0)}%`;
  const meta = `${result.width}×${result.height} ${format}${format !== "png" ? ` q${quality}` : ""}`;
  const warn = overTarget ? "  ⚠ over limit" : "";

  if (opts.dryRun) {
    console.log(`  ${label}  ${arrow}  (${delta})  ${meta}${warn}`);
    return { before, after };
  }

  const out = outputPathFor(input, format, opts);
  await ensureDir(out);
  await writeFile(out, result.data);
  console.log(`  ${label}  ${arrow}  (${delta})  ✓ ${basename(out)}${warn}`);
  return { before, after };
}

async function main(): Promise<void> {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(`Error: ${(e as Error).message}`);
    process.exit(1);
  }

  if ("help" in parsed) {
    printHelp();
    return;
  }
  if ("listPresets" in parsed) {
    for (const p of PRESETS) {
      console.log(
        `${p.id.padEnd(10)} ${p.label}\n  ${p.description}\n`,
      );
    }
    return;
  }
  if ("listTargets" in parsed) {
    console.log("Size targets (use with --max-size <id>):\n");
    let lastCategory = "";
    for (const t of SIZE_TARGETS) {
      if (t.category !== lastCategory) {
        console.log(`  ${t.category}`);
        lastCategory = t.category;
      }
      console.log(`    ${t.id.padEnd(22)} ${t.label}`);
    }
    console.log("\nOr pass a size directly, e.g. --max-size 500KB / --max-size 8MB\n");
    return;
  }

  const opts = parsed;
  if (opts.inputs.length === 0) {
    printHelp();
    process.exit(1);
  }

  const preset = getPreset(opts.presetId);
  if (!preset) {
    console.error(
      `Error: unknown preset "${opts.presetId}". Run --list-presets to see the options.`,
    );
    process.exit(1);
  }

  const files = await resolveInputs(opts.inputs);
  if (files.length === 0) {
    console.error("No image files matched the given inputs (jpg, png, webp).");
    process.exit(1);
  }

  const mode = opts.targetBytes
    ? `fit ≤ ${formatBytes(opts.targetBytes)}`
    : `preset "${preset.id}"`;
  console.log(
    `\nimgsquish · ${mode} · ${files.length} file(s)` +
      (opts.dryRun ? " · dry run" : "") +
      "\n",
  );

  let ok = 0;
  let failed = 0;
  let totalBefore = 0;
  let totalAfter = 0;
  for (const file of files) {
    try {
      const { before, after } = await processFile(file, preset, opts);
      totalBefore += before;
      totalAfter += after;
      ok++;
    } catch (e) {
      failed++;
      console.error(`  ✗ ${basename(file)}: ${(e as Error).message}`);
    }
  }

  const pct = reductionPercent(totalBefore, totalAfter);
  console.log(
    `\nDone. ${ok} succeeded${failed ? `, ${failed} failed` : ""}.` +
      (ok > 0
        ? `  ${formatBytes(totalBefore)} → ${formatBytes(totalAfter)} ` +
          `(saved ${pct >= 0 ? "" : "−"}${Math.abs(pct).toFixed(0)}%)`
        : "") +
      "\n",
  );
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
