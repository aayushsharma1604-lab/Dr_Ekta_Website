import Link from "next/link";
import { SITE_CONFIG } from "@/shared/constants";

export default function FloatingCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900 lg:hidden">
      <div className="flex">
        <a
          href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=Hi%2C%20I%20would%20like%20to%20book%20an%20appointment.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center gap-1 py-3 text-sky-600"
        >
          <span className="material-icons">chat</span>
          <span className="text-[10px] font-medium">WhatsApp</span>
        </a>
        <a
          href={`tel:${SITE_CONFIG.phone}`}
          className="flex flex-1 flex-col items-center gap-1 border-x border-zinc-200 py-3 text-sky-600 dark:border-zinc-700"
        >
          <span className="material-icons">call</span>
          <span className="text-[10px] font-medium">Call</span>
        </a>
        <Link
          href="/#book-appointment"
          className="flex flex-1 flex-col items-center gap-1 bg-sky-600 py-3 text-white"
        >
          <span className="material-icons">calendar_month</span>
          <span className="text-[10px] font-medium">Book Now</span>
        </Link>
      </div>
    </div>
  );
}
