/**
 * 統一訊息路由
 *
 * 客戶透過 LINE / 網站聊天 發送訊息
 * 管理員透過 LINE 官方帳號後台回覆
 */

import { pushMessage } from "./line";

export type MessageSource = "web" | "line";

interface IncomingMessage {
  source: MessageSource;
  senderName: string;
  message: string;
  /** LINE userId 或 tawk.to chatId */
  senderId?: string;
  /** LINE reply token（有時效性，僅限立即回覆） */
  replyToken?: string;
}

const ADMIN_LINE_USER_ID = process.env.LINE_ADMIN_USER_ID || "";

const SOURCE_LABELS: Record<MessageSource, string> = {
  web: "網站聊天",
  line: "LINE",
};

/**
 * 處理客戶來訊 — 通知管理員（透過 LINE 推播）
 */
export async function handleIncomingMessage(msg: IncomingMessage): Promise<void> {
  const label = SOURCE_LABELS[msg.source];

  if (ADMIN_LINE_USER_ID) {
    const notification = [
      `📩 新訊息 [${label}]`,
      `👤 ${msg.senderName}`,
      `💬 ${msg.message}`,
      msg.senderId ? `\n回覆指令：\n/reply ${msg.source} ${msg.senderId} 你的回覆內容` : "",
    ].join("\n");

    await pushMessage(ADMIN_LINE_USER_ID, notification);
  }
}

/**
 * 處理管理員回覆 — 路由回對應頻道
 */
export async function handleAdminReply(text: string): Promise<string | null> {
  // 格式: /reply <source> <targetId> <message>
  const match = text.match(/^\/reply\s+(line|web)\s+(\S+)\s+([\s\S]+)/);
  if (!match) return null;

  const [, source, targetId, message] = match;

  switch (source) {
    case "line":
      await pushMessage(targetId, message);
      return "已回覆 LINE 客戶";

    case "web":
      return "網站聊天回覆功能開發中";

    default:
      return `未知來源: ${source}`;
  }
}
