# ImageSquish

Compress **JPEG / PNG / WebP** images down to a smaller size so they fit any
upload limit, without the quality falling off a cliff and without uploading
anything anywhere.

**Live app: [imgsquish.riyo.me](https://imgsquish.riyo.me)** · **CLI: `npx imgsquish`**

Comes in two forms that share the same presets and logic:

- **Web app** is drag & drop in the browser. **Nothing is uploaded.** Everything
  runs locally with the Canvas API, even offline. Includes a draggable
  before/after comparison slider.
- **CLI (`npx imgsquish`)** batch-processes folders from the terminal. Powered by
  [`sharp`](https://sharp.pixelplumbing.com/), so there is nothing else to install.

---

## Why

Most images are far bigger than they need to be. By default this tool **keeps the
original format** and just makes the file smaller, the two easy ways:

- **Fewer colors.** For JPEG and WebP, lower quality. For PNG, it reduces the color
  count, which shrinks the file while keeping it a PNG.
- **Smaller dimensions.** Capping the longest side is the single biggest lever for
  oversized photos.

Converting to WebP is there too if you want the smallest possible result.

The headline feature is **"fit under a size limit"**: give it a target like a
**GitHub avatar (1 MB)** or **Discord's 10 MB cap** and it automatically picks the
highest quality that fits, downscaling only if it has to.

## Fit under a size limit

There are **57 built-in targets across 10 categories**, researched from each
platform's official documentation. In the web app, pick one (or type your own)
under **Fit under a size limit**. On the CLI, use `--max-size 10MB` or a target id
like `--max-size github-avatar`. Run `npx imgsquish --list-targets` to see them all.

### Supported services

- **Social** - X / Twitter (2 MB), Reddit (5 MB), LinkedIn (8 MB), TikTok (10 MB), Pinterest (32 MB)
- **Video** - YouTube thumbnail (2 MB) & banner (6 MB), Kick (4 MB), Vimeo (5 MB), Twitch avatar & banner (10 MB)
- **Messaging** - Discord free (10 MB) / Nitro Basic (50 MB) / Nitro (500 MB), WhatsApp (16 MB), Messenger (25 MB), Microsoft Teams (100 MB), Signal (100 MB), Slack (1 GB), LINE (1 GB), Telegram (2 GB)
- **Email** - iCloud Mail (20 MB), Zoho Mail (20 MB), Gmail (25 MB), Outlook.com (25 MB), Yahoo Mail (25 MB), Proton Mail (25 MB)
- **Developer** - GitHub avatar (1 MB) & image upload (10 MB), Bitbucket (1 MB), Stack Overflow (2 MB), GitLab (100 MB)
- **Community** - Bluesky (1 MB), Discourse (10 MB), Mastodon (16 MB), Reddit post (20 MB)
- **E-commerce** - Amazon (10 MB), Etsy (10 MB), Mercari (10 MB), eBay (12 MB), Shopify (20 MB)
- **Productivity** - Notion (5 MB), Trello (10 MB), Google Docs (50 MB), Confluence (100 MB), Asana (100 MB)
- **Image hosting** - Cloudinary (10 MB), Imgur (20 MB), ImgBB (32 MB), Postimages (32 MB), Flickr (100 MB)
- **Blogging** - Ghost (5 MB), Substack (10 MB), Squarespace (20 MB), Tumblr (20 MB), Medium (25 MB), Wix (25 MB)

Upload limits are researched from public documentation and may change. ImageSquish
is not affiliated with or endorsed by any listed service. All product names and
logos are trademarks of their respective owners.

## Presets

| id         | Output          | Best for                                 |
| ---------- | --------------- | ---------------------------------------- |
| `balanced` | keep format q80 | Default. Smaller with no visible loss.   |
| `small`    | keep format q60 | A stronger squeeze, still same format.   |
| `high`     | keep format q92 | Barely any loss, modest savings.         |
| `webp`     | WebP q80        | Smallest result, if you can change format. |

---

## CLI

```bash
# Compress a single file, keeping its format (default: balanced)
npx imgsquish photo.jpg

# Compress a whole folder into a new one
npx imgsquish ./images -o ./images-min

# Fit under a platform's limit (quality chosen automatically)
npx imgsquish -s discord photo.png
npx imgsquish -s github-avatar -m 500 avatar.png

# See the savings without writing anything
npx imgsquish --dry-run ./images
```

See [`packages/cli/README.md`](packages/cli/README.md) for the full option list.

## Web app

```bash
npm install
npm run dev:web      # start the dev server
npm run build:web    # production build to packages/web/dist
```

Open the dev URL, drop in images, tweak the settings, and download the results.

---

## Development

This is an npm-workspaces monorepo:

```
packages/
  core/   shared presets, size targets + helpers (dependency-free TS)
  cli/    npx tool (sharp)
  web/    Vite + React + TypeScript web app (Canvas API)
```

```bash
npm install            # install all workspaces
npm run build:cli      # build the CLI to packages/cli/dist
npm run build:web      # build the web app
npm run build          # build both
```

## License

MIT
