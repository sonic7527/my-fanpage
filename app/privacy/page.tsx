import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隱私權政策 — 北大液晶儀表維修工作室",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16 md:pb-20">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <header className="mb-10">
          <h1 className="font-display text-2xl md:text-3xl font-black text-text">隱私權政策</h1>
          <p className="mt-2 text-sm text-text-dim">最後更新：2026-03-22</p>
        </header>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-text-muted">
          <section>
            <h2 className="text-lg font-bold text-text">資料蒐集</h2>
            <p>北大液晶儀表維修工作室（以下簡稱「本工作室」）透過本網站僅蒐集您主動提供的聯絡資訊（如 LINE 訊息內容），用於維修服務諮詢與回覆。</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text">資料使用</h2>
            <p>您提供的資料僅用於以下目的：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>回覆您的維修諮詢</li>
              <li>提供維修報價與進度通知</li>
              <li>改善我們的服務品質</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text">第三方服務</h2>
            <p>本網站使用以下第三方服務：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Vercel — 網站託管與分析</li>
              <li>LINE Messaging API — 訊息通訊</li>
              <li>Facebook Graph API — 粉絲專頁內容同步</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text">資料保護</h2>
            <p>本工作室不會將您的個人資料出售或提供給任何第三方作為行銷用途。</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-text">聯絡我們</h2>
            <p>如對隱私權政策有任何疑問，請透過 LINE 官方帳號（@777xvkrg）與我們聯繫。</p>
          </section>
        </div>
      </div>
    </div>
  );
}
