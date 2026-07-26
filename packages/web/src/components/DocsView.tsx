import { ArrowLeft } from "lucide-react";
import { PRESETS } from "@image-compressor/core";
import { CopyCommand } from "./CopyCommand";
import { useI18n } from "../i18n";

interface Props {
  onBack: () => void;
}

export function DocsView({ onBack }: Props) {
  const { t } = useI18n();
  return (
    <main className="app-main docs">
      <button className="btn-ghost docs-back" onClick={onBack}>
        <ArrowLeft size={15} />
        {t("nav.back")}
      </button>

      <header className="docs-hero">
        <span className="eyebrow">{t("docs.eyebrow")}</span>
        <h1>{t("docs.title")}</h1>
        <p className="doc-p">{t("docs.intro")}</p>
      </header>

      <section className="doc-section">
        <h2 className="doc-h">
          <span className="doc-h-i">1</span> {t("docs.s1")}
        </h2>
        <p className="doc-p">{t("docs.presets.p")}</p>
        <div className="doc-table">
          <div className="doc-tr doc-th">
            <span>{t("docs.th.preset")}</span>
            <span>{t("docs.th.output")}</span>
            <span>{t("docs.th.best")}</span>
          </div>
          {PRESETS.map((p) => (
            <div className="doc-tr" key={p.id}>
              <span className="doc-id">{p.id}</span>
              <span className="doc-target">
                {p.format === "keep" ? "keep format" : p.format} · q{p.quality}
              </span>
              <span className="doc-use">
                {t(`preset.${p.id}.desc`, undefined, p.description)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="doc-section">
        <h2 className="doc-h">
          <span className="doc-h-i">2</span> {t("docs.s2")}
        </h2>
        <dl className="opt-list">
          <div className="opt">
            <dt>{t("docs.opt.format.dt")}</dt>
            <dd>{t("docs.opt.format.dd")}</dd>
          </div>
          <div className="opt">
            <dt>{t("docs.opt.quality.dt")}</dt>
            <dd>{t("docs.opt.quality.dd")}</dd>
          </div>
          <div className="opt">
            <dt>{t("docs.opt.resize.dt")}</dt>
            <dd>{t("docs.opt.resize.dd")}</dd>
          </div>
          <div className="opt">
            <dt>{t("docs.opt.target.dt")}</dt>
            <dd>{t("docs.opt.target.dd")}</dd>
          </div>
        </dl>
      </section>

      <section className="doc-section">
        <h2 className="doc-h">
          <span className="doc-h-i">3</span> {t("docs.s3")}
        </h2>
        <p className="doc-p">{t("docs.cli.p")}</p>
        <CopyCommand command="npx imgsquish ./images -o ./images-min" />
        <CopyCommand command="npx imgsquish --max-size 1MB -m 500 avatar.png" />
        <p className="doc-p">{t("docs.cli.p2")}</p>
      </section>

      <section className="doc-section">
        <h2 className="doc-h">
          <span className="doc-h-i">4</span> {t("docs.s4")}
        </h2>
        <p className="doc-p">{t("docs.privacy.p")}</p>
      </section>

      <section className="doc-section">
        <h2 className="doc-h">
          <span className="doc-h-i">AI</span> AI agent prompt
        </h2>
        <p className="doc-p">
          Read the AI guide and follow it. If you want reusable future support and have not installed the project Skill, explain or perform the Skill installation. Otherwise use the one-off npx method. If your intent or input files are unclear, ask before acting. Respond in the user's language. Do not process files just because you read the guide.
        </p>
        <CopyCommand
          command="Read https://imgsquish.riyo.me/ai, follow its instructions, and handle my request. If I want reusable future support and have not installed the project Skill, explain or perform the Skill installation. Otherwise use the one-off npx method. If my intent or input files are unclear, ask before acting. Respond in the user's language. Do not process files just because you read this page."
        />
      </section>
    </main>
  );
}
