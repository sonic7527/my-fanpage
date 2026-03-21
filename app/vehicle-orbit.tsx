"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const brands = [
  {
    id: "sym", name: "SYM", sub: "三陽", color: "#3B82F6",
    orbit: { layer: 1, fixedAngle: 220 },
    size: 52,
    models: ["FIGHTER 5／JET EVO", "FIGHTER 6", "FNX", "GT 125", "GR 125", "JET-S／SR", "JET-POWER", "MIO 115", "MII 110", "NEW MII", "RX 110", "TL-508", "Z1／IRX"],
  },
  {
    id: "kymco", name: "KYMCO", sub: "光陽", color: "#10B981",
    orbit: { layer: 2, fixedAngle: 30 },
    size: 50,
    models: ["新名流", "GP 125", "G5 系列", "G6", "G6 50週年", "KIWI", "Like", "Many 110", "Many 125", "NEW Many", "Racing", "Racing King", "VJR 110", "VJR 125"],
  },
  {
    id: "yamaha", name: "YAM", sub: "山葉", color: "#0EA5E9",
    orbit: { layer: 0, fixedAngle: 310 },
    size: 48,
    models: ["BWS'X", "BWS'R", "CUXI", "NEW CUXI", "CUXI 115", "FORCE", "GTR", "LIMI", "RSZ", "RS-ZERO", "S-MAX", "勁戰2代"],
  },
  {
    id: "pgo", name: "PGO", sub: "比雅久", color: "#F97316",
    orbit: { layer: 2, fixedAngle: 210 },
    size: 44,
    models: ["ALPHA MAX", "JBUBU 115", "JBUBU 125", "TIGRA 125", "TIGRA 150", "X-HOT"],
  },
  {
    id: "suzuki", name: "SUZ", sub: "鈴木", color: "#EAB308",
    orbit: { layer: 1, fixedAngle: 60 },
    size: 40,
    models: ["GSR／NEX", "SALUTO"],
  },
  {
    id: "vespa", name: "Ves", sub: "偉士牌", color: "#14B8A6",
    orbit: { layer: 0, fixedAngle: 140 },
    size: 38,
    models: ["春天 Primavera"],
  },
];

// Layer rotation speeds (degrees/second) — each layer different direction
const layerSpeeds = [14, -10, 6];

// Radii for each octagon layer
const layerOctagons = [165, 235, 310];

// How much of each edge is rounded at corners (smaller = sharper octagon)
const ROUND_FRAC = 0.10;

// Get the 8 vertices of an octagon at given radius
function getOctagonVertices(r: number, cx: number, cy: number): [number, number][] {
  return Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 - 90) * Math.PI / 180;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r] as [number, number];
  });
}

// Lerp helper
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// Get point on rounded octagon at angle (degrees)
function getOrbitPoint(layer: number, angleDeg: number, cx: number, cy: number): [number, number] {
  const r = layerOctagons[layer];
  const verts = getOctagonVertices(r, cx, cy);
  const n = 8;
  const t = ((angleDeg % 360 + 360) % 360) / 360;
  const seg = t * n;
  const i = Math.floor(seg) % n;
  const frac = seg - Math.floor(seg);

  const curr = verts[i];
  const next = verts[(i + 1) % n];

  // Simple: interpolate linearly along the edge
  const x = lerp(curr[0], next[0], frac);
  const y = lerp(curr[1], next[1], frac);
  return [x, y];
}

// Rotate (px, py) around (cx, cy) by angleDeg degrees
function rotateAround(px: number, py: number, cx: number, cy: number, angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = px - cx, dy = py - cy;
  return [cx + dx * Math.cos(rad) - dy * Math.sin(rad), cy + dx * Math.sin(rad) + dy * Math.cos(rad)];
}

// Build SVG path: straight edges with rounded corners
function buildOrbitPath(layer: number, cx: number, cy: number): string {
  const r = layerOctagons[layer];
  const verts = getOctagonVertices(r, cx, cy);
  const n = 8;
  const rf = ROUND_FRAC;
  const parts: string[] = [];

  for (let i = 0; i < n; i++) {
    const curr = verts[i];
    const next = verts[(i + 1) % n];
    // Points along the edge: start of straight (after prev corner) and end of straight (before next corner)
    const startX = lerp(curr[0], next[0], rf);
    const startY = lerp(curr[1], next[1], rf);
    const endX = lerp(curr[0], next[0], 1 - rf);
    const endY = lerp(curr[1], next[1], 1 - rf);

    if (i === 0) {
      parts.push(`M ${startX.toFixed(1)} ${startY.toFixed(1)}`);
    }

    // Straight line along edge
    parts.push(`L ${endX.toFixed(1)} ${endY.toFixed(1)}`);

    // Rounded corner: Q bezier with next vertex as control point
    const nextVert = verts[(i + 1) % n];
    const nextNext = verts[(i + 2) % n];
    const cornerEndX = lerp(nextVert[0], nextNext[0], rf);
    const cornerEndY = lerp(nextVert[1], nextNext[1], rf);
    parts.push(`Q ${nextVert[0].toFixed(1)} ${nextVert[1].toFixed(1)} ${cornerEndX.toFixed(1)} ${cornerEndY.toFixed(1)}`);
  }

  parts.push("Z");
  return parts.join(" ");
}

