"use client";

import { useState, useEffect, useRef } from "react";

const brands = [
  {
    id: "sym",
    name: "SYM",
    sub: "三陽",
    color: "#3B82F6",
    models: ["FIGHTER 5／JET EVO", "FIGHTER 6", "FNX", "GT 125", "GR 125", "JET-S／SR", "JET-POWER", "MIO 115", "MII 110", "NEW MII", "RX 110", "TL-508", "Z1／IRX"],
  },
  {
    id: "kymco",
    name: "KYMCO",
    sub: "光陽",
    color: "#10B981",
    models: ["新名流", "GP 125", "G5 系列", "G6", "G6 50週年", "KIWI", "Like", "Many 110", "Many 125", "NEW Many", "Racing", "Racing King", "VJR 110", "VJR 125"],
  },
  {
    id: "yamaha",
    name: "YAMAHA",
    sub: "山葉",
    color: "#0EA5E9",
    models: ["BWS'X", "BWS'R", "CUXI", "NEW CUXI", "CUXI 115", "FORCE", "GTR", "LIMI", "RSZ", "RS-ZERO", "S-MAX", "勁戰2代"],
  },
  {
    id: "pgo",
    name: "PGO",
    sub: "比雅久",
    color: "#F97316",
    models: ["ALPHA MAX", "JBUBU 115", "JBUBU 125", "TIGRA 125", "TIGRA 150", "X-HOT"],
  },
  {
    id: "suzuki",
    name: "SUZUKI",
    sub: "鈴木",
    color: "#EAB308",
    models: ["GSR／NEX", "SALUTO"],
  },
  {
    id: "vespa",
    name: "Vespa",
    sub: "偉士牌",
    color: "#14B8A6",
    models: ["春天 Primavera"],
  },
];

