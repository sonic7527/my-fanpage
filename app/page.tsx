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
      <FaqSection />
      <ContactSection />
    </>
  );
}

/* ═══════════════════════════════════════════
   HERO — 全畫面 + 入場動畫 + 視差效果
   ═══════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      {/* 多層背景 */}
      <div className="absolute inset-0 bg-primary-deep" />
      <div className="absolute inset-0 grid-texture opacity-20" />

      {/* 光暈裝飾 */}
      <div className="absolute top-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-accent/[0.04] blur-[120px] animate-float" />
      <div className="absolute bottom-[-30%] left-[-15%] h-[600px] w-[600px] rounded-full bg-gold/[0.03] blur-[100px] animate-float-delayed" />

      {/* 背景網格 */}
      <div className="absolute inset-0 hero-grid opacity-[0.04]" />

      {/* 內容 */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 pt-28 pb-20">
        <div className="max-w-3xl">
          <div className="animate-fade-up mb-8 flex items-center gap-3">
            <span className="h-px w-16 bg-gradient-to-r from-accent to-transparent" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-accent/80">
              Bei Da LCD Dashboard Maintenance
            </span>
          </div>

          <h1 className="animate-fade-up-delay-1">
            <span className="block font-display text-[clamp(2rem,5vw,4rem)] font-black leading-[1.1] tracking-tight text-white">
              北大工作室堅持不換偏光片
            </span>
            <span className="block font-display text-[clamp(2rem,5vw,4rem)] font-black leading-[1.1] tracking-tight">
              採用直接更換
              <span className="relative text-accent">
                全新液晶
                <span className="absolute -bottom-2 left-0 h-1 w-full bg-accent/30 rounded-full" />
              </span>
            </span>
          </h1>

          <p className="animate-fade-up-delay-2 mt-10 max-w-xl text-lg leading-relaxed text-white/60">
            專注一般機車液晶儀表維修 — 液晶淡化、斷字、按鍵故障。
            效果更好、壽命更長。高雄、屏東雙據點，採預約制服務。
          </p>

          <div className="animate-fade-up-delay-3 mt-12 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              className="group relative inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-bold text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_32px_rgba(220,60,40,0.5)] hover:scale-[1.03] hover:gap-3"
            >
              <span className="relative z-10">預約維修諮詢</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-sm font-medium text-white/70 transition-all duration-300 hover:border-white/30 hover:text-white hover:bg-white/[0.04]"
            >
              瀏覽服務項目
            </a>
          </div>

        </div>
      </div>

      {/* 底部漸層過渡 */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
    </section>
  );
}


/* ═══════════════════════════════════════════
   STATUS BANNER — 跑馬燈
   ═══════════════════════════════════════════ */
function StatusBanner() {
  return (
    <div className="relative overflow-hidden border-y border-border bg-surface/50 py-3">
      <div className="flex animate-ticker whitespace-nowrap">
        {[1, 2].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center gap-12 px-6">
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
    <section id="services" className="relative py-32">
      <div className="absolute inset-0 bg-surface/20" />
      <div className="absolute inset-0 stripe-accent opacity-50" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <ScrollReveal>
          <div className="mb-20 max-w-2xl">
            <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-10 bg-accent" /> Services
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

        <ScrollRevealGroup className="grid gap-6 md:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.num}
              className="reveal group relative rounded-2xl border border-white/[0.06] bg-primary-deep/60 p-8 backdrop-blur-sm transition-all duration-500 hover:border-accent/30 hover:bg-surface/40 hover:shadow-[0_0_40px_rgba(220,60,40,0.08)] hover:-translate-y-1"
            >
              {/* 序號 */}
              <span className="absolute top-6 right-6 font-display text-6xl font-black text-white/[0.04] transition-all duration-500 group-hover:text-accent/10">
                {s.num}
              </span>

              {/* 圖示 */}
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(220,60,40,0.3)]">
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
    <section className="relative bg-primary-deep py-32 overflow-hidden">
      {/* 背景光暈 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-accent/[0.03] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <ScrollReveal>
          <div className="mb-20 text-center">
            <span className="flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-accent">
              <span className="h-px w-10 bg-accent/50" /> Why Choose Us <span className="h-px w-10 bg-accent/50" />
            </span>
            <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.5rem)] font-black leading-tight text-white">
              為什麼選擇北大
            </h2>
            <p className="mt-4 text-base text-white/40 max-w-lg mx-auto">
              多年的維修經驗，堅持使用最好的材料與熱誠的服務
            </p>
          </div>
        </ScrollReveal>

        <ScrollRevealGroup className="grid gap-6 md:grid-cols-3">
          {reasons.map((r) => (
            <div key={r.title} className="reveal group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 transition-all duration-500 hover:border-accent/20 hover:bg-white/[0.04] hover:-translate-y-2">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 text-accent ring-1 ring-accent/10">
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
    <section id="articles" className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="mb-16 flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Repair Cases</span>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-black leading-tight text-text">
                維修案例
              </h2>
            </div>
            <Link href="/posts" className="hidden text-sm font-medium text-text-muted hover:text-accent md:block">
              查看全部文章 →
            </Link>
          </div>
        </ScrollReveal>

        {/* Grid — cards fly in from different directions on scroll */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post, i) => (
            <ScrollReveal key={post.slug} className={revealClasses[i % 4]}>
              <Link
                href={`/posts/${post.slug}`}
                className="group block overflow-hidden rounded-xl bg-surface border border-white/[0.06] hover:border-accent/30 transition-all duration-300 hover:shadow-[0_0_24px_rgba(220,60,40,0.15)] hover:scale-[1.03]"
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
    <section id="contact" className="relative border-t border-border bg-surface/30 py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr]">
          <ScrollReveal className="reveal-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Contact</span>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-black leading-tight text-text">
                聯絡我們
              </h2>
              <p className="mt-4 text-base leading-relaxed text-text-muted">
                有任何儀表問題歡迎隨時與我們聯繫，我們會盡快為您提供專業建議與報價。
              </p>

              <div className="mt-6 rounded-xl border border-accent/30 bg-accent-light/30 px-5 py-3">
                <p className="text-sm font-semibold text-accent">
                  ⚠ 本工作室採預約制，請先透過 LINE 或電話預約再前往
                </p>
              </div>

              <div className="mt-8 space-y-5">
                <ContactRow label="高雄據點" value="高雄市苓雅區建國一路64巷59號2樓" />
                <ContactRow label="屏東據點" value="屏東市頂柳路539巷76號" />
                <ContactRow label="營業時間" value="10:30 – 18:00｜週六、日公休｜特殊時段可提前預約" />
                <ContactRow label="電話" value="0958-320-153" />
              </div>

              <div className="mt-8 flex gap-3">
                {["Facebook", "LINE"].map((name) => (
                  <a
                    key={name}
                    href={name === "LINE" ? "https://line.me/R/ti/p/@777xvkrg" : "#"}
                    target={name === "LINE" ? "_blank" : undefined}
                    rel={name === "LINE" ? "noopener noreferrer" : undefined}
                    className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-white/50 hover:border-accent/50 hover:text-accent transition-all duration-300"
                  >
                    {name}
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal className="reveal-right">
            <div className="rounded-xl border border-border bg-surface/50 p-10">
              <h3 className="font-display text-lg font-bold text-text">寄件維修流程</h3>
              <div className="mt-8 space-y-8">
                <FlowStep num="1" title="聯繫我們" desc="透過 LINE、Telegram 或網站聊天告知您的儀表問題與車款資訊。" />
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
