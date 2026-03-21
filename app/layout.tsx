import type { Metadata } from "next";
import "./globals.css";
import TawkWidget from "./tawk-widget";
import LineQrButton from "./line-qr-button";

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
        <TawkWidget />
        <LineQrButton />
      </body>
    </html>
  );
}

/* ─── Nav ─── */
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-primary-deep/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-3 group">
          <img
            src="/images/logo-horizontal.jpg"
            alt="北大液晶儀表維修"
            className="h-12 w-auto transition-transform group-hover:scale-105 invert"
          />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink href="#services">服務項目</NavLink>
          <NavLink href="#articles">最新文章</NavLink>
          <NavLink href="#faq">常見問題</NavLink>
          <NavLink href="#contact">聯絡我們</NavLink>
        </div>

        <a
          href="#contact"
          className="hidden rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover md:block"
        >
          預約諮詢
        </a>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-text-muted hover:bg-surface hover:text-text md:hidden"
          aria-label="選單"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-sm font-medium text-text-muted transition-colors hover:text-text">
      {children}
    </a>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-border bg-primary-deep">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <img src="/images/logo-horizontal.jpg" alt="北大液晶儀表維修" className="mb-4 h-12 w-auto invert" />
            <p className="text-sm leading-relaxed text-text-muted">
              專注一般機車液晶儀表維修，<br />
              不換偏光片，直接更換全新液晶。<br />
              高雄｜屏東｜採預約制服務。
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-text-dim">快速連結</h4>
            <div className="flex flex-col gap-2.5">
              <FLink href="#services">服務項目</FLink>
              <FLink href="#articles">維修知識</FLink>
              <FLink href="#faq">常見問題</FLink>
              <FLink href="#contact">聯絡我們</FLink>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-text-dim">服務據點</h4>
            <div className="flex flex-col gap-2.5 text-sm text-text-muted">
              <span>週一、三 — 高雄</span>
              <span>週二、四、五 — 屏東</span>
              <span>09:00 – 18:00｜採預約制</span>
              <span>週六、日公休</span>
            </div>
          </div>
        </div>
        <div className="mt-12 flex items-center justify-between border-t border-border pt-8">
          <p className="text-xs text-text-dim">© {new Date().getFullYear()} 北大液晶儀表維修工作室</p>
          <div className="flex gap-4">
            <a href="#" className="text-text-dim hover:text-accent" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
            <a href="#" className="text-text-dim hover:text-accent" aria-label="LINE">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} className="text-sm text-text-muted hover:text-text">{children}</a>;
}
