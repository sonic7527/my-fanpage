import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { verifyAdmin } from "../auth";
import { ghGetFile, ghPutFile, ghDeleteFile } from "../github";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

// GET: list all posts (read from deployed fs — fast)
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

  posts.sort((a, b) => (b.date > a.date ? 1 : -1));
  return NextResponse.json({ posts });
}

// DELETE: delete a post (via GitHub API)
export async function DELETE(req: NextRequest) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ error: "缺少 slug" }, { status: 400 });

  try {
    const filename = `${slug}.md`;
    const { sha } = await ghGetFile(filename);
    await ghDeleteFile(filename, sha, `刪除文章: ${slug}`);
    return NextResponse.json({ ok: true, message: `已刪除 ${slug}，網站將在幾秒後自動更新` });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "未知錯誤";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: create new post (via GitHub API)
export async function POST(req: NextRequest) {
  const authError = await verifyAdmin(req);
  if (authError) return authError;

  const { title, date, category, content, excerpt } = await req.json();
  if (!title || !date) {
    return NextResponse.json({ error: "標題和日期為必填" }, { status: 400 });
  }

  const slugBase = `${date}-${title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, "-").replace(/-+/g, "-").toLowerCase().slice(0, 50)}`;
  const filename = `${slugBase}.md`;

  const frontmatter = {
    title,
    date,
    excerpt: excerpt || (content ? content.slice(0, 120) + "…" : ""),
    image: "",
    category: category || "repair",
    model: "",
    pinned: false,
    order: 0,
    fb_id: "",
    fb_permalink: "",
  };

  const file = matter.stringify(content || "", frontmatter);

  try {
    await ghPutFile(filename, file, undefined, `新增文章: ${title}`);
    return NextResponse.json({ ok: true, slug: slugBase, message: "文章已新增，網站將在幾秒後自動更新" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "未知錯誤";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
