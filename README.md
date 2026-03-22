# 北大液晶儀表維修工作室

專業機車液晶儀表維修服務網站 — 北大工作室堅持不換偏光片，採用直接更換全新液晶。

> 最後更新：2026-03-22

## 更新日誌

### 2026-03-22
- FB 自動同步功能正式上線（應用程式審查通過 + API 權限設定完成）
- 同步腳本改用 User Token + `/me/accounts` 自動取得 Page Token
- 新增 `.sync-ignore` 忽略清單，刪除的文章不會被重新同步
- API endpoint 從 `/feed` 改為 `/posts`（不需要 Page Public Content Access 審查）
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

- **首頁** — Hero、可維修車款軌道動畫、服務項目、為什麼選擇北大、維修案例、聯絡資訊
- **公告事項與維修案例** — 置頂文章動態排列 + 多種版面交替排列，分類篩選
- **管理後台** — 登入後可預覽、編輯、新增、刪除文章（透過 GitHub API）
- **Facebook 同步** — 每小時自動從 FB 粉專抓新貼文，轉為 Markdown 存入 repo
- **LINE 官方帳號** — Webhook 整合，自動回覆訊息

## 技術架構

- **框架**: Next.js 16 (App Router) + React 19
- **樣式**: Tailwind CSS 4
- **內容**: Markdown + gray-matter (content/posts/)
- **通訊**: LINE Messaging API webhook
- **後台**: GitHub Contents API（Vercel serverless 環境寫入）
- **部署**: Vercel（自動部署）
- **同步**: GitHub Actions cron（每小時）

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
└── .github/workflows/
    └── sync-fb.yml            # FB 同步排程（每小時）
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
FB_PAGE_TOKEN=       # User Access Token（非 Page Token，見下方說明）

# LINE
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
LINE_ADMIN_USER_ID=
NEXT_PUBLIC_LINE_OA_URL=
```

## Facebook 同步設定（完整步驟）

FB 同步由 GitHub Actions 每小時自動執行，抓取粉專最新貼文轉為 Markdown。

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

> **注意**：此 Token 約 60 天過期。到期後需重新產生並更新 GitHub Secret。
> 可到「存取權杖偵錯工具」查看到期日，或點「延伸存取權杖」延長效期。

### 4. 設定 GitHub Secrets

在 GitHub repo → Settings → Secrets and variables → Actions，設定：
- `FB_PAGE_ID`：粉專 ID（例如 `106558851840335`）
- `FB_PAGE_TOKEN`：上一步產生的 **User Access Token**

### 5. 同步機制說明

- 腳本會用 User Token 呼叫 `/me/accounts` 自動取得 Page Token
- 再用 Page Token 呼叫 `/{PAGE_ID}/posts` 抓取最近 20 篇貼文
- 新文章建立 `.md` 檔 + 下載圖片，已存在的文章比對內容更新
- 不想同步的文章，把 `fb_id` 加到 `content/posts/.sync-ignore`（一行一個）
- 手動觸發：GitHub Actions → Sync Facebook Posts → Run workflow

### 6. 常見問題

| 問題 | 原因 | 解法 |
|------|------|------|
| `pages_read_engagement` 權限錯誤 | Token 產生時沒勾選該權限 | 重新產生 Token 並勾選 |
| `/feed` endpoint 被擋 | 需要 Page Public Content Access 審查 | 改用 `/posts` endpoint |
| 刪除的文章被重新同步 | fb_id 不在忽略清單 | 加到 `.sync-ignore` |
| Token 過期 | User Token 約 60 天過期 | 重新產生並更新 GitHub Secret |

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
