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

  useEffect(() => {
    const stored = sessionStorage.getItem(`room_${code}`)
    if (stored) {
      setPassword(stored)
      setAuthed(true)
    }
  }, [code])

  useEffect(() => {
    if (!authed || !password) return
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [authed, password])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/rooms/${code}/messages?password=${password}`)
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages)
        setRoom(data.room)
      }
    } catch (e) {
      console.error("Connection lost")
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
      setError(data.error || "Failed to transmit")
    }
    setSending(false)
  }

  function handlePasswordSubmit() {
    if (password.length === 4) {
      sessionStorage.setItem(`room_${code}`, password)
      setAuthed(true)
    } else {
      setError("Credentials must be 4 digits")
    }
  }

  if (status === "loading") return <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a" }} />

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ textAlign: "center", maxWidth: "300px", color: "white", fontFamily: "Inter, sans-serif" }}>
          <p style={{ fontSize: "40px", marginBottom: "16px" }}>🔒</p>
          <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "12px" }}>Access Restricted</h1>
          <p style={{ color: "#71717a", fontSize: "14px", marginBottom: "32px" }}>Identity verification required to enter this room.</p>
          <button onClick={() => signIn("google")} style={{ width: "100%", backgroundColor: "#fff", color: "#000", padding: "16px", borderRadius: "16px", fontWeight: 800, border: "none", cursor: "pointer" }}>Continue</button>
        </div>
      </div>
    )
  }

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", color: "white", fontFamily: "Inter, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: "320px", textAlign: "center" }}>
          <h2 style={{ fontSize: "12px", color: "#71717a", letterSpacing: "2px", marginBottom: "40px" }}>ENTER ROOM KEY</h2>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            type="password"
            style={{ width: "100%", background: "none", border: "none", borderBottom: "1px solid #1f1f22", color: "#fff", fontSize: "42px", fontWeight: 900, textAlign: "center", letterSpacing: "12px", outline: "none", marginBottom: "40px" }}
          />
          {error && <p style={{ color: "#ef4444", fontSize: "12px", marginBottom: "20px" }}>{error}</p>}
          <button onClick={handlePasswordSubmit} style={{ width: "100%", backgroundColor: "#ef4444", color: "#fff", padding: "18px", borderRadius: "14px", fontWeight: 800, border: "none", cursor: "pointer" }}>Unlock Room</button>
          <Link href="/rooms" style={{ display: "block", marginTop: "24px", color: "#3f3f46", textDecoration: "none", fontSize: "13px" }}>← Exit</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#f4f4f5", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ padding: "16px 20px", borderBottom: "1px solid #1f1f22", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(10,10,10,0.8)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/rooms" style={{ textDecoration: "none", color: "#71717a", fontSize: "20px" }}>←</Link>
          <div>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 800, letterSpacing: "-0.3px" }}>{room?.name || "Private Room"}</p>
            <p style={{ margin: 0, fontSize: "10px", color: "#ef4444", fontWeight: 700, letterSpacing: "1px" }}>{code} · ENCRYPTED</p>
          </div>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(`Room: ${room?.name}\nCode: ${code}\nPass: ${password}`);
            alert("Invite copied to clipboard!");
          }}
          style={{ backgroundColor: "transparent", border: "1px solid #1f1f22", color: "#71717a", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
        >
          INVITE
        </button>
      </header>

      {/* Message Feed */}
      <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.3 }}>
            <p style={{ fontSize: "14px", fontStyle: "italic" }}>Room initialized. Start the gossip 👀</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.userHash === myHash;
            return (
              <div key={m.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "85%" }}>
                <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: "4px" }}>
                   <span style={{ fontSize: "10px", fontWeight: 800, color: "#3f3f46", textTransform: "uppercase" }}>
                    {isMe ? "YOU" : `ANON_${m.userHash.slice(0, 4)}`}
                   </span>
                </div>
                <div style={{
                  padding: "12px 16px",
                  borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  backgroundColor: isMe ? "#ef4444" : "#111113",
                  color: isMe ? "#fff" : "#d4d4d8",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  boxShadow: isMe ? "0 4px 12px rgba(239, 68, 68, 0.2)" : "none",
                  border: isMe ? "none" : "1px solid #1f1f22"
                }}>
                  {m.content}
                </div>
                <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginTop: "4px" }}>
                   <span style={{ fontSize: "9px", color: "#3f3f46" }}>{timeStr(m.createdAt)}</span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #1f1f22", backgroundColor: "#0a0a0a" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type your message..."
            style={{
              flex: 1, backgroundColor: "#111113", border: "1px solid #1f1f22", borderRadius: "14px",
              padding: "14px 18px", color: "#fff", fontSize: "14px", outline: "none", transition: "border-color 0.2s"
            }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !content.trim()}
            style={{
              backgroundColor: content.trim() ? "#fff" : "#111113",
              color: content.trim() ? "#000" : "#3f3f46",
              width: "50px", height: "50px", borderRadius: "14px", border: "none",
              fontWeight: 800, cursor: "pointer", transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px"
            }}
          >
            {sending ? "..." : "↑"}
          </button>
        </div>
      </div>
    </div>
  )
}