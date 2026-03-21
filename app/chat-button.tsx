"use client";

export default function ChatButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
      className="group relative inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white overflow-hidden transition-all duration-300 hover:shadow-[0_0_24px_rgba(220,60,40,0.4)] hover:scale-[1.02]"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
      <span className="relative z-10">維修服務問答</span>
    </button>
  );
}
