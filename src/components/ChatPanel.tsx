"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/queries";

export function ChatPanel({
  threadId,
  selfRole,
  initialMessages,
  className = "",
}: {
  threadId: string;
  selfRole: "CUSTOMER" | "BUSINESS";
  initialMessages: ChatMessage[];
  className?: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    fetch(`/api/chat/${threadId}/read`, { method: "POST" }).catch(() => {});
  }, [threadId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/${threadId}/messages`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.messages.length !== messagesRef.current.length) {
          setMessages(data.messages);
          fetch(`/api/chat/${threadId}/read`, { method: "POST" }).catch(() => {});
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setDraft("");
    const res = await fetch(`/api/chat/${threadId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSending(false);
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
    }
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
        {messages.map((m) => {
          const mine = m.senderType === selfRole;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[14px] whitespace-pre-wrap break-words ${
                  mine ? "bg-brand-500 text-white rounded-br-md" : "bg-ink-50 text-ink-900 rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-ink-100 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="메시지 입력"
          className="flex-1 h-11 rounded-full bg-ink-50 px-4 text-[14px] outline-none"
        />
        <button
          onClick={send}
          disabled={!draft.trim() || sending}
          className="w-11 h-11 rounded-full bg-brand-500 text-white flex items-center justify-center disabled:opacity-40 shrink-0"
          aria-label="전송"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M3 11.5 20.5 3l-5.6 17.5-4.2-7-7.7-2Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
