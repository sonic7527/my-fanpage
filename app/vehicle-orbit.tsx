"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const brands = [
  {
    id: "sym", name: "SYM", sub: "三陽", color: "#3B82F6",
    orbit: { layer: 2, speed: 0.25, startAngle: 15 },
    size: 52,
    models: ["FIGHTER 5／JET EVO", "FIGHTER 6", "FNX", "GT 125", "GR 125", "JET-S／SR", "JET-POWER", "MIO 115", "MII 110", "NEW MII", "RX 110", "TL-508", "Z1／IRX"],
  },
  {
    id: "kymco", name: "KYMCO", sub: "光陽", color: "#10B981",
    orbit: { layer: 3, speed: 0.15, startAngle: 200 },
    size: 50,
    models: ["新名流", "GP 125", "G5 系列", "G6", "G6 50週年", "KIWI", "Like", "Many 110", "Many 125", "NEW Many", "Racing", "Racing King", "VJR 110", "VJR 125"],
  },
  {
    id: "yamaha", name: "YAM", sub: "山葉", color: "#0EA5E9",
    orbit: { layer: 1, speed: 0.35, startAngle: 100 },
    size: 48,
    models: ["BWS'X", "BWS'R", "CUXI", "NEW CUXI", "CUXI 115", "FORCE", "GTR", "LIMI", "RSZ", "RS-ZERO", "S-MAX", "勁戰2代"],
  },
  {
    id: "pgo", name: "PGO", sub: "比雅久", color: "#F97316",
    orbit: { layer: 3, speed: 0.2, startAngle: 50 },
    size: 44,
    models: ["ALPHA MAX", "JBUBU 115", "JBUBU 125", "TIGRA 125", "TIGRA 150", "X-HOT"],
  },
  {
    id: "suzuki", name: "SUZ", sub: "鈴木", color: "#EAB308",
    orbit: { layer: 2, speed: 0.3, startAngle: 250 },
    size: 40,
    models: ["GSR／NEX", "SALUTO"],
  },
  {
    id: "vespa", name: "Ves", sub: "偉士牌", color: "#14B8A6",
    orbit: { layer: 1, speed: 0.4, startAngle: 280 },
    size: 38,
    models: ["春天 Primavera"],
  },
];

// Irregular polygon orbit paths (like kzero.com)
// Each layer is a set of points forming an irregular polygon
function getOrbitPoint(layer: number, angle: number, cx: number, cy: number): { x: number; y: number } {
  // Each layer has different radii at different angles — irregular shape
  const layers = [
    // Layer 0: inner (r ~120-150)
    [130, 145, 120, 150, 135, 140, 125, 148, 132, 142, 128, 138],
    // Layer 1: middle (r ~170-210)
    [190, 175, 210, 185, 200, 170, 195, 180, 205, 172, 188, 198],
    // Layer 2: outer (r ~230-280)
    [250, 270, 235, 275, 245, 260, 240, 280, 255, 238, 265, 248],
    // Layer 3: outermost (r ~290-340)
    [310, 295, 340, 305, 325, 290, 335, 300, 320, 298, 330, 308],
  ];

  const radii = layers[layer] || layers[0];
  const segments = radii.length;
  const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const segIndex = (normalizedAngle / (Math.PI * 2)) * segments;
  const i0 = Math.floor(segIndex) % segments;
  const i1 = (i0 + 1) % segments;
  const frac = segIndex - Math.floor(segIndex);

  // Smooth interpolation between radii points
  const r = radii[i0] + (radii[i1] - radii[i0]) * frac;

  return {
    x: cx + Math.cos(normalizedAngle) * r,
    y: cy + Math.sin(normalizedAngle) * r * 0.85, // slight vertical squish
  };
}

