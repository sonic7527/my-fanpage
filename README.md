# 北大液晶儀表維修工作室

專業機車液晶儀表維修服務網站 — 北大工作室堅持不換偏光片，採用直接更換全新液晶。

> 最後更新：2026-08-11

## 更新日誌

### 2026-08-11
- 左上角品牌 Logo 與導覽列同步放大，桌機與手機皆保留清楚品牌辨識
- Facebook 同步工作流程從 `disabled_inactivity` 恢復為 `active`，手動實跑成功搬入 2026-07-30 新文章與圖片
- Facebook 同步改為每日 08:17 執行，避開 GitHub Actions 整點尖峰；新增每月心跳提交，避免公開 repo 60 天無活動後再次停用
- GitHub Actions 升級至 `checkout@v6`、`setup-node@v6` 與 Node.js 24
- 全站視覺統一為「職人工坊夜色」：深海軍藍底、暖金與朱砂重點色、紙張顆粒、編輯式不對稱排版
- 新增 AI 生成首頁工作檯主視覺 `public/images/bei-da-workbench-hero-v1.png`，延續北大書法圖的水墨與技術線條語言
- 首頁、車款軌道、服務項目、選擇北大、文章預覽、聯絡區、導覽列、頁尾與 LINE 入口完成一致化
- 文章列表、文章內頁、FAQ、隱私權頁面同步套用新的排版、色彩、互動與行動版樣式
- 首頁恢復顯示最新 6 篇公告與維修案例，Facebook 同步文章可在首頁直接被看見
- 新增鍵盤焦點樣式、44px 以上觸控區、減少動態偏好支援，並修正首頁行動版水平溢位
- 首頁營業時間更新：高雄週一至週五 11:30–16:00；屏東週二、週三 18:00–20:00、週末 10:30–13:30
- LINE 預約入口改為首屏主按鈕、聯絡區大型按鈕與常駐浮動文字按鈕
- 車款軌道中央「北大」圖改用配合深藍、朱砂紅與金色網站色票的新透明圖，移除突兀的銀白星雲外圍
- 同步更新頁尾與網站聊天助理的營業時間回答

### 2026-03-22
- FB 自動同步功能正式上線（應用程式審查通過 + API 權限設定完成）
- 取得永久 Page Token（不會過期），同步腳本直接使用
- 新增 `get-permanent-token.js` 一次性腳本（短期 Token → 永久 Token）
- 新增 `.sync-ignore` 忽略清單，刪除的文章不會被重新同步
- API endpoint 從 `/feed` 改為 `/posts`（不需要 Page Public Content Access 審查）
- 同步頻率調整為每天一次（台灣 8:00），節省 API 額度
- 手機版響應式優化（車款軌道等比縮小、Logo/間距/按鈕自動調整，桌面版不受影響）
- 導覽列「維修案例」改為「公告事項與維修案例」
- 置頂文章改為依數量動態排列（1～5篇自動切換版型）
- 分類統計計數包含置頂文章
- KYMCO/SYM 車款清單加上捲動功能，解決過長被裁切問題
- 品牌清單標題統一「英文 中文」格式
- Google Search Console 驗證 + robots.txt + sitemap
- Vercel Web Analytics 瀏覽統計
- LINE webhook 自動回覆上線

### 2026-03-21
- 網站正式上線，匯入 109 篇 Facebook 貼文
- Logo 全面更新螢光橘版，導航列/頁尾放大
- 車款軌道動畫（6 品牌八角軌道環繞）
- 聊天助理（維修問答 + 快速鍵）
- 管理後台上線（文章 CRUD 透過 GitHub API）
- LINE 官方帳號 QR Code 浮動按鈕
- 聯繫方式改為僅 LINE
- 屏東地址更新 539巷76號→78號

## 線上網站

https://my-fanpage.vercel.app

## 功能一覽

- **首頁** — 職人工坊主視覺、可維修車款軌道、服務項目、選擇北大、最新 6 篇文章、聯絡資訊
- **公告事項與維修案例** — 置頂文章動態排列 + 多種版面交替排列，分類篩選
- **管理後台** — 登入後可預覽、編輯、新增、刪除文章（透過 GitHub API）
- **Facebook 同步** — 每天台灣時間 08:17 從 FB 粉專抓新貼文，轉為 Markdown 存入 repo；每月心跳提交避免排程因公開 repo 長期無活動而停用
- **LINE 官方帳號** — Webhook 整合，自動回覆訊息
- **營業時間** — 高雄：週一至週五 11:30–16:00；屏東：週二、週三 18:00–20:00、週末 10:30–13:30（皆採預約制）

## 技術架構

- **框架**: Next.js 16 (App Router) + React 19
- **樣式**: Tailwind CSS 4
- **內容**: Markdown + gray-matter (content/posts/)
- **通訊**: LINE Messaging API webhook
- **後台**: GitHub Contents API（Vercel serverless 環境寫入）
- **部署**: Vercel（推送 GitHub 自動部署；亦可使用 Vercel CLI 直接部署）
- **同步**: GitHub Actions cron（每天台灣時間 08:17，另有每月防休眠心跳）

## 專案結構

