import { NextRequest, NextResponse } from "next/server";
import type { TelegramUpdate } from "@/lib/telegram";
import { handleIncomingMessage, handleAdminReply } from "@/lib/message-router";
import { sendMessage } from "@/lib/telegram";

const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || "";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  // 可選：驗證 webhook secret（透過 URL query parameter）
  const secret = req.nextUrl.searchParams.get("secret");
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const update: TelegramUpdate = await req.json();
    const message = update.message;

    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const isAdmin = chatId === ADMIN_CHAT_ID;

    if (isAdmin && message.text.startsWith("/reply")) {
      // 管理員回覆指令 → 路由到對應頻道
      const result = await handleAdminReply(message.text);
      if (result) {
        await sendMessage(ADMIN_CHAT_ID, `✅ ${result}`);
      }
    } else if (!isAdmin) {
      // 一般使用者訊息 → 轉發給管理員
      const senderName =
        message.from.first_name +
        (message.from.last_name ? ` ${message.from.last_name}` : "");

      await handleIncomingMessage({
        source: "telegram",
        senderName,
        message: message.text,
        senderId: chatId,
      });

      // 自動回覆客戶
      await sendMessage(
        chatId,
        "您好！已收到您的訊息，我們會盡快回覆。\n如有緊急需求，請直接來電。"
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
