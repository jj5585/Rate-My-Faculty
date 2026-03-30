"use client"

import { useState, useEffect, useRef, use } from "react"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"

function timeStr(date: string) {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState<any[]>([])
  const [room, setRoom] = useState<any>(null)
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [myHash, setMyHash] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  // Get password from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(`room_${code}`)
    if (stored) {
      setPassword(stored)
      setAuthed(true)
    }
  }, [code])

  // Poll for messages every 3 seconds
  useEffect(() => {
    if (!authed || !password) return
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [authed, password])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function fetchMessages() {
    const res = await fetch(`/api/rooms/${code}/messages?password=${password}`)
    const data = await res.json()
    if (data.messages) {
      setMessages(data.messages)
      setRoom(data.room)
      // figure out my hash from first message I sent — not perfect but works
    }
  }

  async function handleSend() {
    if (!content.trim() || sending) return
    setSending(true)
    const res = await fetch(`/api/rooms/${code}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, password }),
    })
    const data = await res.json()
    if (data.message) {
      setContent("")
      setMyHash(data.message.userHash)
      fetchMessages()
    } else {
      setError(data.error || "Failed to send")
    }
    setSending(false)
  }

  function handlePasswordSubmit() {
    if (password.length === 4) {
      sessionStorage.setItem(`room_${code}`, password)
      setAuthed(true)
    }
  }

  if (status === "loading") {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white p-6">
        <div className="text-center space-y-4 max-w-xs">
          <p className="text-4xl">🔒</p>
          <h1 className="text-xl font-bold">Sign in to enter this room</h1>
          <button onClick={() => signIn("google")} className="w-full bg-white text-black font-bold py-3 rounded-xl">
            Continue with Google
          </button>
        </div>
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white p-6">
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <p className="text-center font-bold text-lg">Enter room password</p>
          <p className="text-center text-gray-500 text-sm">Room code: <span className="text-white font-bold">{code}</span></p>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="4-digit password"
            type="password"
            maxLength={4}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:border-blue-500"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            onClick={handlePasswordSubmit}
            className="w-full bg-white text-black font-bold py-3 rounded-xl"
          >
            Enter →
          </button>
          <Link href="/rooms" className="text-center text-gray-500 text-sm">← Back to rooms</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/rooms" className="text-blue-400 text-sm">←</Link>
          <div>
            <p className="font-bold text-sm">{room?.name || `Room ${code}`}</p>
            <p className="text-gray-500 text-xs">Code: {code} · Anonymous</p>
          </div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(`Join my gossip room!\nRoom Code: ${code}\nPassword: ${password}\nhttps://rate-my-faculty.vercel.app/rooms`)
            alert("Invite copied!")
          }}
          className="text-gray-500 text-xs border border-gray-700 px-2 py-1 rounded-lg"
        >
          📋 Invite
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-600 text-sm">No messages yet. Say something 👀</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.userHash === myHash
            return (
              <div key={m.id} className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                <p className="text-gray-600 text-xs px-1">
                  {isMe ? "You" : `Anon ${m.userHash.slice(0, 4).toUpperCase()}`}
                </p>
                <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-gray-800 text-gray-100 rounded-bl-sm"
                }`}>
                  {m.content}
                </div>
                <p className="text-gray-700 text-xs px-1">{timeStr(m.createdAt)}</p>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-4 py-3 flex gap-2 shrink-0">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
          maxLength={500}
        />
        <button
          onClick={handleSend}
          disabled={sending || !content.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}