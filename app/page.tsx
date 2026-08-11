import Link from "next/link";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ScrollReveal, { ScrollRevealGroup } from "./scroll-reveal";
import VehicleOrbit from "./vehicle-orbit";

/* ═══════════════════════════════════════════
   Homepage — 北大液晶儀表維修工作室
   ═══════════════════════════════════════════ */

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image?: string;
  pinned?: boolean;
  category?: string;
}

function getPosts(): Post[] {
  const dir = path.join(process.cwd(), "content/posts");
  if (!fs.existsSync(dir)) return [];
  const allPosts = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug: filename.replace(/\.md$/, ""),
        title: data.title || "無標題",
        date: data.date || "",
        excerpt: data.excerpt || content.replace(/[#*>\-\n]/g, " ").slice(0, 120) + "…",
        image: data.image,
        pinned: data.pinned || false,
        category: data.category || "",
      };
    });

  // Pinned posts first, then by date
  const pinned = allPosts.filter((p) => p.pinned).sort((a, b) => (b.date > a.date ? 1 : -1));
  const regular = allPosts.filter((p) => !p.pinned).sort((a, b) => (b.date > a.date ? 1 : -1));
  return [...pinned, ...regular].slice(0, 6);
}

export default function HomePage() {
  const posts = getPosts();
  return (
    <>
      <HeroSection />
      <VehicleOrbit />
      <StatusBanner />
      <ServicesSection />
      <WhyUsSection />
      <ArticlesSection posts={posts} />
      <ContactSection />
    </>
  );
}

/* ═══════════════════════════════════════════
   HERO — 全畫面 + 入場動畫 + 視差效果
   ═══════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="hero-workbench relative flex min-h-[94svh] items-center overflow-hidden">
      <div className="absolute inset-0 bg-primary-deep" />
      <img
        src="/images/bei-da-workbench-hero-v1.png"
        alt="機車液晶儀表維修工作檯"
        className="hero-workbench-image absolute inset-0 h-full w-full object-cover object-[62%_center]"
      />
      <div className="hero-workbench-wash absolute inset-0" />
      <div className="absolute inset-0 paper-grain opacity-25" />

      {/* 內容 */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-28 lg:px-10">
        <div className="max-w-[44rem]">
          <div className="animate-fade-up mb-7 flex items-center gap-3">
            <span className="h-px w-12 bg-gold/70" />
            <span className="text-xs font-bold tracking-[0.26em] text-gold">
              高雄・屏東｜預約制工坊
            </span>
          </div>

          <h1 className="animate-fade-up-delay-1">
            <span className="block font-display text-[clamp(2.55rem,6vw,5.4rem)] font-black leading-[1.08] tracking-[-0.04em] text-text">
              讓模糊的儀表，
            </span>
            <span className="mt-1 block font-display text-[clamp(2.55rem,6vw,5.4rem)] font-black leading-[1.08] tracking-[-0.04em] text-text">
              重新清楚上路。
              <span className="relative ml-2 inline-block text-accent">
                換新液晶
                <span className="brush-underline absolute -bottom-2 left-0 h-2 w-full" />
              </span>
            </span>
          </h1>

          <p className="animate-fade-up-delay-2 mt-8 max-w-[36rem] text-base leading-8 text-text-muted md:text-lg md:leading-9">
            北大專注一般機車液晶儀表維修。不以更換偏光片暫時處理，
            而是直接更換全新液晶，讓顯示清晰、使用更長久。
          </p>

          <div className="animate-fade-up-delay-3 mt-8 md:mt-12 flex flex-wrap items-center gap-3 md:gap-4">
            <a
              href="https://line.me/R/ti/p/@777xvkrg"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex min-h-13 items-center gap-2 rounded-full bg-line px-6 py-3 text-sm font-black text-line-ink transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-line md:px-8 md:py-4"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" className="relative z-10" aria-hidden="true">
                <path d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              <span className="relative z-10">使用 LINE 預約</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#services"
              className="inline-flex min-h-13 items-center gap-2 rounded-full border border-gold/30 px-6 py-3 text-sm font-medium text-text-muted transition-all duration-300 hover:border-gold/70 hover:text-text md:px-8 md:py-4"
            >
              瀏覽服務項目
            </a>
          </div>

        </div>
      </div>

      {/* 底部漸層過渡 */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-primary via-primary/55 to-transparent" />
    </section>
  );
}


/* ═══════════════════════════════════════════
   STATUS BANNER — 跑馬燈
   ═══════════════════════════════════════════ */
