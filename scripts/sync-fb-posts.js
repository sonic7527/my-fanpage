/**
 * FB 粉專文章同步腳本（新增 + 更新）
 *
 * 由 GitHub Actions 定時執行
 * - 新文章：建立 markdown 檔案
 * - 已存在的文章：更新內容（保留 pinned、category 等手動設定）
 * 如有變更會 commit & push，觸發 Vercel 重新部署
 *
 * 使用方式：npm run sync-fb
 * 環境變數：FB_PAGE_ID, FB_PAGE_TOKEN（GitHub Actions Secrets）
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

async function fetchJSON(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const request = https
          .get(url, (res) => {
            let data = "";
            res.on("error", reject);
            res.on("aborted", () => reject(new Error("Facebook 回應中斷")));
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
              try {
                const parsed = JSON.parse(data);
                if (res.statusCode === 429 || res.statusCode >= 500 || parsed.error?.is_transient) {
                  reject(new Error(`Facebook 暫時無法回應（HTTP ${res.statusCode}）`));
                  return;
                }
                resolve(parsed);
              } catch {
                reject(new Error("Facebook 回傳格式不是 JSON"));
              }
            });
          })
          .on("error", reject);
        request.setTimeout(30000, () => request.destroy(new Error("Facebook 連線逾時")));
      });
    } catch (err) {
      if (attempt === 3) throw err;
      console.log(`⚠ Facebook 讀取失敗，第 ${attempt} 次重試`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 5000));
    }
  }
}

async function fetchRecentPosts(firstUrl) {
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const posts = new Map();
  let nextUrl = firstUrl;
  for (let page = 1; nextUrl; page++) {
    if (page > 100) throw new Error("Facebook 分頁超過安全上限，請檢查回傳資料");
    const parsedUrl = new URL(nextUrl);
    if (parsedUrl.protocol !== "https:" || parsedUrl.hostname !== "graph.facebook.com") {
      throw new Error("Facebook 分頁網址不是官方 API");
    }
    const data = await fetchJSON(nextUrl);
    if (data.error) throw new Error(`Facebook API 錯誤：${data.error.message}`);
    if (!Array.isArray(data.data)) throw new Error("Facebook 回傳缺少貼文清單");
    if (page === 1 && data.data.length === 0) {
      throw new Error("Facebook 回傳空清單，不能判定為沒有新文章");
    }
    for (const post of data.data) {
      if (!post.id || !Number.isFinite(Date.parse(post.created_time))) {
        throw new Error("Facebook 貼文缺少識別碼或發文時間");
      }
      if (Date.parse(post.created_time) >= cutoff) posts.set(post.id, post);
    }
    console.log(`📖 Facebook 第 ${page} 頁：${data.data.length} 篇`);
    const allOlder = data.data.length > 0 && data.data.every(
      (post) => Date.parse(post.created_time) < cutoff
    );
    nextUrl = allOlder ? null : data.paging?.next;
  }
  return [...posts.values()];
}

function downloadFile(url, dest, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error("圖片重新導向次數過多"));
      return;
    }

    https
      .get(url, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          res.resume();
          if (!res.headers.location) {
            reject(new Error("圖片重新導向缺少目標網址"));
            return;
          }
          downloadFile(res.headers.location, dest, redirectCount + 1).then(
            resolve,
            reject
          );
          return;
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          reject(new Error(`圖片下載回傳 HTTP ${res.statusCode}`));
          return;
        }

        const tempPath = `${dest}.part`;
        const file = fs.createWriteStream(tempPath);
        res.pipe(file);
        file.on("finish", () =>
          file.close(() => {
            fs.copyFileSync(tempPath, dest);
            fs.unlinkSync(tempPath);
            resolve();
          })
        );
        file.on("error", (err) => {
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          reject(err);
        });
      })
      .on("error", reject);
  });
}

function getMediaUrls(post) {
  const urls = [];
  const seen = new Set();

  function addImage(item) {
    const url = item?.media?.image?.src;
    if (url && !seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }

  for (const attachment of post.attachments?.data || []) {
    const children = attachment.subattachments?.data || [];
    if (children.length > 0) {
      children.forEach(addImage);
    } else {
      addImage(attachment);
    }
  }

  if (urls.length === 0 && post.full_picture) {
    urls.push(post.full_picture);
  }

  return urls;
}

function getMediaRefs(slug, count) {
  return Array.from(
    { length: count },
    (_, index) => `/images/posts/${slug}/${index + 1}.jpg`
  );
}

async function syncMedia(mediaUrls, slug, imagesDir) {
  if (mediaUrls.length === 0) return [];

  const postImagesDir = path.join(imagesDir, slug);
  fs.mkdirSync(postImagesDir, { recursive: true });

  for (let index = 0; index < mediaUrls.length; index++) {
    await downloadFile(
      mediaUrls[index],
      path.join(postImagesDir, `${index + 1}.jpg`)
    );
  }

  for (const filename of fs.readdirSync(postImagesDir)) {
    const match = filename.match(/^(\d+)\.jpg$/);
    if (match && Number(match[1]) > mediaUrls.length) {
      fs.unlinkSync(path.join(postImagesDir, filename));
    }
  }

  const oldSingleImage = path.join(imagesDir, `${slug}.jpg`);
  if (fs.existsSync(oldSingleImage)) fs.unlinkSync(oldSingleImage);

  return getMediaRefs(slug, mediaUrls.length);
}

function toSlug(text, date, postId) {
  const clean = text
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, " ")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40)
    .replace(/-$/, "");
  const idSuffix = String(postId || "")
    .split("_")
    .pop()
    .replace(/\D/g, "");
  return `${date}-${clean || "facebook-post"}${idSuffix ? `-${idSuffix}` : ""}`;
}

/**
 * 取得已有文章的 fb_id → { filename, content } 對應表
 * 用來判斷哪些文章需要更新
 */
