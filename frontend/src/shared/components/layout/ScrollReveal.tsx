"use client";

import { useEffect } from "react";

/**
 * Adds the reveal class only after mount, so the page never depends on JS for
 * readable content. Cards loaded later by the API are picked up by the
 * MutationObserver as well.
 */
export default function ScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const seen = new WeakSet<Element>();
    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );
    }

    const register = (element: HTMLElement, index: number) => {
      if (seen.has(element)) return;
      seen.add(element);
      element.classList.add("reveal");
      if (!element.style.getPropertyValue("--reveal-delay")) {
        element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
      }
      if (!observer) {
        element.classList.add("is-visible");
        return;
      }
      // Content mounted after the first scan (for example a hero that waits for
      // API data) should not stay hidden while the observer catches up.
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        element.classList.add("is-visible");
        return;
      }
      observer.observe(element);
    };

    let frame = 0;
    const scan = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const nodes = Array.from(
          document.querySelectorAll<HTMLElement>("[data-reveal], .card-hover")
        );
        nodes.forEach((node, index) => register(node, index));
      });
    };

    scan();
    const mutation = new MutationObserver(scan);
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      mutation.disconnect();
      observer?.disconnect();
    };
  }, []);

  return null;
}
