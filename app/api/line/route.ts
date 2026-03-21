import { NextRequest, NextResponse } from "next/server";
import { verifySignature, replyMessage } from "@/lib/line";
import type { LineWebhookBody } from "@/lib/line";
import { handleIncomingMessage } from "@/lib/message-router";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    // 驗證 LINE 簽名
    const signature = req.headers.get("x-line-signature") || "";
    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data: LineWebhookBody = JSON.parse(body);

    for (const event of data.events) {
      if (event.type !== "message" || event.message?.type !== "text") {
        continue;
      }

      const userMessage = event.message.text || "";
      const userId = event.source.userId;

      // 轉發給管理員
      await handleIncomingMessage({
        source: "line",
        senderName: `LINE用戶 (${userId.slice(-6)})`,
        message: userMessage,
        senderId: userId,
        replyToken: event.replyToken,
      });

      // 自動回覆客戶（使用 reply token，免費無額度限制）
      await replyMessage(
        event.replyToken,
        "您好！已收到您的訊息，我們會盡快回覆。\n如有緊急需求，請直接來電。"
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("LINE webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
