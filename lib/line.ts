/**
 * LINE Messaging API 工具
 */

import crypto from "crypto";

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const API_BASE = "https://api.line.me/v2/bot";

export interface LineEvent {
  type: string;
  replyToken: string;
  source: {
    type: string;
    userId: string;
  };
  message?: {
    type: string;
    id: string;
    text?: string;
  };
  timestamp: number;
}

export interface LineWebhookBody {
  events: LineEvent[];
  destination: string;
}

/**
 * 驗證 LINE webhook 簽名
 */
export function verifySignature(body: string, signature: string): boolean {
  if (!CHANNEL_SECRET) return false;
  const hash = crypto
    .createHmac("SHA256", CHANNEL_SECRET)
    .update(body)
    .digest("base64");
  return hash === signature;
}

/**
 * 使用 Reply Token 回覆訊息（免費，無額度限制）
 */
export async function replyMessage(
  replyToken: string,
  text: string
): Promise<void> {
  await fetch(`${API_BASE}/message/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });
}

/**
 * 使用 Push API 發送訊息（每月 500 則免費額度）
 */
export async function pushMessage(
  userId: string,
  text: string
): Promise<void> {
  await fetch(`${API_BASE}/message/push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text }],
    }),
  });
}
