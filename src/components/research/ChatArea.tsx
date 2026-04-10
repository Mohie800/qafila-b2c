"use client";

import { useEffect, useRef } from "react";
import ChatMessage, { Message } from "./ChatMessage";

interface ChatAreaProps {
  messages: Message[];
}

export default function ChatArea({ messages }: ChatAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Scroll the container itself — not scrollIntoView which moves the whole page
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  );
}
