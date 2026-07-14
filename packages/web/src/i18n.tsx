import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Lightweight i18n. Add a language by adding an entry to LOCALES and a
 * dictionary object below. Missing keys fall back to English, then to the
 * provided fallback / key, so a partial translation still renders.
 */

export interface LocaleInfo {
  code: string;
  label: string;
}

export const LOCALES: LocaleInfo[] = [
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.docs": "Docs",
  "nav.back": "Back",
  "btn.install": "Install",
  "lang.label": "Language",

  "hero.title": "The image compressor that fits any upload limit.",
  "hero.sub":
    "Shrink JPEG, PNG and WebP to fit a GitHub avatar, a Discord upload, a Gmail attachment and 54 more limits. Pick a target and it finds the best quality that fits, all processed locally in your browser. Nothing is ever uploaded.",
  "cta.choose": "Choose images",
  "cta.hint": "or drop them below, nothing is uploaded",

  "proof.pre": "Knows the upload limit for",
  "proof.count": "57 destinations",
  "proof.suffix": "across 10 categories",
  "proof.disclaimer":
    "Not affiliated with or endorsed by these services. All names are trademarks of their respective owners.",

  "panel.settings": "Settings",
  "panel.settings.note": "format, quality & size",
  "panel.images": "Images",
  "panel.images.note": "nothing is uploaded",
  "panel.results": "Results",

  "control.preset": "Preset",
  "control.format": "Output format",
  "control.quality": "Quality",
  "control.colors": "Colors",
  "control.resize": "Resize",
  "control.target": "Fit under a size limit",
  "quality.auto": "auto",

  "hint.format": "WebP is usually smallest. PNG is lossless.",
  "hint.quality.target": "Chosen automatically to fit your size limit.",
  "hint.quality.png": "Fewer colors make a smaller PNG. 100 keeps every color.",
  "hint.quality": "Lower quality makes smaller files.",
  "hint.resize": "Cap the longest side. Big lever for oversized photos.",
  "hint.target.on": "Auto-compress each image to fit under {size}.",
  "hint.target.off": "Auto-fit to Discord, a GitHub avatar, or any size you set.",

  "fmt.keep": "Keep original",
  "fmt.webp": "WebP",
  "fmt.jpeg": "JPEG",
  "fmt.png": "PNG · lossless",

  "resize.original": "Original size",
  "resize.max": "Max {px} px",
  "resize.avatar": "Max 500 px (avatar)",

  "target.none": "No limit",
  "target.custom": "Custom size",
  "target.customPlaceholder": "e.g. 500 KB",
  "target.customAria": "Custom size, e.g. 500 KB or 2 MB",
  "search.placeholder": "Search…",
  "select.empty": "No matches",

  "cat.Social": "Social",
  "cat.Video": "Video",
  "cat.Messaging": "Messaging",
  "cat.Email": "Email",
  "cat.Developer": "Developer",
  "cat.Community": "Community",
  "cat.E-commerce": "E-commerce",
  "cat.Productivity": "Productivity",
  "cat.Image hosting": "Image hosting",
  "cat.Blogging": "Blogging",

  "results.saved": "{before} → {after} · saved {pct}%",
  "results.ready": "{done}/{total} ready",
  "btn.clear": "Clear",
  "btn.reapply": "Re-apply",
  "btn.downloadAll": "Download all",

  "status.queued": "Queued",
  "status.compressing": "Compressing…",
  "status.error": "Error",
  "status.remove": "Remove",
  "stat.before": "Before",
  "stat.after": "After",
  "stat.saved": "Saved",
  "badge.overlimit": "over limit",
  "badge.overlimit.title":
    "Could not get under the size limit, even at minimum quality",
  "btn.download": "Download",

  "dz.main": "Drag & drop images here, or ",
  "dz.browse": "click to browse",
  "dz.formats": "JPEG · PNG · WebP",

  "faq.title": "Frequently asked questions",
  "faq.q1": "How do I compress an image to fit a size limit like Discord or a GitHub avatar?",
  "faq.a1":
    "Drop in your image and pick a target under “Fit under a size limit” (for example GitHub avatar 1 MB or Discord 10 MB). ImageSquish finds the highest quality that fits, downscaling only if it has to. There are 57 built-in targets across 10 categories.",
  "faq.q2": "Does ImageSquish upload my images?",
  "faq.a2":
    "No. All compression runs locally in your browser with the Canvas API. Your images never leave your device, and the app works fully offline once loaded.",
  "faq.q3": "Which formats can it compress?",
  "faq.a3":
    "JPEG, PNG and WebP. By default it keeps the original format and just makes the file smaller. You can also convert to WebP for the smallest result.",
  "faq.q4": "How do I make a PNG smaller without changing the format?",
  "faq.a4":
    "Reduce its colors or its dimensions. ImageSquish lowers a PNG’s color count, which shrinks the file while keeping it a PNG, and can cap the longest side. A typical screenshot drops by around 80 percent.",
  "faq.q5": "What is the maximum image size for GitHub, Discord and Gmail?",
  "faq.a5":
    "A GitHub avatar must be under 1 MB, while GitHub image uploads in issues and READMEs allow 10 MB. Discord’s free upload limit is 10 MB (50 MB on Nitro Basic, 500 MB on Nitro). Gmail attachments are limited to 25 MB.",
  "faq.q6": "Is it free?",
  "faq.a6":
    "Yes. ImageSquish is free and open source under the MIT license, with no account, no ads and no upload. There is also a command-line version: npx imgsquish.",

  "footer.tag":
    "Compress JPEG, PNG and WebP images in your browser or the terminal. Fast, free and private.",
  "footer.chip.noupload": "No upload",
  "footer.chip.offline": "Offline",
  "footer.chip.free": "Free & OSS",
  "footer.col.app": "App",
  "footer.col.code": "Code",
  "footer.col.cli": "CLI",
  "footer.link.compressor": "Compressor",
  "footer.link.docs": "Docs",
  "footer.link.install": "Install app",
  "footer.license": "© {year} ImageSquish · MIT License",
  "footer.legal":
    "Upload limits are researched from each platform's public documentation and may change. ImageSquish is not affiliated with or endorsed by any listed service. All product names and logos are trademarks of their respective owners.",

  "docs.eyebrow": "Documentation",
  "docs.title": "How ImageSquish works",
  "docs.intro":
    "Compress JPEG, PNG and WebP images without uploading them anywhere. The web app does everything locally with the Canvas API. The CLI does the same in your terminal, powered by sharp.",
  "docs.s1": "Presets",
  "docs.presets.p":
    "A preset picks an output format and a quality level. You can override the format, quality and resize independently at any time.",
  "docs.th.preset": "Preset",
  "docs.th.output": "Output",
  "docs.th.best": "Best for",
  "docs.s2": "Controls",
  "docs.opt.format.dt": "Format",
  "docs.opt.format.dd":
    "By default the original format is kept, so a PNG stays a PNG. You can also convert to JPEG, PNG or WebP. WebP is usually the smallest for photos.",
  "docs.opt.quality.dt": "Quality / Colors",
  "docs.opt.quality.dd":
    "For JPEG and WebP this is the encoder quality (lower means smaller). For PNG it reduces the number of colors, which shrinks the file while keeping it a PNG. 100 keeps every color.",
  "docs.opt.resize.dt": "Resize",
  "docs.opt.resize.dd":
    "Optionally cap the longest side. Shrinking dimensions is the single biggest way to reduce file size for oversized photos.",
  "docs.opt.target.dt": "Fit under a size limit",
  "docs.opt.target.dd":
    "Pick a target (GitHub avatar 1 MB, Discord 10 MB, and so on) or type your own. Each image is auto-compressed to land just under it, downscaling only if the limit cannot be met otherwise.",
  "docs.s3": "Command line",
  "docs.cli.p": "Batch-process whole folders without leaving the terminal:",
  "docs.cli.p2":
    "The CLI bundles its own image libraries via sharp, so there is nothing else to install.",
  "docs.s4": "Privacy",
  "docs.privacy.p":
    "Your images never leave your device. There is no server, no upload and no tracking. The web app even works fully offline once loaded.",
};

