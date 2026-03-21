import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { notFound } from "next/navigation";

const postsDir = path.join(process.cwd(), "content/posts");

export async function generateStaticParams() {
  if (!fs.existsSync(postsDir)) return [];
  return fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ slug: f.replace(/\.md$/, "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return { title: "文章不存在" };
  const { data } = matter(fs.readFileSync(filePath, "utf-8"));
  return {
    title: `${data.title} — 北大液晶儀表維修`,
    description: data.excerpt || "",
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.join(postsDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) notFound();

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return (
    <article className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        {/* Back link */}
        <Link
          href="/#articles"
          className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent"
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
          返回文章列表
        </Link>

        {/* Header */}
        <header className="mb-12">
          <time className="text-xs font-medium text-gold">{data.date}</time>
          <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.8rem)] font-black leading-tight text-text">
            {data.title}
          </h1>
          {data.fb_permalink && (
            <a
              href={data.fb_permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-text-dim transition-colors hover:text-accent"
            >
              查看 Facebook 原文 ↗
            </a>
          )}
        </header>

        {/* Featured image */}
        {data.image && (
          <div className="mb-12 overflow-hidden rounded-sm">
            <img
              src={data.image}
              alt={data.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Content — rendered as simple HTML from markdown */}
        <div
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
        />
      </div>
    </article>
  );
}

/* Simple markdown → HTML converter (no external dependency needed for basic posts) */
function markdownToHtml(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="mt-8 mb-3 text-lg font-bold text-text">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="mt-10 mb-4 text-xl font-bold text-text">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="mt-10 mb-4 text-2xl font-bold text-text">$1</h1>')
    // Bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-text">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Images
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="my-6 rounded-sm w-full" />'
    )
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-accent hover:underline" target="_blank" rel="noopener">$1</a>'
    )
    // Line breaks → paragraphs
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<h") || trimmed.startsWith("<img")) return trimmed;
      return `<p class="mb-4 text-base leading-relaxed text-text-muted">${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return html;
}
