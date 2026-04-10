"use client";

import { useEffect, useRef, useState } from "react";

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
}

/**
 * Reveals text with a typewriter animation when streaming.
 * Uses adaptive speed so long buffered responses still finish in ~3 s.
 * When streaming stops, instantly shows remaining content.
 */
function useTypewriter(content: string, isStreaming: boolean): string {
  const [cursor, setCursor] = useState(0);
  // Keep a ref so the interval closure always reads the latest length
  // without restarting the interval on every token append.
  const targetRef = useRef(content.length);
  targetRef.current = content.length;

  // Run the ticker only while streaming
  useEffect(() => {
    if (!isStreaming) return;
    const id = setInterval(() => {
      setCursor((prev) => {
        const target = targetRef.current;
        if (prev >= target) return prev;
        // Adaptive: at most ~3 s to reveal whatever is buffered
        const remaining = target - prev;
        const charsPerTick = Math.max(3, Math.ceil(remaining / 180));
        return Math.min(prev + charsPerTick, target);
      });
    }, 16); // ~60 fps
    return () => clearInterval(id);
  }, [isStreaming]);

  // When streaming finishes, jump to full length immediately
  useEffect(() => {
    if (!isStreaming) {
      setCursor(content.length);
    }
  }, [isStreaming, content.length]);

  return content.slice(0, cursor);
}

export default function StreamingText({ text, isStreaming }: StreamingTextProps) {
  const displayed = useTypewriter(text, isStreaming);
  const showCursor = isStreaming || displayed.length < text.length;

  return (
    <span className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      {displayed}
      {showCursor && (
        <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle" />
      )}
    </span>
  );
}
