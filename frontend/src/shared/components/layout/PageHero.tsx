import Link from "next/link";
import type { ReactNode } from "react";

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  image?: string;
  imageAlt?: string;
  imageBadge?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  fullBleed?: boolean;
  breadcrumb?: Crumb[];
  children?: ReactNode;
}

export default function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt = "",
  imageBadge,
  backgroundImage,
  backgroundVideo,
  fullBleed = false,
  breadcrumb,
  children,
}: PageHeroProps) {
  const isDark = Boolean(backgroundVideo);
  const isFullBleed = fullBleed || isDark;

  return (
    <section
      className={
        isFullBleed
          ? "relative overflow-hidden bg-slate-950"
          : "bg-[#dbeafe] px-2 pt-2 sm:px-3 sm:pt-3"
      }
    >
      <div
        className={
          isFullBleed
            ? "relative overflow-hidden"
            : "relative mx-auto max-w-[1600px] overflow-hidden rounded-[28px] bg-white"
        }
      >
        {(backgroundVideo || backgroundImage) && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {backgroundVideo && (
              <video
                className="h-full w-full object-cover motion-reduce:hidden"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={backgroundImage}
              >
                <source src={backgroundVideo} type="video/mp4" />
              </video>
            )}
            {backgroundImage && (
              <img
                src={backgroundImage}
                alt=""
                className={`h-full w-full object-cover ${
                  backgroundVideo ? "hidden motion-reduce:block" : ""
                } ${isFullBleed ? "" : "opacity-60"}`}
              />
            )}
            {isDark ? (
              <>
                <div className="absolute inset-0 bg-slate-950/40" />
                <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-white/60" />
            )}
          </div>
        )}

        <div
          className={`relative grid w-full min-w-0 gap-10 ${
            isFullBleed
              ? "mx-auto min-h-[640px] max-w-[1500px] px-6 pb-16 pt-32 sm:px-10 lg:min-h-[760px] lg:px-16 lg:pb-24 lg:pt-40"
              : "px-6 py-14 sm:px-10 lg:px-14 lg:py-20"
          } ${image ? "lg:grid-cols-12 lg:items-center" : ""}`}
        >
          <div className={`min-w-0 ${image ? "lg:col-span-7" : "max-w-4xl"}`}>
            {breadcrumb && breadcrumb.length > 0 && (
              <nav
                data-reveal
                className={`mb-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                  isDark ? "hero-dark-crumb text-white/75" : "text-slate-500"
                }`}
                aria-label="Breadcrumb"
              >
                <Link
                  href="/"
                  className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-slate-900"}`}
                >
                  Home
                </Link>
                {breadcrumb.map((crumb) => (
                  <span key={crumb.label} className="flex items-center gap-2">
                    <span className={isDark ? "text-white/30" : "text-slate-300"}>/</span>
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className={`transition-colors ${
                          isDark ? "hover:text-white" : "hover:text-slate-900"
                        }`}
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={isDark ? "text-white" : "text-slate-900"}>{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}

            <div data-reveal style={{ transitionDelay: "60ms" }}>
              {eyebrow && (
                <p
                  className={
                    isDark
                      ? "text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70"
                      : "eyebrow"
                  }
                >
                  {eyebrow}
                </p>
              )}
              <h1 className={`mt-3 heading-xl max-w-full break-words ${isDark ? "hero-dark-title text-white!" : ""}`}>
                {title}
              </h1>
              {description && (
                <p className={`mt-5 max-w-2xl break-words body-lg ${isDark ? "hero-dark-body" : ""}`}>
                  {description}
                </p>
              )}
              {children && (
                <div
                  className={`mt-8 flex flex-wrap items-center gap-3 ${
                    isDark ? "hero-dark-actions" : ""
                  }`}
                >
                  {children}
                </div>
              )}
            </div>
          </div>

          {image && (
            <div className="lg:col-span-5" data-reveal style={{ transitionDelay: "120ms" }}>
              <div
                className={`media-card aspect-[4/3] rounded-2xl bg-[#eff6ff] lg:aspect-[4/5] ${
                  isDark ? "ring-1 ring-white/20" : ""
                }`}
              >
                <img
                  src={image}
                  alt={imageAlt}
                  className="media-drift h-full w-full object-cover"
                />
                {imageBadge && (
                  <span className="media-badge">
                    <span className="material-icons text-sm">photo_camera</span>
                    {imageBadge}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
