"use client";

import { useState } from "react";

const brands = [
  {
    name: "SYM 三陽",
    color: "text-blue-400",
    models: [
      "FIGHTER 5／JET EVO", "FIGHTER 6", "FNX", "GT 125", "GR 125",
      "JET-S／SR", "JET-POWER", "MIO 115", "MII 110", "NEW MII",
      "RX 110", "TL-508", "Z1／IRX",
    ],
  },
  {
    name: "KYMCO 光陽",
    color: "text-emerald-400",
    models: [
      "新名流", "GP 125", "G5 系列", "G6", "G6 50週年",
      "KIWI", "Like", "Many 110", "Many 125", "NEW Many",
      "Racing", "Racing King", "VJR 110", "VJR 125",
    ],
  },
  {
    name: "YAMAHA 山葉",
    color: "text-sky-400",
    models: [
      "BWS'X", "BWS'R", "CUXI", "NEW CUXI", "CUXI 115",
      "FORCE", "GTR", "LIMI", "RSZ", "RS-ZERO",
      "S-MAX", "勁戰2代",
    ],
  },
  {
    name: "PGO 比雅久",
    color: "text-orange-400",
    models: [
      "ALPHA MAX", "JBUBU 115", "JBUBU 125",
      "TIGRA 125", "TIGRA 150", "X-HOT",
    ],
  },
  {
    name: "SUZUKI 鈴木",
    color: "text-yellow-400",
    models: ["GSR／NEX", "SALUTO"],
  },
  {
    name: "Vespa 偉士牌",
    color: "text-teal-400",
    models: ["春天 Primavera"],
  },
];

export default function VehiclePanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-medium text-text-muted hover:text-accent transition-colors mt-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        可維修車款一覽
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute top-full left-0 z-[60] mt-2 w-[90vw] max-w-[700px] rounded-2xl border border-white/[0.08] bg-primary-deep/95 backdrop-blur-xl shadow-2xl animate-fade-up overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-base font-bold text-text">可維修車款一覽</h3>
                <p className="text-[11px] text-text-dim mt-0.5">114.07.27 更新 ｜ 持續新增中</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-dim hover:text-text hover:bg-white/[0.06] transition-colors"
                aria-label="關閉"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Brand grid */}
            <div className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-h-[60vh] overflow-y-auto">
              {brands.map((brand) => (
                <div
                  key={brand.name}
                  className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 hover:border-white/[0.08] transition-colors"
                >
                  <h4 className={`text-sm font-bold ${brand.color} mb-2.5`}>
                    {brand.name}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {brand.models.map((model) => (
                      <span
                        key={model}
                        className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-text-muted"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div className="px-6 py-3 border-t border-white/[0.06] bg-surface/20">
              <p className="text-[11px] text-text-dim">
                ⚠️ 僅服務一般機車儀表，重機與汽車恕不服務。未列出的車款歡迎透過 LINE 詢問。
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
