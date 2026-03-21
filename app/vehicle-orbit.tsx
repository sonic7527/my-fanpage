"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const brands = [
  {
    id: "sym",
    name: "SYM",
    sub: "三陽",
    color: "#3B82F6",
    // Unique orbit params: radius, speed, offset angle, y-stretch (ellipse)
    orbit: { rx: 210, ry: 180, speed: 0.3, startAngle: 0 },
    models: ["FIGHTER 5／JET EVO", "FIGHTER 6", "FNX", "GT 125", "GR 125", "JET-S／SR", "JET-POWER", "MIO 115", "MII 110", "NEW MII", "RX 110", "TL-508", "Z1／IRX"],
  },
  {
    id: "kymco",
    name: "KYMCO",
    sub: "光陽",
    color: "#10B981",
    orbit: { rx: 250, ry: 200, speed: 0.22, startAngle: 60 },
    models: ["新名流", "GP 125", "G5 系列", "G6", "G6 50週年", "KIWI", "Like", "Many 110", "Many 125", "NEW Many", "Racing", "Racing King", "VJR 110", "VJR 125"],
  },
  {
    id: "yamaha",
    name: "YAMAHA",
    sub: "山葉",
    color: "#0EA5E9",
    orbit: { rx: 190, ry: 230, speed: 0.26, startAngle: 120 },
    models: ["BWS'X", "BWS'R", "CUXI", "NEW CUXI", "CUXI 115", "FORCE", "GTR", "LIMI", "RSZ", "RS-ZERO", "S-MAX", "勁戰2代"],
  },
  {
    id: "pgo",
    name: "PGO",
    sub: "比雅久",
    color: "#F97316",
    orbit: { rx: 270, ry: 170, speed: 0.18, startAngle: 180 },
    models: ["ALPHA MAX", "JBUBU 115", "JBUBU 125", "TIGRA 125", "TIGRA 150", "X-HOT"],
  },
  {
    id: "suzuki",
    name: "SUZUKI",
    sub: "鈴木",
    color: "#EAB308",
    orbit: { rx: 160, ry: 240, speed: 0.35, startAngle: 240 },
    models: ["GSR／NEX", "SALUTO"],
  },
  {
    id: "vespa",
    name: "Vespa",
    sub: "偉士牌",
    color: "#14B8A6",
    orbit: { rx: 230, ry: 160, speed: 0.28, startAngle: 300 },
    models: ["春天 Primavera"],
  },
];

