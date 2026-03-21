import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { verifyAdmin } from "../auth";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

// GET: list all posts
export async function GET(req: NextRequest) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  if (!fs.existsSync(POSTS_DIR)) {
    return NextResponse.json({ posts: [] });
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((filename) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf-8");
    const { data } = matter(raw);
    return {
      slug: filename.replace(/\.md$/, ""),
      title: data.title || "無標題",
      date: data.date || "",
      category: data.category || "",
      pinned: data.pinned || false,
      image: data.image || "",
    };
  });

  // Sort by date descending
  posts.sort((a, b) => (b.date > a.date ? 1 : -1));

  return NextResponse.json({ posts });
}

// DELETE: delete a post
export async function DELETE(req: NextRequest) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ error: "缺少 slug" }, { status: 400 });

  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  fs.unlinkSync(filePath);
  return NextResponse.json({ ok: true, message: `已刪除 ${slug}` });
}
