import { useEffect, useState } from "react";
import { Loader2, TriangleAlert, CircleAlert, Download, X } from "lucide-react";
import { formatBytes, reductionPercent } from "@image-compressor/core";
import type { ProcessResult } from "../lib/processor";
import { ImageCompare } from "./ImageCompare";
import { useI18n } from "../i18n";

export interface FileItem {
  id: number;
  file: File;
  status: "pending" | "processing" | "done" | "error";
  result?: ProcessResult;
  error?: string;
}

interface Props {
  item: FileItem;
  onDownload: (item: FileItem) => void;
  onRemove: (id: number) => void;
}

export function FileRow({ item, onDownload, onRemove }: Props) {
  const { t } = useI18n();
  const { file, status, result, error } = item;

  // Object URLs for the before/after comparison. Create and revoke in the same
  // effect so the URL's lifetime matches the element (survives StrictMode's
  // mount/unmount/remount without leaving a revoked URL on screen).
  const [beforeUrl, setBeforeUrl] = useState("");
  const [afterUrl, setAfterUrl] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setBeforeUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!result) {
      setAfterUrl("");
      return;
    }
    const url = URL.createObjectURL(result.blob);
    setAfterUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  const pct = result ? reductionPercent(result.originalSize, result.compressedSize) : 0;
  const resized =
    result &&
    (result.width !== result.originalWidth || result.height !== result.originalHeight);

  return (
    <div className={`file-row ${status}`}>
      <div className="file-head">
        <div className="file-main">
          <div className="file-name" title={file.name}>
            {file.name}
          </div>
          {result && (
            <div className="file-meta">
              {result.originalWidth}×{result.originalHeight}
              {resized && ` → ${result.width}×${result.height}`} ·{" "}
              {result.format.toUpperCase()}
              {result.format !== "png" && ` · q${result.quality}`}
            </div>
          )}
        </div>

        <div className="file-head-actions">
          {status === "pending" && <span className="badge pending">{t("status.queued")}</span>}
          {status === "processing" && (
            <span className="badge processing">
              <Loader2 size={13} className="spin" />
              {t("status.compressing")}
            </span>
          )}
          {status === "error" && (
            <span className="badge error" title={error}>
              <TriangleAlert size={13} />
              {t("status.error")}
            </span>
          )}
          <button
            className="file-remove"
            onClick={() => onRemove(item.id)}
            aria-label={t("status.remove")}
            title={t("status.remove")}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {status === "done" && result && (
        <>
          <div className="file-stats">
            <div className="stat">
              <span className="stat-label">{t("stat.before")}</span>
              <span className="stat-value">{formatBytes(result.originalSize)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">{t("stat.after")}</span>
              <span className="stat-value">{formatBytes(result.compressedSize)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">{t("stat.saved")}</span>
              <span className={`stat-value ${pct >= 0 ? "accent" : "warn"}`}>
                {pct >= 0 ? "−" : "+"}
                {Math.abs(pct).toFixed(0)}%
              </span>
            </div>
            {result.overTarget && (
              <span className="badge warn-badge" title={t("badge.overlimit.title")}>
                <CircleAlert size={13} />
                {t("badge.overlimit")}
              </span>
            )}
            <button className="btn-download" onClick={() => onDownload(item)}>
              <Download size={15} />
              {t("btn.download")}
            </button>
          </div>

          <div className="file-player">
            <ImageCompare beforeUrl={beforeUrl} afterUrl={afterUrl} />
          </div>
        </>
      )}

      {status === "error" && <div className="file-error">{error}</div>}
    </div>
  );
}