const ja: Dict = {
  "nav.docs": "ドキュメント",
  "nav.back": "戻る",
  "btn.install": "インストール",
  "lang.label": "言語",

  "hero.title": "あらゆるアップロード上限に収まる画像圧縮ツール。",
  "hero.sub":
    "JPEG・PNG・WebP を、GitHub アバター、Discord のアップロード、Gmail の添付、ほか54種類の上限に合わせて圧縮。ターゲットを選ぶだけで、収まる範囲で最高品質を自動選択します。処理はすべてブラウザ内、アップロードは一切ありません。",
  "cta.choose": "画像を選択",
  "cta.hint": "または下にドロップ・アップロードなし",

  "proof.pre": "アップロード上限を収録:",
  "proof.count": "57サービス",
  "proof.suffix": "・10カテゴリ",
  "proof.disclaimer":
    "各サービスとの提携・公認関係はありません。すべての名称は各社の商標です。",

  "panel.settings": "設定",
  "panel.settings.note": "形式・品質・サイズ",
  "panel.images": "画像",
  "panel.images.note": "アップロードなし",
  "panel.results": "結果",

  "control.preset": "プリセット",
  "control.format": "出力形式",
  "control.quality": "品質",
  "control.colors": "色数",
  "control.resize": "リサイズ",
  "control.target": "サイズ上限に収める",
  "quality.auto": "自動",

  "hint.format": "WebP が最小になりがち。PNG はロスレス。",
  "hint.quality.target": "サイズ上限に合わせて自動で選択されます。",
  "hint.quality.png": "色数を減らすと PNG が小さくなります。100 は全色維持。",
  "hint.quality": "品質を下げるとファイルが小さくなります。",
  "hint.resize": "長辺を制限。大きすぎる写真に効果大。",
  "hint.target.on": "各画像を {size} 以内に自動圧縮します。",
  "hint.target.off":
    "Discord や GitHub アバター、任意のサイズに自動でフィット。",

  "fmt.keep": "元の形式を維持",
  "fmt.webp": "WebP",
  "fmt.jpeg": "JPEG",
  "fmt.png": "PNG・ロスレス",

  "resize.original": "元のサイズ",
  "resize.max": "最大 {px} px",
  "resize.avatar": "最大 500 px（アバター）",

  "target.none": "上限なし",
  "target.custom": "カスタムサイズ",
  "target.customPlaceholder": "例: 500 KB",
  "target.customAria": "カスタムサイズ（例: 500 KB / 2 MB）",
  "search.placeholder": "検索…",
  "select.empty": "該当なし",

  "cat.Social": "SNS",
  "cat.Video": "動画",
  "cat.Messaging": "メッセージ",
  "cat.Email": "メール",
  "cat.Developer": "開発",
  "cat.Community": "コミュニティ",
  "cat.E-commerce": "EC・通販",
  "cat.Productivity": "生産性",
  "cat.Image hosting": "画像ホスティング",
  "cat.Blogging": "ブログ",

  "results.saved": "{before} → {after} ・{pct}% 削減",
  "results.ready": "{done}/{total} 完了",
  "btn.clear": "クリア",
  "btn.reapply": "再適用",
  "btn.downloadAll": "すべてダウンロード",

  "status.queued": "待機中",
  "status.compressing": "圧縮中…",
  "status.error": "エラー",
  "status.remove": "削除",
  "stat.before": "変換前",
  "stat.after": "変換後",
  "stat.saved": "削減",
  "badge.overlimit": "上限超過",
  "badge.overlimit.title": "最低品質でもサイズ上限に収まりませんでした",
  "btn.download": "ダウンロード",

  "dz.main": "画像をドラッグ&ドロップ、または ",
  "dz.browse": "クリックして選択",
  "dz.formats": "JPEG · PNG · WebP",

  "faq.title": "よくある質問",
  "faq.q1": "Discord や GitHub アバターのサイズ上限に画像を収めるには?",
  "faq.a1":
    "画像をドロップし、「サイズ上限に収める」でターゲットを選ぶだけです（例: GitHub アバター 1 MB、Discord 10 MB）。収まる範囲で最高品質を選び、どうしても必要なときだけ縮小します。10カテゴリにわたる57のターゲットを内蔵しています。",
  "faq.q2": "ImageSquish は画像をアップロードしますか?",
  "faq.a2":
    "いいえ。圧縮はすべてブラウザ内で Canvas API を使って行われます。画像が端末外に出ることはなく、読み込み後は完全オフラインで動作します。",
  "faq.q3": "対応している形式は?",
  "faq.a3":
    "JPEG・PNG・WebP です。既定では元の形式を維持したままファイルを小さくします。最小化したい場合は WebP へ変換もできます。",
  "faq.q4": "形式を変えずに PNG を小さくするには?",
  "faq.a4":
    "色数か寸法を減らします。ImageSquish は PNG の色数を下げてファイルを縮小し（PNG のまま）、長辺の上限も設定できます。一般的なスクリーンショットで約80%削減できます。",
  "faq.q5": "GitHub・Discord・Gmail の画像サイズ上限は?",
  "faq.a5":
    "GitHub アバターは 1 MB 未満、Issue や README への画像アップロードは 10 MB までです。Discord の無料アップロードは 10 MB（Nitro Basic は 50 MB、Nitro は 500 MB）。Gmail の添付は 25 MB までです。",
  "faq.q6": "無料ですか?",
  "faq.a6":
    "はい。ImageSquish は MIT ライセンスのオープンソースで、アカウント不要・広告なし・アップロードなしです。コマンドライン版もあります: npx imgsquish。",

  "footer.tag":
    "JPEG・PNG・WebP をブラウザでもターミナルでも圧縮。高速・無料・プライベート。",
  "footer.chip.noupload": "アップロードなし",
  "footer.chip.offline": "オフライン対応",
  "footer.chip.free": "無料・OSS",
  "footer.col.app": "アプリ",
  "footer.col.code": "コード",
  "footer.col.cli": "CLI",
  "footer.link.compressor": "コンプレッサー",
  "footer.link.docs": "ドキュメント",
  "footer.link.install": "アプリをインストール",
  "footer.license": "© {year} ImageSquish・MIT ライセンス",
  "footer.legal":
    "アップロード上限は各プラットフォームの公開情報をもとに調査したもので、変更される場合があります。ImageSquish は掲載サービスと提携・公認関係にありません。すべての製品名およびロゴは各社の商標です。",

  "docs.eyebrow": "ドキュメント",
  "docs.title": "ImageSquish の仕組み",
  "docs.intro":
    "JPEG・PNG・WebP をどこにもアップロードせずに圧縮します。Web アプリは Canvas API ですべてローカル処理し、CLI は sharp を使ってターミナルで同じことを行います。",
  "docs.s1": "プリセット",
  "docs.presets.p":
    "プリセットは出力形式と品質を選びます。形式・品質・リサイズはいつでも個別に上書きできます。",
  "docs.th.preset": "プリセット",
  "docs.th.output": "出力",
  "docs.th.best": "用途",
  "docs.s2": "操作項目",
  "docs.opt.format.dt": "形式",
  "docs.opt.format.dd":
    "既定では元の形式を維持するため、PNG は PNG のままです。JPEG・PNG・WebP へ変換もできます。写真は WebP が最小になりがちです。",
  "docs.opt.quality.dt": "品質 / 色数",
  "docs.opt.quality.dd":
    "JPEG・WebP ではエンコード品質です（低いほど小さい）。PNG では色数を減らし、PNG のままファイルを縮小します。100 は全色維持。",
  "docs.opt.resize.dt": "リサイズ",
  "docs.opt.resize.dd":
    "長辺の上限を任意で設定できます。寸法を小さくするのが、大きすぎる写真を最も減らせる方法です。",
  "docs.opt.target.dt": "サイズ上限に収める",
  "docs.opt.target.dd":
    "ターゲット（GitHub アバター 1 MB、Discord 10 MB など）を選ぶか、自分で入力します。各画像が上限のすぐ下に収まるよう自動圧縮され、他に方法がない場合のみ縮小します。",
  "docs.s3": "コマンドライン",
  "docs.cli.p": "ターミナルからフォルダごと一括処理できます:",
  "docs.cli.p2":
    "CLI は sharp で画像ライブラリを同梱しているため、他に何もインストール不要です。",
  "docs.s4": "プライバシー",
  "docs.privacy.p":
    "画像が端末外に出ることはありません。サーバーもアップロードもトラッキングもなし。読み込み後は完全オフラインで動作します。",

  // preset labels/descriptions. English comes from core as a fallback.
  "preset.balanced.label": "バランス",
  "preset.balanced.desc":
    "元の形式を維持し、品質80%で圧縮。ほとんどの画像で見た目そのままに小さくなります。",
  "preset.small.label": "より小さく",
  "preset.small.desc":
    "元の形式を維持し、品質60%で圧縮。サイズを本当に下げたいときの強めの圧縮。",
  "preset.high.label": "高品質",
  "preset.high.desc":
    "元の形式を維持し、品質92%で圧縮。ほぼ劣化なしで、削減はゆるやか。",
  "preset.webp.label": "WebP に変換",
  "preset.webp.desc":
    "WebP（品質80%）へ変換。形式を変えてよいなら通常これが最小です。",
};

