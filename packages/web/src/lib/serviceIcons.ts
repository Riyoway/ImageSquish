// Shared brand-icon lookup for size-limit targets, used by both the marquee and
// the "Fit under a size limit" dropdown. Icons come from the Simple Icons CDN,
// rendered in a single monochrome tone to match the console aesthetic. The SVGs
// are CC0, but the trademarks belong to their owners.

// One monochrome tone for every icon (matches the muted chip text).
const MONO = "8a8a92";

// Map each target id to a Simple Icons slug. Ids with no icon on the CDN
// (LinkedIn, Slack, Amazon and Mercari were removed from Simple Icons) are
// omitted and render without an icon.
const SLUGS: Record<string, string> = {
  "twitter-avatar": "x",
  "reddit-avatar": "reddit",
  "tiktok-avatar": "tiktok",
  "pinterest-avatar": "pinterest",
  "youtube-thumbnail": "youtube",
  "youtube-banner": "youtube",
  "kick-avatar": "kick",
  "vimeo-avatar": "vimeo",
  "twitch-avatar": "twitch",
  "twitch-banner": "twitch",
  discord: "discord",
  "discord-nitro-basic": "discord",
  "discord-nitro": "discord",
  "whatsapp-photo": "whatsapp",
  messenger: "messenger",
  signal: "signal",
  line: "line",
  telegram: "telegram",
  "icloud-mail": "icloud",
  "zoho-mail": "zoho",
  gmail: "gmail",
  "proton-mail": "protonmail",
  "github-avatar": "github",
  github: "github",
  bitbucket: "bitbucket",
  stackoverflow: "stackoverflow",
  gitlab: "gitlab",
  bluesky: "bluesky",
  discourse: "discourse",
  mastodon: "mastodon",
  "reddit-post": "reddit",
  etsy: "etsy",
  ebay: "ebay",
  shopify: "shopify",
  notion: "notion",
  trello: "trello",
  "google-docs": "googledocs",
  confluence: "confluence",
  asana: "asana",
  cloudinary: "cloudinary",
  imgur: "imgur",
  flickr: "flickr",
  ghost: "ghost",
  substack: "substack",
  squarespace: "squarespace",
  tumblr: "tumblr",
  medium: "medium",
  wix: "wix",
};

/** CDN icon URL for a size-limit target id, or undefined if it has no icon. */
export function iconUrlForTarget(id: string): string | undefined {
  const slug = SLUGS[id];
  if (!slug) return undefined;
  return `https://cdn.simpleicons.org/${slug}/${MONO}`;
}

/** Hide an <img> whose CDN slug does not resolve, so the row stays clean. */
export function hideBrokenIcon(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = "none";
}
