"use client";

import { useState, useCallback, useReducer } from "react";
import ResearchHero from "./ResearchHero";
import ChatArea from "./ChatArea";
import ChatInput from "./ChatInput";
import { Message } from "./ChatMessage";
import { streamChat, ChatMessage, Source } from "@/lib/api/ai-research";

interface ResearchState {
  messages: Message[];
  isStreaming: boolean;
  isHeroVisible: boolean;
}

type ResearchAction =
  | { type: "SEND_MESSAGE"; payload: Message }
  | { type: "START_STREAM"; payload: { id: string } }
  | { type: "APPEND_TOKEN"; payload: { id: string; text: string } }
  | { type: "ADD_TOOL_ACTIVITY"; payload: { id: string; tool: string; query: string } }
  | { type: "ADD_SOURCE"; payload: { id: string; source: Source } }
  | { type: "SET_PDF"; payload: { id: string; pdfId: string; downloadUrl: string } }
  | { type: "FINISH_STREAM"; payload: { id: string } }
  | { type: "SET_ERROR"; payload: { id: string; error: string } };

function reducer(state: ResearchState, action: ResearchAction): ResearchState {
  switch (action.type) {
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
          m.id === action.payload.id ? { ...m, isStreaming: false } : m
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

    default:
      return state;
  }
}

export default function ResearchClient() {
  const [state, dispatch] = useReducer(reducer, {
    messages: [],
    isStreaming: false,
    isHeroVisible: true,
  });

  const handleSend = useCallback(
    async (message: string) => {
      if (state.isStreaming) return;

      const userMsgId = `user-${Date.now()}`;
      const aiMsgId = `ai-${Date.now()}`;

      // Add user message
      dispatch({
        type: "SEND_MESSAGE",
        payload: { id: userMsgId, role: "user", content: message },
      });

      // Add placeholder AI message
      dispatch({ type: "START_STREAM", payload: { id: aiMsgId } });

      // Build history from current messages
      const history: ChatMessage[] = state.messages
        .filter((m) => !m.isStreaming)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        await streamChat(message, history, {
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
    [state.isStreaming, state.messages]
  );

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-dark dark:bg-dark">
      {state.isHeroVisible ? (
        <ResearchHero onSearch={handleSend} />
      ) : (
        <>
          <ChatArea messages={state.messages} />
          <ChatInput onSend={handleSend} isStreaming={state.isStreaming} />
        </>
      )}
    </div>
  );
}
