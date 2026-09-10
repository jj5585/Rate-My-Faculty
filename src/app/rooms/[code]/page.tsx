"use client"

import { useState, useEffect, useRef, use } from "react"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"

type Message = {
  id: string
  content: string
  createdAt: string
  userHash: string
}

function timeStr(date: string) {
  const d = new Date(date)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function RoomChatPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const { data: session, status } = useSession()

  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [room, setRoom] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [myHash, setMyHash] = useState<string>("")
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedPass = sessionStorage.getItem(`room_${code}_pass`)
    if (savedPass) {
      setPassword(savedPass)
      verifyRoom(savedPass)
    }
  }, [code])

  useEffect(() => {
    if (!authed) return
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [authed, code, password])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function verifyRoom(pass: string) {
    try {
      const res = await fetch(`/api/rooms/${code}/messages?password=${encodeURIComponent(pass)}`)
      const data = await res.json()
      if (res.ok) {
        setRoom(data.room)
        setMessages(data.messages || [])
        setMyHash(data.userHash || "")
        setAuthed(true)
        sessionStorage.setItem(`room_${code}_pass`, pass)
      } else {
        setError(data.error || "Incorrect password")
      }
    } catch {
      setError("Failed to connect")
    }
  }

  async function handlePasswordSubmit() {
    setError("")
    await verifyRoom(password)
  }

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/rooms/${code}/messages?password=${encodeURIComponent(password)}`)
      const data = await res.json()
      if (res.ok) {
        setMessages(data.messages || [])
      }
    } catch {
      // silent polling error
    }
  }

  async function handleSend() {
    if (!content.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/rooms/${code}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setContent("")
        setMessages(prev => [...prev, data.message])
      }
    } finally {
      setSending(false)
    }
  }

  const [inviteCopied, setInviteCopied] = useState(false)

  if (status === "loading") return <div className="min-h-screen bg-[#030611]" />

  if (!session) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-screen flex items-center justify-center px-4 py-12 outline-none">
        <div className="rounded-[26px] liquid-glass p-8 text-center max-w-sm w-full flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full liquid-glass flex items-center justify-center text-cyan-300 shadow-liquid-glow">
            <span className="material-symbols-outlined text-[32px]" aria-hidden="true">lock</span>
          </div>
          <h1 className="text-[22px] font-extrabold text-white tracking-tight m-0">Access Restricted</h1>
          <p className="text-[13px] text-white/70 leading-relaxed m-0">Sign in to enter this private room.</p>
          <button
            onClick={() => signIn("google")}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-[14px]"
          >
            Sign In
          </button>
        </div>
      </main>
    )
  }

  if (!authed) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-screen flex items-center justify-center px-4 py-12 outline-none">
        <form
          onSubmit={e => {
            e.preventDefault()
            handlePasswordSubmit()
          }}
          className="rounded-[26px] liquid-glass p-8 text-center max-w-sm w-full flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full liquid-glass flex items-center justify-center text-cyan-300 shadow-liquid-glow">
            <span className="material-symbols-outlined text-[32px]" aria-hidden="true">key</span>
          </div>
          <label htmlFor="room-key-input" className="text-[16px] font-extrabold text-white uppercase tracking-wider block">
            Enter Room Key
          </label>
          <input
            id="room-key-input"
            className="w-full liquid-glass-input text-center text-[36px] font-extrabold tracking-[16px] py-2 rounded-xl text-cyan-300 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            value={password}
            onChange={e => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            type="password"
            inputMode="numeric"
            maxLength={4}
            aria-describedby={error ? "key-error" : undefined}
          />
          {error && <p id="key-error" role="alert" className="text-rose-400 text-[12px] m-0">{error}</p>}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-[14px]"
          >
            Unlock Room
          </button>
          <Link href="/rooms" className="text-[12px] text-white/60 hover:text-white underline">
            ← Back to Rooms
          </Link>
        </form>
      </main>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-between relative z-10 selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full pt-2 pb-2 px-4 backdrop-blur-2xl bg-black/40 border-b border-white/[0.08]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/rooms"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full liquid-glass-pill text-[12px] font-semibold text-cyan-300 hover:text-white transition-all no-underline"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
            <span>Rooms</span>
          </Link>

          <div className="text-center">
            <h1 className="text-[15px] font-bold text-white tracking-tight m-0 truncate max-w-[160px]">
              {room?.name || "Private Room"}
            </h1>
            <span className="text-[10px] text-cyan-300 uppercase tracking-widest font-semibold">
              {code} · Encrypted
            </span>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(`Room: ${room?.name}\nCode: ${code}\nPass: ${password}`)
              setInviteCopied(true)
              setTimeout(() => setInviteCopied(false), 3000)
            }}
            aria-label="Copy room invite link and password"
            className="px-3 py-1.5 rounded-full liquid-glass-pill text-[11px] font-semibold text-cyan-300 hover:text-white transition-all active:scale-95"
          >
            {inviteCopied ? "Copied!" : "Invite"}
          </button>
        </div>
      </header>

      {inviteCopied && (
        <div role="status" aria-live="polite" className="sr-only">
          Room invite details copied to clipboard
        </div>
      )}

      {/* Messages Feed */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col gap-3 overflow-y-auto pb-48 outline-none"
      >
        <div
          role="log"
          aria-live="polite"
          aria-label="Room messages"
          className="flex flex-col gap-3 flex-1"
        >
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-2 my-auto">
              <span className="material-symbols-outlined text-white/30 text-[36px]" aria-hidden="true">chat</span>
              <p className="text-white/60 font-semibold text-[14px]">Private Room Opened</p>
              <p className="text-white/40 text-[12px]">No messages yet. Send a message to get the conversation going.</p>
            </div>
          ) : (
            messages.map(m => {
              const isMe = m.userHash === myHash
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%]`}>
                  <span className="text-[10px] text-white/50 px-2 mb-1">
                    {isMe ? "You" : `Anon ${m.userHash.slice(0, 4)}`}
                  </span>
                  <div
                    className={`p-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-br-sm"
                        : "liquid-glass text-white/90 rounded-bl-sm border border-white/10"
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-white/40 px-2 mt-1">
                    {timeStr(m.createdAt)}
                  </span>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Bottom Floating Message Input Bar */}
      <div className="fixed bottom-16 inset-x-0 z-40 p-4 pointer-events-none flex justify-center">
        <div className="w-full max-w-md pointer-events-auto rounded-[28px] liquid-glass-dock shadow-pill-dock p-2 flex items-center gap-2">
          <label htmlFor="room-message-input" className="sr-only">Type a message</label>
          <input
            id="room-message-input"
            className="flex-1 liquid-glass-input px-4 py-2.5 rounded-2xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type anonymous message..."
          />
          <button
            onClick={handleSend}
            disabled={sending || !content.trim()}
            aria-label="Send message"
            className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center disabled:opacity-40 transition-opacity active:scale-95 shadow-sm flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">send</span>
          </button>
        </div>
      </div>
    </div>
  )
}