// Decorative dots fixed on layers
const decorDots = [
  { layer: 0, angle: 50, color: "#DC3C28", size: 6 },
  { layer: 0, angle: 230, color: "#8B5CF6", size: 5 },
  { layer: 1, angle: 150, color: "#3B82F6", size: 7 },
  { layer: 1, angle: 320, color: "#0EA5E9", size: 5 },
  { layer: 2, angle: 120, color: "#DC3C28", size: 4 },
  { layer: 2, angle: 300, color: "#14B8A6", size: 5 },
];

export default function VehicleOrbit() {
  const [selected, setSelected] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const layerAnglesRef = useRef([0, 0, 0]);
  const lastFrameRef = useRef(0);
  const runningRef = useRef(true);
  // For "spin then pause" transition when switching brands
  const transitionRef = useRef<{ active: boolean; remaining: number }>({ active: false, remaining: 0 });

  const CX = 400, CY = 400;
  const W = 800, H = 800;

  const animate = useCallback((now: number) => {
    if (!startTimeRef.current) startTimeRef.current = now;
    if (!lastFrameRef.current) lastFrameRef.current = now;
    const dt = (now - lastFrameRef.current) / 1000;
    lastFrameRef.current = now;

    const container = containerRef.current;
    if (!container) { animRef.current = requestAnimationFrame(animate); return; }

    // Handle transition: spin a bit then pause
    const tr = transitionRef.current;
    if (tr.active) {
      tr.remaining -= dt;
      if (tr.remaining <= 0) {
        tr.active = false;
        runningRef.current = false; // pause
      } else {
        // Still spinning during transition
        for (let l = 0; l < 3; l++) {
          layerAnglesRef.current[l] = (layerAnglesRef.current[l] + layerSpeeds[l] * dt) % 360;
        }
      }
    } else if (runningRef.current) {
      for (let l = 0; l < 3; l++) {
        layerAnglesRef.current[l] = (layerAnglesRef.current[l] + layerSpeeds[l] * dt) % 360;
      }
    }

    const angles = layerAnglesRef.current;

    // Rotate SVG orbit paths
    const svgGroups = container.querySelectorAll<SVGGElement>("[data-orbit-layer]");
    svgGroups.forEach((g) => {
      const layer = Number(g.dataset.orbitLayer);
      g.setAttribute("transform", `rotate(${angles[layer]} ${CX} ${CY})`);
    });

    // Move brand icons — fixed on orbit, rotated with layer
    const brandEls = container.querySelectorAll<HTMLElement>("[data-brand-idx]");
    brandEls.forEach((el) => {
      const idx = Number(el.dataset.brandIdx);
      const brand = brands[idx];
      const { layer, fixedAngle } = brand.orbit;
      const [bx, by] = getOrbitPoint(layer, fixedAngle, CX, CY);
      const [rx, ry] = rotateAround(bx, by, CX, CY, angles[layer]);
      el.style.left = `${rx}px`;
      el.style.top = `${ry}px`;
    });

    // Move decorative dots
    const dotEls = container.querySelectorAll<HTMLElement>("[data-dot-idx]");
    dotEls.forEach((el) => {
      const idx = Number(el.dataset.dotIdx);
      const dot = decorDots[idx];
      const [bx, by] = getOrbitPoint(dot.layer, dot.angle, CX, CY);
      const [rx, ry] = rotateAround(bx, by, CX, CY, angles[dot.layer]);
      el.style.left = `${rx}px`;
      el.style.top = `${ry}px`;
    });

    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    runningRef.current = true;
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  function handleBrandClick(id: string) {
    if (selected === id) {
      // Same brand → deselect → resume rotation
      setSelected(null);
      runningRef.current = true;
      transitionRef.current = { active: false, remaining: 0 };
    } else {
      // Select brand → quick shuffle all layer angles then pause
      setSelected(id);
      // Rapidly jump to new random positions for visual punch
      for (let l = 0; l < 3; l++) {
        layerAnglesRef.current[l] = (layerAnglesRef.current[l] + 60 + Math.random() * 120) % 360;
      }
      runningRef.current = false;
      transitionRef.current = { active: false, remaining: 0 };
    }
  }

  const selectedBrand = brands.find((b) => b.id === selected);

  return (
    <section id="vehicles" className="relative py-28 overflow-hidden bg-primary-deep">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Compatible Models</span>
          <h2 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,3rem)] font-black text-white">可維修車款一覽</h2>
          <p className="mt-2 text-sm text-white/40">點擊品牌查看可維修車款</p>
        </div>

        <div className="relative">
          {/* Left panel */}
          <div className={`lg:absolute lg:-left-16 lg:top-1/2 lg:-translate-y-1/2 z-30 w-full lg:w-[320px] transition-all duration-500 ${selected ? "opacity-100 translate-x-0" : "opacity-0 lg:-translate-x-10 pointer-events-none h-0 lg:h-auto"}`}>
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
                <button type="button" onClick={() => { setSelected(null); runningRef.current = true; transitionRef.current = { active: false, remaining: 0 }; }} className="mt-4 text-xs text-text-dim hover:text-accent transition-colors">
                  ← 返回
                </button>
              </div>
            )}
          </div>

          {/* Orbit container */}
          <div className="flex justify-center">
            <div ref={containerRef} className="relative" style={{ width: W, height: H }}>

              {/* SVG orbit rings */}
              <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${W} ${H}`}>
                {layerOctagons.map((_, layer) => (
                  <g key={layer} data-orbit-layer={layer}>
                    <path
                      d={buildOrbitPath(layer, CX, CY)}
                      fill="none"
                      stroke="white"
                      strokeOpacity={0.15}
                      strokeWidth={1.5}
                    />
                  </g>
                ))}
              </svg>

              {/* Decorative dots */}
              {decorDots.map((dot, i) => (
                <div
                  key={`dot-${i}`}
                  data-dot-idx={i}
                  className="absolute rounded-full"
                  style={{
                    width: dot.size,
                    height: dot.size,
                    backgroundColor: dot.color,
                    opacity: 0.7,
                    boxShadow: `0 0 ${dot.size * 3}px ${dot.color}80`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}

              {/* Center: galaxy glow + calligraphy image */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`relative transition-all duration-500 ${selected ? "scale-90 opacity-60" : "scale-100 opacity-100"}`}>
                  {/* Glow layers */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full" style={{ background: "radial-gradient(circle, rgba(120,40,200,0.15) 0%, rgba(80,20,160,0.08) 40%, transparent 70%)" }} />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full blur-[60px]" style={{ background: "radial-gradient(circle, rgba(140,60,220,0.3) 0%, rgba(100,30,180,0.15) 50%, transparent 80%)" }} />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[40px]" style={{ background: "radial-gradient(circle, rgba(220,80,50,0.25) 0%, rgba(200,60,120,0.18) 40%, transparent 75%)" }} />
                  {/* Spinning crystal layers */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] animate-spin" style={{ animationDuration: "12s" }}>
                    <div className="absolute inset-0 rounded-[30%] rotate-45" style={{ background: "linear-gradient(135deg, rgba(180,60,220,0.4) 0%, rgba(220,80,40,0.3) 50%, rgba(60,120,220,0.35) 100%)", filter: "blur(12px)" }} />
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[130px] h-[130px]" style={{ animation: "spin 18s linear infinite reverse" }}>
                    <div className="absolute inset-0 rounded-[35%] -rotate-12" style={{ background: "linear-gradient(225deg, rgba(240,100,60,0.35) 0%, rgba(200,50,150,0.3) 40%, rgba(100,60,220,0.4) 100%)", filter: "blur(8px)" }} />
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] animate-spin" style={{ animationDuration: "8s" }}>
                    <div className="absolute inset-0 rounded-[25%] rotate-[30deg]" style={{ background: "linear-gradient(315deg, rgba(80,140,255,0.4) 0%, rgba(180,80,220,0.35) 50%, rgba(240,90,70,0.3) 100%)", filter: "blur(5px)" }} />
                  </div>
                  {/* Hot core */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,200,180,0.35) 0%, rgba(220,100,180,0.2) 40%, transparent 70%)", filter: "blur(8px)" }} />
                  {/* Calligraphy image */}
                  <div className="relative flex items-center justify-center">
                    <img src="/北大旋轉書法.png" alt="北大" className="w-[220px] h-auto drop-shadow-[0_0_50px_rgba(150,50,200,0.5)] mix-blend-screen" draggable={false} />
                  </div>
                </div>
              </div>

              {/* Brand icons */}
              {brands.map((brand, i) => {
                const isSelected = selected === brand.id;
                const s = brand.size;
                return (
                  <button
                    key={brand.id}
                    type="button"
                    data-brand-idx={i}
                    onClick={() => handleBrandClick(brand.id)}
                    className={`absolute flex flex-col items-center justify-center group ${isSelected ? "z-20" : "z-10"}`}
                    style={{
                      transform: `translate(-50%, -50%) scale(${isSelected ? 1.25 : 1})`,
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full border-2 transition-colors duration-300"
                      style={{
                        width: s, height: s,
                        borderColor: isSelected ? brand.color : brand.color + "40",
                        backgroundColor: isSelected ? brand.color + "20" : "rgba(15,15,25,0.85)",
                        boxShadow: isSelected ? `0 0 30px ${brand.color}40` : `0 0 10px ${brand.color}15`,
                      }}
                    >
                      <span className="font-bold" style={{ color: brand.color, fontSize: s * 0.22 }}>{brand.name}</span>
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

        <div className="mt-6 text-center">
          <p className="text-xs text-text-dim">⚠️ 僅服務一般機車儀表，重機與汽車恕不服務 ｜ 114.07.27 更新</p>
        </div>
      </div>
    </section>
  );
}
