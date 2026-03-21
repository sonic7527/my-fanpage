/**
 * FB 粉專文章搬遷腳本（從 Facebook 資料匯出）
 *
 * 使用方式：npm run migrate-fb
 *
 * 讀取 facebook-100075586557819-2026-3-21-6KZPzbVS/ 資料夾
 * 轉換為 content/posts/ 下的 markdown 檔案
 * 複製圖片到 public/images/posts/
 */

const fs = require("fs");
const path = require("path");

const FB_DATA_DIR = path.join(
  __dirname,
  "..",
  "facebook-100075586557819-2026-3-21-6KZPzbVS",
  "this_profile's_activity_across_facebook",
  "posts"
);
const POSTS_DIR = path.join(__dirname, "..", "content", "posts");
const IMAGES_DIR = path.join(__dirname, "..", "public", "images", "posts");

// Decode Facebook's weird UTF-8 encoding (each byte stored as \u00xx)
function decodeFbText(str) {
  if (!str) return "";
  try {
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i));
    }
    return Buffer.from(bytes).toString("utf-8");
  } catch {
    return str;
  }
}

// Generate a URL-safe slug
function generateSlug(timestamp, title) {
  const date = new Date(timestamp * 1000);
  const dateStr = date.toISOString().slice(0, 10);

  // Try to extract vehicle model for a meaningful slug
  const modelMatch = title.match(
    /(?:SYM|KYMCO|YAMAHA|PGO|SUZUKI|GOGORO|AEON|Vespa)\s*[\w''＇\-\s]{2,20}/i
  );

  let slug;
  if (modelMatch) {
    slug = modelMatch[0]
      .trim()
      .replace(/[''＇]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
  } else {
    // Fallback: use timestamp
    slug = `post-${timestamp}`;
  }

  return `${dateStr}-${slug}`;
}

// Categorize post by content
function categorizePost(text) {
  if (!text) return "other";
  if (/維修實錄|維修紀錄|寄來|客人.*寄|收到.*儀表/.test(text)) return "repair";
  if (/整新品|翻新|整新/.test(text)) return "refurbished";
  if (/新品上架|新品到貨|全新液晶/.test(text)) return "new-product";
  if (/教學|Q&A|步驟|DIY/.test(text)) return "tutorial";
  if (/公告|通知|暫停|出國|預約/.test(text)) return "announcement";
  if (/測試影片|試機/.test(text)) return "test-video";
  return "repair"; // default for this workshop page
}

// Extract vehicle model from text
function extractModel(text) {
  if (!text) return "";
  const match = text.match(
    /(?:SYM|KYMCO|YAMAHA|PGO|SUZUKI|GOGORO|AEON|Vespa)\s*[\w''＇\-\s]{2,25}/i
  );
  return match ? match[0].trim() : "";
}

function main() {
  // Verify source exists
  if (!fs.existsSync(FB_DATA_DIR)) {
    console.error("找不到 Facebook 資料匯出資料夾:", FB_DATA_DIR);
    process.exit(1);
  }

  // Create output directories
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  // Clean old posts
  const existingPosts = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"));
  for (const f of existingPosts) {
    fs.unlinkSync(path.join(POSTS_DIR, f));
  }
  console.log(`Removed ${existingPosts.length} old posts`);

  // Read posts JSON
  const postsJson = JSON.parse(
    fs.readFileSync(path.join(FB_DATA_DIR, "profile_posts_1.json"), "utf-8")
  );
  console.log(`Found ${postsJson.length} Facebook posts\n`);

  let migrated = 0;
  const slugs = new Set();
  const FB_ROOT = path.join(
    __dirname,
    "..",
    "facebook-100075586557819-2026-3-21-6KZPzbVS"
  );

  for (const post of postsJson) {
    const timestamp = post.timestamp;
    const date = new Date(timestamp * 1000);
    const dateStr = date.toISOString().slice(0, 10);

    // Get post text
    let postText = "";
    if (post.data) {
      for (const d of post.data) {
        if (d.post) {
          postText = decodeFbText(d.post);
          break;
        }
      }
    }

    // Get title
    let rawTitle = "";
    if (post.title) {
      rawTitle = decodeFbText(post.title);
    }

    // Use first meaningful line of post text as title
    let title = "";
    if (postText) {
      const lines = postText.split("\n").filter((l) => l.trim());
      // Find a good title line (skip very short ones)
      for (const line of lines) {
        const clean = line.trim();
        if (clean.length > 5) {
          title = clean.slice(0, 80);
          break;
        }
      }
    }
    if (!title && rawTitle) {
      title = rawTitle;
    }
    if (!title) {
      title = `貼文 ${dateStr}`;
    }

    // Safe title for YAML frontmatter
    const safeTitle = title.replace(/"/g, '\\"').replace(/\n/g, " ");

    // Generate unique slug
    let slug = generateSlug(timestamp, postText || title);
    if (slugs.has(slug)) {
      slug += `-${String(timestamp).slice(-4)}`;
    }
    slugs.add(slug);

    // Collect and copy media files
    const mediaFiles = [];
    if (post.attachments) {
      for (const att of post.attachments) {
        if (att.data) {
          for (const item of att.data) {
            if (item.media && item.media.uri) {
              mediaFiles.push(item.media.uri);
            }
            // Also check for external context (links/gifs)
            if (item.external_context && item.external_context.url) {
              // Skip external URLs, just note them
            }
          }
        }
      }
    }

    // Copy media
    const imageRefs = [];
    if (mediaFiles.length > 0) {
      const postImgDir = path.join(IMAGES_DIR, slug);
      fs.mkdirSync(postImgDir, { recursive: true });

      for (let i = 0; i < mediaFiles.length; i++) {
        const srcPath = path.join(FB_ROOT, mediaFiles[i]);
        if (fs.existsSync(srcPath)) {
          const ext = path.extname(srcPath).toLowerCase();
          const destName = `${i + 1}${ext}`;
          fs.copyFileSync(srcPath, path.join(postImgDir, destName));
          imageRefs.push(`/images/posts/${slug}/${destName}`);
        }
      }
    }

    const featuredImage = imageRefs.find((r) => !r.endsWith(".mp4")) || "";

    // Excerpt
    const excerpt = postText
      ? postText
          .replace(/\n/g, " ")
          .slice(0, 120)
          .trim() + (postText.length > 120 ? "..." : "")
      : "";
    const safeExcerpt = excerpt.replace(/"/g, '\\"');

    const category = categorizePost(postText);
    const model = extractModel(postText);

    // Build markdown body
    let mdBody = "";
    if (postText) {
      mdBody += postText + "\n\n";
    }

    // Add images
    if (imageRefs.length > 0) {
      for (const img of imageRefs) {
        if (img.endsWith(".mp4")) {
          mdBody += `<video src="${img}" controls class="my-4 w-full rounded-sm"></video>\n\n`;
        } else {
          mdBody += `![${safeTitle}](${img})\n\n`;
        }
      }
    }

    // Build frontmatter
    const md = [
      "---",
      `title: "${safeTitle}"`,
      `date: "${dateStr}"`,
      `excerpt: "${safeExcerpt}"`,
      `image: "${featuredImage}"`,
      `category: "${category}"`,
      `model: "${(model || "").replace(/"/g, '\\"')}"`,
      `pinned: false`,
      `order: 0`,
      `fb_id: "${timestamp}"`,
      `fb_permalink: ""`,
      "---",
      "",
      mdBody,
    ].join("\n");

    fs.writeFileSync(path.join(POSTS_DIR, `${slug}.md`), md, "utf-8");
    migrated++;

    const mediaInfo =
      imageRefs.length > 0 ? ` (${imageRefs.length} media)` : "";
    console.log(`  ${migrated}. ${slug}${mediaInfo}`);
  }

  console.log(`\nMigration complete: ${migrated} posts`);
  console.log(`Posts: ${POSTS_DIR}`);
  console.log(`Images: ${IMAGES_DIR}`);
}

main();
