import { useEffect, useState } from 'react'
import { MessageCircle, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { request } from '../lib/api.js'
import { useAppContext } from '../context/AppContext.jsx'

function LiveChatWidget({ isOpen: controlledOpen, onOpenChange }) {
  const { isAuthenticated } = useAppContext()
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen ?? internalOpen
  const setIsOpen = (next) => {
    if (onOpenChange) onOpenChange(next)
    else setInternalOpen(next)
  }
  const [input, setInput] = useState('')
  const [roomKey, setRoomKey] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: 'Hi! I am HorizonInvest support. How can I help today?' },
  ])

  useEffect(() => {
    const bootstrapChat = async () => {
      if (!isAuthenticated || !isOpen) return
      setConnecting(true)
      try {
        const roomRes = await request('/chat/room', { method: 'POST' })
        const room = roomRes?.data || {}
        const key = room.room_key || room.roomKey || ''
        if (!key) {
          toast.error('Could not start support chat. Please try again.')
          return
        }
        setRoomKey(key)
        const messageRes = await request(`/chat/${encodeURIComponent(key)}/messages`)
        const liveMessages = (messageRes?.data || []).map((item) => ({
          id: item.id,
          from: item.senderRole === 'user' ? 'user' : 'bot',
          text: item.content,
        }))
        if (liveMessages.length) setMessages(liveMessages)
      } catch (error) {
        toast.error(error.message || 'Support chat is temporarily unavailable.')
      } finally {
        setConnecting(false)
      }
    }
    bootstrapChat()
  }, [isAuthenticated, isOpen])

  useEffect(() => {
    if (!isOpen || !isAuthenticated || !roomKey) return undefined
    let cancelled = false
    const syncMessages = async () => {
      try {
        const messageRes = await request(`/chat/${encodeURIComponent(roomKey)}/messages`)
        const liveMessages = (messageRes?.data || []).map((item) => ({
          id: item.id,
          from: item.senderRole === 'user' ? 'user' : 'bot',
          text: item.content,
        }))
        if (!cancelled && liveMessages.length) setMessages(liveMessages)
      } catch {
        // keep existing messages when polling fails
      }
    }

    const timer = setInterval(syncMessages, 4000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [isAuthenticated, isOpen, roomKey])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return
    if (!isAuthenticated) {
      toast.error('Please log in to use live support.')
      return
    }
    if (!roomKey) {
      toast.error('Connecting to support… please wait a moment.')
      return
    }

    const userMessage = { id: Date.now(), from: 'user', text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')

    try {
      await request('/chat/message', {
        method: 'POST',
        body: { roomKey, content: text },
      })
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          from: 'bot',
          text: error.message || 'Support is temporarily offline. Please try again shortly.',
        },
      ])
    }
  }

  return (
    <>
      {controlledOpen === undefined && !isOpen ? (
        <button type="button" className="chat-fab" onClick={() => setIsOpen(true)} aria-label="Open live support chat">
          <MessageCircle size={22} />
        </button>
      ) : null}
      {isOpen ? (
        <div className="chat-panel chat-panel-open" role="dialog" aria-label="Live support chat">
          <header>
            <div>
              <span className="dot" /> Live Support
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X size={16} />
            </button>
          </header>
          <div className="chat-body">
            {connecting ? <p className="muted small">Connecting…</p> : null}
            {messages.map((message) => (
              <div key={message.id} className={`bubble ${message.from}`}>
                {message.text}
              </div>
            ))}
          </div>
          <footer>
            <input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage()
              }}
              disabled={!isAuthenticated || connecting}
            />
            <button type="button" onClick={sendMessage} disabled={!isAuthenticated || connecting}>
              <Send size={16} />
            </button>
          </footer>
        </div>
      ) : null}
    </>
  )
}

export default LiveChatWidget
