import { NextRequest, NextResponse } from "next/server";
import matter from "gray-matter";
import { verifyAdmin } from "../../auth";
import { ghGetFile, ghPutFile } from "../../github";

// GET single post (full content)
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  const { slug } = await params;
  const filename = `${slug}.md`;

  try {
    const { content: raw } = await ghGetFile(filename);
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
  } catch {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }
}

// PUT update post
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  const { slug } = await params;
  const filename = `${slug}.md`;

  try {
    const { content: raw, sha } = await ghGetFile(filename);
    const existing = matter(raw);

    const body = await req.json();
    const { title, date, category, excerpt, content, pinned, image } = body;

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

    await ghPutFile(filename, newFile, sha, `更新文章: ${newData.title}`);
    return NextResponse.json({ ok: true, message: `已更新 ${slug}` });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "未知錯誤";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
