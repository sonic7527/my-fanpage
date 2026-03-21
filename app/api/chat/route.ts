import { NextRequest, NextResponse } from "next/server";
import { matchQuestion } from "@/lib/chat-matcher";
import { defaultSuggestions } from "@/lib/chat-qa";
import { handleIncomingMessage } from "@/lib/message-router";

// Simple rate limiter
const rateLimitMap = new Map<string, number>();

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const last = rateLimitMap.get(sessionId) || 0;
  if (now - last < 1000) return false; // 1 message per second
  rateLimitMap.set(sessionId, now);

  // Clean old entries every 100 calls
  if (rateLimitMap.size > 200) {
    for (const [key, time] of rateLimitMap) {
      if (now - time > 300000) rateLimitMap.delete(key);
    }
  }
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, senderName } = await req.json();

    if (!message || typeof message !== "string" || !sessionId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!checkRateLimit(sessionId)) {
      return NextResponse.json({ error: "Too fast" }, { status: 429 });
    }

    const trimmed = message.trim().slice(0, 500);

    // Try auto-reply
    const match = matchQuestion(trimmed);

    if (match) {
      return NextResponse.json({
        reply: match.answer,
        forwarded: false,
        suggestions: defaultSuggestions.filter((s) => s !== match.question),
      });
    }

    // No match — forward to LINE
    try {
      await handleIncomingMessage({
        source: "web",
        senderName: senderName || `網站訪客`,
        message: trimmed,
        senderId: sessionId,
      });
    } catch (err) {
      console.error("Failed to forward to LINE:", err);
    }

    return NextResponse.json({
      reply: "您的問題我先記下來了，已通知店主，會盡快回覆您！\n\n如需即時協助，也可以直接加 LINE 詢問：\n📱 @777xvkrg",
      forwarded: true,
      suggestions: defaultSuggestions,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
