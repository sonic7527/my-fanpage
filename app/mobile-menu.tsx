"use client";

import { useState, useEffect } from "react";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const links = [
    { href: "/#services", label: "服務項目" },
    { href: "/posts", label: "維修案例" },
    { href: "/#faq", label: "常見問題" },
    { href: "/#contact", label: "聯絡我們" },
  ];

  return (
    <div className="md:hidden">
      {/* 漢堡按鈕 */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-muted hover:text-white transition-colors z-[60]"
        aria-label={open ? "關閉選單" : "開啟選單"}
      >
        <div className="flex flex-col gap-[5px]">
          <span
            className={`block h-[2px] w-5 bg-current transition-all duration-300 origin-center ${
              open ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-5 bg-current transition-all duration-300 ${
              open ? "opacity-0 scale-x-0" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-5 bg-current transition-all duration-300 origin-center ${
              open ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </div>
      </button>

      {/* 全螢幕選單 */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ${
          open ? "visible" : "invisible"
        }`}
      >
        {/* 背景遮罩 */}
        <div
          className={`absolute inset-0 bg-primary-deep/95 backdrop-blur-2xl transition-opacity duration-500 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />

        {/* 選單內容 */}
        <div className="relative flex h-full flex-col items-center justify-center gap-2 px-6">
          {links.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block py-4 text-center text-3xl font-bold text-white/80 transition-all duration-500 hover:text-accent ${
                open
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: open ? `${i * 80 + 100}ms` : "0ms" }}
            >
              {link.label}
            </a>
          ))}

          <a
            href="/#contact"
            onClick={() => setOpen(false)}
            className={`mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-bold text-white transition-all duration-500 hover:scale-105 ${
              open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: open ? "420ms" : "0ms" }}
          >
            預約維修諮詢
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
