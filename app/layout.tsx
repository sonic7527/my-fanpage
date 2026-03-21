import type { Metadata } from "next";
import "./globals.css";
import LineQrButton from "./line-qr-button";
import MobileMenu from "./mobile-menu";
import NavScrollEffect from "./nav-scroll";
import ChatButton from "./chat-button";
import { ChatWidgetWrapper } from "./chat-widget";

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
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;600;700;900&display=swap"
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
      </body>
    </html>
  );
}

/* ─── Nav ─── */
function Nav() {
  return (
    <nav className="nav-bar fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      {/* 三欄 grid：Logo 左 ｜ 導航置中 ｜ CTA 右 */}
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center px-6 lg:px-10">
        {/* 左欄：Logo */}
        <div className="justify-self-start">
          <a href="/" className="group inline-block">
            <img
              src="/images/logo-nav-white.png"
              alt="北大液晶儀表維修"
              className="h-28 w-auto transition-all duration-300 group-hover:scale-105"
            />
          </a>
        </div>

        {/* 中欄：導航連結 — 永遠置中 */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink href="/#services">服務項目</NavLink>
          <NavLink href="/posts">維修案例</NavLink>
          <NavLink href="/#faq">常見問題</NavLink>
          <NavLink href="/#contact">聯絡我們</NavLink>
        </div>

        {/* 右欄：維修問答 + 手機選單 */}
        <div className="justify-self-end flex items-center gap-4">
          <div className="hidden md:block">
            <ChatButton />
          </div>
          <MobileMenu />
        </div>
      </div>

      {/* 底線 + 背景 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.06]" />
      <div className="absolute inset-0 -z-10 bg-primary-deep/70 backdrop-blur-2xl" />
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="relative px-4 py-2 text-sm font-medium text-text-muted transition-colors duration-300 hover:text-white after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-6"
    >
      {children}
    </a>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-primary-deep overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-accent blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-gold blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* 品牌欄 */}
          <div>
            <img src="/images/logo-nav-white.png" alt="北大液晶儀表維修" className="mb-5 h-12 w-auto opacity-80" />
            <p className="text-sm leading-relaxed text-text-muted max-w-xs">
              專注一般機車液晶儀表維修，不換偏光片，直接更換全新液晶。高雄、屏東雙據點，採預約制服務。
            </p>
            <div className="mt-6 flex gap-3">
              <SocialLink href="#" label="Facebook" icon="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              <SocialLink href="#" label="LINE" icon="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </div>
          </div>

          {/* 服務項目 */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/40">服務項目</h4>
            <div className="flex flex-col gap-3">
              <FLink href="#services">液晶淡化修復</FLink>
              <FLink href="#services">斷字顯示修復</FLink>
              <FLink href="#services">按鍵故障排除</FLink>
              <FLink href="#contact">寄件維修</FLink>
            </div>
          </div>

          {/* 快速連結 */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/40">快速連結</h4>
            <div className="flex flex-col gap-3">
              <FLink href="#articles">維修案例</FLink>
              <FLink href="#faq">常見問題</FLink>
              <FLink href="#contact">聯絡我們</FLink>
              <FLink href="/faq">完整 FAQ</FLink>
            </div>
          </div>

          {/* 服務據點 */}
          <div>
            <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-white/40">服務據點</h4>
            <div className="flex flex-col gap-3 text-sm text-text-muted">
              <span>週一、三 — 高雄</span>
              <span>週二、四、五 — 屏東</span>
              <span>10:30 – 18:00</span>
              <span className="text-accent font-medium">採預約制服務</span>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} 北大液晶儀表維修工作室. All rights reserved.</p>
          <p className="text-xs text-white/20">Bei Da LCD Dashboard Maintenance</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all duration-300 hover:border-accent/50 hover:text-accent hover:scale-110"
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
