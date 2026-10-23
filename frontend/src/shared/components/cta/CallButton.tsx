import { SITE_CONFIG } from "@/shared/constants";

interface CallButtonProps {
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function CallButton({
  variant = "outline",
  size = "md",
  className = "",
}: CallButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all";

  const variants = {
    primary: "bg-sky-600 text-white hover:bg-sky-700",
    outline:
      "border-2 border-sky-600 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <a
      href={`tel:${SITE_CONFIG.phone}`}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      <span className="material-icons text-base">call</span>
      Call Us
    </a>
  );
}