/**
 * 讀取忽略清單（已刪除不想再同步的 fb_id）
 */
function getIgnoredIds() {
  const ignoreFile = path.join(__dirname, "..", "content", "posts", ".sync-ignore");
  if (!fs.existsSync(ignoreFile)) return new Set();
  return new Set(
    fs.readFileSync(ignoreFile, "utf-8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
  );
}

function getExistingPosts() {
  const postsDir = path.join(__dirname, "..", "content", "posts");
  if (!fs.existsSync(postsDir)) return new Map();

  const map = new Map();
  fs.readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .forEach((f) => {
      const content = fs.readFileSync(path.join(postsDir, f), "utf-8");
      const match = content.match(/fb_id:\s*"([^"]+)"/);
      if (match) {
        map.set(match[1], { filename: f, content });
      }
    });
  return map;
}

/**
 * 從現有 frontmatter 中提取手動設定的欄位（不被 FB 同步覆蓋）
 */
function extractManualFields(existingContent) {
  const fields = {};
  const pinnedMatch = existingContent.match(/pinned:\s*(true|false)/);
  if (pinnedMatch) fields.pinned = pinnedMatch[1];

  const categoryMatch = existingContent.match(/category:\s*"([^"]*)"/);
  if (categoryMatch) fields.category = categoryMatch[1];

  const modelMatch = existingContent.match(/model:\s*"([^"]*)"/);
  if (modelMatch) fields.model = modelMatch[1];

  const orderMatch = existingContent.match(/order:\s*(\d+)/);
  if (orderMatch) fields.order = orderMatch[1];

  return fields;
}

