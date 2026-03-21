"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
  forwarded?: boolean;
}

const WELCOME_MESSAGE =
  "您好！我是北大液晶儀表維修的線上助理 🔧\n有什麼我可以幫您的嗎？\n您可以直接輸入問題，或點選下方快速選項。";

const INITIAL_SUGGESTIONS = [
  "維修費用",
  "維修時間",
  "寄件維修",
  "營業時間",
  "保固說明",
  "可維修車種",
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
  const sessionId = useRef(
    typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36)
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setInput("");
      setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            sessionId: sessionId.current,
          }),
        });

        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.reply, forwarded: data.forwarded },
        ]);
        if (data.suggestions) {
          setSuggestions(data.suggestions.slice(0, 4));
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "抱歉，連線出了問題。請直接加 LINE @777xvkrg 聯繫我們！",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop on mobile */}
      <div
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm sm:hidden"
        onClick={() => setIsOpen(false)}
      />

      {/* Chat panel */}
      <div className="fixed z-[70] bottom-0 right-0 left-0 top-16 sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:w-[400px] sm:h-[560px] sm:rounded-2xl flex flex-col overflow-hidden border border-white/[0.08] bg-primary-deep shadow-2xl animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-surface/30">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-text">維修服務問答</div>
              <div className="text-[10px] text-text-dim">北大液晶儀表維修</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:text-text hover:bg-white/[0.06] transition-colors"
            aria-label="關閉"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-accent text-white rounded-br-sm"
                    : "bg-surface/60 text-text-muted rounded-bl-sm"
                }`}
              >
                {msg.text}
                {msg.forwarded && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-text-dim flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#06C755]">
                      <path d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                    </svg>
                    已轉送店主，也可加 LINE 即時詢問
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface/60 rounded-2xl rounded-bl-sm px-4 py-3 text-text-dim">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-text-dim animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-text-dim animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-text-dim animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {/* Quick suggestions */}
          {!isLoading && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestions.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-accent/20 bg-accent/[0.06] px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/15 hover:border-accent/40 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.08] px-4 py-3 bg-surface/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="輸入您的問題..."
              className="flex-1 rounded-xl border border-white/[0.08] bg-primary-deep px-4 py-2.5 text-sm text-text placeholder:text-text-dim outline-none focus:border-accent/40 transition-colors"
              aria-label="輸入訊息"
              disabled={isLoading}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white disabled:opacity-30 hover:bg-accent-hover transition-colors"
              aria-label="送出"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 2L7 9M14 2l-4.5 12L7 9M14 2L2 6.5 7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// Export a hook/function to open the chat from nav
export function useChatToggle() {
  // This is a simple approach using a global event
  return {
    open: () => window.dispatchEvent(new CustomEvent("open-chat")),
  };
}

// Wrapper that listens for the open event
export function ChatWidgetWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleOpen() {
      setIsOpen(true);
    }
    window.addEventListener("open-chat", handleOpen);
    return () => window.removeEventListener("open-chat", handleOpen);
  }, []);

  if (!isOpen) return null;

  return <ChatWidgetInner onClose={() => setIsOpen(false)} />;
}

function ChatWidgetInner({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
  const sessionId = useRef(
    typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36)
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setInput("");
      setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            sessionId: sessionId.current,
          }),
        });

        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.reply, forwarded: data.forwarded },
        ]);
        if (data.suggestions) {
          setSuggestions(data.suggestions.slice(0, 4));
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "抱歉，連線出了問題。請直接加 LINE @777xvkrg 聯繫我們！",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm sm:bg-black/30"
        onClick={onClose}
      />

      <div className="fixed z-[70] bottom-0 right-0 left-0 top-16 sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:w-[400px] sm:h-[560px] sm:rounded-2xl flex flex-col overflow-hidden border border-white/[0.08] bg-primary-deep shadow-2xl animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-surface/30">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-text">維修服務問答</div>
              <div className="text-[10px] text-text-dim">北大液晶儀表維修</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-dim hover:text-text hover:bg-white/[0.06] transition-colors"
            aria-label="關閉"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-accent text-white rounded-br-sm"
                    : "bg-surface/60 text-text-muted rounded-bl-sm"
                }`}
              >
                {msg.text}
                {msg.forwarded && (
                  <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-text-dim flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#06C755]">
                      <path d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                    </svg>
                    已轉送店主，也可加 LINE 即時詢問
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface/60 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-text-dim animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-text-dim animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-text-dim animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestions.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-accent/20 bg-accent/[0.06] px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/15 hover:border-accent/40 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.08] px-4 py-3 bg-surface/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="輸入您的問題..."
              className="flex-1 rounded-xl border border-white/[0.08] bg-primary-deep px-4 py-2.5 text-sm text-text placeholder:text-text-dim outline-none focus:border-accent/40 transition-colors"
              aria-label="輸入訊息"
              disabled={isLoading}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white disabled:opacity-30 hover:bg-accent-hover transition-colors"
              aria-label="送出"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 2L7 9M14 2l-4.5 12L7 9M14 2L2 6.5 7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
