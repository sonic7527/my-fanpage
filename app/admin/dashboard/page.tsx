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

interface PostDetail {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  pinned: boolean;
}

const CATEGORIES = ["repair", "announcement", "promotion", "other"];

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  // View/Edit states
  const [viewing, setViewing] = useState<string | null>(null);
  const [detail, setDetail] = useState<PostDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<PostDetail | null>(null);
  const [saving, setSaving] = useState(false);
  // Create new post
  const [creating, setCreating] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", date: new Date().toISOString().slice(0, 10), category: "repair", content: "" });

  const router = useRouter();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/posts");
    if (res.status === 401) { router.push("/admin"); return; }
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function handleDelete(slug: string) {
    setDeleting(slug);
    const res = await fetch("/api/admin/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
      if (viewing === slug) { setViewing(null); setDetail(null); }
    } else {
      const data = await res.json();
      alert(data.error || "刪除失敗");
    }
    setDeleting(null);
    setConfirmSlug(null);
  }

  async function handleView(slug: string) {
    if (viewing === slug) { setViewing(null); setDetail(null); setEditing(false); return; }
    setViewing(slug);
    setEditing(false);
    const res = await fetch(`/api/admin/posts/${slug}`);
    if (res.ok) {
      const data = await res.json();
      setDetail(data);
    }
  }

  function startEdit() {
    if (!detail) return;
    setEditForm({ ...detail });
    setEditing(true);
  }

  async function handleSave() {
    if (!editForm) return;
    setSaving(true);
    const res = await fetch(`/api/admin/posts/${editForm.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      setDetail(editForm);
      setEditing(false);
      // Update list
      setPosts((prev) => prev.map((p) => p.slug === editForm.slug ? { ...p, title: editForm.title, date: editForm.date, category: editForm.category, pinned: editForm.pinned } : p));
    } else {
      alert("儲存失敗");
    }
    setSaving(false);
  }

  async function handleCreate() {
    if (!newPost.title || !newPost.date) { alert("標題和日期為必填"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
    });
    if (res.ok) {
      setCreating(false);
      setNewPost({ title: "", date: new Date().toISOString().slice(0, 10), category: "repair", content: "" });
      fetchPosts();
    } else {
      const data = await res.json();
      alert(data.error || "新增失敗");
    }
    setSaving(false);
  }

  function handleLogout() {
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/admin");
  }

  const filtered = posts.filter(
    (p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a14]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold">北大後台</h1>
              <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{posts.length} 篇文章</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" className="text-xs text-white/40 hover:text-white transition">← 前台</a>
              <button onClick={handleLogout} className="text-xs text-red-400/70 hover:text-red-400 transition">登出</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] max-w-md rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500/50 transition"
              placeholder="搜尋標題、slug、分類..."
            />
            <button
              onClick={() => setCreating(!creating)}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-500 transition whitespace-nowrap"
            >
              + 新增文章
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-6">

        {/* Create new post form */}
        {creating && (
          <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h3 className="font-bold text-sm mb-4 text-orange-400">新增文章</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-[11px] text-white/40 mb-1">標題 *</label>
                <input value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50" placeholder="文章標題" />
              </div>
              <div>
                <label className="block text-[11px] text-white/40 mb-1">日期 *</label>
                <input type="date" value={newPost.date} onChange={(e) => setNewPost({ ...newPost, date: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50" />
              </div>
              <div>
                <label className="block text-[11px] text-white/40 mb-1">分類</label>
                <select value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[11px] text-white/40 mb-1">內容</label>
              <textarea value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} rows={6} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50 resize-y" placeholder="Markdown 內容..." />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={saving} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-500 disabled:opacity-50 transition">
                {saving ? "儲存中..." : "發布文章"}
              </button>
              <button onClick={() => setCreating(false)} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/20 transition">取消</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-white/40">載入中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/40">{search ? "找不到符合的文章" : "目前沒有文章"}</div>
        ) : (
          <div className="space-y-1">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_90px_200px] gap-4 px-4 py-2 text-xs font-medium text-white/30 uppercase tracking-wider">
              <span>標題</span>
              <span>日期</span>
              <span>分類</span>
              <span className="text-right">操作</span>
            </div>

            {filtered.map((post) => (
              <div key={post.slug}>
                {/* Row */}
                <div
                  className={`grid grid-cols-[1fr_90px_90px_120px] gap-4 items-center px-4 py-3 rounded-lg hover:bg-white/[0.03] transition group cursor-pointer ${viewing === post.slug ? "bg-white/[0.04]" : ""}`}
                  onClick={() => handleView(post.slug)}
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
                  <div className="text-right flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {confirmSlug === post.slug ? (
                      <>
                        <button onClick={() => handleDelete(post.slug)} disabled={deleting === post.slug} className="text-[11px] px-2 py-1 rounded bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 transition">
                          {deleting === post.slug ? "..." : "確認刪除"}
                        </button>
                        <button onClick={() => setConfirmSlug(null)} className="text-[11px] px-2 py-1 rounded bg-white/10 text-white/60 hover:bg-white/20 transition">取消</button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmSlug(post.slug)} className="text-[11px] px-2 py-1 rounded text-red-400/60 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition">
                        刪除
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded detail / edit panel */}
                {viewing === post.slug && detail && (
                  <div className="mx-4 mb-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                    {editing && editForm ? (
                      /* Edit mode */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[11px] text-white/40 mb-1">標題</label>
                            <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50" />
                          </div>
                          <div>
                            <label className="block text-[11px] text-white/40 mb-1">日期</label>
                            <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50" />
                          </div>
                          <div>
                            <label className="block text-[11px] text-white/40 mb-1">分類</label>
                            <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50">
                              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] text-white/40 mb-1">摘要</label>
                          <input value={editForm.excerpt} onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-white/40 mb-1">內容 (Markdown)</label>
                          <textarea value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows={10} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50 resize-y font-mono" />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                            <input type="checkbox" checked={editForm.pinned} onChange={(e) => setEditForm({ ...editForm, pinned: e.target.checked })} className="rounded" />
                            置頂文章
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-500 disabled:opacity-50 transition">
                            {saving ? "儲存中..." : "儲存變更"}
                          </button>
                          <button onClick={() => setEditing(false)} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/20 transition">取消</button>
                        </div>
                      </div>
                    ) : (
                      /* Preview mode */
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-white/50">{detail.category}</span>
                            <span className="text-[11px] text-white/30">{detail.date}</span>
                            {detail.pinned && <span className="text-[11px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">置頂</span>}
                          </div>
                          <button onClick={startEdit} className="text-[11px] px-3 py-1 rounded bg-white/10 text-white/60 hover:bg-orange-600 hover:text-white transition">
                            編輯
                          </button>
                        </div>
                        {detail.excerpt && (
                          <p className="text-xs text-white/40 mb-3 italic">{detail.excerpt}</p>
                        )}
                        <div className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                          {detail.content || "（無內容）"}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
