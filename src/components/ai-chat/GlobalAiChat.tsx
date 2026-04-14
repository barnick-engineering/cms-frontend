import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Bot, ChevronDown, Loader2, SendHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { postAiAgentChat, type AiAgentHistoryEntry } from '@/api/aiAgentApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function toHistoryEntries(messages: ChatMessage[]): AiAgentHistoryEntry[] {
  return messages.map((m) => ({ role: m.role, content: m.content }))
}

export function GlobalAiChat() {
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const listEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (expanded) {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, expanded, isLoading])

  useEffect(() => {
    if (expanded) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 100)
      return () => window.clearTimeout(t)
    }
  }, [expanded])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
    }
    setInput('')
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const history = toHistoryEntries(messages)
      const reply = await postAiAgentChat({ message: text, history })
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply || '(Empty response)',
        },
      ])
      toast.success('Reply received')
      await queryClient.invalidateQueries()
    } catch (e) {
      console.error(e)
      toast.error('Could not reach the assistant. Try again.')
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id))
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, queryClient])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  const shell = (
    <div
      className='pointer-events-none fixed bottom-4 right-4 z-100 flex flex-col items-end gap-3'
      aria-live='polite'
    >
      {expanded && (
        <div className='pointer-events-auto flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-xl border bg-background shadow-lg'>
          <div className='flex items-center justify-between gap-2 border-b px-3 py-2'>
            <div className='flex min-w-0 items-center gap-2'>
              <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                <Bot className='size-4' aria-hidden />
              </div>
              <div className='min-w-0'>
                <p className='truncate text-sm font-semibold'>Barnick AI</p>
                <p className='truncate text-xs text-muted-foreground'>
                  ask anything
                </p>
              </div>
            </div>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='size-8 shrink-0'
              onClick={() => setExpanded(false)}
              aria-label='Minimize chat'
            >
              <ChevronDown className='size-4' />
            </Button>
          </div>

          <ScrollArea className='h-[min(50vh,320px)]'>
            <div className='space-y-3 p-3'>
              {messages.length === 0 && (
                <p className='text-center text-sm text-muted-foreground'>
                  Ask anything about the app or your data.
                </p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'flex',
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    <p className='whitespace-pre-wrap wrap-break-word'>
                      {m.content}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className='flex justify-start'>
                  <div className='flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground'>
                    <Loader2 className='size-4 animate-spin' />
                    Thinking…
                  </div>
                </div>
              )}
              <div ref={listEndRef} />
            </div>
          </ScrollArea>

          <div className='flex gap-2 border-t p-2'>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder='Type a message…'
              disabled={isLoading}
              className='min-w-0 flex-1'
              autoComplete='off'
            />
            <Button
              type='button'
              size='icon'
              onClick={() => void send()}
              disabled={isLoading || !input.trim()}
              aria-label='Send message'
            >
              <SendHorizontal className='size-4' />
            </Button>
          </div>
        </div>
      )}

      <Button
        type='button'
        size='icon'
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          'pointer-events-auto size-14 rounded-full shadow-md',
          expanded && 'ring-2 ring-primary/30'
        )}
        aria-expanded={expanded}
        aria-label={expanded ? 'Close chat panel' : 'Open assistant chat'}
      >
        <Bot className='size-7' />
      </Button>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(shell, document.body)
}
