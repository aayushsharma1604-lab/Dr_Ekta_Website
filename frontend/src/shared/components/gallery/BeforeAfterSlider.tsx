"use client";

import { useState } from "react";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
}

/**
 * Draggable before/after comparison slider.
 * Design-only component — no data fetching, props only.
 */
export function BeforeAfterSlider({ before, after, beforeLabel = "BEFORE", afterLabel = "AFTER" }: BeforeAfterSliderProps) {
  const [pos, setPos] = useState(50);

  return (
    <div className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
      {/* AFTER — full background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after} alt="After treatment" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <span className="absolute right-3 top-3 rounded bg-zinc-900/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">{afterLabel}</span>

      {/* BEFORE — full-size layer clipped from the right */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt="Before treatment" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <span className="absolute left-3 top-3 whitespace-nowrap rounded bg-zinc-900/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">{beforeLabel}</span>
      </div>

      {/* Divider + handle */}
      <div className="absolute inset-y-0 w-[2px] bg-secondary-foreground shadow-lg" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-secondary-foreground shadow-md">
          <span className="material-icons text-lg">drag_indicator</span>
        </div>
      </div>

      {/* Invisible range input for drag */}
      <input
        aria-label="Comparison slider between before and after treatment"
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
