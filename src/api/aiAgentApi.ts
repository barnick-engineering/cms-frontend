import { apiEndpoints } from '@/config/api'
import { axiosInstance } from './axios'

/** Shape sent to POST /api/v1/ai-agent/chat/ — adjust entries if backend expects a different schema */
export type AiAgentHistoryEntry = {
  role: 'user' | 'assistant'
  content: string
}

export type AiAgentChatRequest = {
  message: string
  history: AiAgentHistoryEntry[]
}

function extractReplyFromPayload(data: unknown): string {
  if (data == null) return ''
  if (typeof data === 'string') return data

  if (typeof data === 'object') {
    const o = data as Record<string, unknown>
    const candidates = ['reply', 'message', 'response', 'answer', 'content', 'text']
    for (const key of candidates) {
      const v = o[key]
      if (typeof v === 'string' && v.trim()) return v
    }
    const nested = o.data
    if (typeof nested === 'string' && nested.trim()) return nested
    if (nested && typeof nested === 'object') {
      const no = nested as Record<string, unknown>
      for (const key of candidates) {
        const v = no[key]
        if (typeof v === 'string' && v.trim()) return v
      }
    }
  }

  return ''
}

export async function postAiAgentChat(
  body: AiAgentChatRequest
): Promise<string> {
  const res = await axiosInstance.post<unknown>(
    apiEndpoints.aiAgent.chat,
    body
  )

  const payload = res.data
  let inner: unknown = payload

  if (payload && typeof payload === 'object' && 'data' in payload) {
    inner = (payload as { data: unknown }).data
  }

  const text = extractReplyFromPayload(inner) || extractReplyFromPayload(payload)
  if (text) return text

  try {
    return typeof payload === 'object' && payload !== null
      ? JSON.stringify(payload)
      : String(payload)
  } catch {
    return 'No reply text in response.'
  }
}
