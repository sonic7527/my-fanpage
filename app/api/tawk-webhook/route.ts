import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/message-router";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

/**
 * tawk.to Webhook 處理器
 *
 * tawk.to 後台設定：
 * 1. Administration → Webhooks → 新增
 * 2. URL: https://your-domain.vercel.app/api/tawk-webhook?secret=YOUR_SECRET
 * 3. 勾選事件：chat:start, chat:end
 */
export async function POST(req: NextRequest) {
  // 驗證 secret
  const secret = req.nextUrl.searchParams.get("secret");
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    // tawk.to webhook payload 結構
    const event = data.event; // "chat:start", "chat:end", etc.
    const visitor = data.visitor || {};
    const message = data.message || {};

    if (event === "chat:start" || message.text) {
      const senderName = visitor.name || "網站訪客";
      const messageText =
        message.text || `（新對話開始）來自 ${visitor.city || "未知位置"}`;

      await handleIncomingMessage({
        source: "web",
        senderName,
        message: messageText,
        senderId: data.chatId || "",
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("tawk.to webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
