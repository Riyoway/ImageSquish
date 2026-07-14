import { useCallback, useMemo, useRef, useState } from "react";
import {
  ImageIcon,
  ImagePlus,
  SlidersHorizontal,
  Gauge,
  Scaling,
  Target,
  RefreshCw,
  Download,
  MonitorDown,
  ShieldCheck,
  CloudOff,
  Zap,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import {
  PRESETS,
  getPreset,
  DEFAULT_PRESET_ID,
  SIZE_TARGETS,
  getSizeTarget,
  parseSize,
  formatBytes,
  reductionPercent,
  type OutputFormat,
} from "@image-compressor/core";
import { processFile, type ProcessResult, type ProcessSettings } from "./lib/processor";
import { iconUrlForTarget } from "./lib/serviceIcons";
import { useI18n } from "./i18n";
import Aurora from "./components/Aurora";
import { Dropzone } from "./components/Dropzone";
import { FileRow, type FileItem } from "./components/FileRow";
import { Select } from "./components/Select";
import { CopyCommand } from "./components/CopyCommand";
import { DocsView } from "./components/DocsView";
import { ServiceMarquee } from "./components/ServiceMarquee";
import { FaqSection } from "./components/FaqSection";
import { LanguageMenu } from "./components/LanguageMenu";
import { usePwaInstall } from "./hooks/usePwaInstall";

function GitHubMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.21.7.82.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

const GITHUB_URL = "https://github.com/Riyoway/ImageSquish";

let idCounter = 0;

export function App() {
  const { t, lang } = useI18n();
  const [view, setView] = useState<"app" | "docs">("app");
  const [presetId, setPresetId] = useState(DEFAULT_PRESET_ID);
  const [format, setFormat] = useState<OutputFormat>(getPreset(DEFAULT_PRESET_ID)!.format);
  const [quality, setQuality] = useState(getPreset(DEFAULT_PRESET_ID)!.quality);
  const [maxDimension, setMaxDimension] = useState(0);
  const [targetSel, setTargetSel] = useState("none");
  const [customSize, setCustomSize] = useState("2 MB");
  const [items, setItems] = useState<FileItem[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const heroInputRef = useRef<HTMLInputElement>(null);

  const preset = useMemo(() => getPreset(presetId)!, [presetId]);
  const { canInstall, promptInstall } = usePwaInstall();
  const year = new Date().getFullYear();

  // The aurora background is decorative motion; skip it under reduced-motion.
  const reduceMotion = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    [],
  );

  // Options are rebuilt when the language changes.
  const presetOptions = useMemo(
    () => PRESETS.map((p) => ({ value: p.id, label: t(`preset.${p.id}.label`, undefined, p.label) })),
    [lang], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const formatOptions = useMemo(
    () => [
      { value: "keep", label: t("fmt.keep") },
      { value: "webp", label: t("fmt.webp") },
      { value: "jpeg", label: t("fmt.jpeg") },
      { value: "png", label: t("fmt.png") },
    ],
    [lang], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const resizeOptions = useMemo(
    () => [
      { value: "0", label: t("resize.original") },
      { value: "4000", label: t("resize.max", { px: 4000 }) },
      { value: "2560", label: t("resize.max", { px: 2560 }) },
      { value: "1920", label: t("resize.max", { px: 1920 }) },
      { value: "1280", label: t("resize.max", { px: 1280 }) },
      { value: "800", label: t("resize.max", { px: 800 }) },
      { value: "500", label: t("resize.avatar") },
    ],
    [lang], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const targetOptions = useMemo(
    () => [
      { value: "none", label: t("target.none") },
      ...SIZE_TARGETS.map((tg) => ({
        value: tg.id,
        label: tg.label,
        group: t(`cat.${tg.category}`, undefined, tg.category),
        icon: iconUrlForTarget(tg.id),
      })),
      { value: "custom", label: t("target.custom") },
    ],
    [lang], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Applying a preset resets the format + quality to its recommended values.
  const applyPreset = useCallback((id: string) => {
    const p = getPreset(id);
    if (!p) return;
    setPresetId(id);
    setFormat(p.format);
    setQuality(p.quality);
  }, []);

  // Resolve the active size target (0 = no limit).
  const targetBytes = useMemo(() => {
    if (targetSel === "none") return 0;
    if (targetSel === "custom") return parseSize(customSize) ?? 0;
    return getSizeTarget(targetSel)?.bytes ?? 0;
  }, [targetSel, customSize]);

  const settings: ProcessSettings = useMemo(
    () => ({ format, quality, maxDimension, targetBytes }),
    [format, quality, maxDimension, targetBytes],
  );
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // With a size target active, quality is chosen automatically by the fit search.
  const targeting = targetBytes > 0;
  const qualityDisabled = targeting;

  const update = useCallback((id: number, patch: Partial<FileItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const runOne = useCallback(
    async (item: FileItem, s = settingsRef.current) => {
      update(item.id, { status: "processing", error: undefined });
      try {
        const result: ProcessResult = await processFile(item.file, s);
        update(item.id, { status: "done", result });
      } catch (e) {
        update(item.id, { status: "error", error: (e as Error).message });
      }
    },
    [update],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      const images = files.filter(
        (f) =>
          /^image\/(jpeg|png|webp)$/.test(f.type) || /\.(jpe?g|png|webp)$/i.test(f.name),
      );
      const newItems: FileItem[] = images.map((file) => ({
        id: ++idCounter,
        file,
        status: "pending",
      }));
      setItems((prev) => [...prev, ...newItems]);
      (async () => {
        for (const it of newItems) await runOne(it);
      })();
    },
    [runOne],
  );

  const reprocessAll = useCallback(() => {
    (async () => {
      for (const it of itemsRef.current) await runOne(it, settingsRef.current);
    })();
  }, [runOne]);

  const downloadOne = (item: FileItem) => {
    if (!item.result) return;
    const url = URL.createObjectURL(item.result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.result.outputName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadAll = () => {
    items
      .filter((it) => it.status === "done")
      .forEach((it, i) => setTimeout(() => downloadOne(it), i * 150));
  };

  const removeItem = useCallback(
    (id: number) => setItems((prev) => prev.filter((it) => it.id !== id)),
    [],
  );

  const clearAll = useCallback(() => setItems([]), []);

  const doneItems = items.filter((it) => it.status === "done" && it.result);
  const doneCount = doneItems.length;

  // Aggregate savings across everything compressed so far.
  const totals = doneItems.reduce(
    (acc, it) => {
      acc.before += it.result!.originalSize;
      acc.after += it.result!.compressedSize;
      return acc;
    },
    { before: 0, after: 0 },
  );
  const totalPct = reductionPercent(totals.before, totals.after);

  return (
    <div className="app">
      {!reduceMotion && (
        <div className="hero-aurora" aria-hidden="true">
          <Aurora
            colorStops={["#2dd4bf", "#22d3ee", "#3b82f6"]}
            blend={0.5}
            amplitude={1.3}
            speed={0.4}
          />
        </div>
      )}
      <header className="app-bar">
        <button
          className="app-bar-brand"
          onClick={() => {
            setView("app");
            window.scrollTo({ top: 0 });
          }}
        >
          <img src="/icon-192.png" alt="" className="app-bar-logo" />
          <span className="app-bar-title">
            Image<b>Squish</b>
          </span>
        </button>
        <nav className="app-bar-nav">
          <button
            className={`nav-link${view === "docs" ? " active" : ""}`}
            onClick={() => {
              setView(view === "docs" ? "app" : "docs");
              window.scrollTo({ top: 0 });
            }}
          >
            {t("nav.docs")}
          </button>
          <LanguageMenu />
          <a className="icon-link" href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
            <GitHubMark size={18} />
          </a>
          {canInstall && (
            <button className="btn-install" onClick={promptInstall}>
              <MonitorDown size={16} />
              <span className="btn-install-label">{t("btn.install")}</span>
            </button>
          )}
        </nav>
      </header>

      {view === "docs" ? (
        <DocsView onBack={() => setView("app")} />
      ) : (
        <main className="app-main">
          <section className="hero">
            <h1>{t("hero.title")}</h1>
            <p className="hero-sub">{t("hero.sub")}</p>
            <div className="hero-cta">
              <button className="btn-primary btn-lg" onClick={() => heroInputRef.current?.click()}>
                <ImagePlus size={17} />
                {t("cta.choose")}
              </button>
              <span className="hero-cta-hint">{t("cta.hint")}</span>
            </div>
            <input
              ref={heroInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              multiple
              hidden
              onChange={(e) => {
                const fs = Array.from(e.target.files ?? []);
                if (fs.length) {
                  addFiles(fs);
                  document
                    .getElementById("tool")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }
                e.target.value = "";
              }}
            />
          </section>

          <section className="proof" aria-label="Supported upload destinations">
            <p className="proof-label">
              {t("proof.pre")} <b>{t("proof.count")}</b> {t("proof.suffix")}
            </p>
            <ServiceMarquee />
            <p className="proof-disclaimer">{t("proof.disclaimer")}</p>
          </section>

          <section className="panel" id="tool">
            <div className="panel-head">
              <span className="panel-index">1</span>
              <span className="panel-title">{t("panel.images")}</span>
              <span className="panel-note">{t("panel.images.note")}</span>
            </div>
            <Dropzone onFiles={addFiles} />
          </section>

          <section className="panel">
            <div className="panel-head">
              <span className="panel-index">2</span>
              <span className="panel-title">{t("panel.settings")}</span>
              <span className="panel-note">{t("panel.settings.note")}</span>
            </div>
            <div className="controls">
              <div className="control">
                <label htmlFor="preset">
                  <Gauge size={14} />
                  {t("control.preset")}
                </label>
                <Select
                  id="preset"
                  ariaLabel={t("control.preset")}
                  value={presetId}
                  options={presetOptions}
                  onChange={applyPreset}
                />
                <p className="hint">
                  {t(`preset.${preset.id}.desc`, undefined, preset.description)}
                </p>
              </div>

              <div className="control">
                <label htmlFor="format">
                  <ImageIcon size={14} />
                  {t("control.format")}
                </label>
                <Select
                  id="format"
                  ariaLabel={t("control.format")}
                  value={format}
                  options={formatOptions}
                  onChange={(v) => setFormat(v as OutputFormat)}
                />
                <p className="hint">{t("hint.format")}</p>
              </div>

              <div className="control">
                <label htmlFor="quality">
                  <SlidersHorizontal size={14} />
                  {format === "png" ? t("control.colors") : t("control.quality")}
                  <span className="quality-value">
                    {targeting ? t("quality.auto") : quality}
                  </span>
                </label>
                <input
                  id="quality"
                  className="range"
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  disabled={qualityDisabled}
                  onChange={(e) => setQuality(Number(e.target.value))}
                />
                <p className="hint">
                  {targeting
                    ? t("hint.quality.target")
                    : format === "png"
                      ? t("hint.quality.png")
                      : t("hint.quality")}
                </p>
              </div>

              <div className="control">
                <label htmlFor="resize">
                  <Scaling size={14} />
                  {t("control.resize")}
                </label>
                <Select
                  id="resize"
                  ariaLabel={t("control.resize")}
                  value={String(maxDimension)}
                  options={resizeOptions}
                  onChange={(v) => setMaxDimension(Number(v))}
                />
                <p className="hint">{t("hint.resize")}</p>
              </div>

              <div className="control control-wide">
                <label htmlFor="target">
                  <Target size={14} />
                  {t("control.target")}
                </label>
                <div className="target-row">
                  <Select
                    id="target"
                    ariaLabel={t("control.target")}
                    value={targetSel}
                    options={targetOptions}
                    onChange={setTargetSel}
                    searchable
                  />
                  {targetSel === "custom" && (
                    <input
                      className="text-input"
                      type="text"
                      value={customSize}
                      aria-label={t("target.customAria")}
                      placeholder={t("target.customPlaceholder")}
                      onChange={(e) => setCustomSize(e.target.value)}
                    />
                  )}
                </div>
                <p className="hint">
                  {targeting
                    ? t("hint.target.on", { size: formatBytes(targetBytes) })
                    : t("hint.target.off")}
                </p>
              </div>
            </div>
          </section>

          {items.length > 0 && (
            <section className="panel">
              <div className="panel-head results-head">
                <span className="panel-index">3</span>
                <span className="panel-title">{t("panel.results")}</span>
                <span className="results-count">
                  {doneCount > 0
                    ? t("results.saved", {
                        before: formatBytes(totals.before),
                        after: formatBytes(totals.after),
                        pct: `${totalPct >= 0 ? "" : "−"}${Math.abs(totalPct).toFixed(0)}`,
                      })
                    : t("results.ready", { done: doneCount, total: items.length })}
                </span>
                <div className="results-actions">
                  <button onClick={clearAll} className="btn-ghost">
                    <Trash2 size={15} />
                    {t("btn.clear")}
                  </button>
                  <button onClick={reprocessAll} className="btn-secondary">
                    <RefreshCw size={15} />
                    {t("btn.reapply")}
                  </button>
                  <button onClick={downloadAll} className="btn-primary" disabled={doneCount === 0}>
                    <Download size={15} />
                    {t("btn.downloadAll")}
                  </button>
                </div>
              </div>
              <div className="file-list">
                {items.map((item) => (
                  <FileRow
                    key={item.id}
                    item={item}
                    onDownload={downloadOne}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </section>
          )}

          <FaqSection />
        </main>
      )}

      <footer className="site-footer">
        <div className="site-footer-inner footer-grid">
          <div className="footer-brand">
            <div className="footer-brand-row">
              <img src="/icon-192.png" alt="" className="footer-logo" />
              <span className="footer-name">
                Image<b>Squish</b>
              </span>
            </div>
            <p className="footer-tag">{t("footer.tag")}</p>
            <div className="footer-chips">
              <span>
                <ShieldCheck size={13} /> {t("footer.chip.noupload")}
              </span>
              <span>
                <CloudOff size={13} /> {t("footer.chip.offline")}
              </span>
              <span>
                <Zap size={13} /> {t("footer.chip.free")}
              </span>
            </div>
          </div>

          <nav className="footer-col">
            <h4>{t("footer.col.app")}</h4>
            <button
              className="footer-link"
              onClick={() => {
                setView("app");
                window.scrollTo({ top: 0 });
              }}
            >
              {t("footer.link.compressor")}
            </button>
            <button
              className="footer-link"
              onClick={() => {
                setView("docs");
                window.scrollTo({ top: 0 });
              }}
            >
              {t("footer.link.docs")}
            </button>
            {canInstall && (
              <button className="footer-link" onClick={promptInstall}>
                {t("footer.link.install")}
              </button>
            )}
          </nav>

          <nav className="footer-col">
            <h4>{t("footer.col.code")}</h4>
            <a className="footer-link" href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub <ArrowUpRight size={13} />
            </a>
            <a className="footer-link" href={`${GITHUB_URL}/issues`} target="_blank" rel="noreferrer">
              Issues <ArrowUpRight size={13} />
            </a>
            <a
              className="footer-link"
              href="https://www.npmjs.com/package/imgsquish"
              target="_blank"
              rel="noreferrer"
            >
              npm <ArrowUpRight size={13} />
            </a>
          </nav>

          <div className="footer-col footer-cli">
            <h4>{t("footer.col.cli")}</h4>
            <CopyCommand command="npx imgsquish photo.jpg" />
            <CopyCommand command="npx imgsquish -s discord photo.png" />
          </div>
        </div>

        <div className="site-footer-inner footer-bottom">
          <span>{t("footer.license", { year })}</span>
          <span className="mono footer-tech">Canvas API · sharp · WebP / JPEG / PNG</span>
        </div>
        <div className="site-footer-inner footer-legal">{t("footer.legal")}</div>
      </footer>
    </div>
  );
}