function StatusBanner() {
  return (
    <div className="status-ribbon relative overflow-hidden border-y border-gold/[0.12] bg-surface py-3">
      <div className="flex animate-ticker whitespace-nowrap">
        {[1, 2].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-6 px-4 md:gap-12 md:px-6">
            <BannerItem status="ok" text="目前正常收件中 — 現場約 1 小時，郵寄 3 個工作天內寄回" />
            <BannerItem status="info" text="全新液晶更換服務，不換偏光片，效果更持久" />
            <BannerItem status="ok" text="寄件維修全台皆可服務，歡迎透過 LINE 詢問" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BannerItem({ status, text }: { status: string; text: string }) {
  return (
    <span className="flex items-center gap-2.5 text-sm text-text-muted">
      <span className={`inline-block h-2 w-2 rounded-full animate-pulse-glow ${status === "ok" ? "bg-emerald-400" : "bg-gold"}`} />
      {text}
    </span>
  );
}


/* ═══════════════════════════════════════════
   SERVICES — 滾動淡入 + 交錯動畫
   ═══════════════════════════════════════════ */
function ServicesSection() {
  const services = [
    {
      num: "01",
      title: "液晶淡化修復",
      desc: "儀表液晶螢幕隨使用年限逐漸淡化、對比度下降、數字模糊不清。我們不更換偏光片，直接更換全新液晶，效果更好、壽命更長。",
      tags: ["全新液晶更換", "不換偏光片", "顯示清晰"],
      icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    },
    {
      num: "02",
      title: "斷字顯示修復",
      desc: "液晶螢幕出現斷字，數字或圖示部分筆劃消失。主因為導電橡膠條老化或接觸不良，經專業處理即可恢復完整顯示。",
      tags: ["斷字修復", "斑馬條更換", "接觸不良"],
      icon: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    },
    {
      num: "03",
      title: "按鍵故障排除",
      desc: "儀表按鍵按壓無反應、觸感異常或接觸不良。針對按鍵開關與電路進行檢測維修，恢復各項功能切換操作。",
      tags: ["按鍵無反應", "開關維修", "功能切換"],
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
    },
  ];

  return (
    <section id="services" className="craft-section relative py-20 md:py-32">
      <div className="absolute inset-0 paper-grain opacity-30" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <ScrollReveal>
          <div className="mb-12 md:mb-20 max-w-2xl">
            <span className="section-kicker">
              <span className="h-px w-10 bg-gold/70" /> 服務項目
            </span>
            <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-black leading-tight text-white">
              專業維修項目
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/50">
              專注液晶儀表的三大常見問題，精準診斷、快速維修。
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/[0.06] px-4 py-2 text-sm text-accent">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              本工作室僅服務一般機車儀表，重機與汽車儀表板恕不提供維修服務
            </div>
          </div>
        </ScrollReveal>

        <ScrollRevealGroup className="service-ledger grid gap-5 md:grid-cols-12 md:items-stretch">
          {services.map((s) => (
            <div
              key={s.num}
              className="service-entry reveal group relative overflow-hidden border border-gold/[0.12] bg-primary-deep/70 p-6 transition-all duration-500 hover:border-gold/35 md:p-9"
            >
              {/* 序號 */}
              <span className="absolute top-6 right-6 font-display text-6xl font-black text-white/[0.04] transition-all duration-500 group-hover:text-accent/10">
                {s.num}
              </span>

              {/* 圖示 */}
              <div className="mb-8 flex h-12 w-12 items-center justify-center border border-gold/20 text-gold transition-colors duration-300 group-hover:border-accent/50 group-hover:text-accent">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.icon} />
                </svg>
              </div>

              <h3 className="font-display text-xl font-bold text-white transition-colors duration-300 group-hover:text-accent">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">{s.desc}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {s.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/[0.08] px-3 py-1 text-xs text-white/40 transition-all duration-300 group-hover:border-accent/20 group-hover:text-accent/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   WHY US — 為什麼選擇北大（左右交錯動畫）
   ═══════════════════════════════════════════ */
function WhyUsSection() {
  const reasons = [
    {
      icon: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      title: "全新液晶更換",
      desc: "不使用偏光片替換的治標方式，直接更換全新液晶面板，顯示效果如同全新品，使用壽命更長。",
      highlight: "根本解決方案",
    },
    {
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      title: "快速交件",
      desc: "現場工時約 1 小時，可現場等待或事後取車。郵寄維修收到儀表後 3 個工作天內寄回，若無法維修則隔日寄回，全程透過 LINE 回報進度。",
      highlight: "快速完工",
    },
    {
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
      title: "品質保固",
      desc: "所有維修項目提供保固服務。保固期間為 6 個月，如遇儀表進水或其他碰撞導致儀表損壞，則不在保固範圍內。",
      highlight: "售後無憂",
    },
  ];

  return (
    <section className="why-ledger relative overflow-hidden bg-primary-deep py-20 md:py-32">
      <div className="absolute inset-0 paper-grain opacity-20" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <ScrollReveal>
          <div className="mb-12 max-w-2xl md:mb-20">
            <span className="section-kicker">
              <span className="h-px w-10 bg-gold/70" /> 選擇北大
            </span>
            <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-black leading-tight text-white">
              為什麼選擇北大
            </h2>
            <p className="mt-4 max-w-lg text-base text-text-muted">
              多年的維修經驗，堅持使用最好的材料與熱誠的服務
            </p>
          </div>
        </ScrollReveal>

        <ScrollRevealGroup className="reason-list grid gap-0 md:grid-cols-3">
          {reasons.map((r) => (
            <div key={r.title} className="reason-entry reveal group relative border-t border-gold/[0.14] p-6 transition-colors duration-500 hover:bg-surface/35 md:p-10">
              <div className="mb-8 flex h-12 w-12 items-center justify-center text-gold">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={r.icon} />
                </svg>
              </div>
              <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent mb-4">{r.highlight}</span>
              <h3 className="font-display text-xl font-bold text-white">{r.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/45">{r.desc}</p>
            </div>
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   ARTICLES — 雜誌風排版 + 滾動動畫
   ═══════════════════════════════════════════ */
function ArticlesSection({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  const revealClasses = ["reveal-left", "reveal-right", "reveal-scale", "reveal"];

  return (
    <section id="articles" className="article-preview relative py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="mb-10 md:mb-16 flex items-end justify-between">
            <div>
              <span className="section-kicker">維修札記</span>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-black leading-tight text-text">
                公告事項與維修案例
              </h2>
            </div>
            <Link href="/posts" className="hidden text-sm font-medium text-text-muted hover:text-accent md:block">
              查看全部文章 →
            </Link>
          </div>
        </ScrollReveal>

        {/* Grid — cards fly in from different directions on scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post, i) => (
            <ScrollReveal key={post.slug} className={revealClasses[i % 4]}>
              <Link
                href={`/posts/${post.slug}`}
                className="article-preview-card group block overflow-hidden border border-gold/[0.12] bg-surface transition-all duration-300 hover:border-gold/40 hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden bg-surface-light">
                  {post.image ? (
                    <img src={post.image} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <LcdIcon size={48} />
                    </div>
                  )}
                  {post.category && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-primary-deep/80 text-accent px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <time className="text-[11px] text-text-dim">{post.date}</time>
                  <h4 className="mt-1 font-display text-sm font-bold leading-snug text-text group-hover:text-accent transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link href="/posts" className="text-sm font-medium text-text-muted hover:text-accent">
            查看全部文章 →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FAQ — 手風琴 + 滾動動畫
   ═══════════════════════════════════════════ */
function FaqSection() {
  const faqs = [
    { q: "維修大約需要多少時間？", a: "一般儀表維修約 3-5 個工作天，視故障情況而定。如需特殊零件調貨，會另行通知預計交件時間。急件可提前告知，我們會盡量配合。" },
    { q: "可以寄件維修嗎？不在附近怎麼辦？", a: "當然可以！我們提供全台寄件維修服務。請將儀表妥善包裝後寄送至我們的地址，收到後會立即進行檢測並回報維修報價。" },
    { q: "維修費用大概是多少？", a: "費用依故障狀況而異。基本檢測不收費，確認問題後會提供詳細報價，經您同意後才進行維修。" },
    { q: "維修後有保固嗎？", a: "所有維修項目提供 6 個月保固服務。如遇儀表進水或其他碰撞導致儀表損壞，則不在保固範圍內。" },
    { q: "你們跟別人的差別是什麼？", a: "市面上許多店家是更換偏光片來處理液晶淡化問題，我們是直接更換全新液晶面板。全新液晶的顯示效果更好、壽命更長，是根本性的解決方案。" },
    { q: "你們可以修哪些品牌的機車儀表？", a: "我們可以維修大部分品牌的一般機車儀表，包括光陽 KYMCO、三陽 SYM、山葉 YAMAHA、本田 HONDA、PGO 等。重機與汽車儀表板不在服務範圍。" },
  ];

  return (
    <section id="faq" className="bg-primary-deep py-28">
      <div className="mx-auto max-w-3xl px-6">
        <ScrollReveal>
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">FAQ</span>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-black leading-tight text-text">
              常見問題
            </h2>
          </div>
        </ScrollReveal>

        <ScrollRevealGroup className="divide-y divide-border">
          {faqs.map((faq, i) => (
            <details key={i} className="reveal group">
              <summary className="flex items-center justify-between py-6">
                <h3 className="pr-4 text-base font-semibold text-text group-hover:text-accent transition-colors">{faq.q}</h3>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="faq-chevron shrink-0 text-text-dim">
                  <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <div className="faq-answer pb-6">
                <p className="text-sm leading-relaxed text-text-muted">{faq.a}</p>
              </div>
            </details>
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   CONTACT — 雙欄 + 滾動動畫
   ═══════════════════════════════════════════ */
function ContactSection() {
  return (
    <section id="contact" className="contact-workshop relative overflow-hidden border-t border-gold/[0.14] bg-surface/35 py-20 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:gap-16 lg:grid-cols-[1fr_1.2fr]">
          <ScrollReveal className="reveal-left">
            <div>
              <span className="section-kicker">聯絡方式</span>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-black leading-tight text-text">
                聯絡我們
              </h2>
              <p className="mt-4 text-base leading-relaxed text-text-muted">
                有任何儀表問題歡迎隨時與我們聯繫，我們會盡快為您提供專業建議與報價。
              </p>

              <div className="mt-6 border-l-2 border-accent bg-accent-light/30 px-5 py-3">
                <p className="text-sm font-semibold text-accent">
                  ⚠ 本工作室採預約制，請先透過 LINE 或電話預約再前往
                </p>
              </div>

              <a
                href="https://line.me/R/ti/p/@777xvkrg"
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 flex min-h-16 items-center gap-4 rounded-2xl bg-line px-5 py-4 text-line-ink transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-line"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-black">LINE 預約諮詢</span>
                  <span className="mt-0.5 block text-sm text-line-ink/75">官方帳號 @777xvkrg</span>
                </span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
                  <path d="M4 9h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              <div className="mt-8 space-y-5">
                <ContactRow label="高雄據點" value="高雄市苓雅區建國一路64巷59號2樓" />
                <ContactRow label="屏東據點" value="屏東市頂柳路539巷78號" />
                <ContactRow label="高雄營業時間" value="週一至週五 11:30–16:00" />
                <ContactRow label="屏東營業時間" value="週二、週三 18:00–20:00｜週末 10:30–13:30" />
                <ContactRow label="電話" value="0958-320-153" />
              </div>

              <div className="mt-8 flex gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=100075586557819"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white/60 transition-all duration-300 hover:border-accent/50 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Facebook 粉絲專頁
                </a>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal className="reveal-right">
            <div className="process-ledger border border-gold/[0.14] bg-primary-deep/70 p-6 md:p-10">
              <h3 className="font-display text-lg font-bold text-text">寄件維修流程</h3>
              <div className="mt-8 space-y-8">
                <FlowStep num="1" title="聯繫我們" desc="透過 LINE 告知您的儀表問題與車款資訊。" />
                <FlowStep num="2" title="寄送儀表" desc="將儀表妥善包裝（建議用氣泡紙），透過宅配或超商寄送至我們的地址。" />
                <FlowStep num="3" title="檢測報價" desc="收到後 1-2 個工作天內完成檢測，拍照回報問題並提供詳細報價。" />
                <FlowStep num="4" title="維修交件" desc="確認報價後進行維修，完成後寄回給您。全程可透過 LINE 追蹤進度。" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-text-dim">{label}</div>
      <div className="mt-0.5 text-sm text-text-muted">{value}</div>
    </div>
  );
}

function FlowStep({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 font-display text-sm font-black text-accent">
        {num}
      </div>
      <div>
        <h4 className="font-display text-sm font-bold text-text">{title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">{desc}</p>
      </div>
    </div>
  );
}

/* ─── LCD 裝飾圖標 ─── */
function LcdIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className="text-text-dim opacity-20">
      <rect x="10" y="15" width="60" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="18" y="22" width="44" height="30" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
      <text x="40" y="43" textAnchor="middle" fill="currentColor" fontSize="14" fontFamily="monospace">LCD</text>
    </svg>
  );
}
