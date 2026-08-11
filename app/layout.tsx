import type { Metadata } from "next";
import "./globals.css";
import LineQrButton from "./line-qr-button";
import MobileMenu from "./mobile-menu";
import NavScrollEffect from "./nav-scroll";
import ChatButton from "./chat-button";
import { ChatWidgetWrapper } from "./chat-widget";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "北大液晶儀表維修 — 專業機車液晶儀表更換服務",
  description:
    "北大液晶儀表維修工作室 — 專業機車液晶儀表維修，不換偏光片，直接更換全新液晶。液晶淡化、斷字、按鍵故障。高雄、屏東預約制服務。",
  keywords: [
    "機車儀表維修", "液晶儀表維修", "液晶淡化", "斷字修復",
    "北大液晶", "高雄儀表維修", "屏東儀表維修",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Sans+TC:wght@300;400;500;600;700;900&family=Noto+Serif+TC:wght@600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <Nav />
        <main>{children}</main>
        <Footer />
        <NavScrollEffect />
        <LineQrButton />
        <ChatWidgetWrapper />
        <Analytics />
      </body>
    </html>
  );
}

/* ─── Nav ─── */
function Nav() {
  return (
    <nav className="nav-bar fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      {/* 三欄 grid：Logo 左 ｜ 導航置中 ｜ CTA 右 */}
      <div className="relative grid h-24 grid-cols-[1fr_auto_1fr] items-center px-5 md:h-32 lg:px-10">
        {/* 左欄：Logo */}
        <div className="justify-self-start">
          <a href="/" className="group inline-block">
            <img
              src="/images/logo-nav-white.png"
              alt="北大液晶儀表維修"
              className="h-20 w-auto transition-transform duration-300 group-hover:scale-[1.03] md:h-28"
            />
          </a>
        </div>

        {/* 中欄：導航連結 — 永遠置中 */}
        <div className="hidden items-center gap-2 lg:flex">
          <NavLink href="/#services">服務項目</NavLink>
          <NavLink href="/posts">公告事項與維修案例</NavLink>
          <NavLink href="/#contact">聯絡我們</NavLink>
        </div>

        {/* 右欄：維修問答 + 手機選單 */}
        <div className="justify-self-end flex items-center gap-4">
          <ChatButton />
          <MobileMenu />
        </div>
      </div>

      {/* 底線 + 背景 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gold/[0.16]" />
      <div className="absolute inset-0 -z-10 bg-primary-deep/90 backdrop-blur-xl" />
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="relative px-4 py-3 text-sm font-medium tracking-[0.08em] text-text-muted transition-colors duration-300 hover:text-text after:absolute after:bottom-1 after:left-4 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-8"
    >
      {children}
    </a>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-gold/[0.14] bg-primary-deep">
      {/* 背景裝飾 */}
      <div className="pointer-events-none absolute inset-0 paper-grain opacity-40">
        <div className="absolute -right-20 top-8 h-px w-72 rotate-[-8deg] bg-gold/20" />
        <div className="absolute -right-8 top-14 h-px w-52 rotate-[-8deg] bg-accent/20" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-12 md:py-20">
        <div className="grid gap-8 md:gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* 品牌欄 */}
          <div>
            <img src="/images/logo-nav-white.png" alt="北大液晶儀表維修" className="mb-5 h-20 w-auto opacity-90 md:h-24" />
            <p className="text-sm leading-relaxed text-text-muted max-w-xs">
              專注一般機車液晶儀表維修，不換偏光片，直接更換全新液晶。高雄、屏東雙據點，採預約制服務。
            </p>
            <div className="mt-6 flex items-center gap-3">
              <SocialLink href="https://www.facebook.com/profile.php?id=100075586557819" label="Facebook" icon="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              <a href="https://line.me/R/ti/p/@777xvkrg" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-line px-4 py-2 text-xs font-bold text-line-ink transition-transform duration-300 hover:-translate-y-0.5" target="_blank" rel="noopener noreferrer">
                LINE 預約 <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          {/* 服務項目 */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/40">服務項目</h4>
            <div className="flex flex-col gap-3">
              <FLink href="/#services">液晶淡化修復</FLink>
              <FLink href="/#services">斷字顯示修復</FLink>
              <FLink href="/#services">按鍵故障排除</FLink>
              <FLink href="/#contact">寄件維修</FLink>
            </div>
          </div>

          {/* 快速連結 */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/40">快速連結</h4>
            <div className="flex flex-col gap-3">
              <FLink href="/posts">公告事項與維修案例</FLink>
              <FLink href="/#contact">聯絡我們</FLink>
            </div>
          </div>

          {/* 服務據點 */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/40">服務據點</h4>
            <div className="flex flex-col gap-3 text-sm text-text-muted">
              <span>高雄｜週一至週五 11:30–16:00</span>
              <span>屏東｜週二、週三 18:00–20:00</span>
              <span>屏東｜週末 10:30–13:30</span>
              <span className="text-accent font-medium">採預約制服務</span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-gold/[0.12] pt-8 md:mt-16 sm:flex-row sm:items-center">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} 北大液晶儀表維修工作室．版權所有</p>
          <p className="text-xs text-white/20">專業機車液晶儀表維修</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/20 text-text-muted transition-all duration-300 hover:border-gold/60 hover:text-gold hover:-translate-y-0.5"
      aria-label={label}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={icon} /></svg>
    </a>
  );
}

function FLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-sm text-text-muted transition-colors duration-300 hover:text-white hover:translate-x-1 inline-block">
      {children}
    </a>
  );
}
