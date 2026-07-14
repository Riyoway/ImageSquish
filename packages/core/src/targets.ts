/**
 * Common upload size limits people actually bump into, so you can compress an
 * image to "fit under Discord / a GitHub avatar / a Gmail attachment / ..."
 * without doing the math.
 *
 * Limits were researched from each platform's official help/docs (mid-2026) and
 * change over time. They are grouped by category and stored in bytes using
 * binary MB (1 MB = 1048576 bytes). Each entry keeps its source URL.
 */

const KB = 1024;
const MB = 1024 * 1024;
const GB = 1024 * 1024 * 1024;

export interface SizeTarget {
  /** Stable id used on the CLI and in the UI. */
  id: string;
  /** Human label, includes the limit. */
  label: string;
  /** The hard limit in bytes. */
  bytes: number;
  /** Grouping category, e.g. "Messaging", "Social", "Email". */
  category: string;
  /** Optional extra advice (e.g. recommended dimensions). */
  note?: string;
  /** Source URL the limit was taken from. */
  sourceUrl?: string;
}

export const SIZE_TARGETS: SizeTarget[] = [
  // ---- Social ---------------------------------------------------------------
  {
    id: "twitter-avatar",
    label: "X / Twitter avatar · 2 MB",
    bytes: 2 * MB,
    category: "Social",
    note: "Square, 400x400 px recommended.",
    sourceUrl: "https://postfa.st/sizes/x/profile",
  },
  {
    id: "reddit-avatar",
    label: "Reddit avatar · 5 MB",
    bytes: 5 * MB,
    category: "Social",
    sourceUrl: "https://mediasizes.com/reddit-image-size/",
  },
  {
    id: "linkedin-avatar",
    label: "LinkedIn photo · 8 MB",
    bytes: 8 * MB,
    category: "Social",
    note: "Square, 400x400 px or larger.",
    sourceUrl: "https://postfa.st/sizes/linkedin/profile",
  },
  {
    id: "tiktok-avatar",
    label: "TikTok avatar · 10 MB",
    bytes: 10 * MB,
    category: "Social",
    sourceUrl: "https://postfa.st/sizes/tiktok/profile",
  },
  {
    id: "pinterest-avatar",
    label: "Pinterest avatar · 32 MB",
    bytes: 32 * MB,
    category: "Social",
    sourceUrl: "https://www.socialez.com/blog/pinterest-image-sizes/",
  },

  // ---- Video ----------------------------------------------------------------
  {
    id: "youtube-thumbnail",
    label: "YouTube thumbnail · 2 MB",
    bytes: 2 * MB,
    category: "Video",
    note: "16:9, 1280x720 recommended.",
    sourceUrl: "https://support.google.com/youtube/answer/72431",
  },
  {
    id: "kick-avatar",
    label: "Kick avatar · 4 MB",
    bytes: 4 * MB,
    category: "Video",
    sourceUrl: "https://help.kick.com/en/articles/7120563-how-to-update-your-profile",
  },
  {
    id: "vimeo-avatar",
    label: "Vimeo avatar · 5 MB",
    bytes: 5 * MB,
    category: "Video",
    sourceUrl: "https://allplatforms.io/vimeo/",
  },
  {
    id: "youtube-banner",
    label: "YouTube banner · 6 MB",
    bytes: 6 * MB,
    category: "Video",
    note: "16:9, 2560x1440 recommended.",
    sourceUrl: "https://support.google.com/youtube/answer/12950272",
  },
  {
    id: "twitch-avatar",
    label: "Twitch avatar · 10 MB",
    bytes: 10 * MB,
    category: "Video",
    sourceUrl: "https://www.streamscheme.com/twitch-image-sizes/",
  },
  {
    id: "twitch-banner",
    label: "Twitch banner · 10 MB",
    bytes: 10 * MB,
    category: "Video",
    sourceUrl: "https://www.streamscheme.com/twitch-image-sizes/",
  },

  // ---- Messaging ------------------------------------------------------------
  {
    id: "discord",
    label: "Discord (free) · 10 MB",
    bytes: 10 * MB,
    category: "Messaging",
    sourceUrl: "https://support.discord.com/hc/en-us/articles/115000435108",
  },
  {
    id: "whatsapp-photo",
    label: "WhatsApp photo · 16 MB",
    bytes: 16 * MB,
    category: "Messaging",
    note: "Sent as media. Photos are recompressed by WhatsApp.",
    sourceUrl: "https://faq.whatsapp.com/453914586839706/",
  },
  {
    id: "messenger-attachment",
    label: "Messenger attachment · 25 MB",
    bytes: 25 * MB,
    category: "Messaging",
    sourceUrl:
      "https://help.manychat.com/hc/en-us/articles/14281167455388",
  },
  {
    id: "discord-nitro-basic",
    label: "Discord Nitro Basic · 50 MB",
    bytes: 50 * MB,
    category: "Messaging",
    sourceUrl: "https://support.discord.com/hc/en-us/articles/115000435108",
  },
  {
    id: "microsoft-teams",
    label: "Microsoft Teams chat · 100 MB",
    bytes: 100 * MB,
    category: "Messaging",
    sourceUrl:
      "https://learn.microsoft.com/en-us/microsoftteams/limits-specifications-teams",
  },
  {
    id: "signal",
    label: "Signal attachment · 100 MB",
    bytes: 100 * MB,
    category: "Messaging",
    sourceUrl:
      "https://forestvpn.com/en/blog/digital-communication/signal-max-file-size-limits/",
  },
  {
    id: "discord-nitro",
    label: "Discord Nitro · 500 MB",
    bytes: 500 * MB,
    category: "Messaging",
    sourceUrl: "https://support.discord.com/hc/en-us/articles/115000435108",
  },
  {
    id: "slack",
    label: "Slack (free) file · 1 GB",
    bytes: 1 * GB,
    category: "Messaging",
    sourceUrl:
      "https://slack.com/help/articles/115002422943-Usage-limits-for-free-workspaces",
  },
  {
    id: "line",
    label: "LINE file · 1 GB",
    bytes: 1 * GB,
    category: "Messaging",
    note: "Album photos are capped lower, around 20 MB.",
    sourceUrl: "https://help.line.me/line/?contentId=50000121",
  },
  {
    id: "telegram",
    label: "Telegram (free) file · 2 GB",
    bytes: 2 * GB,
    category: "Messaging",
    sourceUrl: "https://telegram.org/faq_premium",
  },

  // ---- Email ----------------------------------------------------------------
  {
    id: "icloud-mail",
    label: "iCloud Mail · 20 MB",
    bytes: 20 * MB,
    category: "Email",
    sourceUrl: "https://support.apple.com/en-us/102198",
  },
  {
    id: "zoho-mail",
    label: "Zoho Mail (free) · 20 MB",
    bytes: 20 * MB,
    category: "Email",
    sourceUrl: "https://www.zoho.com/mail/help/attachments.html",
  },
  {
    id: "gmail",
    label: "Gmail attachment · 25 MB",
    bytes: 25 * MB,
    category: "Email",
    sourceUrl: "https://support.google.com/mail/answer/6584",
  },
  {
    id: "outlook",
    label: "Outlook.com attachment · 25 MB",
    bytes: 25 * MB,
    category: "Email",
    sourceUrl:
      "https://support.microsoft.com/en-us/office/sending-limits-in-outlook-com-279ee200-594c-40f0-9ec8-bb6af7735c2e",
  },
  {
    id: "yahoo-mail",
    label: "Yahoo Mail attachment · 25 MB",
    bytes: 25 * MB,
    category: "Email",
    sourceUrl: "https://help.yahoo.com/kb/SLN5673.html",
  },
  {
    id: "proton-mail",
    label: "Proton Mail attachment · 25 MB",
    bytes: 25 * MB,
    category: "Email",
    sourceUrl: "https://proton.me/support/attaching-multiple-documents-to-a-message",
  },

  // ---- Developer ------------------------------------------------------------
  {
    id: "github-avatar",
    label: "GitHub avatar · 1 MB",
    bytes: 1 * MB,
    category: "Developer",
    note: "Square, 500x500 px or larger recommended.",
    sourceUrl:
      "https://docs.github.com/en/account-and-profile/reference/profile-reference",
  },
  {
    id: "bitbucket",
    label: "Bitbucket attachment · 1 MB",
    bytes: 1 * MB,
    category: "Developer",
    sourceUrl: "https://jira.atlassian.com/browse/BCLOUD-15202",
  },
  {
    id: "stackoverflow",
    label: "Stack Overflow image · 2 MB",
    bytes: 2 * MB,
    category: "Developer",
    sourceUrl:
      "https://meta.stackexchange.com/questions/71689/what-are-the-image-size-limits-and-image-hosting-details",
  },
  {
    id: "github",
    label: "GitHub image upload · 10 MB",
    bytes: 10 * MB,
    category: "Developer",
    note: "Images in issues, PRs, comments and profile READMEs.",
    sourceUrl:
      "https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files",
  },
  {
    id: "gitlab",
    label: "GitLab attachment · 100 MB",
    bytes: 100 * MB,
    category: "Developer",
    sourceUrl:
      "https://docs.gitlab.com/administration/settings/account_and_limit_settings/",
  },

  // ---- Community ------------------------------------------------------------
  {
    id: "bluesky",
    label: "Bluesky post image · 1 MB",
    bytes: 1000000,
    category: "Community",
    note: "Hard per-image cap of 1,000,000 bytes.",
    sourceUrl: "https://docs.bsky.app/docs/advanced-guides/posts",
  },
  {
    id: "discourse",
    label: "Discourse image · 10 MB",
    bytes: 10 * MB,
    category: "Community",
    note: "Default limit. Instance admins can change it.",
    sourceUrl: "https://github.com/discourse/discourse/blob/main/config/site_settings.yml",
  },
  {
    id: "mastodon",
    label: "Mastodon image · 16 MB",
    bytes: 16 * MB,
    category: "Community",
    note: "Default limit. Instance admins can change it.",
    sourceUrl:
      "https://fedi.tips/how-do-i-post-images-videos-or-audio-in-mastodon-what-can-i-attach-to-a-post-how-do-i-post-gifs/",
  },
  {
    id: "reddit-post",
    label: "Reddit image post · 20 MB",
    bytes: 20 * MB,
    category: "Community",
    sourceUrl:
      "https://support.reddithelp.com/hc/en-us/articles/16673273180948",
  },

  // ---- E-commerce -----------------------------------------------------------
  {
    id: "amazon-seller",
    label: "Amazon product image · 10 MB",
    bytes: 10 * MB,
    category: "E-commerce",
    note: "1600 px on the longest side enables zoom.",
    sourceUrl: "https://sellercentral.amazon.com/help/hub/reference/G1881",
  },
  {
    id: "etsy",
    label: "Etsy listing photo · 10 MB",
    bytes: 10 * MB,
    category: "E-commerce",
    sourceUrl:
      "https://help.etsy.com/hc/en-us/articles/115015663347",
  },
  {
    id: "mercari",
    label: "Mercari photo · 10 MB",
    bytes: 10 * MB,
    category: "E-commerce",
    sourceUrl: "https://www.mercari.com/us/help_center/article/240/",
  },
  {
    id: "ebay",
    label: "eBay listing photo · 12 MB",
    bytes: 12 * MB,
    category: "E-commerce",
    note: "1600x1600 px recommended to enable zoom.",
    sourceUrl: "https://www.ebay.com/help/selling/listings/adding-pictures-listings?id=4148",
  },
  {
    id: "shopify",
    label: "Shopify product image · 20 MB",
    bytes: 20 * MB,
    category: "E-commerce",
    sourceUrl:
      "https://help.shopify.com/en/manual/products/product-media/product-media-types",
  },

  // ---- Productivity ---------------------------------------------------------
  {
    id: "notion",
    label: "Notion (free) file · 5 MB",
    bytes: 5 * MB,
    category: "Productivity",
    note: "Per-file cap on the Free plan.",
    sourceUrl: "https://www.notion.com/help/images-files-and-media",
  },
  {
    id: "trello",
    label: "Trello (free) attachment · 10 MB",
    bytes: 10 * MB,
    category: "Productivity",
    sourceUrl:
      "https://support.atlassian.com/trello/docs/adding-attachments-to-cards/",
  },
  {
    id: "google-docs",
    label: "Google Docs image · 50 MB",
    bytes: 50 * MB,
    category: "Productivity",
    note: "Large images are auto-downscaled to about 2000 px.",
    sourceUrl: "https://support.google.com/docs/thread/222022371/size-limit-in-docs",
  },
  {
    id: "confluence",
    label: "Confluence attachment · 100 MB",
    bytes: 100 * MB,
    category: "Productivity",
    sourceUrl:
      "https://support.atlassian.com/confluence-cloud/docs/configure-attachment-size/",
  },
  {
    id: "asana",
    label: "Asana attachment · 100 MB",
    bytes: 100 * MB,
    category: "Productivity",
    sourceUrl: "https://help.asana.com/s/article/task-comments-and-attachments",
  },

  // ---- Image hosting --------------------------------------------------------
  {
    id: "cloudinary",
    label: "Cloudinary (free) · 10 MB",
    bytes: 10 * MB,
    category: "Image hosting",
    sourceUrl:
      "https://support.cloudinary.com/hc/en-us/articles/202520592",
  },
  {
    id: "imgur",
    label: "Imgur image · 20 MB",
    bytes: 20 * MB,
    category: "Image hosting",
    sourceUrl:
      "https://gethuman.com/customer-service/Imgur-com/faq/Is-there-a-maximum-file-size-limit-for-uploads/xluG6I",
  },
  {
    id: "imgbb",
    label: "ImgBB (free) · 32 MB",
    bytes: 32 * MB,
    category: "Image hosting",
    sourceUrl: "https://imgbb.com/",
  },
  {
    id: "postimages",
    label: "Postimages (free) · 32 MB",
    bytes: 32 * MB,
    category: "Image hosting",
    sourceUrl: "https://postimages.org/faq",
  },
  {
    id: "flickr",
    label: "Flickr (free) photo · 100 MB",
    bytes: 100 * MB,
    category: "Image hosting",
    sourceUrl:
      "https://www.flickrhelp.com/hc/en-us/articles/4404079649300",
  },

  // ---- Blogging -------------------------------------------------------------
  {
    id: "ghost",
    label: "Ghost(Pro) Starter · 5 MB",
    bytes: 5 * MB,
    category: "Blogging",
    note: "Higher on paid Ghost plans.",
    sourceUrl: "https://ghost.org/help/media-file-size-limits/",
  },
  {
    id: "substack",
    label: "Substack image · 10 MB",
    bytes: 10 * MB,
    category: "Blogging",
    sourceUrl:
      "https://support.substack.com/hc/en-us/articles/4408381685268",
  },
  {
    id: "squarespace",
    label: "Squarespace image · 20 MB",
    bytes: 20 * MB,
    category: "Blogging",
    sourceUrl:
      "https://support.squarespace.com/hc/en-us/articles/206542517",
  },
  {
    id: "tumblr",
    label: "Tumblr image · 20 MB",
    bytes: 20 * MB,
    category: "Blogging",
    sourceUrl: "https://help.tumblr.com/knowledge-base/image-gif-troubleshooting/",
  },
  {
    id: "medium",
    label: "Medium image · 25 MB",
    bytes: 25 * MB,
    category: "Blogging",
    sourceUrl: "https://help.medium.com/hc/en-us/articles/215679797-Using-images",
  },
  {
    id: "wix",
    label: "Wix image · 25 MB",
    bytes: 25 * MB,
    category: "Blogging",
    sourceUrl:
      "https://support.wix.com/en/article/wix-media-supported-media-file-types-and-file-sizes",
  },
];

export function getSizeTarget(id: string): SizeTarget | undefined {
  return SIZE_TARGETS.find((t) => t.id === id);
}

/**
 * Parse a human size like "10MB", "500 kb", "1.5mb" or a raw byte count into
 * bytes. Returns null if it can't be understood.
 */
export function parseSize(input: string): number | null {
  const m = input.trim().match(/^([\d.]+)\s*(b|kb|mb|gb)?$/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!isFinite(n) || n <= 0) return null;
  const unit = (m[2] || "b").toLowerCase();
  const mult = unit === "gb" ? GB : unit === "mb" ? MB : unit === "kb" ? KB : 1;
  return Math.round(n * mult);
}
