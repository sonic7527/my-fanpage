import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { verifyAdmin } from "../../auth";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

// GET single post (full content)
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  const { slug } = await params;
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return NextResponse.json({
    slug,
    title: data.title || "",
    date: data.date || "",
    category: data.category || "",
    excerpt: data.excerpt || "",
    image: data.image || "",
    pinned: data.pinned || false,
    content,
    frontmatter: data,
  });
}

// PUT update post
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  const { slug } = await params;
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  const body = await req.json();
  const { title, date, category, excerpt, content, pinned, image } = body;

  // Read existing to preserve other frontmatter fields
  const raw = fs.readFileSync(filePath, "utf-8");
  const existing = matter(raw);

  const newData = {
    ...existing.data,
    title: title ?? existing.data.title,
    date: date ?? existing.data.date,
    category: category ?? existing.data.category,
    excerpt: excerpt ?? existing.data.excerpt,
    image: image ?? existing.data.image,
    pinned: pinned ?? existing.data.pinned,
  };

  const newContent = content ?? existing.content;
  const newFile = matter.stringify(newContent, newData);
  fs.writeFileSync(filePath, newFile, "utf-8");

  return NextResponse.json({ ok: true, message: `已更新 ${slug}` });
}