// Generate SVG path for orbit ring
function orbitPath(layer: number, cx: number, cy: number): string {
  const steps = 72;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const p = getOrbitPoint(layer, a, cx, cy);
    d += i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`;
  }
  return d + " Z";
}

// Decorative dots scattered around orbits
const decorDots = [
  { layer: 0, angle: 2.1, color: "#DC3C28", size: 5 },
  { layer: 1, angle: 0.8, color: "#8B5CF6", size: 4 },
  { layer: 1, angle: 3.5, color: "#3B82F6", size: 6 },
  { layer: 2, angle: 1.5, color: "#DC3C28", size: 3 },
  { layer: 2, angle: 4.2, color: "#8B5CF6", size: 5 },
  { layer: 3, angle: 0.3, color: "#14B8A6", size: 4 },
  { layer: 3, angle: 2.8, color: "#F97316", size: 3 },
  { layer: 0, angle: 4.8, color: "#0EA5E9", size: 4 },
];

export default function VehicleOrbit() {
  const [selected, setSelected] = useState<string | null>(null);
  const pausedRef = useRef(false);
  const timeRef = useRef(0);
  const animRef = useRef<number>(0);
  const [positions, setPositions] = useState<{ x: number; y: number }[]>(
    brands.map(() => ({ x: 350, y: 300 }))
  );
  const [dotPositions, setDotPositions] = useState<{ x: number; y: number }[]>(
    decorDots.map(() => ({ x: 0, y: 0 }))
  );

  const cx = 350;
  const cy = 300;

  const updatePositions = useCallback((time: number) => {
    if (!pausedRef.current) {
      timeRef.current = time;
    }
    const t = timeRef.current / 1000;

    const newPos = brands.map((brand) => {
      const { layer, speed, startAngle } = brand.orbit;
      const a = (startAngle * Math.PI) / 180 + t * speed;
      return getOrbitPoint(layer, a, cx, cy);
    });

    const newDots = decorDots.map((dot) => {
      const a = dot.angle + t * 0.08; // slow drift
      return getOrbitPoint(dot.layer, a, cx, cy);
    });

    setPositions(newPos);
    setDotPositions(newDots);
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
          <h2 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,3rem)] font-black text-white">可維修車款一覽</h2>
          <p className="mt-2 text-sm text-white/40">點擊品牌查看可維修車款</p>
        </div>

        <div className="relative">
          {/* Left panel - overlaid */}
          <div className={`lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2 z-20 w-full lg:w-[320px] transition-all duration-700 ${selected ? "opacity-100 translate-x-0" : "opacity-0 lg:-translate-x-10 pointer-events-none h-0 lg:h-auto"}`}>
            {selectedBrand && (
              <div className="rounded-2xl border border-white/[0.08] bg-primary-deep/95 backdrop-blur-xl p-6 shadow-2xl">
                <h3 className="font-bold text-lg mb-1" style={{ color: selectedBrand.color }}>
                  {selectedBrand.id === "yamaha" ? "YAMAHA" : selectedBrand.name}
                </h3>
                <p className="text-xs text-text-dim mb-4">{selectedBrand.sub} ｜ {selectedBrand.models.length} 款可維修</p>
                <ul className="space-y-0">
                  {selectedBrand.models.map((model, idx) => (
                    <li key={model} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0 text-sm text-text-muted">
                      <span className="text-[10px] font-mono w-5 text-text-dim text-right">{String(idx + 1).padStart(2, "0")}</span>
                      <span className="h-1 w-1 rounded-full shrink-0" style={{ backgroundColor: selectedBrand.color + "60" }} />
                      {model}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => { setSelected(null); pausedRef.current = false; }} className="mt-4 text-xs text-text-dim hover:text-accent transition-colors">
                  ← 返回
                </button>
              </div>
            )}
          </div>

          {/* Orbit area - always centered */}
          <div className="flex justify-center">
            <div className="relative" style={{ width: 700, height: 600 }}>
              {/* Orbit ring paths */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 600">
                {[0, 1, 2, 3].map((layer) => (
                  <path
                    key={layer}
                    d={orbitPath(layer, cx, cy)}
                    fill="none"
                    stroke="white"
                    strokeOpacity={0.06 - layer * 0.005}
                    strokeWidth={0.8}
                  />
                ))}
              </svg>

              {/* Decorative dots */}
              {decorDots.map((dot, i) => (
                <div
                  key={i}
                  className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
                  style={{
                    left: dotPositions[i]?.x || 0,
                    top: dotPositions[i]?.y || 0,
                    width: dot.size,
                    height: dot.size,
                    backgroundColor: dot.color,
                    opacity: 0.5,
                    boxShadow: `0 0 ${dot.size * 2}px ${dot.color}40`,
                  }}
                />
              ))}

              {/* Center - galaxy glow + 北大 calligraphy */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`text-center transition-all duration-500 ${selected ? "scale-90 opacity-50" : "scale-100 opacity-100"}`}>
                  {/* Galaxy / crystal glow effect */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    {/* Outer glow */}
                    <div className="absolute inset-0 -m-20 rounded-full bg-purple-600/[0.06] blur-[80px]" />
                    {/* Rotating crystal shape */}
                    <div className="relative h-40 w-40 -m-20 animate-spin" style={{ animationDuration: "15s" }}>
                      <div className="absolute inset-2 rounded-[30%] bg-gradient-to-br from-purple-500/20 via-accent/15 to-blue-500/20 blur-[20px] rotate-45" />
                      <div className="absolute inset-4 rounded-[35%] bg-gradient-to-tr from-orange-500/15 via-pink-500/10 to-purple-600/15 blur-[15px] -rotate-12" />
                      <div className="absolute inset-6 rounded-[40%] bg-gradient-to-bl from-blue-400/20 via-violet-500/15 to-rose-500/10 blur-[10px] rotate-[30deg]" />
                    </div>
                    {/* Inner bright core */}
                    <div className="absolute inset-0 -m-8 rounded-full bg-white/[0.03] blur-[30px]" />
                  </div>
                  {/* Text overlay */}
                  <div className="relative">
                    <div
                      className="text-8xl text-white leading-none"
                      style={{ fontFamily: "'Ma Shan Zheng', cursive", textShadow: "0 0 60px rgba(220,60,40,0.3), 0 0 120px rgba(150,50,200,0.15), 0 2px 4px rgba(0,0,0,0.5)" }}
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
                const s = brand.size;

                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => handleBrandClick(brand.id)}
                    className={`absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 group transition-all duration-500 ${isSelected ? "z-20 scale-125" : "z-10 hover:scale-110"}`}
                    style={{ left: pos.x, top: pos.y }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full border-2 transition-all duration-300"
                      style={{
                        width: s,
                        height: s,
                        borderColor: isSelected ? brand.color : brand.color + "40",
                        backgroundColor: isSelected ? brand.color + "20" : "rgba(15,15,25,0.8)",
                        boxShadow: isSelected ? `0 0 30px ${brand.color}40` : `0 0 10px ${brand.color}15`,
                      }}
                    >
                      <span className="font-bold" style={{ color: brand.color, fontSize: s * 0.22 }}>
                        {brand.name}
                      </span>
                    </div>
                    <span className={`mt-1 text-[9px] font-medium whitespace-nowrap transition-opacity duration-300 ${isSelected ? "opacity-100" : "opacity-40 group-hover:opacity-90"}`} style={{ color: brand.color }}>
                      {brand.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-dim">⚠️ 僅服務一般機車儀表，重機與汽車恕不服務 ｜ 114.07.27 更新</p>
        </div>
      </div>
    </section>
  );
}
