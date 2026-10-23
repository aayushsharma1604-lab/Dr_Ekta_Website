import Link from "next/link";
import type { ReactNode } from "react";

interface ImageCardProps {
  image: string;
  alt?: string;
  title: string;
  description?: string;
  icon?: string;
  eyebrow?: string;
  href?: string;
  className?: string;
  imageClassName?: string;
  children?: ReactNode;
}

/**
 * Photo-backed card used for credentials, expertise, team and recognition
 * sections. The overlay keeps text readable while the image stays visible.
 */
export default function ImageCard({
  image,
  alt = "",
  title,
  description,
  icon,
  eyebrow,
  href,
  className = "min-h-[260px]",
  imageClassName = "",
  children,
}: ImageCardProps) {
  const card = (
    <div
      data-reveal
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-slate-900 ${className}`}
    >
      <img
        src={image}
        alt={alt}
        loading="lazy"
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${imageClassName}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-slate-950/10 transition-opacity duration-500 group-hover:from-slate-950" />

      <div className="relative flex flex-1 flex-col justify-end p-6">
        {icon && (
          <span className="mb-4 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-slate-700 ring-1 ring-white/30 transition-colors group-hover:bg-slate-50 group-hover:text-slate-900">
            <span className="material-icons block text-xl leading-none">{icon}</span>
          </span>
        )}

        {eyebrow && (
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
            {eyebrow}
          </p>
        )}

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-heading text-xl font-semibold leading-tight tracking-[-0.01em] text-white">
              {title}
            </h3>
            {description && (
              <p className="mt-2 text-sm leading-6 text-white/70">{description}</p>
            )}
          </div>
          {href && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-all duration-300 group-hover:bg-white group-hover:text-slate-900">
              <span className="material-icons text-base">arrow_outward</span>
            </span>
          )}
        </div>

        {children}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {card}
    </Link>
  ) : (
    card
  );
}
