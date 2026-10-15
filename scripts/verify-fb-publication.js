const fs = require("fs");

async function verifyPublication() {
  const result = JSON.parse(fs.readFileSync(process.env.FB_SYNC_RESULT_PATH, "utf-8"));
  const posts = result.postsToVerify;
  if (posts.length === 0) {
    console.log("✅ 本次範圍沒有需驗收的文章");
    return;
  }

  let lastError;
  for (let attempt = 1; attempt <= 24; attempt++) {
    try {
      for (const post of posts) {
        const article = await fetch(`https://my-fanpage.vercel.app/posts/${post.slug}`, {
          signal: AbortSignal.timeout(15000),
        });
        const html = await article.text();
        const escapedTitle = post.title.replace(/[&<>"']/g, (char) => ({
          "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;",
        })[char]);
        if (!article.ok || !html.includes(escapedTitle)) {
          throw new Error(`文章尚未上線：${post.slug}（HTTP ${article.status}）`);
        }
        for (const image of post.mediaRefs) {
          if (!html.includes(image)) throw new Error(`文章尚未包含圖片：${image}`);
          const response = await fetch(`https://my-fanpage.vercel.app${image}`, {
            method: "HEAD",
            signal: AbortSignal.timeout(15000),
          });
          if (!response.ok) throw new Error(`圖片尚未上線：${image}`);
        }
      }
      console.log(`✅ 正式網站驗收通過：${posts.length} 篇文章與全部圖片`);
      if (process.env.GITHUB_STEP_SUMMARY) {
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
          `\n正式網站文章與圖片已驗收：${new Date().toISOString()}\n`
        );
      }
      return;
    } catch (err) {
      lastError = err;
      console.log(`等待 Vercel 更新（${attempt}/24）：${err.message}`);
      if (attempt < 24) await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }
  throw lastError;
}

verifyPublication().catch((err) => {
  console.error(`❌ 同步已提交，但正式網站驗收未通過：${err.message}`);
  process.exitCode = 1;
});