export default function VehicleOrbit() {
  const [selected, setSelected] = useState<string | null>(null);
  const pausedRef = useRef(false);
  const timeRef = useRef(0);
  const animRef = useRef<number>(0);
  const [positions, setPositions] = useState<{ x: number; y: number }[]>(
    brands.map(() => ({ x: 0, y: 0 }))
  );

  const updatePositions = useCallback((time: number) => {
    if (!pausedRef.current) {
      timeRef.current = time;
    }
    const t = timeRef.current / 1000; // seconds

    const cx = 280;
    const cy = 260;

    const newPos = brands.map((brand) => {
      const { rx, ry, speed, startAngle } = brand.orbit;
      const a = (startAngle * Math.PI) / 180 + t * speed;
      // Add wobble for organic feel
      const wobbleX = Math.sin(t * speed * 1.7 + startAngle) * 15;
      const wobbleY = Math.cos(t * speed * 2.3 + startAngle) * 10;
      return {
        x: cx + Math.cos(a) * rx + wobbleX,
        y: cy + Math.sin(a) * ry + wobbleY,
      };
    });

    setPositions(newPos);
    animRef.current = requestAnimationFrame(updatePositions);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(updatePositions);
    return () => cancelAnimationFrame(animRef.current);
  }, [updatePositions]);

  function handleBrandClick(id: string) {
    if (selected === id) {
      setSelected(null);
      pausedRef.current = false;
    } else {
      setSelected(id);
      pausedRef.current = true;
    }
  }

  const selectedBrand = brands.find((b) => b.id === selected);

  return (
    <section id="vehicles" className="relative py-28 overflow-hidden bg-primary-deep">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Compatible Models</span>
          <h2 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,3rem)] font-black text-white">
            可維修車款一覽
          </h2>
          <p className="mt-2 text-sm text-white/40">點擊品牌查看可維修車款</p>
        </div>

        <div className="relative">
          {/* Left panel - overlaid, doesn't push orbit */}
          <div className={`lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2 z-20 w-full lg:w-[340px] transition-all duration-700 ${selected ? "opacity-100 translate-x-0" : "opacity-0 lg:-translate-x-10 pointer-events-none h-0 lg:h-auto"}`}>
            {selectedBrand && (
              <div className="rounded-2xl border border-white/[0.08] bg-surface/30 p-6 backdrop-blur-sm">
                <h3 className="font-bold text-lg mb-1" style={{ color: selectedBrand.color }}>
                  {selectedBrand.name}
                </h3>
                <p className="text-xs text-text-dim mb-4">{selectedBrand.sub} ｜ {selectedBrand.models.length} 款可維修</p>
                <ul className="space-y-0">
                  {selectedBrand.models.map((model, idx) => (
                    <li
                      key={model}
                      className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0 text-sm text-text-muted"
                    >
                      <span className="text-[10px] font-mono w-5 text-text-dim text-right">{String(idx + 1).padStart(2, "0")}</span>
                      <span className="h-1 w-1 rounded-full shrink-0" style={{ backgroundColor: selectedBrand.color + "60" }} />
                      {model}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => { setSelected(null); pausedRef.current = false; }}
                  className="mt-4 text-xs text-text-dim hover:text-accent transition-colors"
                >
                  ← 返回
                </button>
              </div>
            )}
          </div>

          {/* Orbit area - always centered */}
          <div className="flex justify-center">
            <div className="relative" style={{ width: 560, height: 520 }}>
              {/* Orbit trail rings (irregular ellipses) */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 560 520">
                {brands.map((brand, i) => (
                  <ellipse
                    key={brand.id}
                    cx={280}
                    cy={260}
                    rx={brand.orbit.rx}
                    ry={brand.orbit.ry}
                    fill="none"
                    stroke="white"
                    strokeWidth={0.5}
                    strokeDasharray="4 8"
                    transform={`rotate(${i * 12} 280 260)`}
                  />
                ))}
              </svg>

              {/* Decorative dots */}
              <div className="absolute top-[20%] left-[15%] h-1 w-1 rounded-full bg-accent/20" />
              <div className="absolute top-[60%] right-[20%] h-1.5 w-1.5 rounded-full bg-white/10" />
              <div className="absolute bottom-[25%] left-[30%] h-1 w-1 rounded-full bg-accent/15" />

              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`text-center transition-all duration-500 ${selected ? "scale-90 opacity-50" : "scale-100 opacity-100"}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-40 w-40 rounded-full bg-accent/[0.04] blur-[60px]" />
                  </div>
                  <div className="relative">
                    <div
                      className="text-8xl text-white leading-none"
                      style={{ fontFamily: "'Ma Shan Zheng', cursive", textShadow: "0 0 60px rgba(220,60,40,0.25), 0 0 120px rgba(220,60,40,0.1), 0 2px 4px rgba(0,0,0,0.4)" }}
                    >
                      北大
                    </div>
                    <div className="text-[10px] font-bold text-accent/50 tracking-[0.6em] mt-3 uppercase font-display">
                      Bei Da
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand icons */}
              {brands.map((brand, i) => {
                const pos = positions[i];
                const isSelected = selected === brand.id;

                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => handleBrandClick(brand.id)}
                    className={`absolute flex flex-col items-center justify-center transition-all duration-500 -translate-x-1/2 -translate-y-1/2 group ${isSelected ? "z-20 scale-125" : "z-10 hover:scale-110"}`}
                    style={{ left: pos.x, top: pos.y }}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 backdrop-blur-sm transition-all duration-300 ${
                        isSelected ? "shadow-[0_0_30px_var(--glow)]" : "hover:shadow-[0_0_20px_var(--glow)]"
                      }`}
                      style={{
                        "--glow": brand.color + "50",
                        borderColor: isSelected ? brand.color : brand.color + "40",
                        backgroundColor: isSelected ? brand.color + "25" : "rgba(0,0,0,0.6)",
                      } as React.CSSProperties}
                    >
                      <span className="font-bold text-[10px]" style={{ color: brand.color }}>
                        {brand.name.length > 4 ? brand.name.slice(0, 3) : brand.name}
                      </span>
                    </div>
                    <span
                      className={`mt-1 text-[9px] font-medium whitespace-nowrap transition-opacity duration-300 ${isSelected ? "opacity-100" : "opacity-50 group-hover:opacity-100"}`}
                      style={{ color: brand.color }}
                    >
                      {brand.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-text-dim">
            ⚠️ 僅服務一般機車儀表，重機與汽車恕不服務 ｜ 114.07.27 更新 ｜ 持續新增中
          </p>
        </div>
      </div>
    </section>
  );
}
