import { SIZE_TARGETS } from "@image-compressor/core";
import { iconUrlForTarget, hideBrokenIcon } from "../lib/serviceIcons";

// Two rows of service chips scrolling in opposite directions. Brand icons come
// from the Simple Icons CDN (see serviceIcons). Rows are decorative (aria-hidden).
interface Chip {
  label: string;
  icon?: string;
}

const CHIPS: Chip[] = SIZE_TARGETS.map((t) => ({
  label: t.label,
  icon: iconUrlForTarget(t.id),
}));

const HALF = Math.ceil(CHIPS.length / 2);
const ROW_A = CHIPS.slice(0, HALF);
const ROW_B = CHIPS.slice(HALF);

function ChipEl({ label, icon }: Chip) {
  return (
    <span className="chip">
      {icon && (
        <img
          className="chip-icon"
          src={icon}
          alt=""
          width={15}
          height={15}
          decoding="async"
          onError={hideBrokenIcon}
        />
      )}
      {label}
    </span>
  );
}

function Row({ items, reverse }: { items: Chip[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className={`marquee${reverse ? " reverse" : ""}`}>
      <div className="marquee-track">
        {doubled.map((c, i) => (
          <ChipEl key={i} {...c} />
        ))}
      </div>
    </div>
  );
}

export function ServiceMarquee() {
  return (
    <div className="marquee-wrap" aria-hidden="true">
      <Row items={ROW_A} />
      <Row items={ROW_B} reverse />
    </div>
  );
}
