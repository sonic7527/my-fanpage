/**
 * 統一訊息路由
 *
 * 所有來源（tawk.to / LINE / Telegram）的客戶訊息
 * 統一轉發到管理者的 Telegram 群組
 */

import { forwardToAdmin, parseReplyCommand, sendMessage } from "./telegram";
import { pushMessage, replyMessage } from "./line";

export type MessageSource = "web" | "line" | "telegram";

interface IncomingMessage {
  source: MessageSource;
  senderName: string;
  message: string;
  /** LINE userId 或 tawk.to chatId，用於管理員回覆時路由回去 */
  senderId?: string;
  /** LINE reply token（有時效性，僅限立即回覆） */
  replyToken?: string;
}

const SOURCE_LABELS: Record<MessageSource, string> = {
  web: "網站聊天",
  line: "LINE",
  telegram: "Telegram",
};

/**
 * 處理客戶來訊 — 轉發給管理員
 */
export async function handleIncomingMessage(msg: IncomingMessage): Promise<void> {
  const label = SOURCE_LABELS[msg.source];

  await forwardToAdmin(label, msg.senderName, msg.message, {
    chatId: msg.senderId,
    replyToken: msg.replyToken,
  });
}

/**
 * 處理管理員回覆 — 路由回對應頻道
 */
export async function handleAdminReply(text: string): Promise<string | null> {
  const parsed = parseReplyCommand(text);
  if (!parsed) return null;

  const { source, targetId, message } = parsed;

  switch (source) {
    case "LINE":
    case "line":
      await pushMessage(targetId, message);
      return "已回覆 LINE 客戶";

    case "web":
    case "網站聊天":
      // tawk.to 回覆需透過其 REST API（需要 tawk.to API key）
      // 目前先記錄，後續可串接
      return "網站聊天回覆功能開發中";

    case "Telegram":
    case "telegram":
      await sendMessage(targetId, message);
      return "已回覆 Telegram 客戶";

    default:
      return `未知來源: ${source}`;
  }
}
