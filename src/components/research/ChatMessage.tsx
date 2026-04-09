"use client";

import { useLocale } from "next-intl";
import MarkdownRenderer from "./MarkdownRenderer";
import SourceCitation from "./SourceCitation";
import PdfDownloadButton from "./PdfDownloadButton";
import StreamingText from "./StreamingText";
import { Source } from "@/lib/api/ai-research";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  sources?: Source[];
  pdfId?: string;
  pdfDownloadUrl?: string;
  toolActivity?: { tool: string; query: string }[];
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full gap-3 ${isUser ? (isRtl ? "flex-row-reverse" : "flex-row-reverse") : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isUser
            ? "bg-primary text-white"
            : "bg-gray-200 text-dark dark:bg-gray-700 dark:text-gray-100"
        }`}
      >
        {isUser ? "U" : "AI"}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "rounded-tr-sm bg-primary/10 dark:bg-primary/20"
            : "rounded-tl-sm bg-white shadow-sm dark:bg-dark/60"
        }`}
      >
        {/* Tool activity indicator */}
        {!isUser && message.toolActivity && message.toolActivity.length > 0 && (
          <div className="mb-2 space-y-1">
            {message.toolActivity.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-xs text-gray-400"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                <span>
                  Using <strong>{a.tool}</strong>
                  {a.query ? `: ${a.query}` : ""}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        {isUser ? (
          <p className="text-sm text-dark dark:text-gray-100">{message.content}</p>
        ) : message.isStreaming && !message.content ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
          </div>
        ) : message.isStreaming ? (
          <StreamingText text={message.content} isStreaming={true} />
        ) : (
          <MarkdownRenderer content={message.content} />
        )}

        {/* Sources */}
        {!isUser && !message.isStreaming && message.sources && message.sources.length > 0 && (
          <div className="mt-3 border-t border-gray-100 pt-2 dark:border-gray-700">
            <p className="mb-1.5 text-xs font-medium text-gray-400">Sources</p>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((src, i) => (
                <SourceCitation key={i} {...src} />
              ))}
            </div>
          </div>
        )}

        {/* PDF download */}
        {!isUser && !message.isStreaming && message.pdfDownloadUrl && (
          <PdfDownloadButton
            title="Qafila Research Report"
            content={message.content}
            pdfId={message.pdfId}
            downloadUrl={message.pdfDownloadUrl}
          />
        )}
      </div>
    </div>
  );
}
