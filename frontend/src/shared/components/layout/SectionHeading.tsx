import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      data-reveal
      className={`${align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className={`${eyebrow ? "mt-3" : ""} heading-lg`}>{title}</h2>
      {description && (
        <p className={`${align === "center" ? "mx-auto" : ""} mt-4 max-w-2xl body-lg`}>
          {description}
        </p>
      )}
    </div>
  );
}
