"use client";

import { useEffect, useRef } from "react";

/**
 * 滾動觸發動畫元件
 * 當元素進入視窗時加上 .visible class，觸發 CSS transition
 */
export default function ScrollReveal({
  children,
  className = "reveal",
  threshold = 0.15,
  rootMargin = "0px 0px -60px 0px",
}: {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * 批量子元素交錯動畫
 */
export function ScrollRevealGroup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const items = el.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
          items.forEach((item, i) => {
            setTimeout(() => {
              item.classList.add("visible");
            }, i * 120);
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
