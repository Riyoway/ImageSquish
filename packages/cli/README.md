# imgsquish

Compress and resize **JPEG / PNG / WebP** images from the command line.
Powered by [`sharp`](https://sharp.pixelplumbing.com/), fast, and it bundles its
own image libraries, so `npx imgsquish` just works.

By default it **keeps the original format** and just makes the file smaller, either
by lowering quality (JPEG/WebP) or reducing colors (PNG).

```bash
# Compress one file, keeping its format (default preset: balanced)
npx imgsquish photo.jpg

# Compress a whole folder into a new one
npx imgsquish ./images -o ./images-min

# Squeeze PNG screenshots harder (fewer colors)
npx imgsquish -p small "shots/*.png"

# Lower quality and cap the longest side at 1600px
npx imgsquish -q 70 -m 1600 hero.jpg

# Fit under a size limit, quality is chosen automatically
npx imgsquish --max-size 10MB clip.png         # Discord (free)
npx imgsquish -s github-avatar -m 500 me.png   # 1 MB square avatar
npx imgsquish --max-size 300KB -f jpeg pic.png

# See the savings without writing anything
npx imgsquish --dry-run ./images
```

## Fit under a size limit

Tell `imgsquish` how big the file is allowed to be and it binary-searches the
highest quality that fits, downscaling only if it has to.

```bash
npx imgsquish --max-size 10MB photo.jpg     # a size: 500KB, 8MB, 1.5MB
npx imgsquish --max-size discord photo.jpg  # or a known target id
npx imgsquish --list-targets                # 57 targets across 10 categories
```

There are 57 built-in targets across Social, Video, Messaging, Email, Developer,
Community, E-commerce, Productivity, Image hosting and Blogging, for example
`github-avatar` (1 MB), `discord` (10 MB), `gmail` (25 MB), `twitter-avatar`
(2 MB), `youtube-thumbnail` (2 MB) and `shopify` (20 MB). Run `--list-targets`
for the full list.

## Options

```
-p, --preset <id>     Compression preset (default: balanced)
-q, --quality <1-100> Override the preset's quality (for PNG, the color count)
-f, --format <fmt>    Output format: keep, jpeg, png, webp (default: preset)
-m, --max <px>        Resize so the longest side is at most <px>
-s, --max-size <size> Fit under a size limit: a size (500KB, 10MB) or a target
                      name (discord, github-avatar). Quality is automatic.
-o, --out <dir>       Output directory (default: alongside each input)
    --suffix <str>    Filename suffix for outputs (default: "-min")
    --keep-metadata   Preserve EXIF / ICC metadata (stripped by default)
    --lossless        Lossless WebP output
    --dry-run         Report savings without writing files
    --list-presets    List presets and exit
    --list-targets    List size targets and exit
-h, --help            Show help
```

## Presets

| id         | Output          | Best for                                 |
| ---------- | --------------- | ---------------------------------------- |
| `balanced` | keep format q80 | Default. Smaller with no visible loss.   |
| `small`    | keep format q60 | A stronger squeeze, still same format.   |
| `high`     | keep format q92 | Barely any loss, modest savings.         |
| `webp`     | WebP q80        | Smallest result, if you can change format. |

Metadata (EXIF, GPS, ICC) is stripped by default for smaller, more private files.
Pass `--keep-metadata` to preserve it.

## License

MIT
