/**
 * FB 粉專文章一次性搬遷腳本
 *
 * 使用方式：
 * 1. 在 .env.local 設定 FB_PAGE_ID 和 FB_PAGE_TOKEN
 * 2. 執行 npm run migrate-fb
 *
 * 前置作業：
 * - 到 developers.facebook.com 建立應用程式
 * - 取得 Page Access Token（需粉專管理員權限）
 * - 權限：pages_read_engagement, pages_show_list
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

// 讀取 .env.local
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ 找不到 .env.local 檔案");
    console.log("請建立 .env.local 並設定 FB_PAGE_ID 和 FB_PAGE_TOKEN");
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const [key, ...vals] = line.split("=");
    if (key && vals.length) {
      process.env[key.trim()] = vals.join("=").trim();
    }
  });
}

// HTTPS GET request
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

// 下載檔案
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        // 處理重導向
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlinkSync(dest);
          return downloadFile(res.headers.location, dest).then(resolve, reject);
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlinkSync(dest);
        reject(err);
      });
  });
}

// 文字轉 slug
function toSlug(text, date) {
  const clean = text
    .replace(/[^\w\u4e00-\u9fff\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
  return `${date}-${clean || "post"}`;
}

// 產生 Markdown
function toMarkdown(post) {
  const date = post.created_time.split("T")[0];
  const message = post.message || "";
  const title = message.split("\n")[0].slice(0, 80) || "粉專貼文";
  const slug = toSlug(title, date);
  const excerpt = message.replace(/\n/g, " ").slice(0, 120);

  let image = "";
  if (post.full_picture) {
    image = `/images/posts/${slug}.jpg`;
  }

  const frontmatter = [
    "---",
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: "${date}"`,
    `excerpt: "${excerpt.replace(/"/g, '\\"')}"`,
    `fb_id: "${post.id}"`,
    `fb_permalink: "${post.permalink_url || ""}"`,
    `image: "${image}"`,
    "---",
    "",
    message,
  ].join("\n");

  return { slug, frontmatter, imageUrl: post.full_picture, imageDest: image };
}

async function main() {
  loadEnv();

  const PAGE_ID = process.env.FB_PAGE_ID;
  const TOKEN = process.env.FB_PAGE_TOKEN;

  if (!PAGE_ID || !TOKEN) {
    console.error("❌ 請在 .env.local 設定 FB_PAGE_ID 和 FB_PAGE_TOKEN");
    process.exit(1);
  }

  const postsDir = path.join(__dirname, "..", "content", "posts");
  const imagesDir = path.join(__dirname, "..", "public", "images", "posts");
  fs.mkdirSync(postsDir, { recursive: true });
  fs.mkdirSync(imagesDir, { recursive: true });

  console.log("📡 正在從 Facebook 取得貼文...\n");

  const fields = "id,message,full_picture,created_time,permalink_url,attachments";
  let url = `https://graph.facebook.com/v19.0/${PAGE_ID}/posts?fields=${fields}&limit=50&access_token=${TOKEN}`;

  let allPosts = [];
  let page = 1;

  while (url) {
    console.log(`  第 ${page} 頁...`);
    const data = await fetchJSON(url);

    if (data.error) {
      console.error("❌ Facebook API 錯誤:", data.error.message);
      process.exit(1);
    }

    if (data.data) {
      allPosts = allPosts.concat(data.data);
    }

    url = data.paging?.next || null;
    page++;
  }

  console.log(`\n✅ 共取得 ${allPosts.length} 篇貼文\n`);

  let count = 0;
  for (const post of allPosts) {
    if (!post.message) continue; // 跳過沒有文字的貼文

    const { slug, frontmatter, imageUrl, imageDest } = toMarkdown(post);
    const filePath = path.join(postsDir, `${slug}.md`);

    // 跳過已存在的文章
    if (fs.existsSync(filePath)) {
      console.log(`  ⏭ 跳過已存在: ${slug}`);
      continue;
    }

    // 寫入 Markdown
    fs.writeFileSync(filePath, frontmatter, "utf-8");
    console.log(`  📝 ${slug}`);

    // 下載圖片
    if (imageUrl) {
      const imgPath = path.join(imagesDir, `${slug}.jpg`);
      try {
        await downloadFile(imageUrl, imgPath);
        console.log(`  🖼 圖片已下載`);
      } catch (err) {
        console.log(`  ⚠ 圖片下載失敗: ${err.message}`);
      }
    }

    count++;
  }

  console.log(`\n🎉 完成！共搬遷 ${count} 篇文章到 content/posts/`);
  console.log("   執行 npm run dev 預覽網站");
}

main().catch((err) => {
  console.error("❌ 執行失敗:", err.message);
  process.exit(1);
});
