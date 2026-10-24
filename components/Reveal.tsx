"use client";
import { useEffect } from "react";

/**
 * Apparition douce des blocs marqués data-reveal lorsqu'ils entrent à l'écran.
 * Le contenu reste visible sans JavaScript et lorsque l'utilisateur a réduit les animations.
 */
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const els = [...document.querySelectorAll<HTMLElement>("[data-reveal]")].filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.9);
    els.forEach((el) => el.classList.add("rv"));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("rv-in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -6% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
