import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import type { Metadata } from "next";
import PostsGrid, { type PostItem } from "./posts-grid";

/* ═══════════════════════════════════════════
   Posts listing page — 北大液晶儀表維修工作室
   Server component: reads all markdown posts and
   passes data to the client PostsGrid component.
   ═══════════════════════════════════════════ */

export const metadata: Metadata = {
  title: "全部文章 — 北大液晶儀表維修工作室",
  description:
    "瀏覽北大液晶儀表維修工作室的所有維修實錄、整新品上架、教學文章與最新公告。",
};

const postsDir = path.join(process.cwd(), "content/posts");

function getAllPosts(): PostItem[] {
  if (!fs.existsSync(postsDir)) return [];

  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(postsDir, filename), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug: filename.replace(/\.md$/, ""),
        title: data.title || "無標題",
        date: data.date || "",
        excerpt:
          data.excerpt ||
          content.replace(/[#*>\-\n]/g, " ").trim().slice(0, 120) + "...",
        image: data.image,
        category: data.category,
        model: data.model,
        pinned: data.pinned || false,
        order: data.order || 0,
        fb_id: data.fb_id,
      };
    })
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}

export default function PostsPage() {
  const allPosts = getAllPosts();

  /* Separate pinned from regular posts */
  const pinnedPosts = allPosts
    .filter((p) => p.pinned)
    .sort((a, b) => (b.order || 0) - (a.order || 0));
  const regularPosts = allPosts.filter((p) => !p.pinned);

  return (
    <div className="min-h-screen bg-primary pt-24 pb-20">
      {/* ── Background decorations ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-accent/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-10%] h-[500px] w-[500px] rounded-full bg-gold/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
        {/* ── Back link ── */}
        <Link
          href="/#articles"
          className="mb-10 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M13 8H3m0 0l4-4M3 8l4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          返回首頁
        </Link>

        {/* ── Page header ── */}
        <header className="mb-14">
          <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
            <span className="h-px w-10 bg-accent" /> Articles
          </span>
          <h1 className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-black leading-tight text-white">
            全部文章
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/50">
            維修實錄、整新品、教學文章與最新公告，了解更多液晶儀表的維修知識。
          </p>
          <div className="mt-4 text-sm text-text-dim">
            共 {allPosts.length} 篇文章
          </div>
        </header>

        {/* ── Posts grid (client component with filtering) ── */}
        <PostsGrid posts={regularPosts} pinnedPosts={pinnedPosts} />
      </div>
    </div>
  );
}
