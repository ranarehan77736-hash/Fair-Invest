import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useAdmin } from '../state/AdminContext.jsx'

function sortRooms(rooms) {
  return [...rooms].sort((a, b) => {
    const unreadDiff = Number(b.unreadCount || 0) - Number(a.unreadCount || 0)
    if (unreadDiff !== 0) return unreadDiff
    const aTime = new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0).getTime()
    const bTime = new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0).getTime()
    return bTime - aTime
  })
}

function ChatRoomsPage() {
  const { chatRooms, users, closeChatRoom, getChatMessages, replyChatRoom, refreshChatRooms } = useAdmin()
  const [selectedRoomId, setSelectedRoomId] = useState(null)
  const [messages, setMessages] = useState([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const threadRef = useRef(null)
  const messagesEndRef = useRef(null)

  const orderedRooms = useMemo(() => sortRooms(chatRooms), [chatRooms])
  const selectedRoom = useMemo(
    () => orderedRooms.find((room) => room.id === selectedRoomId) || null,
    [orderedRooms, selectedRoomId],
  )
  const userById = useMemo(() => new Map(users.map((user) => [Number(user.id), user])), [users])

  const selectRoom = (roomId) => {
    setSelectedRoomId(roomId)
    window.requestAnimationFrame(() => {
      threadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  useEffect(() => {
    const timer = setInterval(() => {
      refreshChatRooms().catch(() => {})
    }, 15000)
    return () => clearInterval(timer)
  }, [refreshChatRooms])

  useEffect(() => {
    if (!orderedRooms.length) {
      setSelectedRoomId(null)
      setMessages([])
      return
    }
    if (!selectedRoomId || !orderedRooms.some((room) => room.id === selectedRoomId)) {
      const firstUnread = orderedRooms.find((room) => Number(room.unreadCount || 0) > 0)
      setSelectedRoomId((firstUnread || orderedRooms[0]).id)
    }
  }, [orderedRooms, selectedRoomId])

  useEffect(() => {
    let cancelled = false
    let markedRead = false
    const loadMessages = async () => {
      if (!selectedRoomId) return
      try {
        const rows = await getChatMessages(selectedRoomId)
        if (!cancelled) {
          setMessages(rows)
          if (!markedRead) {
            markedRead = true
            await refreshChatRooms()
          }
        }
      } catch (error) {
        if (!cancelled) toast.error(error.message)
      }
    }

    loadMessages()
    const timer = setInterval(() => {
      getChatMessages(selectedRoomId)
        .then((rows) => {
          if (!cancelled) setMessages(rows)
        })
        .catch(() => {})
    }, 4000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [getChatMessages, selectedRoomId, refreshChatRooms])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedRoomId])

  const onClose = async (id) => {
    try {
      await closeChatRoom(id)
      toast.success('Chat room closed')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onReply = async () => {
    if (!selectedRoomId || !reply.trim()) return
    setSending(true)
    try {
      await replyChatRoom(selectedRoomId, reply.trim())
      const rows = await getChatMessages(selectedRoomId)
      setMessages(rows)
      setReply('')
      toast.success('Reply sent')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="panel-grid chat-page">
      <header className="panel-head">
        <h2>Live Chat Rooms</h2>
        <p>Pick a chat on the left — the conversation opens on the right instantly. Unread chats stay at the top.</p>
      </header>

      <div className="admin-chat-layout">
        <aside className="table-card admin-chat-list-panel">
          <div className="admin-chat-list-head">
            <strong>Chats ({orderedRooms.length})</strong>
            <span className="muted small">
              {orderedRooms.filter((room) => Number(room.unreadCount || 0) > 0).length} unread
            </span>
          </div>
          <div className="admin-chat-list">
            {orderedRooms.length ? (
              orderedRooms.map((room) => {
                const unread = Number(room.unreadCount || 0)
                const userName = userById.get(Number(room.userId))?.name || `User #${room.userId}`
                const lastMessageAt = room.lastMessageAt || room.updatedAt || room.createdAt
                const isSelected = selectedRoomId === room.id
                return (
                  <button
                    key={room.id}
                    type="button"
                    className={`admin-chat-list-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => selectRoom(room.id)}
                  >
                    <div className="admin-chat-list-top">
                      <div className="admin-chat-list-user">
                        {unread > 0 ? <span className="chat-unread-dot" title="Unread messages" /> : null}
                        <strong>{userName}</strong>
                      </div>
                      {unread > 0 ? <span className="chat-unread-count">{unread}</span> : null}
                    </div>
                    <p className="muted small">Room #{room.id} · {room.status}</p>
                    <p className="muted small">
                      {lastMessageAt ? String(lastMessageAt).slice(0, 19).replace('T', ' ') : 'No messages yet'}
                    </p>
                  </button>
                )
              })
            ) : (
              <p className="muted small admin-chat-empty">No chat rooms yet.</p>
            )}
          </div>
        </aside>

        <div className="table-card plan-form admin-chat-thread-panel" ref={threadRef}>
          {selectedRoom ? (
            <>
              <div className="admin-chat-thread-head">
                <div>
                  <h3>Chat with {userById.get(Number(selectedRoom.userId))?.name || `User #${selectedRoom.userId}`}</h3>
                  <p className="muted small">
                    Room #{selectedRoom.id} · {userById.get(Number(selectedRoom.userId))?.email || '-'} ·{' '}
                    {userById.get(Number(selectedRoom.userId))?.phone || '-'}
                  </p>
                </div>
                <button
                  className="mini-btn"
                  type="button"
                  disabled={selectedRoom.status === 'closed'}
                  onClick={() => onClose(selectedRoom.id)}
                >
                  Close Room
                </button>
              </div>

              <div className="admin-chat-thread">
                {messages.length ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`admin-chat-bubble ${message.senderRole === 'admin' ? 'admin' : 'user'}`}
                    >
                      <strong>{message.senderRole === 'admin' ? 'Admin' : 'User'}:</strong> {message.content}
                    </div>
                  ))
                ) : (
                  <p className="muted">No messages in this room yet.</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="plan-actions admin-chat-reply">
                <input
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') onReply()
                  }}
                  disabled={sending}
                />
                <button className="primary-btn" type="button" disabled={sending} onClick={onReply}>
                  {sending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </>
          ) : (
            <div className="admin-chat-placeholder">
              <h3>Select a chat</h3>
              <p className="muted">Choose a conversation from the list on the left.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ChatRoomsPage
