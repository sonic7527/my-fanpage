"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Post {
  slug: string;
  title: string;
  date: string;
  category: string;
  pinned: boolean;
  image: string;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  const router = useRouter();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/posts");
    if (res.status === 401) {
      router.push("/admin");
      return;
    }
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function handleDelete(slug: string) {
    setDeleting(slug);
    const res = await fetch("/api/admin/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });

    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } else {
      const data = await res.json();
      alert(data.error || "刪除失敗");
    }
    setDeleting(null);
    setConfirmSlug(null);
  }

  function handleLogout() {
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/admin");
  }

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a14]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">北大後台</h1>
            <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{posts.length} 篇文章</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" className="text-xs text-white/40 hover:text-white transition">← 前台</a>
            <button onClick={handleLogout} className="text-xs text-red-400/70 hover:text-red-400 transition">登出</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500/50 transition"
            placeholder="搜尋文章標題、slug、分類..."
          />
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/40">載入中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            {search ? "找不到符合的文章" : "目前沒有文章"}
          </div>
        ) : (
          <div className="space-y-1">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_100px_80px] gap-4 px-4 py-2 text-xs font-medium text-white/30 uppercase tracking-wider">
              <span>標題</span>
              <span>日期</span>
              <span>分類</span>
              <span className="text-right">操作</span>
            </div>

            {/* Posts list */}
            {filtered.map((post) => (
              <div
                key={post.slug}
                className="grid grid-cols-[1fr_100px_100px_80px] gap-4 items-center px-4 py-3 rounded-lg hover:bg-white/[0.03] transition group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {post.pinned && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">置頂</span>}
                    <span className="text-sm truncate">{post.title}</span>
                  </div>
                  <div className="text-[11px] text-white/20 mt-0.5 truncate">{post.slug}</div>
                </div>

                <span className="text-xs text-white/40">{post.date}</span>
                <span className="text-xs text-white/40">{post.category || "—"}</span>

                <div className="text-right">
                  {confirmSlug === post.slug ? (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleDelete(post.slug)}
                        disabled={deleting === post.slug}
                        className="text-[11px] px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 transition"
                      >
                        {deleting === post.slug ? "..." : "確認"}
                      </button>
                      <button
                        onClick={() => setConfirmSlug(null)}
                        className="text-[11px] px-2 py-1 rounded bg-white/10 text-white/60 hover:bg-white/20 transition"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmSlug(post.slug)}
                      className="text-[11px] px-2 py-1 rounded text-red-400/60 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition"
                    >
                      刪除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
