"use client";

import { useEffect } from "react";

export default function NavScrollEffect() {
  useEffect(() => {
    const nav = document.querySelector(".nav-bar");
    if (!nav) return;

    const onScroll = () => {
      if (window.scrollY > 50) {
        nav.classList.add("nav-scrolled");
      } else {
        nav.classList.remove("nav-scrolled");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
