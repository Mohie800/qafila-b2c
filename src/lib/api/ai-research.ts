const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Source {
  url: string;
  title: string;
  snippet?: string;
}

export interface StreamEventPayload {
  type:
    | 'token'
    | 'tool_call'
    | 'tool_result'
    | 'source'
    | 'pdf_ready'
    | 'done'
    | 'error';
  data: string;
}

export interface PdfReadyData {
  pdfId: string;
  downloadUrl: string;
}

export async function streamChat(
  message: string,
  history: ChatMessage[],
  callbacks: {
    onToken: (text: string) => void;
    onToolCall: (tool: string, query: string) => void;
    onSource: (source: Source) => void;
    onPdfReady: (pdfId: string, url: string) => void;
    onDone: () => void;
    onError: (error: string) => void;
  },
): Promise<void> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('qafila_token') : null;

  const response = await fetch(`${API_URL}/v1/ai-research/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    callbacks.onError(`Request failed: ${response.status} ${response.statusText}`);
    return;
  }

  if (!response.body) {
    callbacks.onError('No response body');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if (!raw || raw === '[DONE]') continue;

      try {
        const event = JSON.parse(raw) as StreamEventPayload;
        const payload = JSON.parse(event.data || '{}');

        switch (event.type) {
          case 'token':
            callbacks.onToken(payload.text || '');
            break;
          case 'tool_call':
            callbacks.onToolCall(payload.tool || '', payload.query || '');
            break;
          case 'source':
            callbacks.onSource({
              url: payload.url,
              title: payload.title,
              snippet: payload.snippet,
            });
            break;
          case 'pdf_ready':
            callbacks.onPdfReady(payload.pdfId, payload.downloadUrl);
            break;
          case 'done':
            callbacks.onDone();
            break;
          case 'error':
            callbacks.onError(payload.message || 'Unknown error');
            break;
        }
      } catch {
        // Ignore parse errors
      }
    }
  }
}

export async function generatePdf(
  title: string,
  content: string,
  locale: 'en' | 'ar' = 'en',
): Promise<{ pdfId: string; downloadUrl: string }> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('qafila_token') : null;

  const response = await fetch(`${API_URL}/v1/ai-research/pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ title, content, locale }),
  });

  if (!response.ok) {
    throw new Error(`PDF generation failed: ${response.status}`);
  }

  return response.json();
}

export function getPdfDownloadUrl(pdfId: string): string {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('qafila_token') : null;
  return `${API_URL}/v1/ai-research/pdf/${pdfId}${token ? `?token=${token}` : ''}`;
}
