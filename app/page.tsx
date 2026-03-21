import Link from "next/link";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ScrollReveal, { ScrollRevealGroup } from "./scroll-reveal";

/* ═══════════════════════════════════════════
   Homepage — 北大液晶儀表維修工作室
   ═══════════════════════════════════════════ */

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image?: string;
}

function getPosts(): Post[] {
  const dir = path.join(process.cwd(), "content/posts");
  if (!fs.existsSync(dir)) return [];
  return fs
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
      };
    })
    .sort((a, b) => (b.date > a.date ? 1 : -1))
    .slice(0, 6);
}

export default function HomePage() {
  const posts = getPosts();
  return (
    <>
      <HeroSection />
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
   HERO — 全畫面 + 入場動畫
   ═══════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      <div className="absolute inset-0 bg-primary-deep" />
      <div className="absolute inset-0 grid-texture opacity-30" />

      {/* 背景 hero logo */}
      <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block">
        <img
          src="/images/logo-hero.jpg"
          alt=""
          className="w-[650px] opacity-25 rounded-2xl"
          aria-hidden="true"
        />
      </div>

      {/* 內容 */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24">
        <div className="max-w-3xl">
          <div className="animate-fade-up mb-6 flex items-center gap-3">
            <span className="h-px w-12 bg-accent" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
              Bei Da LCD Dashboard Maintenance
            </span>
          </div>

          <h1 className="animate-fade-up-delay-1">
            <span className="block font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-black leading-[1.08] tracking-tight text-text">
              不換偏光片
            </span>
            <span className="block font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-black leading-[1.08] tracking-tight">
              直接更換
              <span className="text-accent">全新液晶</span>
            </span>
          </h1>

          <p className="animate-fade-up-delay-2 mt-8 max-w-xl text-lg leading-relaxed text-text-muted">
            專注一般機車液晶儀表維修 — 液晶淡化、斷字、按鍵故障。
            效果更好、壽命更長。高雄、屏東雙據點，採預約制服務。
          </p>

          <div className="animate-fade-up-delay-3 mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-accent-hover hover:gap-3"
            >
              預約維修諮詢
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-2 rounded-full border border-border-light px-7 py-3.5 text-sm font-medium text-text-muted transition-colors hover:border-text-muted hover:text-text"
            >
              瀏覽服務項目
            </a>
          </div>

          <div className="animate-fade-up-delay-3 mt-16 flex gap-12 border-t border-border pt-8">
            <StatItem value="10+" label="年維修經驗" />
            <StatItem value="3000+" label="成功案例" />
            <StatItem value="98%" label="客戶滿意度" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary to-transparent" />
    </section>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-black text-gold">{value}</div>
      <div className="mt-1 text-xs text-text-dim">{label}</div>
    </div>
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
            <BannerItem status="ok" text="目前正常收件中 — 預估交件時間 3-5 個工作天" />
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
    },
    {
      num: "02",
      title: "斷字顯示修復",
      desc: "液晶螢幕出現斷字，數字或圖示部分筆劃消失。主因為導電橡膠條老化或接觸不良，經專業處理即可恢復完整顯示。",
      tags: ["斷字修復", "斑馬條更換", "接觸不良"],
    },
    {
      num: "03",
      title: "按鍵故障排除",
      desc: "儀表按鍵按壓無反應、觸感異常或接觸不良。針對按鍵開關與電路進行檢測維修，恢復各項功能切換操作。",
      tags: ["按鍵無反應", "開關維修", "功能切換"],
    },
  ];

  return (
    <section id="services" className="relative py-28">
      <div className="absolute inset-0 stripe-accent" />
      <div className="relative mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <div className="mb-20 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Services</span>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-black leading-tight text-text">
              專業維修項目
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-muted">
              專注液晶儀表的三大常見問題，精準診斷、快速維修。
            </p>
            <p className="mt-2 text-sm text-accent">
              ⚠ 備註：本工作室僅服務一般機車儀表，重機與汽車儀表板恕不提供維修服務。
            </p>
          </div>
        </ScrollReveal>

        <ScrollRevealGroup className="space-y-0">
          {services.map((s, i) => (
            <div
              key={s.num}
              className={`reveal grid gap-8 py-12 md:grid-cols-[1fr_1.2fr] ${
                i !== services.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              <div>
                <span className="font-display text-5xl font-black text-surface-light">{s.num}</span>
                <h3 className="mt-2 font-display text-xl font-bold text-text">{s.title}</h3>
              </div>
              <div>
                <p className="text-base leading-relaxed text-text-muted">{s.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-3 py-1 text-xs text-text-dim transition-colors hover:border-accent hover:text-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </ScrollRevealGroup>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   WHY US — 為什麼選擇我們（左右交錯動畫）
   ═══════════════════════════════════════════ */
function WhyUsSection() {
  return (
    <section className="bg-primary-deep py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Why Choose Us</span>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-black leading-tight text-text">
              為什麼選擇我們
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-3">
          <ScrollReveal className="reveal">
            <div className="rounded-xl border border-border bg-surface/40 p-8 transition-all hover:border-accent/40 hover:bg-surface/60">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-text">全新液晶更換</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                不使用偏光片替換的治標方式，直接更換全新液晶面板，顯示效果如同全新品，使用壽命更長。
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal className="reveal">
            <div className="rounded-xl border border-border bg-surface/40 p-8 transition-all hover:border-accent/40 hover:bg-surface/60">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-text">快速交件</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                一般維修 3-5 個工作天完成。全程可透過 LINE 追蹤進度，維修完成立即通知。
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal className="reveal">
            <div className="rounded-xl border border-border bg-surface/40 p-8 transition-all hover:border-accent/40 hover:bg-surface/60">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-text">品質保固</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                所有維修項目提供保固服務。保固期間相同問題免費維修，讓您安心騎乘。
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   ARTICLES — 雜誌風排版 + 滾動動畫
   ═══════════════════════════════════════════ */
function ArticlesSection({ posts }: { posts: Post[] }) {
  const displayPosts: Post[] =
    posts.length > 0
      ? posts
      : [
          {
            slug: "sample-1",
            title: "液晶儀表常見故障解析：淡化、斷字、按鍵失靈的成因與對策",
            date: "2024-12-15",
            excerpt: "許多車主遇到儀表液晶螢幕出現淡化或斷字問題，本文深入分析常見原因與專業維修方式⋯",
          },
          {
            slug: "sample-2",
            title: "為什麼我們堅持更換全新液晶，而非只換偏光片？",
            date: "2024-12-10",
            excerpt: "市面上許多店家選擇更換偏光片作為快速修復方案，但我們認為直接更換液晶才是根本之道⋯",
          },
          {
            slug: "sample-3",
            title: "寄件維修全流程教學：從包裝到收到修好的儀表",
            date: "2024-12-05",
            excerpt: "不在高雄或屏東也沒關係！本文詳細說明寄件維修的完整流程與包裝注意事項⋯",
          },
        ];

  const featured = displayPosts[0];
  const rest = displayPosts.slice(1);

  return (
    <section id="articles" className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <div className="mb-16 flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Articles</span>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-black leading-tight text-text">
                維修知識專欄
              </h2>
            </div>
            <Link href="/posts" className="hidden text-sm font-medium text-text-muted hover:text-accent md:block">
              查看全部文章 →
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <ScrollReveal className="reveal-left">
            <Link href={`/posts/${featured.slug}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface">
                {featured.image ? (
                  <img src={featured.image} alt={featured.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <LcdIcon size={100} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/90 via-primary-deep/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <time className="text-xs font-medium text-gold">{featured.date}</time>
                  <h3 className="mt-2 font-display text-2xl font-bold leading-snug text-text group-hover:text-accent transition-colors">
                    {featured.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-muted line-clamp-2">{featured.excerpt}</p>
                </div>
              </div>
            </Link>
          </ScrollReveal>

          <ScrollRevealGroup className="flex flex-col gap-6">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="reveal group flex gap-5 border-b border-border/50 pb-6 last:border-0"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface">
                  {post.image ? (
                    <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center"><LcdIcon size={32} /></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <time className="text-xs text-text-dim">{post.date}</time>
                  <h4 className="mt-1 font-display text-sm font-bold leading-snug text-text group-hover:text-accent transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-text-muted line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </ScrollRevealGroup>
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
    { q: "維修後有保固嗎？", a: "所有維修項目提供保固。保固期間如有相同問題免費維修。人為損壞或進水等非正常使用不在保固範圍內。" },
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
                <ContactRow label="高雄據點" value="週一、週三（請填入高雄地址）" />
                <ContactRow label="屏東據點" value="週二、週四、週五（請填入屏東地址）" />
                <ContactRow label="營業時間" value="09:00 – 18:00｜週六、日公休" />
                <ContactRow label="電話" value="（請填入您的電話）" />
              </div>

              <div className="mt-8 flex gap-3">
                {["Facebook", "LINE", "Telegram"].map((name) => (
                  <a
                    key={name}
                    href="#"
                    className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-text-muted hover:border-accent hover:text-accent transition-colors"
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
