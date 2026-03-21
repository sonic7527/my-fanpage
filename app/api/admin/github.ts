const OWNER = "sonic7527";
const REPO = "my-fanpage";
const POSTS_PATH = "content/posts";

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN 未設定");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${POSTS_PATH}`;

/** List all .md files in content/posts */
export async function ghListFiles(): Promise<{ name: string; sha: string }[]> {
  const res = await fetch(API, { headers: getHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const files = await res.json();
  return (files as { name: string; sha: string }[]).filter((f) => f.name.endsWith(".md"));
}

/** Get a single file's content + sha */
export async function ghGetFile(filename: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(`${API}/${encodeURIComponent(filename)}`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

/** Create or update a file */
export async function ghPutFile(filename: string, content: string, sha?: string, message?: string) {
  const body: Record<string, string> = {
    message: message || `admin: update ${filename}`,
    content: Buffer.from(content).toString("base64"),
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${API}/${encodeURIComponent(filename)}`, {
    method: "PUT",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub API error: ${res.status} ${JSON.stringify(err)}`);
  }
  return res.json();
}

/** Delete a file */
export async function ghDeleteFile(filename: string, sha: string, message?: string) {
  const res = await fetch(`${API}/${encodeURIComponent(filename)}`, {
    method: "DELETE",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: message || `admin: delete ${filename}`,
      sha,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub API error: ${res.status} ${JSON.stringify(err)}`);
  }
  return res.json();
}
