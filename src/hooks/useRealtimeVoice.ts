import { useEffect, useRef, useState } from 'react'

export type RealtimeVoiceStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

export interface RealtimeMessage {
  id: string
  role: 'agent' | 'caller' | 'system'
  content: string
  createdAt: string
}

export interface RealtimeSessionState {
  status: RealtimeVoiceStatus
  session: Record<string, unknown> | null
  messages: RealtimeMessage[]
  transcript: string
  error: string | null
}

export function useRealtimeVoice() {
  const [state, setState] = useState<RealtimeSessionState>({
    status: 'idle',
    session: null,
    messages: [],
    transcript: '',
    error: null,
  })
  const channelRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    return () => {
      channelRef.current?.close()
      channelRef.current = null
    }
  }, [])

  async function connectSession(payload: { businessSlug: string; widgetSlug?: string; mode?: 'voice' | 'chat'; language?: string }) {
    setState((current) => ({ ...current, status: 'connecting', error: null }))
    try {
      const response = await fetch('/api/realtime/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(await response.text())
      }
      const session = await response.json()
      setState((current) => ({ ...current, status: 'connected', session, error: null }))
      return session
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect realtime session'
      setState((current) => ({ ...current, status: 'error', error: message }))
      throw error
    }
  }

  function disconnectSession() {
    channelRef.current?.close()
    channelRef.current = null
    setState((current) => ({ ...current, status: 'disconnected' }))
  }

  function appendMessage(message: RealtimeMessage) {
    setState((current) => ({ ...current, messages: [...current.messages, message] }))
  }

  function setTranscript(transcript: string) {
    setState((current) => ({ ...current, transcript }))
  }

  function reset() {
    disconnectSession()
    setState({
      status: 'idle',
      session: null,
      messages: [],
      transcript: '',
      error: null,
    })
  }

  return {
    ...state,
    connectSession,
    disconnectSession,
    appendMessage,
    setTranscript,
    reset,
  }
}

export default useRealtimeVoice
