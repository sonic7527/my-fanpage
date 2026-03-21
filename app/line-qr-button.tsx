"use client";

import { useState } from "react";

/**
 * LINE 官方帳號 QR Code 浮動按鈕
 *
 * 在 .env.local 設定：
 * NEXT_PUBLIC_LINE_OA_URL=https://line.me/R/ti/p/@你的ID
 * NEXT_PUBLIC_LINE_QR_IMAGE=/images/line-qr.png （將 QR code 圖片放在 public/images/）
 */
export default function LineQrButton() {
  const [open, setOpen] = useState(false);

  const lineUrl = process.env.NEXT_PUBLIC_LINE_OA_URL;
  const qrImage = process.env.NEXT_PUBLIC_LINE_QR_IMAGE || "/images/line-qr.png";

  if (!lineUrl) return null;

  return (
    <>
      {/* 浮動 LINE 按鈕 — 固定在左下角（tawk.to 在右下角） */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#06C755] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="加入 LINE 官方帳號"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      </button>

      {/* QR Code 彈出面板 */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="fixed bottom-24 left-6 z-50 w-[calc(100vw-3rem)] max-w-72 rounded-2xl border border-border bg-surface p-5 md:p-6 shadow-2xl animate-fade-up">
            <div className="mb-4 text-center">
              <h3 className="text-base font-bold text-text">加入 LINE 官方帳號</h3>
              <p className="mt-1 text-xs text-text-muted">
                掃描 QR Code 或點擊下方按鈕加入
              </p>
            </div>

            {/* QR Code 圖片 */}
            <div className="mx-auto mb-4 flex h-40 w-40 md:h-48 md:w-48 items-center justify-center overflow-hidden rounded-lg bg-white p-3">
              <img
                src={qrImage}
                alt="LINE 官方帳號 QR Code"
                className="h-full w-full object-contain"
                onError={(e) => {
                  // QR 圖片不存在時顯示提示
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerHTML =
                    '<div class="flex h-full items-center justify-center text-center text-xs text-gray-400">請將 LINE QR Code<br/>圖片放在<br/>public/images/line-qr.png</div>';
                }}
              />
            </div>

            {/* 直接加入按鈕 */}
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#06C755] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#05b34d]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              加入好友
            </a>

            {/* 關閉按鈕 */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-text-dim transition-colors hover:bg-surface-light hover:text-text"
              aria-label="關閉"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M11 3L3 11M3 3l8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </>
  );
}
