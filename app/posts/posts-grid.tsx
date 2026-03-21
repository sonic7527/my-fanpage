"use client";

import { useState } from "react";
import Link from "next/link";
import ScrollReveal, { ScrollRevealGroup } from "../scroll-reveal";

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
  { label: "整新品", value: "refurbished" },
  { label: "新品上架", value: "new-product" },
  { label: "教學Q&A", value: "tutorial" },
  { label: "公告", value: "announcement" },
];

const CATEGORY_LABELS: Record<string, string> = {
  repair: "維修實錄",
  refurbished: "整新品",
  "new-product": "新品上架",
  tutorial: "教學Q&A",
  announcement: "公告",
};

const CATEGORY_COLORS: Record<string, string> = {
  repair: "bg-accent/15 text-accent border-accent/20",
  refurbished: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "new-product": "bg-gold/15 text-gold border-gold/20",
  tutorial: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  announcement: "bg-purple-500/15 text-purple-400 border-purple-500/20",
};

const PAGE_SIZE = 12;

/* ─── LCD placeholder icon ─── */
function LcdIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className="text-text-dim opacity-20">
      <rect x="10" y="15" width="60" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="22" width="44" height="30" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
      <text x="40" y="43" textAnchor="middle" fill="currentColor" fontSize="14" fontFamily="monospace">LCD</text>
    </svg>
  );
}

/* ─── Category badge ─── */
function CategoryBadge({ category }: { category?: string }) {
  if (!category) return null;
  const label = CATEGORY_LABELS[category] || category;
  const colors = CATEGORY_COLORS[category] || "bg-white/10 text-white/60 border-white/10";
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${colors}`}>
      {label}
    </span>
  );
}

/* ─── Post card ─── */
function PostCard({ post }: { post: PostItem }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="reveal group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-primary-deep/60 backdrop-blur-sm transition-all duration-500 hover:border-accent/30 hover:bg-surface/40 hover:shadow-[0_0_40px_rgba(220,60,40,0.08)] hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <LcdIcon size={64} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/70 via-transparent to-transparent" />

        {/* Category badge overlay */}
        {post.category && (
          <div className="absolute top-3 left-3">
            <CategoryBadge category={post.category} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <time className="text-xs font-medium text-gold">{post.date}</time>
        <h3 className="mt-2 font-display text-base font-bold leading-snug text-text transition-colors duration-300 group-hover:text-accent line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted line-clamp-2">
          {post.excerpt}
        </p>
        {post.model && (
          <div className="mt-3 text-xs text-text-dim">
            {post.model}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ─── Pinned post card (highlighted) ─── */
function PinnedPostCard({ post }: { post: PostItem }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="reveal group relative flex flex-col overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.08] to-primary-deep/80 backdrop-blur-sm transition-all duration-500 hover:border-accent/40 hover:shadow-[0_0_50px_rgba(220,60,40,0.12)] hover:-translate-y-1 sm:flex-row"
    >
      {/* Pinned indicator */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-[10px] font-bold text-accent backdrop-blur-sm">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
        </svg>
        置頂
      </div>

      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden sm:aspect-auto sm:w-2/5 shrink-0 bg-surface">
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <LcdIcon size={80} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary-deep/50 hidden sm:block" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center p-6">
        <div className="flex items-center gap-3">
          <CategoryBadge category={post.category} />
          <time className="text-xs font-medium text-gold">{post.date}</time>
        </div>
        <h3 className="mt-3 font-display text-lg font-bold leading-snug text-text transition-colors duration-300 group-hover:text-accent line-clamp-2 sm:text-xl">
          {post.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-text-muted line-clamp-3">
          {post.excerpt}
        </p>
        {post.model && (
          <div className="mt-3 text-xs text-text-dim">
            {post.model}
          </div>
        )}
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT — PostsGrid
   ═══════════════════════════════════════════ */
export default function PostsGrid({
  posts,
  pinnedPosts,
}: {
  posts: PostItem[];
  pinnedPosts: PostItem[];
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /* Filter posts by category */
  const filteredPosts =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const displayPosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  /* Reset pagination when changing category */
  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <>
      {/* ── Pinned posts ── */}
      {pinnedPosts.length > 0 && (
        <section className="mb-16">
          <ScrollReveal>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-accent" />
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
                置頂文章
              </h2>
            </div>
          </ScrollReveal>
          <ScrollRevealGroup className="grid gap-6">
            {pinnedPosts.map((post) => (
              <PinnedPostCard key={post.slug} post={post} />
            ))}
          </ScrollRevealGroup>
        </section>
      )}

      {/* ── Category filter tabs ── */}
      <ScrollReveal className="reveal mb-10">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            const count =
              cat.value === "all"
                ? posts.length
                : posts.filter((p) => p.category === cat.value).length;

            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`
                  relative rounded-full px-5 py-2 text-sm font-medium transition-all duration-300
                  ${
                    isActive
                      ? "bg-accent text-white shadow-[0_0_20px_rgba(220,60,40,0.3)]"
                      : "border border-white/[0.08] text-text-muted hover:border-white/20 hover:text-white hover:bg-white/[0.04]"
                  }
                `}
              >
                {cat.label}
                <span
                  className={`ml-1.5 text-xs ${
                    isActive ? "text-white/70" : "text-text-dim"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollReveal>

      {/* ── Posts grid ── */}
      {displayPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <LcdIcon size={80} />
          <p className="mt-4 text-text-muted">此分類尚無文章</p>
        </div>
      ) : (
        <ScrollRevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </ScrollRevealGroup>
      )}

      {/* ── Load more ── */}
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="group relative inline-flex items-center gap-2 rounded-full border border-white/[0.1] px-8 py-3 text-sm font-medium text-text-muted transition-all duration-300 hover:border-accent/40 hover:text-accent hover:bg-accent/[0.06] hover:shadow-[0_0_24px_rgba(220,60,40,0.1)]"
          >
            載入更多
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform duration-300 group-hover:translate-y-0.5"
            >
              <path
                d="M8 3v10m0 0l-4-4m4 4l4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs text-text-dim">
              ({filteredPosts.length - visibleCount} 篇)
            </span>
          </button>
        </div>
      )}

      {/* ── Post count summary ── */}
      <div className="mt-8 text-center text-xs text-text-dim">
        顯示 {displayPosts.length} / {filteredPosts.length} 篇文章
      </div>
    </>
  );
}