function buildMarkdown({ post, title, date, excerpt, mediaRefs, manual }) {
  const body = [post.message.trim()];
  for (const image of mediaRefs.slice(1)) {
    body.push(`![${title.replace(/\]/g, "")}](${image})`);
  }

  return [
    "---",
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: "${date}"`,
    `excerpt: "${excerpt.replace(/"/g, '\\"')}"`,
    `fb_id: "${post.id}"`,
    `fb_permalink: "${post.permalink_url || ""}"`,
    `fb_updated_time: "${post.updated_time || post.created_time}"`,
    `media_count: ${mediaRefs.length}`,
    `image: "${mediaRefs[0] || ""}"`,
    `category: "${manual.category || ""}"`,
    `model: "${manual.model || ""}"`,
    `pinned: ${manual.pinned || "false"}`,
    `order: ${manual.order || "0"}`,
    "---",
    "",
    body.join("\n\n"),
  ].join("\n");
}

async function main() {
  const PAGE_ID = process.env.FB_PAGE_ID;
  const TOKEN = process.env.FB_PAGE_TOKEN;

  if (!PAGE_ID || !TOKEN) {
    console.error("❌ 環境變數 FB_PAGE_ID / FB_PAGE_TOKEN 未設定");
    process.exit(1);
  }

  console.log("🔑 使用 Page Token 直接存取粉專\n");

  const postsDir = path.join(__dirname, "..", "content", "posts");
  const imagesDir = path.join(__dirname, "..", "public", "images", "posts");
  fs.mkdirSync(postsDir, { recursive: true });
  fs.mkdirSync(imagesDir, { recursive: true });

  const existingPosts = getExistingPosts();
  const auditOnly = process.env.FB_SYNC_AUDIT_ONLY === "true";
  const changedPosts = [];
  const postsToVerify = [];
  console.log(`📋 已有 ${existingPosts.size} 篇 FB 文章\n`);

  // 逐頁補查最近 90 天，避免停機期間貼文超過單頁而永久漏搬。
  const fields =
    "id,message,full_picture,created_time,permalink_url,updated_time," +
    "attachments{media_type,type,media,target,subattachments{media_type,type,media,target}}";
  const url = `https://graph.facebook.com/v25.0/${PAGE_ID}/posts?fields=${encodeURIComponent(fields)}&limit=20&access_token=${encodeURIComponent(TOKEN)}`;
  const posts = await fetchRecentPosts(url);
  console.log(`🕒 執行時間：${new Date().toISOString()}；近 90 天讀到 ${posts.length} 篇`);
  for (const post of posts) {
    console.log(`📋 貼文 ${post.id}，發文 ${post.created_time}，${existingPosts.has(post.id) ? "已收錄" : "未收錄"}`);
  }
  let newCount = 0;
  let updateCount = 0;

  const ignoredIds = getIgnoredIds();
  if (ignoredIds.size > 0) {
    console.log(`🚫 忽略清單有 ${ignoredIds.size} 篇文章\n`);
  }

  for (const post of posts) {
    if (ignoredIds.has(post.id)) {
      console.log(`🚫 略過忽略清單貼文：${post.id}`);
      continue;
    }

    const mediaTypes = (post.attachments?.data || []).flatMap((attachment) => [
      attachment.media_type || attachment.type || "未知附件",
      ...(attachment.subattachments?.data || []).map(
        (item) => item.media_type || item.type || "未知附件"
      ),
    ]);
    if (!post.message?.trim()) {
      const hasVideo = mediaTypes.some((type) => /video/i.test(type));
      const title = hasVideo ? "粉專影片分享" : "粉專照片與動態分享";
      post.message = `${title}\n\n此貼文沒有文字說明。${hasVideo ? "請點選「查看 Facebook 原文」觀看完整影片。" : "可透過「查看 Facebook 原文」查看來源貼文。"}`;
      console.log(`🖼 補收無文字貼文：${post.id}；附件類型：${mediaTypes.join("、") || "未提供"}`);
    }

    const date = post.created_time.split("T")[0];
    const title = post.message.split("\n")[0].slice(0, 80) || "粉專貼文";
    const excerpt = post.message.replace(/\n/g, " ").slice(0, 120);
    const mediaUrls = getMediaUrls(post);

    const existing = existingPosts.get(post.id);
    const slug = existing
      ? existing.filename.replace(/\.md$/, "")
      : toSlug(title, date, post.id);
    const mediaRefs = getMediaRefs(slug, mediaUrls.length);
    const manual = existing ? extractManualFields(existing.content) : {};
    const markdown = buildMarkdown({
      post,
      title,
      date,
      excerpt,
      mediaRefs,
      manual,
    });
    const assetsReady = mediaRefs.every((image) =>
      fs.existsSync(path.join(__dirname, "..", "public", image))
    );

    postsToVerify.push({ slug, title, mediaRefs, createdTime: post.created_time });
    if (existing?.content === markdown && assetsReady) continue;
    changedPosts.push({ slug, title, mediaRefs, createdTime: post.created_time });
    if (auditOnly) {
      console.log(`🔎 待同步：${slug}（${mediaUrls.length} 張圖片）`);
      continue;
    }

    if (existing) {
      // === 更新已存在的文章 ===
      if (existing.content === markdown && assetsReady) continue;

      await syncMedia(mediaUrls, slug, imagesDir);
      fs.writeFileSync(path.join(postsDir, existing.filename), markdown, "utf-8");
      console.log(`🔄 已更新: ${slug}（${mediaUrls.length} 張圖片）`);

      updateCount++;
    } else {
      // === 新文章 ===
      await syncMedia(mediaUrls, slug, imagesDir);
      fs.writeFileSync(path.join(postsDir, `${slug}.md`), markdown, "utf-8");
      console.log(`📝 新文章: ${slug}（${mediaUrls.length} 張圖片）`);

      newCount++;
    }
  }

  const totalChanges = newCount + updateCount;
  const result = {
    checkedAt: new Date().toISOString(),
    auditOnly,
    fetchedCount: posts.length,
    changedPosts,
    postsToVerify,
  };
  if (process.env.FB_SYNC_RESULT_PATH) {
    fs.writeFileSync(process.env.FB_SYNC_RESULT_PATH, JSON.stringify(result, null, 2));
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `## Facebook 同步核對\n\n檢查時間：${result.checkedAt}\n\n近 90 天讀到 ${posts.length} 篇；${auditOnly ? "待同步" : "異動"} ${changedPosts.length} 篇。\n\n` +
      posts.map((post) => `- 貼文 ${post.id}；發文：${post.created_time}；${existingPosts.has(post.id) ? "原已收錄" : "本次新發現"}`).join("\n") + "\n"
    );
  }
  if (auditOnly) {
    console.log(`🔎 核對完成，待同步 ${changedPosts.length} 篇，未寫入文章`);
    return;
  }
  if (totalChanges === 0) {
    console.log("✅ 沒有需要同步的變更");
    return;
  }

  console.log(`\n🎉 同步完成：${newCount} 篇新文章，${updateCount} 篇已更新`);

  // 在 GitHub Actions 環境中自動 commit & push
  if (process.env.GITHUB_ACTIONS) {
    console.log("\n📤 正在 commit & push...");
    try {
      execSync('git config user.name "FB Sync Bot"');
      execSync('git config user.email "bot@noreply.github.com"');
      execSync("git add content/posts/ public/images/posts/");
      const msg = [];
      if (newCount > 0) msg.push(`新增 ${newCount} 篇`);
      if (updateCount > 0) msg.push(`更新 ${updateCount} 篇`);
      execSync(`git commit -m "sync: ${msg.join("、")} FB 文章"`);
      execSync("git push");
      console.log("✅ 推送完成，Vercel 將自動重新部署");
    } catch (err) {
      console.error("❌ Git 操作失敗:", err.message);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("❌ 同步失敗:", err.message);
    process.exit(1);
  });
}

module.exports = { buildMarkdown, getMediaRefs, getMediaUrls, toSlug };
