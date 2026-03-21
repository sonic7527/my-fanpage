"use client";

import { useEffect, useRef, useState } from "react";

interface CardPost {
  title: string;
  date: string;
  category?: string;
  image?: string;
}

// Card colors for visual variety
const cardColors = [
  "from-purple-600/30 via-pink-500/20 to-blue-500/30",
  "from-orange-500/30 via-red-500/20 to-purple-600/30",
  "from-blue-500/30 via-cyan-400/20 to-purple-500/30",
  "from-rose-500/30 via-orange-400/20 to-yellow-500/30",
  "from-teal-500/30 via-blue-500/20 to-indigo-500/30",
];

// Each card's starting spread position (x offset, rotation, y offset)
const cardLayouts = [
  { x: -320, rot: -12, y: 30 },
  { x: -160, rot: -6, y: -20 },
  { x: 0, rot: 0, y: 10 },
  { x: 160, rot: 6, y: -15 },
  { x: 320, rot: 12, y: 25 },
];

export default function CardStack({ posts }: { posts: CardPost[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportH = window.innerHeight;

      // Progress: 0 when section top hits viewport bottom → 1 when section bottom hits viewport top
      const scrolled = viewportH - rect.top;
      const total = sectionHeight + viewportH;
      const p = Math.max(0, Math.min(1, scrolled / total));
      setProgress(p);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Map progress to phases:
  // 0.0 - 0.3: cards spread out, visible
  // 0.3 - 0.7: cards converge toward center (stacking)
  // 0.7 - 1.0: cards fully stacked → fade to BEI DA text
  const spreadPhase = Math.max(0, Math.min(1, progress / 0.3)); // 0→1 during spread
  const stackPhase = Math.max(0, Math.min(1, (progress - 0.3) / 0.4)); // 0→1 during stacking
  const revealPhase = Math.max(0, Math.min(1, (progress - 0.7) / 0.3)); // 0→1 during reveal

  const cards = posts.slice(0, 5);

  return (
    <section ref={sectionRef} className="relative bg-primary-deep" style={{ height: "250vh" }}>
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">

        {/* Background flowing gradient — similar to kzero.com */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-[140%] h-[140%] -left-[20%] -top-[20%] animate-spin"
            style={{
              animationDuration: "30s",
              background: `
                radial-gradient(ellipse 60% 40% at 30% 40%, rgba(140,50,220,0.15) 0%, transparent 60%),
                radial-gradient(ellipse 50% 50% at 70% 60%, rgba(220,60,40,0.1) 0%, transparent 50%),
                radial-gradient(ellipse 40% 60% at 50% 30%, rgba(50,100,220,0.12) 0%, transparent 55%)
              `,
            }}
          />
          {/* Wave mesh overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 1200 800" preserveAspectRatio="none">
            {Array.from({ length: 20 }, (_, i) => {
              const y = 100 + i * 30;
              const amp = 40 + i * 5;
              return (
                <path
                  key={i}
                  d={`M 0 ${y} Q 300 ${y - amp} 600 ${y} Q 900 ${y + amp} 1200 ${y}`}
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                  style={{
                    animation: `wave-drift ${8 + i * 0.5}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* Cards container */}
        <div className="relative z-10" style={{ perspective: "1200px" }}>
          {cards.map((post, i) => {
            const layout = cardLayouts[i] || cardLayouts[2];

            // Interpolate from spread position to stacked center
            const x = layout.x * (1 - stackPhase);
            const y = layout.y * (1 - stackPhase);
            const rot = layout.rot * (1 - stackPhase);
            // When stacking, add slight offset per card for depth
            const stackY = stackPhase * (i - 2) * 8;
            const stackRot = stackPhase * (i - 2) * 2;
            // Scale up slightly when stacking
            const scale = 1 + stackPhase * 0.05 - Math.abs(i - 2) * stackPhase * 0.02;
            // Fade out cards as reveal phase starts
            const cardOpacity = Math.max(0, 1 - revealPhase * 2);
            // Entrance fade
            const entranceOpacity = Math.min(1, spreadPhase * 3 - i * 0.3);

            return (
              <div
                key={i}
                className="absolute w-[220px] h-[300px] rounded-2xl border border-white/[0.08] backdrop-blur-xl overflow-hidden"
                style={{
                  transform: `translate(-50%, -50%) translate(${x}px, ${y + stackY}px) rotate(${rot + stackRot}deg) scale(${scale})`,
                  opacity: Math.max(0, Math.min(1, entranceOpacity)) * cardOpacity,
                  zIndex: i + 1,
                  left: "50%",
                  top: "50%",
                  transition: "none",
                }}
              >
                {/* Card background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cardColors[i % cardColors.length]} opacity-60`} />
                <div className="absolute inset-0 bg-[#0a0a14]/70" />

                {/* Card content */}
                <div className="relative p-5 h-full flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-white/30">{String(i + 1).padStart(2, "0")}</span>
                    {/* Abstract icon placeholder */}
                    <div className="mt-4 mb-6 flex justify-center">
                      <div
                        className={`w-20 h-20 rounded-[30%] bg-gradient-to-br ${cardColors[i % cardColors.length]} animate-spin`}
                        style={{ animationDuration: `${10 + i * 3}s`, filter: "blur(1px)" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white/80 uppercase tracking-wider leading-snug line-clamp-2">
                      {post.title}
                    </div>
                    <div className="text-[9px] text-white/30 mt-1">{post.date}</div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* BEI DA reveal — appears when cards merge */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 pointer-events-none"
            style={{ opacity: Math.max(0, revealPhase * 2 - 0.5) }}
          >
            {/* Glow behind text */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(140,50,200,0.2) 0%, rgba(220,60,40,0.1) 30%, transparent 70%)", filter: "blur(40px)" }} />

            <div className="relative">
              <div className="text-[120px] font-black text-white leading-none tracking-tighter" style={{ fontFamily: "'Noto Sans TC', sans-serif", textShadow: "0 0 80px rgba(220,60,40,0.3), 0 0 160px rgba(140,50,200,0.2)" }}>
                北大
              </div>
              <div className="mt-2 text-xl font-bold tracking-[0.5em] text-white/40 uppercase" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
                BEI DA
              </div>
              <div className="mt-4 text-xs text-white/25 tracking-[0.3em] uppercase">
                LCD Dashboard Maintenance
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
