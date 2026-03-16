import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Client } from '@stomp/stompjs'
import type { IMessage, StompSubscription } from '@stomp/stompjs'
import { Card } from '../components/ui/Card'
import { InputField } from '../components/ui/InputField'
import { getClassMessages } from '../services/chatService'
import { getMyNotifications } from '../services/notificationService'
import type { ChatMessage, NotificationItem } from '../types/models'
import { formatDate } from '../utils/format'

export function StudentPanel({ token, userEmail }: { token: string; userEmail: string }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [chatClassId, setChatClassId] = useState<string>('')
  const [chatInput, setChatInput] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  const clientRef = useRef<Client | null>(null)
  const classSubRef = useRef<StompSubscription | null>(null)

  useEffect(() => {
    getMyNotifications(token).then(setNotifications).catch(() => undefined)
  }, [token])

  useEffect(() => {
    if (!chatClassId) {
      setMessages([])
      return
    }

    getClassMessages(chatClassId, token)
      .then(setMessages)
      .catch(() => setMessages([]))
  }, [chatClassId, token])

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const client = new Client({
      brokerURL: `${wsProtocol}://${window.location.host}/ws`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
    })

    client.onConnect = () => {
      client.subscribe('/user/queue/notifications', (frame: IMessage) => {
        const notification = JSON.parse(frame.body) as NotificationItem
        setNotifications((prev) => [notification, ...prev])
      })

      if (chatClassId) {
        classSubRef.current = client.subscribe(`/topic/classes/${chatClassId}/chat`, (frame: IMessage) => {
          const chatMessage = JSON.parse(frame.body) as ChatMessage
          setMessages((prev) => [...prev, chatMessage])
        })
      }
    }

    client.activate()
    clientRef.current = client

    return () => {
      classSubRef.current?.unsubscribe()
      classSubRef.current = null
      client.deactivate()
      clientRef.current = null
    }
  }, [token, chatClassId])

  const sendChat = (event: FormEvent) => {
    event.preventDefault()
    if (!chatClassId || !chatInput.trim() || !clientRef.current?.connected) {
      return
    }

    clientRef.current.publish({
      destination: `/app/chat/classes/${chatClassId}/messages`,
      body: JSON.stringify({ message: chatInput.trim() }),
    })
    setChatInput('')
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <p className="text-xs text-slate-500">Realtime queue + history for {userEmail}</p>

          <div className="max-h-96 space-y-2 overflow-auto">
            {notifications.length === 0 && <p className="text-sm text-slate-500">No notifications yet.</p>}
            {notifications.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <p className="font-medium text-slate-800">{item.title}</p>
                <p className="text-slate-600">{item.message}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Class Chat</h3>
          <InputField label="Class ID" value={chatClassId} onChange={setChatClassId} placeholder="Paste class UUID" />

          <div className="max-h-64 space-y-2 overflow-auto rounded-lg border border-slate-200 p-3">
            {messages.length === 0 && <p className="text-sm text-slate-500">Enter class ID to load messages.</p>}
            {messages.map((item) => (
              <div key={item.id} className="rounded bg-slate-50 p-2 text-sm">
                <p className="font-medium text-slate-800">{item.senderName}</p>
                <p className="text-slate-700">{item.message}</p>
                <p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p>
              </div>
            ))}
          </div>

          <form className="flex gap-2" onSubmit={sendChat}>
            <input
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none ring-indigo-300 focus:ring"
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Type message"
              value={chatInput}
            />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700" type="submit">
              Send
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}