export default function VehicleOrbit() {
  const [selected, setSelected] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [angle, setAngle] = useState(0);
  const animRef = useRef<number>(0);
  const lastTime = useRef<number>(0);

  useEffect(() => {
    function animate(time: number) {
      if (!paused) {
        const delta = lastTime.current ? (time - lastTime.current) / 1000 : 0;
        setAngle((prev) => (prev + delta * 15) % 360); // 15 degrees per second
      }
      lastTime.current = time;
      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [paused]);

  function handleBrandClick(id: string) {
    if (selected === id) {
      setSelected(null);
      setPaused(false);
    } else {
      setSelected(id);
      setPaused(true);
    }
  }

  const selectedBrand = brands.find((b) => b.id === selected);
  const orbitRadius = 220; // px from center

  return (
    <section id="vehicles" className="relative py-28 overflow-hidden bg-primary-deep">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Section header */}
        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Compatible Models</span>
          <h2 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,3rem)] font-black text-white">
            可維修車款一覽
          </h2>
          <p className="mt-2 text-sm text-white/40">
            點擊品牌查看可維修車款
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-0">
          {/* Left panel - brand detail (shows when selected) */}
          <div className={`w-full lg:w-[340px] shrink-0 transition-all duration-700 ${selected ? "opacity-100 translate-x-0" : "opacity-0 lg:-translate-x-10 pointer-events-none"}`}>
            {selectedBrand && (
              <div className="rounded-2xl border border-white/[0.08] bg-surface/30 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-sm"
                    style={{ backgroundColor: selectedBrand.color + "30", color: selectedBrand.color }}
                  >
                    {selectedBrand.name.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{selectedBrand.name}</h3>
                    <p className="text-xs text-text-dim">{selectedBrand.sub} ｜ {selectedBrand.models.length} 款</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedBrand.models.map((model) => (
                    <span
                      key={model}
                      className="rounded-full px-3 py-1.5 text-xs font-medium text-white/80 border transition-all duration-300"
                      style={{
                        borderColor: selectedBrand.color + "30",
                        backgroundColor: selectedBrand.color + "10",
                      }}
                    >
                      {model}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setPaused(false); }}
                  className="mt-5 text-xs text-text-dim hover:text-accent transition-colors"
                >
                  ← 返回瀏覽全部品牌
                </button>
              </div>
            )}
          </div>

          {/* Orbit container */}
          <div className="flex-1 flex justify-center">
            <div className="relative" style={{ width: orbitRadius * 2 + 120, height: orbitRadius * 2 + 120 }}>
              {/* Orbit rings */}
              <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${orbitRadius * 2 + 120} ${orbitRadius * 2 + 120}`}>
                {/* Outer hexagonal orbit */}
                <HexPath cx={orbitRadius + 60} cy={orbitRadius + 60} r={orbitRadius} className="stroke-white/[0.06] fill-none" strokeWidth={1} />
                <HexPath cx={orbitRadius + 60} cy={orbitRadius + 60} r={orbitRadius * 0.7} className="stroke-white/[0.04] fill-none" strokeWidth={1} />
                <HexPath cx={orbitRadius + 60} cy={orbitRadius + 60} r={orbitRadius * 0.4} className="stroke-white/[0.03] fill-none" strokeWidth={1} />
                {/* Accent dots on orbits */}
                <circle cx={orbitRadius + 60 + orbitRadius * 0.7} cy={orbitRadius + 60} r={2} className="fill-accent/30" />
                <circle cx={orbitRadius + 60} cy={orbitRadius + 60 - orbitRadius * 0.7} r={2} className="fill-white/10" />
              </svg>

              {/* Center - 北大 text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`relative flex flex-col items-center justify-center transition-all duration-500 ${paused ? "scale-90 opacity-70" : "scale-100 opacity-100"}`}>
                  {/* Glow */}
                  <div className="absolute inset-0 rounded-full bg-accent/[0.06] blur-[80px] scale-[2]" />
                  <div className="relative text-center">
                    <div className="font-display text-6xl font-black text-white tracking-tight leading-none" style={{ textShadow: "0 0 40px rgba(220,60,40,0.3), 0 0 80px rgba(220,60,40,0.1)" }}>
                      北大
                    </div>
                    <div className="text-xs font-bold text-accent/70 tracking-[0.4em] mt-2 uppercase">
                      Bei Da
                    </div>
                  </div>
                </div>
              </div>

              {/* Orbiting brand icons */}
              {brands.map((brand, i) => {
                const brandAngle = angle + (i * 360) / brands.length;
                const rad = (brandAngle * Math.PI) / 180;
                const x = Math.cos(rad) * orbitRadius + orbitRadius + 60;
                const y = Math.sin(rad) * orbitRadius + orbitRadius + 60;
                const isSelected = selected === brand.id;

                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => handleBrandClick(brand.id)}
                    className={`absolute flex flex-col items-center justify-center transition-all duration-300 -translate-x-1/2 -translate-y-1/2 group ${isSelected ? "z-20 scale-125" : "z-10 hover:scale-110"}`}
                    style={{ left: x, top: y }}
                  >
                    {/* Icon circle */}
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full border-2 backdrop-blur-sm transition-all duration-300 ${
                        isSelected
                          ? "shadow-[0_0_25px_var(--glow)]"
                          : "hover:shadow-[0_0_20px_var(--glow)]"
                      }`}
                      style={{
                        "--glow": brand.color + "50",
                        borderColor: isSelected ? brand.color : brand.color + "40",
                        backgroundColor: isSelected ? brand.color + "25" : "rgba(0,0,0,0.5)",
                      } as React.CSSProperties}
                    >
                      <span
                        className="font-bold text-xs"
                        style={{ color: brand.color }}
                      >
                        {brand.name.length > 4 ? brand.name.slice(0, 3) : brand.name}
                      </span>
                    </div>
                    {/* Label */}
                    <span className={`mt-1.5 text-[10px] font-medium whitespace-nowrap transition-opacity duration-300 ${isSelected ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`} style={{ color: brand.color }}>
                      {brand.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center">
          <p className="text-xs text-text-dim">
            ⚠️ 僅服務一般機車儀表，重機與汽車恕不服務 ｜ 114.07.27 更新 ｜ 持續新增中
          </p>
        </div>
      </div>
    </section>
  );
}

/* Hexagonal path SVG */
function HexPath({ cx, cy, r, className, strokeWidth }: { cx: number; cy: number; r: number; className?: string; strokeWidth?: number }) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    points.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
  }
  return (
    <polygon
      points={points.join(" ")}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
}
