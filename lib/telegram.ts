/**
 * Telegram Bot API 工具
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || "";
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text?: string;
  date: number;
  reply_to_message?: TelegramMessage;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

/**
 * 發送訊息到指定 chat
 */
export async function sendMessage(
  chatId: string | number,
  text: string,
  options?: { reply_to_message_id?: number; parse_mode?: string }
): Promise<{ ok: boolean; result?: TelegramMessage }> {
  const res = await fetch(`${API_BASE}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode || "HTML",
      reply_to_message_id: options?.reply_to_message_id,
    }),
  });
  return res.json();
}

/**
 * 轉發客戶訊息給管理員
 */
export async function forwardToAdmin(
  source: string,
  senderName: string,
  message: string,
  metadata?: { chatId?: string; replyToken?: string }
): Promise<void> {
  const metaStr = metadata
    ? `\n\n<i>回覆指令：/reply ${source} ${metadata.chatId || metadata.replyToken || ""}</i>`
    : "";

  const text = `📩 <b>[${source}]</b> 新訊息\n\n<b>來自：</b>${senderName}\n<b>內容：</b>${message}${metaStr}`;

  await sendMessage(ADMIN_CHAT_ID, text);
}

/**
 * 檢查是否為管理員回覆指令
 * 格式：/reply <source> <id> <message>
 */
export function parseReplyCommand(text: string): {
  source: string;
  targetId: string;
  message: string;
} | null {
  const match = text.match(/^\/reply\s+(\w+)\s+(\S+)\s+([\s\S]+)/);
  if (!match) return null;
  return {
    source: match[1],
    targetId: match[2],
    message: match[3],
  };
}
