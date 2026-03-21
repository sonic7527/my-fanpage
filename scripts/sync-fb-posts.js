/**
 * FB 粉專文章增量同步腳本
 *
 * 由 GitHub Actions 定時執行，僅下載新文章
 * 如有新文章會 commit & push，觸發 Vercel 重新部署
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

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlinkSync(dest);
          return downloadFile(res.headers.location, dest).then(resolve, reject);
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.unlinkSync(dest);
        reject(err);
      });
  });
}

function toSlug(text, date) {
  const clean = text
    .replace(/[^\w\u4e00-\u9fff\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
  return `${date}-${clean || "post"}`;
}

// 取得已有文章的 fb_id 清單
function getExistingFbIds() {
  const postsDir = path.join(__dirname, "..", "content", "posts");
  if (!fs.existsSync(postsDir)) return new Set();

  const ids = new Set();
  fs.readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .forEach((f) => {
      const content = fs.readFileSync(path.join(postsDir, f), "utf-8");
      const match = content.match(/fb_id:\s*"([^"]+)"/);
      if (match) ids.add(match[1]);
    });
  return ids;
}

async function main() {
  const PAGE_ID = process.env.FB_PAGE_ID;
  const TOKEN = process.env.FB_PAGE_TOKEN;

  if (!PAGE_ID || !TOKEN) {
    console.error("❌ 環境變數 FB_PAGE_ID / FB_PAGE_TOKEN 未設定");
    process.exit(1);
  }

  const postsDir = path.join(__dirname, "..", "content", "posts");
  const imagesDir = path.join(__dirname, "..", "public", "images", "posts");
  fs.mkdirSync(postsDir, { recursive: true });
  fs.mkdirSync(imagesDir, { recursive: true });

  const existingIds = getExistingFbIds();
  console.log(`📋 已有 ${existingIds.size} 篇文章\n`);

  // 只取最近 20 篇（同步用，不需要全部）
  const fields = "id,message,full_picture,created_time,permalink_url";
  const url = `https://graph.facebook.com/v19.0/${PAGE_ID}/posts?fields=${fields}&limit=20&access_token=${TOKEN}`;
  const data = await fetchJSON(url);

  if (data.error) {
    console.error("❌ Facebook API 錯誤:", data.error.message);
    process.exit(1);
  }

  const posts = data.data || [];
  let newCount = 0;

  for (const post of posts) {
    if (!post.message) continue;
    if (existingIds.has(post.id)) continue;

    const date = post.created_time.split("T")[0];
    const title = post.message.split("\n")[0].slice(0, 80) || "粉專貼文";
    const slug = toSlug(title, date);
    const excerpt = post.message.replace(/\n/g, " ").slice(0, 120);

    let image = "";
    if (post.full_picture) {
      image = `/images/posts/${slug}.jpg`;
    }

    const markdown = [
      "---",
      `title: "${title.replace(/"/g, '\\"')}"`,
      `date: "${date}"`,
      `excerpt: "${excerpt.replace(/"/g, '\\"')}"`,
      `fb_id: "${post.id}"`,
      `fb_permalink: "${post.permalink_url || ""}"`,
      `image: "${image}"`,
      "---",
      "",
      post.message,
    ].join("\n");

    fs.writeFileSync(path.join(postsDir, `${slug}.md`), markdown, "utf-8");
    console.log(`📝 新文章: ${slug}`);

    if (post.full_picture) {
      try {
        await downloadFile(
          post.full_picture,
          path.join(imagesDir, `${slug}.jpg`)
        );
        console.log(`🖼 圖片已下載`);
      } catch (err) {
        console.log(`⚠ 圖片下載失敗: ${err.message}`);
      }
    }

    newCount++;
  }

  if (newCount === 0) {
    console.log("✅ 沒有新文章需要同步");
    return;
  }

  console.log(`\n🎉 同步了 ${newCount} 篇新文章`);

  // 在 GitHub Actions 環境中自動 commit & push
  if (process.env.GITHUB_ACTIONS) {
    console.log("\n📤 正在 commit & push...");
    try {
      execSync('git config user.name "FB Sync Bot"');
      execSync('git config user.email "bot@noreply.github.com"');
      execSync("git add content/posts/ public/images/posts/");
      execSync(`git commit -m "sync: 同步 ${newCount} 篇 FB 新文章"`);
      execSync("git push");
      console.log("✅ 推送完成，Vercel 將自動重新部署");
    } catch (err) {
      console.error("❌ Git 操作失敗:", err.message);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("❌ 同步失敗:", err.message);
  process.exit(1);
});
