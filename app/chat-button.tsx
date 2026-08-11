"use client";

export default function ChatButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
      className="group relative inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/25 px-3 py-2 text-sm font-bold text-text transition-all duration-300 hover:border-gold/60 hover:text-gold md:px-5 md:py-2.5"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
      <span className="relative z-10 hidden sm:inline">維修服務問答</span>
    </button>
  );
}
