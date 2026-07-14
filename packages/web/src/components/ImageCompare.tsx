import { useRef, useState } from "react";

interface Props {
  beforeUrl: string;
  afterUrl: string;
}

/**
 * Draggable before/after comparison slider. The "after" (compressed) image sits
 * underneath; the "before" (original) is clipped from the right by the divider.
 */
export function ImageCompare({ beforeUrl, afterUrl }: Props) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  const moveTo = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  };

  return (
    <div
      className="compare"
      ref={ref}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        moveTo(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) moveTo(e.clientX);
      }}
    >
      <img src={afterUrl} className="compare-img" alt="" draggable={false} />
      <img
        src={beforeUrl}
        className="compare-img compare-over"
        alt=""
        draggable={false}
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />
      <span className="compare-tag left">Original</span>
      <span className="compare-tag right">Compressed</span>
      <div className="compare-divider" style={{ left: `${pos}%` }}>
        <span className="compare-grip" />
      </div>
    </div>
  );
}
