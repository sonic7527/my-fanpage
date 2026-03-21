# 北大液晶儀表維修工作室

專業機車液晶儀表維修服務網站 — 不換偏光片，直接更換全新液晶。

## 線上網站

https://my-fanpage.vercel.app

## 技術架構

- **框架**: Next.js 16 (App Router) + React 19
- **樣式**: Tailwind CSS 4
- **內容**: Markdown + gray-matter (content/posts/)
- **通訊**: LINE Messaging API webhook
- **部署**: Vercel

## 專案結構

```
├── app/                    # Next.js App Router 頁面
│   ├── page.tsx           # 首頁（Hero、服務、案例、FAQ、聯絡）
│   ├── layout.tsx         # 全局佈局（導航列、頁尾）
│   ├── globals.css        # 全局樣式與動畫
│   ├── posts/
│   │   ├── page.tsx       # 文章列表頁（分類篩選）
│   │   ├── posts-grid.tsx # 文章網格元件（客戶端）
│   │   └── [slug]/page.tsx # 文章內頁
│   ├── faq/page.tsx       # 完整 FAQ 頁
│   ├── api/line/route.ts  # LINE webhook API
│   ├── mobile-menu.tsx    # 手機選單
│   ├── nav-scroll.tsx     # 導航列滾動效果
│   ├── scroll-reveal.tsx  # 滾動動畫元件
│   ├── tawk-widget.tsx    # tawk.to 聊天
│   └── line-qr-button.tsx # LINE 浮動按鈕
├── content/posts/          # Markdown 文章（109 篇 FB 貼文）
├── lib/
│   ├── line.ts            # LINE API 工具
│   └── message-router.ts  # 訊息路由
├── public/images/          # 靜態圖片
│   ├── posts/             # 文章圖片（依文章分資料夾）
│   ├── logo-nav-white.png # 導航列 logo（白色透明）
│   ├── logo-hero.png      # Hero 區 logo
│   └── logo-full.png      # 完整 logo
├── scripts/
│   ├── migrate-fb-posts.js # FB 資料匯出轉 Markdown
│   └── sync-fb-posts.js   # FB API 同步（需 token）
└── .env.local              # 環境變數（不入版控）
```

## 環境變數

```env
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
LINE_ADMIN_USER_ID=
NEXT_PUBLIC_LINE_OA_URL=https://line.me/R/ti/p/@777xvkrg
NEXT_PUBLIC_LINE_QR_IMAGE=/images/line-qr.png
```

## 開發

```bash
npm install
npm run dev        # 啟動開發伺服器
npm run build      # 建置
npm run migrate-fb # 匯入 FB 貼文（需要 FB 資料匯出檔案）
```

## 文章管理

文章存放在 `content/posts/` 目錄下，每篇為一個 `.md` 檔案。

Frontmatter 欄位：
```yaml
---
title: "文章標題"
date: "2024-01-01"
excerpt: "摘要"
image: "/images/posts/slug/1.jpg"
category: "repair"          # repair, refurbished, new-product, tutorial, announcement
model: "YAMAHA CUXI"        # 車款
pinned: false               # 設為 true 置頂
order: 0                    # 置頂排序（數字越大越前）
---
```

## 聯絡資訊

- LINE 官方帳號: @777xvkrg
- 電話: 0958-320-153
- 高雄: 苓雅區建國一路64巷59號2樓
- 屏東: 屏東市頂柳路539巷76號
