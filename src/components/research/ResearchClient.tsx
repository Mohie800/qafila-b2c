"use client";

import { useState, useCallback, useReducer, useEffect } from "react";
import { RotateCcw, Loader2 } from "lucide-react";
import ResearchHero from "./ResearchHero";
import ChatArea from "./ChatArea";
import ChatInput from "./ChatInput";
import { Message } from "./ChatMessage";
import { streamChat, getHistory, resetHistory, Source } from "@/lib/api/ai-research";

/**
 * The AI model occasionally echoes back tool-call JSON (e.g. generate_pdf result)
 * as plain text tokens. Strip any lines that are standalone parseable JSON objects/arrays.
 */
function stripJsonLeakage(text: string): string {
  const lines = text.split("\n");
  const cleaned = lines.filter((line) => {
    const t = line.trim();
    if (!t) return true;
    if (
      (t.startsWith("{") && t.endsWith("}")) ||
      (t.startsWith("[") && t.endsWith("]"))
    ) {
      try {
        JSON.parse(t);
        return false; // pure JSON line — drop it
      } catch {
        return true;
      }
    }
    return true;
  });
  return cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

interface ResearchState {
  messages: Message[];
  isStreaming: boolean;
  isHeroVisible: boolean;
  isLoadingHistory: boolean;
}

type ResearchAction =
  | { type: "LOAD_HISTORY"; payload: Message[] }
  | { type: "SEND_MESSAGE"; payload: Message }
  | { type: "START_STREAM"; payload: { id: string } }
  | { type: "APPEND_TOKEN"; payload: { id: string; text: string } }
  | { type: "ADD_TOOL_ACTIVITY"; payload: { id: string; tool: string; query: string } }
  | { type: "ADD_SOURCE"; payload: { id: string; source: Source } }
  | { type: "SET_PDF"; payload: { id: string; pdfId: string; downloadUrl: string } }
  | { type: "FINISH_STREAM"; payload: { id: string } }
  | { type: "SET_ERROR"; payload: { id: string; error: string } }
  | { type: "RESET" };

function reducer(state: ResearchState, action: ResearchAction): ResearchState {
  switch (action.type) {
    case "LOAD_HISTORY":
      return {
        ...state,
        isLoadingHistory: false,
        messages: action.payload,
        isHeroVisible: action.payload.length === 0,
      };

    case "SEND_MESSAGE":
      return {
        ...state,
        isHeroVisible: false,
        messages: [...state.messages, action.payload],
      };

    case "START_STREAM":
      return {
        ...state,
        isStreaming: true,
        messages: [
          ...state.messages,
          {
            id: action.payload.id,
            role: "assistant",
            content: "",
            isStreaming: true,
            sources: [],
            toolActivity: [],
          },
        ],
      };

    case "APPEND_TOKEN":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id
            ? { ...m, content: m.content + action.payload.text }
            : m
        ),
      };

    case "ADD_TOOL_ACTIVITY":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id
            ? {
                ...m,
                toolActivity: [
                  ...(m.toolActivity || []),
                  { tool: action.payload.tool, query: action.payload.query },
                ],
              }
            : m
        ),
      };

    case "ADD_SOURCE":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id
            ? { ...m, sources: [...(m.sources || []), action.payload.source] }
            : m
        ),
      };

    case "SET_PDF":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id
            ? {
                ...m,
                pdfId: action.payload.pdfId,
                pdfDownloadUrl: action.payload.downloadUrl,
              }
            : m
        ),
      };

    case "FINISH_STREAM":
      return {
        ...state,
        isStreaming: false,
        messages: state.messages.map((m) =>
          m.id === action.payload.id
            ? { ...m, isStreaming: false, content: stripJsonLeakage(m.content) }
            : m
        ),
      };

    case "SET_ERROR":
      return {
        ...state,
        isStreaming: false,
        messages: state.messages.map((m) =>
          m.id === action.payload.id
            ? { ...m, isStreaming: false, content: `Error: ${action.payload.error}` }
            : m
        ),
      };

    case "RESET":
      return {
        messages: [],
        isStreaming: false,
        isHeroVisible: true,
        isLoadingHistory: false,
      };

    default:
      return state;
  }
}

export default function ResearchClient() {
  const [state, dispatch] = useReducer(reducer, {
    messages: [],
    isStreaming: false,
    isHeroVisible: true,
    isLoadingHistory: true,
  });

  const [isResetting, setIsResetting] = useState(false);

  // Load persisted history on mount
  useEffect(() => {
    getHistory()
      .then((history) => {
        const messages: Message[] = history.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          sources: m.sources ?? [],
          pdfId: m.pdfId,
          pdfDownloadUrl: m.pdfDownloadUrl,
          isStreaming: false,
        }));
        dispatch({ type: "LOAD_HISTORY", payload: messages });
      })
      .catch(() => {
        dispatch({ type: "LOAD_HISTORY", payload: [] });
      });
  }, []);

  const handleReset = useCallback(async () => {
    if (isResetting || state.isStreaming) return;
    setIsResetting(true);
    try {
      await resetHistory();
      dispatch({ type: "RESET" });
    } finally {
      setIsResetting(false);
    }
  }, [isResetting, state.isStreaming]);

  const handleSend = useCallback(
    async (message: string) => {
      if (state.isStreaming) return;

      const userMsgId = `user-${Date.now()}`;
      const aiMsgId = `ai-${Date.now()}`;

      dispatch({
        type: "SEND_MESSAGE",
        payload: { id: userMsgId, role: "user", content: message },
      });
      dispatch({ type: "START_STREAM", payload: { id: aiMsgId } });

      // Backend now manages history — no need to pass it
      try {
        await streamChat(message, [], {
          onToken: (text) =>
            dispatch({ type: "APPEND_TOKEN", payload: { id: aiMsgId, text } }),
          onToolCall: (tool, query) =>
            dispatch({ type: "ADD_TOOL_ACTIVITY", payload: { id: aiMsgId, tool, query } }),
          onSource: (source) =>
            dispatch({ type: "ADD_SOURCE", payload: { id: aiMsgId, source } }),
          onPdfReady: (pdfId, downloadUrl) =>
            dispatch({ type: "SET_PDF", payload: { id: aiMsgId, pdfId, downloadUrl } }),
          onDone: () =>
            dispatch({ type: "FINISH_STREAM", payload: { id: aiMsgId } }),
          onError: (error) =>
            dispatch({ type: "SET_ERROR", payload: { id: aiMsgId, error } }),
        });
      } catch (err) {
        dispatch({
          type: "SET_ERROR",
          payload: { id: aiMsgId, error: String(err) },
        });
      }
    },
    [state.isStreaming]
  );

  // Loading skeleton
  if (state.isLoadingHistory) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-dark">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-dark dark:bg-dark">
      {state.isHeroVisible ? (
        <ResearchHero onSearch={handleSend} />
      ) : (
        <>
          {/* Chat header with reset button */}
          <div className="flex items-center justify-between border-b border-gray-700 bg-dark px-4 py-2">
            <span className="text-sm font-medium text-gray-300">
              Research AI
              <span className="ms-2 text-xs text-gray-500">
                ({state.messages.filter((m) => !m.isStreaming).length}/20 messages)
              </span>
            </span>
            <button
              onClick={handleReset}
              disabled={isResetting || state.isStreaming}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-40"
              title="Clear conversation"
            >
              {isResetting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <RotateCcw size={13} />
              )}
              Reset
            </button>
          </div>

          <ChatArea messages={state.messages} />
          <ChatInput onSend={handleSend} isStreaming={state.isStreaming} />
        </>
      )}
    </div>
  );
}
