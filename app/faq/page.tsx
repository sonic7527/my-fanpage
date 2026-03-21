import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "常見問題 — 北大液晶儀表維修",
  description: "關於機車儀表維修的常見問題與解答，包含維修時間、費用、保固、寄件方式等。",
};

const faqs = [
  {
    category: "維修服務",
    items: [
      {
        q: "你們可以修哪些品牌的機車儀表？",
        a: "我們可以維修大部分品牌的機車儀表，包括光陽 KYMCO、三陽 SYM、山葉 YAMAHA、本田 HONDA、PGO、宏佳騰 Aeon 等國產與進口車款。如有特殊車款，歡迎先聯繫確認。",
      },
      {
        q: "維修大約需要多少時間？",
        a: "一般儀表維修約 3-5 個工作天，視故障情況而定。如需特殊零件調貨，會另行通知預計交件時間。急件可提前告知，我們會盡量配合。",
      },
      {
        q: "維修費用大概是多少？",
        a: "費用依故障狀況而異。基本檢測不收費，確認問題後會提供詳細報價，經您同意後才進行維修。一般維修費用約在 $500 - $3,000 之間。",
      },
      {
        q: "維修後有保固嗎？",
        a: "所有維修項目提供 3 個月保固。保固期間如有相同問題免費維修。人為損壞或進水等非正常使用不在保固範圍內。",
      },
    ],
  },
  {
    category: "寄件方式",
    items: [
      {
        q: "可以寄件維修嗎？",
        a: "當然可以！我們提供全台寄件維修服務。請將儀表妥善包裝後寄送至我們的地址，收到後會立即進行檢測並回報維修報價。",
      },
      {
        q: "寄件時要注意什麼？",
        a: "請使用氣泡紙或泡棉妥善包裹儀表，避免運送途中碰撞損壞。建議使用有追蹤功能的寄送方式（如宅配或超商寄件），並在包裹內附上您的聯繫方式與問題描述。",
      },
      {
        q: "維修好後怎麼取回？",
        a: "維修完成後我們會透過宅配寄回給您，運費依實際金額收取。如在附近也歡迎親自到場取件。",
      },
    ],
  },
  {
    category: "付款方式",
    items: [
      {
        q: "接受哪些付款方式？",
        a: "我們接受現金、銀行轉帳、LINE Pay 等付款方式。寄件維修的客戶建議使用銀行轉帳，維修完成確認付款後即安排寄回。",
      },
      {
        q: "需要先付訂金嗎？",
        a: "一般維修不需要預付訂金。如需特殊零件調貨，可能會酌收零件費用作為訂金。",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <header className="mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
            FAQ
          </span>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-black leading-tight text-text">
            常見問題
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            以下整理了客戶最常詢問的問題，如有其他疑問歡迎透過聊天視窗或通訊軟體聯繫我們。
          </p>
        </header>

        {faqs.map((section) => (
          <div key={section.category} className="mb-12">
            <h2 className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.15em] text-gold">
              <span className="h-px w-8 bg-gold/40" />
              {section.category}
            </h2>
            <div className="divide-y divide-border">
              {section.items.map((faq, i) => (
                <details key={i} className="group">
                  <summary className="flex cursor-pointer items-center justify-between py-5">
                    <h3 className="pr-4 text-base font-semibold text-text transition-colors group-hover:text-accent">
                      {faq.q}
                    </h3>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="faq-chevron shrink-0 text-text-dim"
                    >
                      <path
                        d="M5 7.5l5 5 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </summary>
                  <div className="faq-answer pb-5">
                    <p className="text-sm leading-relaxed text-text-muted">
                      {faq.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
