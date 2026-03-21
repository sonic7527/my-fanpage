# 北大液晶儀表維修工作室

專業機車液晶儀表維修服務網站 — 北大工作室堅持不換偏光片，採用直接更換全新液晶。

> 最後更新：2026-03-21

## 線上網站

https://my-fanpage.vercel.app

## 功能一覽

- **首頁** — Hero、可維修車款軌道動畫、服務項目、為什麼選擇北大、FAQ、聯絡資訊
- **維修案例** — 文章方塊網格，分類篩選（從 Facebook 自動同步）
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

# Facebook 同步
FB_PAGE_ID=
FB_PAGE_TOKEN=

# LINE
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
LINE_ADMIN_USER_ID=
NEXT_PUBLIC_LINE_OA_URL=
```

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
- 屏東: 屏東市頂柳路539巷76號
