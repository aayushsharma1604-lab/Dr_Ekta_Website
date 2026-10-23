/**
 * Routes whose first screen is a full-bleed video hero. The header uses this
 * list to decide whether it should float over the video like the homepage.
 */
const VIDEO_ROUTES = new Set([
  "/",
  "/about",
  "/treatments",
  "/team",
  "/testimonials",
  "/gallery",
  "/knowledge",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/disclaimer",
]);

export function hasVideoHero(pathname: string): boolean {
  if (VIDEO_ROUTES.has(pathname)) return true;
  if (pathname.startsWith("/treatments/")) return true;
  if (pathname.startsWith("/team/")) return true;
  return false;
}

export const PAGE_VIDEO = {
  about: {
    src: "/dental/dentalVideo.mp4",
    poster: "/dental/clinic-room.jpg",
  },
  treatments: {
    src: "/dental/videos/treatments.mp4",
    poster: "/dental/clinic-room.jpg",
  },
  treatmentDetail: {
    src: "/dental/videos/knowledge.mp4",
    poster: "/dental/service-checkup.jpg",
  },
  team: {
    src: "/dental/videos/team.mp4",
    poster: "/clinic-team.jpg",
  },
  testimonials: {
    src: "/dental/videos/testimonials.mp4",
    poster: "/dental/service-cleaning.jpg",
  },
  gallery: {
    src: "/dental/videos/gallery.mp4",
    poster: "/dental/service-veneers.jpg",
  },
  knowledge: {
    src: "/dental/videos/knowledge.mp4",
    poster: "/dental/clinic-room.jpg",
  },
  contact: {
    src: "/dental/videos/contact.mp4",
    poster: "/dental/clinic-room.jpg",
  },
  legal: {
    src: "/dental/videos/legal.mp4",
    poster: "/dental/clinic-room.jpg",
  },
} as const;
