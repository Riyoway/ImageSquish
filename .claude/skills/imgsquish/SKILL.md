---
name: imgsquish
description: Compress and resize JPEG, PNG, and WebP files with the imgsquish npm CLI when the user explicitly asks for image processing.
---

# ImageSquish

ImageSquish compresses and resizes JPEG, PNG, and WebP files locally with sharp. It can keep the input format, convert to JPEG, PNG, or WebP, resize the longest side, and fit output under a byte limit.

## Safety and intent

- Reading this Skill, asking what it does, or asking for help must not run a command or inspect or process files.
- If the user only asks for image processing without choosing a reusable Skill or one-off run, ask which they want before acting.
- If the user explicitly invoked this Skill or explicitly asked to install or use it, do not ask that choice again.
- If the user provides concrete input files, folders, or globs and a clear operation, do not ask the Skill-versus-npx question again.
- If the input path, operation, preset, target, format, or output location is unclear, ask only for the missing information.
- Respond in the user's language.
- Do not invent presets, options, formats, target IDs, or recursive behavior. Use `--list-presets` and `--list-targets` when needed.

## Run the CLI

```text
npx imgsquish [options] <files|globs|folders...>
```

Node.js 18 or newer is required. The package bundles the native image libraries through sharp.

## Choose a preset or target from the request

Use a preset for a general compression preference. Use a size target when the user names a service or a hard upload limit.

### Presets

| User request | Preset | Behavior |
| --- | --- | --- |
| Normal compression, keep the format | `balanced` | Keep format, quality 80 |
| Smaller file, keep the format | `small` | Keep format, quality 60 |
| Highest quality with some savings | `high` | Keep format, quality 92 |
| Smallest result and format conversion is allowed | `webp` | Convert to WebP, quality 80 |

The default preset is `balanced`. A preset can be combined with `-q`, `-f`, `-m`, or `-s` when the user asks for an override.

### Service and platform targets

Use the exact target ID with `--max-size <id>`:

- Social: `twitter-avatar` 2 MB, `reddit-avatar` 5 MB, `linkedin-avatar` 8 MB, `tiktok-avatar` 10 MB, `pinterest-avatar` 32 MB.
- Video: `youtube-thumbnail` 2 MB, `kick-avatar` 4 MB, `vimeo-avatar` 5 MB, `youtube-banner` 6 MB, `twitch-avatar` 10 MB, `twitch-banner` 10 MB.
- Messaging: `discord` 10 MB, `whatsapp-photo` 16 MB, `messenger-attachment` 25 MB, `discord-nitro-basic` 50 MB, `microsoft-teams` 100 MB, `signal` 100 MB, `discord-nitro` 500 MB, `slack` 1 GB, `line` 1 GB, `telegram` 2 GB.
- Email: `icloud-mail` 20 MB, `zoho-mail` 20 MB, `gmail` 25 MB, `outlook` 25 MB, `yahoo-mail` 25 MB, `proton-mail` 25 MB.
- Developer: `github-avatar` 1 MB, `bitbucket` 1 MB, `stackoverflow` 2 MB, `github` 10 MB, `gitlab` 100 MB.
- Community: `bluesky` 1 MB, `discourse` 10 MB, `mastodon` 16 MB, `reddit-post` 20 MB.
- E-commerce: `amazon-seller` 10 MB, `etsy` 10 MB, `mercari` 10 MB, `ebay` 12 MB, `shopify` 20 MB.
- Productivity: `notion` 5 MB, `trello` 10 MB, `google-docs` 50 MB, `confluence` 100 MB, `asana` 100 MB.
- Image hosting: `cloudinary` 10 MB, `imgur` 20 MB, `imgbb` 32 MB, `postimages` 32 MB, `flickr` 100 MB.
- Blogging: `ghost` 5 MB, `substack` 10 MB, `squarespace` 20 MB, `tumblr` 20 MB, `medium` 25 MB, `wix` 25 MB.

Examples of interpreting requests:

- “Make this fit Discord” means `--max-size discord`, currently 10 MB for the free target.
- “Make this fit a GitHub avatar” means `--max-size github-avatar`, currently 1 MB. Add `-m 500` only when the user asks for a 500 px longest side or square-avatar sizing.
- “Make it fit under 8 MB” means `--max-size 8MB`, not a guessed service target.
- “Use the Twitter avatar limit” means `--max-size twitter-avatar`.
- If the user names an unsupported or ambiguous service, run or consult `--list-targets` and ask for the intended limit instead of inventing one.
- These limits can change. Treat the built-in target as a practical limit, not a promise from the service.

## CLI options

- `-h`, `--help`: print help and exit.
- `--list-presets`: print preset IDs and descriptions and exit.
- `--list-targets`: print all target IDs grouped by category and exit.
- `-p`, `--preset <id>`: choose a preset. Default is `balanced`.
- `-q`, `--quality <1-100>`: override quality. For PNG this controls the color count rather than encoder quality.
- `-f`, `--format <keep|jpeg|jpg|png|webp>`: choose output format. `jpg` is normalized to `jpeg`.
- `-m`, `--max <px>`: cap the longest side at the specified pixel count. It does not enlarge smaller images.
- `-s`, `--max-size <size|target-id>`: fit under a size such as `500KB`, `10MB`, or a built-in target ID. Quality is searched automatically.
- `-o`, `--out <dir>`: write outputs to this directory. The directory is created when needed.
- `--suffix <str>`: replace the default `-min` filename suffix.
- `--keep-metadata`: preserve EXIF and ICC metadata. Metadata is removed by default.
- `--lossless`: request lossless WebP output.
- `--dry-run`: perform compression calculations and report savings without writing files.

The parser expects each option value in the next argument. Use `--max-size discord`, not a made-up flag or target name.

## Inputs and outputs

- Supported input extensions are `.jpg`, `.jpeg`, `.png`, and `.webp`.
- Inputs can be one file, multiple files, a glob, or a folder.
- A folder matches supported files directly inside it. It is not recursive. Use an explicit recursive glob such as `"images/**/*.png"` for subfolders.
- By default each output is beside its input, keeps the input format, and adds `-min` before the extension.
- Existing output files are overwritten by `writeFile`. Warn the user when this can replace an important file.
- JPEG uses mozjpeg. WebP uses the requested quality or lossless mode. PNG uses palette compression and reduces colors according to quality.
- EXIF orientation is applied during processing. JPEG output fills transparent areas with white.
- Multiple files are processed sequentially. Processing continues after an individual failure, but the final exit code is 1 if any file fails.
- Report the succeeded count, failed count, total size change, and output location. Never describe a partial failure as complete success.

## Examples

```text
npx imgsquish photo.jpg
npx imgsquish ./images -o ./images-min
npx imgsquish -p small "shots/*.png"
npx imgsquish -q 70 -m 1600 hero.jpg
npx imgsquish --format webp photo.jpg
npx imgsquish --max-size discord clip.png
npx imgsquish --max-size github-avatar -m 500 avatar.png
npx imgsquish --max-size 300KB -f jpeg pic.png
npx imgsquish --keep-metadata photo.jpg
npx imgsquish --lossless -f webp artwork.png
npx imgsquish --dry-run ./images
npx imgsquish "images/**/*.png" -p small
```

Before running a write command, confirm the input paths and any output path that could overwrite important files. If the user only asks for an explanation, show the command but do not run it.
