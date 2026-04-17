import type { Express, Response as ExpressRes } from 'express';
import { createRequire } from 'node:module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse') as (data: Buffer) => Promise<{ text: string }>;

const OLLAMA_BASE = (process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434').replace(
  /\/$/,
  ''
);
const VISION_MODEL = process.env.OLLAMA_VISION_MODEL ?? 'llava';
const TEXT_MODEL = process.env.OLLAMA_TEXT_MODEL ?? 'llama3.2';
const MAX_DOC_CHARS = Number(process.env.GABAI_MAX_DOC_CHARS ?? 48000);

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

type Attachment = {
  type: 'image' | 'file';
  name: string;
  size: number;
  mimeType: string;
  dataUrl: string;
};

type ClientMessage = {
  role: 'user' | 'assistant';
  content: string;
  attachment?: Attachment;
};

type OllamaMessage =
  | { role: 'system' | 'assistant'; content: string }
  | { role: 'user'; content: string; images?: string[] };

type GroqApiMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function stripDataUrl(dataUrl: string): { mime: string; base64: string; buffer: Buffer } {
  const m = dataUrl.match(/^data:([^;,]+);base64,(.*)$/s);
  if (!m) throw new Error('Invalid attachment data URL');
  const base64 = m[2].replace(/\s/g, '');
  return { mime: m[1].trim(), base64, buffer: Buffer.from(base64, 'base64') };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Last message is user with an image or file → use Ollama (vision / extraction). */
function lastTurnNeedsOllama(messages: ClientMessage[]): boolean {
  const last = messages[messages.length - 1];
  return Boolean(last?.role === 'user' && last.attachment);
}

function toGroqTextOnlyMessages(
  systemContent: string,
  clientMessages: ClientMessage[]
): GroqApiMessage[] {
  const out: GroqApiMessage[] = [{ role: 'system', content: systemContent }];

  for (const m of clientMessages) {
    const text = typeof m.content === 'string' ? m.content : '';
    if (m.role === 'assistant') {
      out.push({ role: 'assistant', content: text });
      continue;
    }
    if (m.attachment) {
      const note = `[User attached a ${m.attachment.type}: ${m.attachment.name} (${formatFileSize(m.attachment.size)}) — media not shown in text mode; user may follow up with a new attachment to analyze.]`;
      const content = text.trim() ? `${text}\n${note}` : note;
      out.push({ role: 'user', content });
      continue;
    }
    out.push({ role: 'user', content: text });
  }

  return out;
}

async function extractDocumentText(att: Attachment): Promise<string> {
  const { mime, buffer } = stripDataUrl(att.dataUrl);
  const name = att.name.toLowerCase();
  let raw = '';

  if (mime === 'application/pdf' || name.endsWith('.pdf')) {
    const { text } = await pdfParse(buffer);
    raw = text ?? '';
  } else if (
    mime ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    const r = await mammoth.extractRawText({ buffer });
    raw = r.value ?? '';
  } else if (mime === 'text/plain' || name.endsWith('.txt')) {
    raw = buffer.toString('utf8');
  } else if (
    mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    name.endsWith('.xlsx')
  ) {
    return '[Spreadsheet attached: Excel text extraction is not supported. Export as CSV or describe what you need.]';
  } else {
    return `[File "${att.name}": unsupported type for text extraction on the server.]`;
  }

  raw = raw.replace(/\u0000/g, '').trim();
  if (!raw) {
    return '[No extractable text (empty file or scanned PDF — try a text-based PDF or describe the content).]';
  }
  if (raw.length > MAX_DOC_CHARS) {
    raw = `${raw.slice(0, MAX_DOC_CHARS)}\n\n[... truncated for model context ...]`;
  }
  return raw;
}

async function buildOllamaMessages(
  systemContent: string,
  clientMessages: ClientMessage[]
): Promise<OllamaMessage[]> {
  const out: OllamaMessage[] = [{ role: 'system', content: systemContent }];

  for (const m of clientMessages) {
    if (m.role === 'assistant') {
      out.push({ role: 'assistant', content: m.content });
      continue;
    }

    if (m.attachment?.type === 'image') {
      const { base64 } = stripDataUrl(m.attachment.dataUrl);
      const textPart =
        m.content.trim() || 'Describe this image and answer any questions about it.';
      out.push({ role: 'user', content: textPart, images: [base64] });
      continue;
    }

    if (m.attachment?.type === 'file') {
      const extracted = await extractDocumentText(m.attachment);
      const combined = m.content.trim()
        ? `${m.content}\n\n--- Document: ${m.attachment.name} ---\n${extracted}`
        : `--- Document: ${m.attachment.name} ---\n${extracted}`;
      out.push({ role: 'user', content: combined });
      continue;
    }

    out.push({ role: 'user', content: m.content });
  }

  return out;
}

function pickOllamaModel(messages: OllamaMessage[]): string {
  const needsVision = messages.some(
    (msg) => msg.role === 'user' && 'images' in msg && msg.images && msg.images.length > 0
  );
  return needsVision ? VISION_MODEL : TEXT_MODEL;
}

function gabaiSystemPrompt(userName: string, userRole: string): string {
  return `You are GabAI, the friendly AI assistant for the CITEzen campus concern management system at NEMSU (North Eastern Mindanao State University). Your name "GabAI" comes from "Gabay" (guide in Filipino/Bisaya) + AI. You help students and staff with questions about submitting concerns, tracking status, understanding the system, and general campus inquiries. Be friendly, concise, and helpful. If you don't know something specific about their account, suggest they check the relevant dashboard section. The current user is ${userName} (${userRole}).

When the user shares an image, describe what you see and answer their question using the image.
When the user shares extracted document text, answer using that text accurately.

IMPORTANT LANGUAGE INSTRUCTIONS: You are multilingual. You can understand and respond in English, Tagalog (Filipino), and Bisaya (Cebuano). Always reply in the same language the user is speaking. If the user writes in Tagalog, respond in Tagalog. If the user writes in Bisaya/Cebuano, respond in Bisaya/Cebuano. If the user writes in English, respond in English. If the user mixes languages (Taglish, Bislish), match their style naturally. Be natural and conversational in all languages.`;
}

function beginSse(res: ExpressRes): void {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  (res as { flushHeaders?: () => void }).flushHeaders?.();
}

function describeFetchError(err: unknown, target: string): string {
  const msg = err instanceof Error ? err.message : String(err);
  const code =
    err && typeof err === 'object' && 'cause' in err && err.cause &&
    typeof err.cause === 'object' &&
    err.cause !== null &&
    'code' in err.cause
      ? String((err.cause as { code?: string }).code)
      : '';
  const hint =
    code === 'ECONNREFUSED' || /ECONNREFUSED/i.test(msg)
      ? ` Nothing is listening — check the service is running and the URL is correct.`
      : '';
  return `${target}: ${msg}.${hint}`;
}

/** User-facing explanation: attachments use local Ollama; text-only can use Groq without Ollama. */
function ollamaVsGroqHelp(): string {
  return (
    `\n\nImage and document analysis runs on your computer through Ollama (not Groq).\n\n` +
    `• Install and open Ollama (https://ollama.com)\n` +
    `• Run: ollama pull ${VISION_MODEL} (and ollama pull ${TEXT_MODEL} if your app expects both; if you only have one model, set OLLAMA_TEXT_MODEL=${VISION_MODEL} in server/.env)\n` +
    `• Restart the CITEzen API after changing server/.env\n\n` +
    `Text-only chat still works with Groq without Ollama.`
  );
}

/** Parse OpenAI-compatible SSE (Groq) and re-emit our delta shape for the Vite client. */
async function pipeGroqSseToClient(
  upstream: ReadableStream<Uint8Array> | null,
  res: ExpressRes
): Promise<void> {
  if (!upstream) {
    res.status(500).json({ error: 'Empty stream from Groq' });
    return;
  }

  beginSse(res);
  const reader = upstream.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  try {
    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const parts = buf.split('\n');
      buf = parts.pop() ?? '';

      for (const line of parts) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;
        try {
          const json = JSON.parse(trimmed.slice(6)) as {
            error?: { message?: string };
            choices?: Array<{ delta?: { content?: string } }>;
          };
          if (json.error) {
            const em = json.error.message ?? 'stream error';
            console.error('Groq SSE error chunk:', em);
            res.write(
              `data: ${JSON.stringify({
                choices: [{ delta: { content: `Error from Groq: ${em}` } }]
              })}\n\n`
            );
            break outer;
          }
          const piece = json.choices?.[0]?.delta?.content;
          if (piece) {
            res.write(
              `data: ${JSON.stringify({ choices: [{ delta: { content: piece } }] })}\n\n`
            );
          }
        } catch {
          /* skip bad line */
        }
      }
    }

    if (buf.trim().startsWith('data: ')) {
      try {
        const json = JSON.parse(buf.trim().slice(6)) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const piece = json.choices?.[0]?.delta?.content;
        if (piece) {
          res.write(
            `data: ${JSON.stringify({ choices: [{ delta: { content: piece } }] })}\n\n`
          );
        }
      } catch {
        /* ignore */
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e) {
    console.error('Groq stream pipe:', e);
    try {
      res.end();
    } catch {
      /* ignore */
    }
  }
}

async function pipeOllamaNdjsonToClient(
  upstream: ReadableStream<Uint8Array> | null,
  res: ExpressRes
): Promise<void> {
  if (!upstream) {
    res.status(500).json({ error: 'Empty body from Ollama' });
    return;
  }

  beginSse(res);
  const reader = upstream.getReader();
  const decoder = new TextDecoder();
  let lineBuffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      lineBuffer += decoder.decode(value, { stream: true });
      const lines = lineBuffer.split('\n');
      lineBuffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        let parsed: { message?: { content?: string } };
        try {
          parsed = JSON.parse(trimmed) as { message?: { content?: string } };
        } catch {
          continue;
        }
        const piece = parsed.message?.content;
        if (piece) {
          res.write(
            `data: ${JSON.stringify({ choices: [{ delta: { content: piece } }] })}\n\n`
          );
        }
      }
    }

    if (lineBuffer.trim()) {
      try {
        const parsed = JSON.parse(lineBuffer.trim()) as { message?: { content?: string } };
        const piece = parsed.message?.content;
        if (piece) {
          res.write(
            `data: ${JSON.stringify({ choices: [{ delta: { content: piece } }] })}\n\n`
          );
        }
      } catch {
        /* ignore */
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (e) {
    console.error('Ollama stream pipe:', e);
    try {
      res.end();
    } catch {
      /* ignore */
    }
  }
}

export function registerGabaiRoutes(app: Express): void {
  app.post('/api/gabai/chat', async (req, res) => {
    try {
      const body = req.body as {
        user?: { name?: string; role?: string };
        messages?: ClientMessage[];
      };
      const { user, messages: clientMessages } = body;

      if (!clientMessages?.length) {
        res.status(400).json({ error: 'messages are required' });
        return;
      }

      const systemContent = gabaiSystemPrompt(user?.name ?? 'User', user?.role ?? 'student');
      const useOllama = lastTurnNeedsOllama(clientMessages);

      if (useOllama) {
        let ollamaMessages: OllamaMessage[];
        try {
          ollamaMessages = await buildOllamaMessages(systemContent, clientMessages);
        } catch (e) {
          console.error('GabAI build messages:', e);
          res.status(400).json({
            error: e instanceof Error ? e.message : 'Invalid message or attachment'
          });
          return;
        }

        const model = pickOllamaModel(ollamaMessages);
        let ollamaRes: Awaited<ReturnType<typeof fetch>>;
        try {
          ollamaRes = await fetch(`${OLLAMA_BASE}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              messages: ollamaMessages,
              stream: true,
              keep_alive: process.env.OLLAMA_KEEP_ALIVE ?? '15m',
              options: { temperature: 0.7, num_predict: 512 }
            })
          });
        } catch (e) {
          console.error('GabAI Ollama fetch:', e);
          res.status(503).json({
            error: `${describeFetchError(
              e,
              `Cannot reach Ollama at ${OLLAMA_BASE}`
            )}${ollamaVsGroqHelp()}`
          });
          return;
        }

        if (!ollamaRes.ok) {
          const errText = await ollamaRes.text();
          res.status(503).json({
            error: `Ollama returned HTTP ${ollamaRes.status} at ${OLLAMA_BASE}. ${errText.slice(0, 240)}${ollamaVsGroqHelp()}`
          });
          return;
        }

        await pipeOllamaNdjsonToClient(ollamaRes.body, res);
        return;
      }

      const groqKey = (process.env.GROQ_API_KEY ?? '').trim();
      if (!groqKey) {
        res.status(503).json({
          error:
            'GROQ_API_KEY is not set on the server — add it to server/.env for text-only chat (Groq). Image and document analysis uses local Ollama instead; see server/.env.example.'
        });
        return;
      }

      const groqModel = process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile';
      const groqMessages = toGroqTextOnlyMessages(systemContent, clientMessages);
      let groqRes: Awaited<ReturnType<typeof fetch>>;
      try {
        groqRes = await fetch(GROQ_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: groqModel,
            messages: groqMessages,
            temperature: 0.7,
            max_tokens: 1024,
            stream: true
          })
        });
      } catch (e) {
        console.error('GabAI Groq fetch:', e);
        res.status(503).json({
          error: `${describeFetchError(
            e,
            'Cannot reach Groq API (api.groq.com)'
          )} Check internet, firewall, and GROQ_API_KEY in server/.env.`
        });
        return;
      }

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        res.status(503).json({
          error: `Groq returned ${groqRes.status}. Check GROQ_API_KEY and model. ${errText.slice(0, 280)}`
        });
        return;
      }

      await pipeGroqSseToClient(groqRes.body, res);
    } catch (e) {
      console.error('GabAI:', e);
      if (!res.headersSent) {
        const detail = e instanceof Error ? e.message : String(e);
        res.status(500).json({
          error: `GabAI chat failed: ${detail}`
        });
      }
    }
  });
}
