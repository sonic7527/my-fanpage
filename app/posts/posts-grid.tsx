"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

/* ─── Types ─── */
export interface PostItem {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image?: string;
  category?: string;
  model?: string;
  pinned?: boolean;
  order?: number;
  fb_id?: string;
}

/* ─── Category config ─── */
const CATEGORIES: { label: string; value: string }[] = [
  { label: "全部", value: "all" },
  { label: "維修實錄", value: "repair" },
  { label: "新品上架", value: "new-product" },
  { label: "教學Q&A", value: "tutorial" },
  { label: "公告", value: "announcement" },
];

const CATEGORY_LABELS: Record<string, string> = {
  repair: "維修實錄",
  "new-product": "新品上架",
  tutorial: "教學Q&A",
  announcement: "公告",
  "test-video": "測試影片",
  other: "其他",
};

const CATEGORY_COLORS: Record<string, string> = {
  repair: "bg-accent/15 text-accent border-accent/20",
  "new-product": "bg-gold/15 text-gold border-gold/20",
  tutorial: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  announcement: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  "test-video": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  other: "bg-white/10 text-white/60 border-white/10",
};

const PAGE_SIZE = 18;

/* ─── Scroll reveal hook for individual elements ─── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const items = el.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            const delay = target.dataset.revealDelay || "0";
            setTimeout(() => {
              target.style.opacity = "1";
              target.style.transform = "translateY(0) scale(1)";
            }, parseInt(delay));
            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -30px 0px" }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  });

  return ref;
}

/* ─── Category badge ─── */
function CategoryBadge({ category }: { category?: string }) {
  if (!category) return null;
  const label = CATEGORY_LABELS[category] || category;
  const colors = CATEGORY_COLORS[category] || "bg-white/10 text-white/60 border-white/10";
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${colors}`}>
      {label}
    </span>
  );
}

/* ─── LCD placeholder ─── */
function LcdIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className="text-text-dim opacity-20">
      <rect x="10" y="15" width="60" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="22" width="44" height="30" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
      <text x="40" y="43" textAnchor="middle" fill="currentColor" fontSize="14" fontFamily="monospace">LCD</text>
    </svg>
  );
}

/* ─── Image with fallback ─── */
function PostImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  if (src) {
    return <img src={src} alt={alt} className={`h-full w-full object-cover ${className || ""}`} loading="lazy" />;
  }
  return (
    <div className="flex h-full items-center justify-center">
      <LcdIcon size={64} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Layout A: Hero — 1 大張滿版
   ═══════════════════════════════════════════════════════ */
function LayoutHero({ post, index }: { post: PostItem; index: number }) {
  return (
    <div
      data-reveal
      data-reveal-delay={index * 80}
      style={{ opacity: 0, transform: "translateY(40px)", transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)" }}
    >
      <Link href={`/posts/${post.slug}`} className="group block">
        <div className="relative aspect-[21/9] overflow-hidden rounded-2xl bg-surface">
          <PostImage src={post.image} alt={post.title} className="transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-deep via-primary-deep/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-3">
              <CategoryBadge category={post.category} />
              <time className="text-xs font-medium text-gold">{post.date}</time>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight text-text group-hover:text-accent transition-colors duration-300">
              {post.title}
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-muted line-clamp-2">{post.excerpt}</p>
            {post.model && <div className="mt-3 text-xs text-text-dim">{post.model}</div>}
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Layout B: 左右分割 — 左圖右文 / 右圖左文
   ═══════════════════════════════════════════════════════ */
function LayoutSplit({ post, reverse, index }: { post: PostItem; reverse?: boolean; index: number }) {
  return (
    <div
      data-reveal
      data-reveal-delay={index * 80}
      style={{ opacity: 0, transform: `translateY(30px)`, transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)" }}
    >
      <Link href={`/posts/${post.slug}`} className="group block">
        <div className={`flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-primary-deep/60 transition-all duration-500 hover:border-accent/30 hover:shadow-[0_0_40px_rgba(220,60,40,0.08)] ${reverse ? "md:flex-row-reverse" : "md:flex-row"}`}>
          <div className="relative aspect-[16/10] md:aspect-auto md:w-1/2 shrink-0 overflow-hidden bg-surface">
            <PostImage src={post.image} alt={post.title} className="transition-transform duration-700 group-hover:scale-105" />
            <div className={`absolute inset-0 hidden md:block ${reverse ? "bg-gradient-to-l from-primary-deep/60 to-transparent" : "bg-gradient-to-r from-transparent to-primary-deep/60"}`} />
            {post.category && (
              <div className="absolute top-4 left-4"><CategoryBadge category={post.category} /></div>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-center p-6 md:p-10">
            <time className="text-xs font-medium text-gold">{post.date}</time>
            <h3 className="mt-3 font-display text-xl md:text-2xl font-bold leading-snug text-text group-hover:text-accent transition-colors duration-300 line-clamp-2">
              {post.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-text-muted line-clamp-3">{post.excerpt}</p>
            {post.model && <div className="mt-4 text-xs text-text-dim">{post.model}</div>}
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              閱讀更多
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Layout C: 三欄小卡片
   ═══════════════════════════════════════════════════════ */
function LayoutCard({ post, index }: { post: PostItem; index: number }) {
  return (
    <div
      data-reveal
      data-reveal-delay={index * 100}
      style={{ opacity: 0, transform: "translateY(30px) scale(0.97)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}
    >
      <Link
        href={`/posts/${post.slug}`}
        className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-primary-deep/60 backdrop-blur-sm transition-all duration-500 hover:border-accent/30 hover:bg-surface/40 hover:shadow-[0_0_40px_rgba(220,60,40,0.08)] hover:-translate-y-2"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          <PostImage src={post.image} alt={post.title} className="transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/80 via-primary-deep/20 to-transparent" />
          {post.category && (
            <div className="absolute top-3 left-3"><CategoryBadge category={post.category} /></div>
          )}
          <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white/60 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <time className="text-xs font-medium text-gold">{post.date}</time>
          <h3 className="mt-2 font-display text-base font-bold leading-snug text-text transition-colors duration-300 group-hover:text-accent line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted line-clamp-2">{post.excerpt}</p>
          {post.model && <div className="mt-3 text-xs text-text-dim">{post.model}</div>}
        </div>
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Layout D: 兩欄寬卡片
   ═══════════════════════════════════════════════════════ */
function LayoutWide({ post, index }: { post: PostItem; index: number }) {
  return (
    <div
      data-reveal
      data-reveal-delay={index * 100}
      style={{ opacity: 0, transform: "translateY(30px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}
    >
      <Link
        href={`/posts/${post.slug}`}
        className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-primary-deep/60 transition-all duration-500 hover:border-accent/30 hover:shadow-[0_0_30px_rgba(220,60,40,0.06)] hover:-translate-y-1"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-surface">
          <PostImage src={post.image} alt={post.title} className="transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/70 via-transparent to-transparent" />
          {post.category && (
            <div className="absolute top-3 left-3"><CategoryBadge category={post.category} /></div>
          )}
        </div>
        <div className="p-5">
          <time className="text-xs font-medium text-gold">{post.date}</time>
          <h3 className="mt-2 font-display text-lg font-bold leading-snug text-text transition-colors duration-300 group-hover:text-accent line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-muted line-clamp-2">{post.excerpt}</p>
        </div>
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Layout E: 橫條列表（緊湊）
   ═══════════════════════════════════════════════════════ */
function LayoutList({ post, index }: { post: PostItem; index: number }) {
  return (
    <div
      data-reveal
      data-reveal-delay={index * 60}
      style={{ opacity: 0, transform: "translateY(20px)", transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)" }}
    >
      <Link
        href={`/posts/${post.slug}`}
        className="group flex gap-5 rounded-xl border border-white/[0.04] bg-primary-deep/40 p-4 transition-all duration-400 hover:border-accent/20 hover:bg-surface/30"
      >
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-surface">
          <PostImage src={post.image} alt={post.title} className="transition-transform duration-500 group-hover:scale-110" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <CategoryBadge category={post.category} />
            <time className="text-xs text-text-dim">{post.date}</time>
          </div>
          <h3 className="mt-1.5 font-display text-sm font-bold leading-snug text-text group-hover:text-accent transition-colors line-clamp-1">
            {post.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-text-muted line-clamp-1">{post.excerpt}</p>
        </div>
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Pinned grid card (equal-size cards for 2-5 pinned posts)
   ═══════════════════════════════════════════════════════ */
function PinnedGridCard({ post, index }: { post: PostItem; index: number }) {
  return (
    <div
      data-reveal
      data-reveal-delay={index * 100}
      style={{ opacity: 0, transform: "translateY(30px)", transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)" }}
    >
      <Link
        href={`/posts/${post.slug}`}
        className="group block overflow-hidden rounded-xl border border-accent/20 bg-gradient-to-br from-accent/[0.06] to-primary-deep/80 transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_30px_rgba(220,60,40,0.1)] hover:-translate-y-1"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-surface">
          <PostImage src={post.image} alt={post.title} className="transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent backdrop-blur-sm">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" /></svg>
            置頂
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <CategoryBadge category={post.category} />
            <time className="text-[11px] text-gold">{post.date}</time>
          </div>
          <h4 className="mt-2 font-display text-sm font-bold leading-snug text-text group-hover:text-accent transition-colors line-clamp-2">
            {post.title}
          </h4>
          <p className="mt-1.5 text-xs leading-relaxed text-text-muted line-clamp-2">{post.excerpt}</p>
        </div>
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Pinned post card (large, for single pinned post)
   ═══════════════════════════════════════════════════════ */
function PinnedPostCard({ post, index }: { post: PostItem; index: number }) {
  return (
    <div
      data-reveal
      data-reveal-delay={index * 100}
      style={{ opacity: 0, transform: "translateY(30px)", transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)" }}
    >
      <Link
        href={`/posts/${post.slug}`}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.08] to-primary-deep/80 transition-all duration-500 hover:border-accent/40 hover:shadow-[0_0_50px_rgba(220,60,40,0.12)] hover:-translate-y-1 sm:flex-row"
      >
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-[10px] font-bold text-accent backdrop-blur-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
          </svg>
          置頂
        </div>
        <div className="relative aspect-[16/10] overflow-hidden sm:aspect-auto sm:w-2/5 shrink-0 bg-surface">
          <PostImage src={post.image} alt={post.title} className="transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary-deep/50 hidden sm:block" />
        </div>
        <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
          <div className="flex items-center gap-3">
            <CategoryBadge category={post.category} />
            <time className="text-xs font-medium text-gold">{post.date}</time>
          </div>
          <h3 className="mt-3 font-display text-lg font-bold leading-snug text-text group-hover:text-accent transition-colors sm:text-xl line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-text-muted line-clamp-3">{post.excerpt}</p>
          {post.model && <div className="mt-3 text-xs text-text-dim">{post.model}</div>}
        </div>
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Build mixed layout sections from posts array
   Pattern repeats: Hero → 3-grid → Split-L → 2-wide → Split-R → 3-list → ...
   ═══════════════════════════════════════════════════════ */
function MixedLayout({ posts }: { posts: PostItem[] }) {
  const sections: React.ReactNode[] = [];
  let i = 0;
  let sectionIndex = 0;

  while (i < posts.length) {
    const pattern = sectionIndex % 5;

    switch (pattern) {
      case 0: {
        // Hero: 1 big post
        if (i < posts.length) {
          sections.push(
            <div key={`s-${sectionIndex}`} className="mb-10">
              <LayoutHero post={posts[i]} index={0} />
            </div>
          );
          i += 1;
        }
        break;
      }
      case 1: {
        // 3-column grid
        const chunk = posts.slice(i, i + 3);
        sections.push(
          <div key={`s-${sectionIndex}`} className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {chunk.map((p, idx) => (
              <LayoutCard key={p.slug} post={p} index={idx} />
            ))}
          </div>
        );
        i += chunk.length;
        break;
      }
      case 2: {
        // Split left
        if (i < posts.length) {
          sections.push(
            <div key={`s-${sectionIndex}`} className="mb-10">
              <LayoutSplit post={posts[i]} index={0} />
            </div>
          );
          i += 1;
        }
        break;
      }
      case 3: {
        // 2-column wide
        const chunk = posts.slice(i, i + 2);
        sections.push(
          <div key={`s-${sectionIndex}`} className="mb-10 grid gap-6 md:grid-cols-2">
            {chunk.map((p, idx) => (
              <LayoutWide key={p.slug} post={p} index={idx} />
            ))}
          </div>
        );
        i += chunk.length;
        break;
      }
      case 4: {
        // Split right + 3 list items
        const listItems = posts.slice(i + 1, i + 4);
        sections.push(
          <div key={`s-${sectionIndex}`} className="mb-10 space-y-6">
            {i < posts.length && <LayoutSplit post={posts[i]} reverse index={0} />}
            {listItems.length > 0 && (
              <div className="grid gap-3 md:grid-cols-3">
                {listItems.map((p, idx) => (
                  <LayoutList key={p.slug} post={p} index={idx} />
                ))}
              </div>
            )}
          </div>
        );
        i += 1 + listItems.length;
        break;
      }
    }

    sectionIndex++;
  }

  return <>{sections}</>;
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT — PostsGrid
   ═══════════════════════════════════════════════════════ */
export default function PostsGrid({
  posts,
  pinnedPosts,
}: {
  posts: PostItem[];
  pinnedPosts: PostItem[];
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const containerRef = useScrollReveal();

  /* Combine pinned + regular for accurate category counts */
  const allPosts = [...pinnedPosts, ...posts];

  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const displayPosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div ref={containerRef}>
      {/* ── Pinned posts ── */}
      {pinnedPosts.length > 0 && (
        <section className="mb-16">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-accent">置頂文章</h2>
          </div>
          {/* Dynamic layout based on pinned post count */}
          {pinnedPosts.length === 1 && (
            <PinnedPostCard post={pinnedPosts[0]} index={0} />
          )}
          {pinnedPosts.length === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pinnedPosts.map((post, idx) => (
                <PinnedGridCard key={post.slug} post={post} index={idx} />
              ))}
            </div>
          )}
          {pinnedPosts.length === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {pinnedPosts.map((post, idx) => (
                <PinnedGridCard key={post.slug} post={post} index={idx} />
              ))}
            </div>
          )}
          {pinnedPosts.length === 4 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {pinnedPosts.map((post, idx) => (
                <PinnedGridCard key={post.slug} post={post} index={idx} />
              ))}
            </div>
          )}
          {pinnedPosts.length >= 5 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
              {pinnedPosts.map((post, idx) => (
                <PinnedGridCard key={post.slug} post={post} index={idx} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Category filter ── */}
      <div className="mb-12 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.value;
          const count =
            cat.value === "all"
              ? allPosts.length
              : allPosts.filter((p) => p.category === cat.value).length;

          return (
            <button
              type="button"
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-accent text-white shadow-[0_0_20px_rgba(220,60,40,0.3)]"
                  : "border border-white/[0.08] text-text-muted hover:border-white/20 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {cat.label}
              <span className={`ml-1.5 text-xs ${isActive ? "text-white/70" : "text-text-dim"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Mixed layout posts ── */}
      {displayPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <LcdIcon size={80} />
          <p className="mt-4 text-text-muted">此分類尚無文章</p>
        </div>
      ) : (
        <MixedLayout posts={displayPosts} />
      )}

      {/* ── Load more ── */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="group inline-flex items-center gap-2 rounded-full border border-white/[0.1] px-8 py-3 text-sm font-medium text-text-muted transition-all duration-300 hover:border-accent/40 hover:text-accent hover:bg-accent/[0.06]"
          >
            載入更多
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform duration-300 group-hover:translate-y-0.5">
              <path d="M8 3v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs text-text-dim">({filteredPosts.length - visibleCount} 篇)</span>
          </button>
        </div>
      )}

      <div className="mt-8 text-center text-xs text-text-dim">
        顯示 {displayPosts.length} / {filteredPosts.length} 篇文章
      </div>
    </div>
  );
}