const DICTS: Record<string, Dict> = { en, ja };

export function availableLocales(): LocaleInfo[] {
  return LOCALES.filter((l) => DICTS[l.code]);
}

function detectLocale(): string {
  try {
    const saved = localStorage.getItem("imagesquish.lang");
    if (saved && DICTS[saved]) return saved;
  } catch {
    /* localStorage may be unavailable */
  }
  const prefs =
    navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language];
  for (const p of prefs) {
    const base = (p || "").toLowerCase().split("-")[0];
    if (DICTS[base]) return base;
  }
  return "en";
}

export type TFn = (
  key: string,
  vars?: Record<string, string | number>,
  fallback?: string,
) => string;

interface I18nValue {
  lang: string;
  setLang: (l: string) => void;
  t: TFn;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<string>(detectLocale);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: string) => {
    setLangState(l);
    try {
      localStorage.setItem("imagesquish.lang", l);
    } catch {
      /* ignore */
    }
  };

  const t: TFn = (key, vars, fallback) => {
    let s = DICTS[lang]?.[key] ?? en[key] ?? fallback ?? key;
    if (vars) {
      for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]));
    }
    return s;
  };

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const c = useContext(I18nContext);
  if (!c) throw new Error("useI18n must be used within I18nProvider");
  return c;
}
