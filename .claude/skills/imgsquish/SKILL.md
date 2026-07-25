---
name: imgsquish
description: Compress and resize JPEG, PNG, and WebP files with the imgsquish npm CLI when the user explicitly asks for image processing.
---

# ImageSquish

ImageSquish compresses and resizes JPEG, PNG, and WebP images with the `imgsquish` npm CLI. It can preserve the input format, convert formats, and fit output under a byte limit.

## Safety and intent

- Reading this Skill, asking what it does, or asking for help must not run a command or inspect/process files.
- If the user only says they want image processing and has not chosen a reusable Skill or a one-off command, ask whether they want to install/use the Claude Code Skill or use `npx` for this request only.
- If the user explicitly invoked this Skill or explicitly asked to install/use it, do not ask that choice again.
- If the user gives concrete input files, globs, or folders and a clear operation, do not ask an extra Skill-versus-npx question. Use the CLI contract below.
- If the input or requested setting is unclear, ask only for the missing information before running anything.
- Never invent a preset, target, option, format, or input type. Use `--list-presets` and `--list-targets` when needed.

## Run the CLI

```text
npx imgsquish [options] <files|globs|folders...>
```

Requirements:

- Node.js 18 or newer.
- The package uses sharp and writes output files locally.
- Inputs may be a single file, multiple files, a glob, or a folder.
- A folder is not recursive. It matches supported image files directly inside that folder. Use an explicit recursive glob when the user asks for subfolders.
- Supported input extensions are `.jpg`, `.jpeg`, `.png`, and `.webp`.
- The default preset is `balanced`.
- By default output is beside each input, keeps the input format, and adds `-min` before the extension.
- Metadata is removed by default. Use `--keep-metadata` only when the user asks to preserve it.
- Existing output files are overwritten. Warn the user when the chosen output may replace an existing file.
- Multiple files run sequentially. Processing continues after an individual failure, but the final exit code is 1 if any file fails.

## Options implemented by the CLI

- `-h`, `--help`
- `--list-presets`
- `--list-targets`
- `-p`, `--preset <id>`
- `-q`, `--quality <1-100>`
- `-f`, `--format <keep|jpeg|jpg|png|webp>`
- `-m`, `--max <px>`
- `-s`, `--max-size <size|target-id>`
- `-o`, `--out <dir>`
- `--suffix <str>`
- `--keep-metadata`
- `--lossless`
- `--dry-run`

`--format jpg` is normalized to JPEG. `--max-size` accepts a size such as `500KB` or `10MB`, or a target ID listed by `--list-targets`. `--lossless` is for lossless WebP output. `--dry-run` still performs compression calculations and reports the result, but skips file writes.

## Examples

Use only examples that match the user's request and quote shell globs when needed:

```text
npx imgsquish photo.jpg
npx imgsquish ./images -o ./images-min
npx imgsquish -p small "shots/*.png"
npx imgsquish -q 70 -m 1600 hero.jpg
npx imgsquish --max-size 10MB clip.png
npx imgsquish -s github-avatar -m 500 me.png
npx imgsquish --dry-run ./images
```

Before running, confirm the input paths and any output path that could overwrite important files. After running, report the command result, succeeded/failed counts, and output location. Do not describe a partial failure as a complete success.