```
├── app/                        # Next.js App Router
│   ├── page.tsx               # 首頁
│   ├── layout.tsx             # 全局佈局（導航列、頁尾）
│   ├── globals.css            # 全局樣式與動畫
│   ├── vehicle-orbit.tsx      # 車款軌道動畫（八邊形圓角）
│   ├── scroll-reveal.tsx      # 滾動動畫元件
│   ├── posts/                 # 文章頁面
│   │   ├── page.tsx           # 文章列表（分類篩選）
│   │   ├── posts-grid.tsx     # 文章網格元件
│   │   └── [slug]/page.tsx    # 文章內頁
│   ├── admin/                 # 管理後台
│   │   ├── page.tsx           # 登入頁
│   │   └── dashboard/page.tsx # 後台主頁
│   ├── api/
│   │   ├── admin/             # 後台 API（GitHub API 操作）
│   │   │   ├── auth.ts        # JWT 驗證
│   │   │   ├── github.ts      # GitHub Contents API 封裝
│   │   │   ├── login/route.ts # 登入
│   │   │   └── posts/         # 文章 CRUD
│   │   └── line/route.ts      # LINE webhook
│   ├── mobile-menu.tsx        # 手機選單
│   ├── nav-scroll.tsx         # 導航列滾動效果
│   └── line-qr-button.tsx     # LINE 浮動按鈕
├── content/posts/              # Markdown 文章
├── scripts/
│   ├── sync-fb-posts.js       # FB API 同步（GitHub Actions 用）
│   └── migrate-fb-posts.js    # FB 資料匯出轉 Markdown
├── public/                     # 靜態資源
│   └── images/bei-da-workbench-hero-v1.png # 首頁職人工坊主視覺
└── .github/
    ├── fb-sync-heartbeat      # 每月更新，避免排程因 repo 無活動被停用
    └── workflows/
        └── sync-fb.yml        # FB 同步排程（每天台灣時間 08:17）
```

## 環境變數

```env
# 後台
ADMIN_USER=
ADMIN_PASS=
ADMIN_JWT_SECRET=

# GitHub API（後台文章操作）
GITHUB_TOKEN=

# Facebook 同步（GitHub Secrets 設定，非 .env）
FB_PAGE_ID=          # 粉專 ID（例如 106558851840335）
FB_PAGE_TOKEN=       # 永久 Page Token（用 get-permanent-token.js 產生）

# LINE
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
LINE_ADMIN_USER_ID=
NEXT_PUBLIC_LINE_OA_URL=
```

## Facebook 同步設定（完整步驟）

FB 同步由 GitHub Actions 每天自動執行一次（台灣 8:17），抓取粉專最新貼文轉為 Markdown。

> 2026-08-11 驗證：工作流程已從 `disabled_inactivity` 重新啟用，手動執行成功新增 1 篇 Facebook 文章與圖片並推送至 GitHub。工作流程另會每月更新 `.github/fb-sync-heartbeat`，避免公開 repo 因 60 天無活動再次停用。

### 1. Facebook 開發者應用程式設定

1. 到 [Facebook 開發者](https://developers.facebook.com/) 建立應用程式（類型：商業與粉絲專頁）
2. 「應用程式設定」→「基本資料」填寫：
   - 顯示名稱、隱私政策網址、服務條款網址、應用程式圖示、類別
   - 聯絡電子郵件
3. 「商家專用 Facebook 登入」→ 設定 → 完成快速入門
4. 「發佈」應用程式（左側選單最下方）

### 2. 啟用 API 權限

1. 「使用案例」→「管理粉絲專頁的所有內容」→ 點「自訂」
2. 在權限清單中，點「+ 新增」啟用以下權限：
   - **`pages_read_engagement`**（必要：讀取粉專貼文）
   - `pages_show_list`（列出管理的粉專）
3. 啟用後狀態會顯示「可供測試」，對應用程式管理員自己的粉專即可使用

### 3. 產生 User Access Token

1. 到「工具」→「Graph API 測試工具」
2. 選擇你的應用程式
3. 勾選權限：`pages_read_engagement`、`pages_show_list`
4. 點「產生存取權杖」→ 同意授權
5. 複製產生的 Token

### 4. 換取永久 Page Token

短期 User Token 只有 1-2 小時效期，需要換成永久 Token：

```bash
# 設定應用程式密鑰（到 FB 開發者 → 應用程式設定 → 基本資料 → 應用程式密鑰）
set FB_APP_SECRET=你的密鑰

# 執行換 Token 腳本
node scripts/get-permanent-token.js <短期User Token>
```

腳本會自動：短期 User Token → 長期 User Token（60天）→ 永久 Page Token（永不過期）

### 5. 設定 GitHub Secrets

在 GitHub repo → Settings → Secrets and variables → Actions，設定：
- `FB_PAGE_ID`：粉專 ID（例如 `106558851840335`）
- `FB_PAGE_TOKEN`：上一步產生的**永久 Page Token**

### 6. 同步機制說明

- 同步腳本直接使用永久 Page Token 呼叫 `/{PAGE_ID}/posts` 抓取最近 20 篇貼文
- 每天自動執行一次（台灣 8:00），也可到 GitHub Actions 手動觸發
- 新文章建立 `.md` 檔 + 下載圖片，已存在的文章比對內容更新
- 不想同步的文章，把 `fb_id` 加到 `content/posts/.sync-ignore`（一行一個）

### 7. 常見問題

| 問題 | 原因 | 解法 |
|------|------|------|
| `pages_read_engagement` 權限錯誤 | Token 產生時沒勾選該權限 | 重新產生 Token 並勾選 |
| `/feed` endpoint 被擋 | 需要 Page Public Content Access 審查 | 改用 `/posts` endpoint（已修正） |
| 刪除的文章被重新同步 | fb_id 不在忽略清單 | 加到 `.sync-ignore` |
| Token 過期 | 沒有使用永久 Token | 用 `get-permanent-token.js` 換取永久 Token |

## 開發

```bash
npm install
npm run dev        # 啟動開發伺服器
npm run build      # 建置
```

## 聯絡資訊

- LINE 官方帳號: @777xvkrg
- 電話: 0958-320-153
- 高雄: 苓雅區建國一路64巷59號2樓
- 屏東: 屏東市頂柳路539巷78號
