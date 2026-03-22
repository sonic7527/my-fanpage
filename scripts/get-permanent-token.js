/**
 * 一次性腳本：取得永久 Page Access Token
 *
 * 使用方式：
 *   node scripts/get-permanent-token.js <短期User Token>
 *
 * 需要的環境變數（或直接修改下方常數）：
 *   FB_APP_ID     — 應用程式編號
 *   FB_APP_SECRET — 應用程式密鑰
 *   FB_PAGE_ID    — 粉專 ID
 *
 * 流程：
 *   1. 短期 User Token → 長期 User Token（60天）
 *   2. 長期 User Token → 永久 Page Token（不會過期）
 */

const https = require("https");

const APP_ID = process.env.FB_APP_ID || "1003321468693628";
const APP_SECRET = process.env.FB_APP_SECRET || ""; // 需要填入或設環境變數
const PAGE_ID = process.env.FB_PAGE_ID || "106558851840335";

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
            reject(new Error(`JSON parse error: ${data.slice(0, 500)}`));
          }
        });
      })
      .on("error", reject);
  });
}

async function main() {
  const shortToken = process.argv[2];

  if (!shortToken) {
    console.error("用法: node scripts/get-permanent-token.js <短期User Token>");
    console.error("");
    console.error("請先到 Graph API 測試工具產生 User Token（勾選 pages_read_engagement、pages_show_list）");
    process.exit(1);
  }

  if (!APP_SECRET) {
    console.error("❌ 需要 FB_APP_SECRET 環境變數");
    console.error("   到 Facebook 開發者 → 應用程式設定 → 基本資料 → 應用程式密鑰");
    console.error("");
    console.error("   set FB_APP_SECRET=你的密鑰");
    console.error("   node scripts/get-permanent-token.js <Token>");
    process.exit(1);
  }

  // Step 1: 短期 → 長期 User Token
  console.log("🔄 Step 1: 換取長期 User Token...");
  const exchangeUrl =
    `https://graph.facebook.com/v25.0/oauth/access_token` +
    `?grant_type=fb_exchange_token` +
    `&client_id=${APP_ID}` +
    `&client_secret=${APP_SECRET}` +
    `&fb_exchange_token=${shortToken}`;

  const longData = await fetchJSON(exchangeUrl);
  if (longData.error) {
    console.error("❌ 換取長期 Token 失敗:", longData.error.message);
    process.exit(1);
  }

  const longToken = longData.access_token;
  console.log("✅ 長期 User Token 取得成功");

  // Step 2: 長期 User Token → 永久 Page Token
  console.log("🔄 Step 2: 取得永久 Page Token...");
  const accountsUrl = `https://graph.facebook.com/v25.0/me/accounts?access_token=${longToken}`;
  const accountsData = await fetchJSON(accountsUrl);

  if (accountsData.error) {
    console.error("❌ 取得 Page Token 失敗:", accountsData.error.message);
    process.exit(1);
  }

  const page = (accountsData.data || []).find((p) => p.id === PAGE_ID);
  if (!page) {
    console.error(`❌ 找不到 PAGE_ID=${PAGE_ID} 的粉專`);
    console.error("可用的粉專:", (accountsData.data || []).map((p) => `${p.name} (${p.id})`).join(", "));
    process.exit(1);
  }

  const pageToken = page.access_token;

  // 驗證是否為永久 Token
  console.log("🔄 驗證 Token...");
  const debugUrl = `https://graph.facebook.com/v25.0/debug_token?input_token=${pageToken}&access_token=${longToken}`;
  const debugData = await fetchJSON(debugUrl);

  const expires = debugData.data?.expires_at;
  if (expires === 0) {
    console.log("✅ 確認為永久 Token（永不過期）");
  } else {
    console.log(`⚠ Token 到期時間: ${new Date(expires * 1000).toISOString()}`);
  }

  console.log("");
  console.log("========================================");
  console.log("永久 Page Token（複製下面這行）：");
  console.log("========================================");
  console.log(pageToken);
  console.log("========================================");
  console.log("");
  console.log("請到 GitHub → Settings → Secrets → FB_PAGE_TOKEN 更新此 Token");
}

main().catch((err) => {
  console.error("❌ 失敗:", err.message);
  process.exit(1);
});
