/**
 * "In the Media" content — the single place to edit when a new mention lands.
 * Add an entry to MEDIA_ITEMS and it shows up on /media automatically
 * (sorted newest first, filters and search pick it up with no code change).
 */

export type MediaType = "article" | "podcast" | "magazine" | "video" | "award";

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  publication: string;
  /** ISO date (YYYY-MM-DD) — used for sorting and the year filter. */
  date: string;
  /** Absolute URL; links open in a new tab. */
  url: string;
  /** Thumbnail; any image path works (public/ folder or remote URL). */
  image: string;
  excerpt: string;
  /** Highlighted above the grid. */
  featured?: boolean;
  /** YouTube id — enables the inline podcast/video embed. */
  youtubeId?: string;
}

/** Badge label, icon and CTA wording per media type. */
export const MEDIA_TYPE_META: Record<MediaType, { label: string; icon: string; cta: string }> = {
  article: { label: "Article", icon: "article", cta: "Read Article" },
  podcast: { label: "Podcast", icon: "podcasts", cta: "Listen Now" },
  magazine: { label: "Magazine", icon: "auto_stories", cta: "View Issue" },
  video: { label: "Video / TV", icon: "play_circle", cta: "Watch Now" },
  award: { label: "Award", icon: "emoji_events", cta: "View Recognition" },
};

/** Filter pills, in display order. */
export const MEDIA_TYPE_FILTERS: { value: MediaType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "article", label: "Articles" },
  { value: "podcast", label: "Podcasts" },
  { value: "magazine", label: "Magazines" },
  { value: "video", label: "Video / TV" },
  { value: "award", label: "Awards" },
];

export const MEDIA_ITEMS: MediaItem[] = [
  {
    id: "times-of-india-smile-makeovers",
    type: "article",
    title: "New Delhi clinics are raising the bar for painless smile makeovers",
    publication: "The Times of India",
    date: "2026-08-14",
    url: "https://timesofindia.indiatimes.com/",
    image: "/dental/service-veneers.jpg",
    excerpt:
      "Dr. Ekta Narula explains how digital planning and a comfort-first chair-side protocol are changing what a same-day smile makeover looks like.",
    featured: true,
  },
  {
    id: "health-pulse-podcast",
    type: "podcast",
    title: "The fear behind the flinch: why dental anxiety is costing India its smiles",
    publication: "The Health Pulse",
    date: "2026-07-02",
    url: "https://www.youtube.com/",
    image: "/dental/service-checkup.jpg",
    excerpt:
      "A candid conversation on needle phobia, sedation dentistry and the small changes that make a first dental visit bearable.",
    featured: true,
    youtubeId: "dQw4w9WgXcQ",
  },
  {
    id: "india-today-health-wellness",
    type: "magazine",
    title: "10 dentists changing the way India smiles",
    publication: "India Today",
    date: "2026-05-21",
    url: "https://www.indiatoday.in/",
    image: "/hero-dr-ekta-portrait.jpg",
    excerpt:
      "From full-mouth rehabilitation to the dentist-led oral health camps that screened record-breaking numbers of children.",
  },
  {
    id: "ndtv-profit-preventive-dentistry",
    type: "video",
    title: "The business of preventive dentistry",
    publication: "NDTV Profit",
    date: "2026-04-09",
    url: "https://www.youtube.com/",
    image: "/doctor-desk.jpg",
    excerpt:
      "Dr. Ekta Narula on why the economics of a dental clinic are shifting from reactive treatments to planned, preventive care.",
    youtubeId: "dQw4w9WgXcQ",
  },
  {
    id: "hindustan-times-dental-anxiety",
    type: "article",
    title: "Dental anxiety is real — here is how the chair became a safe place again",
    publication: "Hindustan Times",
    date: "2026-03-18",
    url: "https://www.hindustantimes.com/",
    image: "/dental/clinic-room.jpg",
    excerpt:
      "Talking to patients first, moving at their pace and never rushing the appointment: the small habits behind a 4.9-star clinic.",
  },
  {
    id: "asia-book-of-records",
    type: "award",
    title: "Record for most children screened in dentist-led oral health camps",
    publication: "Asia Book of Records",
    date: "2026-02-11",
    url: "https://www.asiabookofrecords.com/",
    image: "/doctor-certificates.jpg",
    excerpt:
      "A national camp across schools and community centres that screened more than 9,000 children for free.",
  },
  {
    id: "outlook-health-implant-specialist",
    type: "magazine",
    title: "Homegrown implants and the specialist behind Dr. Ekta Narula's clinic",
    publication: "Outlook Health",
    date: "2025-12-05",
    url: "https://www.outlookhealth.in/",
    image: "/doctor-desk-2.jpg",
    excerpt:
      "Inside the implant laboratory: how planning, CBCT imaging and a resident periodontist keep full-arch cases predictable.",
  },
  {
    id: "stethoscope-stories-journey",
    type: "podcast",
    title: "From MAMC residency to a private dental studio in New Delhi",
    publication: "Stethoscope Stories",
    date: "2025-10-22",
    url: "https://www.youtube.com/",
    image: "/hero-dr-ekta.jpg",
    excerpt:
      "Twenty-five years of practice, a gold medal from V.S. Dental College, and the decision to build a clinic around comfort.",
    youtubeId: "dQw4w9WgXcQ",
  },
  {
    id: "indian-express-clear-aligners",
    type: "article",
    title: "Straight teeth, clear aligners, and what they actually cost",
    publication: "The Indian Express",
    date: "2025-09-08",
    url: "https://indianexpress.com/",
    image: "/dental/service-cleaning.jpg",
    excerpt:
      "A dentist explains aligner timelines, the trade-offs between braces and aligners, and the questions worth asking before you start.",
  },
  {
    id: "aaj-tak-dental-camp",
    type: "video",
    title: "Free dental health camp: 400 children screened in New Rajinder Nagar",
    publication: "Aaj Tak TV",
    date: "2025-07-30",
    url: "https://www.youtube.com/",
    image: "/clinic-team.jpg",
    excerpt:
      "The team takes the clinic to the community — screenings, fluoride varnishes and referrals for the children who needed more.",
    youtubeId: "dQw4w9WgXcQ",
  },
  {
    id: "femina-smile-aesthetic",
    type: "magazine",
    title: "Confidence, not perfection: the new smile aesthetic",
    publication: "Femina",
    date: "2025-05-19",
    url: "https://www.femina.in/",
    image: "/dental/service-veneers.jpg",
    excerpt:
      "Why the goal of cosmetic dentistry has moved from a perfect smile to one that still looks like you.",
  },
  {
    id: "national-dental-excellence-award",
    type: "award",
    title: "Outstanding Cosmetic Dentist of the Year 2025",
    publication: "National Dental Excellence Awards",
    date: "2024-11-28",
    url: "https://www.dentalexcellenceawards.com/",
    image: "/doctor-certificates.jpg",
    excerpt:
      "Recognised for clinical outcomes in veneer and full-mouth rehabilitation work across the last year.",
  },
];

/** Newest first — the default order on the page. */
export function sortByDateDesc(items: MediaItem[]): MediaItem[] {
  return [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Distinct years present in the data, newest first. */
export function mediaYears(items: MediaItem[]): string[] {
  return [...new Set(items.map((item) => item.date.slice(0, 4)))].sort((a, b) => Number(b) - Number(a));
}

export function formatMediaDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
