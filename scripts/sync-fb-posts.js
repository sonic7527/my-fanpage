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

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`JSON parse error: ${data.slice(0, 200)}`));
          }
        });
      })
      .on("error", reject);
  });
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
  console.log(`📋 已有 ${existingPosts.size} 篇 FB 文章\n`);

  // 取最近 20 篇
  const fields =
    "id,message,full_picture,created_time,permalink_url,updated_time," +
    "attachments{media_type,type,media,target,subattachments{media_type,type,media,target}}";
  const url = `https://graph.facebook.com/v25.0/${PAGE_ID}/posts?fields=${encodeURIComponent(fields)}&limit=20&access_token=${encodeURIComponent(TOKEN)}`;
  const data = await fetchJSON(url);

  if (data.error) {
    console.error("❌ Facebook API 錯誤:", data.error.message);
    process.exit(1);
  }

  const posts = data.data || [];
  let newCount = 0;
  let updateCount = 0;

  const ignoredIds = getIgnoredIds();
  if (ignoredIds.size > 0) {
    console.log(`🚫 忽略清單有 ${ignoredIds.size} 篇文章\n`);
  }

  for (const post of posts) {
    if (!post.message) continue;
    if (ignoredIds.has(post.id)) continue;

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
