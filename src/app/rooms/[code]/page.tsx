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
    if (stored) { setPassword(stored); setAuthed(true) }
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
      if (data.messages) { setMessages(data.messages); setRoom(data.room) }
    } catch { /* silent */ }
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
      setContent(""); setMyHash(data.message.userHash); fetchMessages()
    } else {
      setError(data.error || "Failed to send")
    }
    setSending(false)
  }

  function handlePasswordSubmit() {
    if (password.length === 4) {
      sessionStorage.setItem(`room_${code}`, password); setAuthed(true)
    } else {
      setError("Must be 4 digits")
    }
  }

  if (status === "loading") return <div style={{ minHeight: "100vh", backgroundColor: "#080808" }} />

  // Sign in gate
  if (!session) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700&family=DM+Sans:wght@400;600&display=swap');` }} />
        <div style={{ textAlign: "center", maxWidth: "300px" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "#f0ede8", marginBottom: "12px" }}>
            Access Restricted
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#555", marginBottom: "28px" }}>
            Sign in to enter this room.
          </p>
          <button
            onClick={() => signIn("google")}
            style={{
              width: "100%", background: "#c8a96e", color: "#080808", border: "none",
              padding: "14px", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              fontSize: "13px", cursor: "pointer", borderRadius: "2px", textTransform: "uppercase",
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  // Password gate
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700&family=DM+Sans:wght@400;600&display=swap');
          .code-input {
            width: 100%; background: none; border: none;
            border-bottom: 1px solid #1e1e1e; color: #f0ede8;
            font-family: 'Playfair Display', serif; font-size: 48px;
            font-weight: 700; text-align: center; letter-spacing: 16px;
            outline: none; padding-bottom: 8px; transition: border-color 0.2s;
          }
          .code-input:focus { border-bottom-color: #c8a96e; }
        `}} />
        <div style={{ width: "100%", maxWidth: "320px", textAlign: "center" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#555", letterSpacing: "2px", marginBottom: "36px", textTransform: "uppercase" }}>
            Enter Room Key
          </p>
          <input
            className="code-input"
            value={password}
            onChange={e => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            type="password"
            style={{ marginBottom: "36px" }}
          />
          {error && <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#f87171", fontSize: "12px", marginBottom: "16px" }}>{error}</p>}
          <button
            onClick={handlePasswordSubmit}
            style={{
              width: "100%", background: "#c8a96e", color: "#080808", border: "none",
              padding: "14px", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              fontSize: "13px", cursor: "pointer", borderRadius: "2px", textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Unlock Room
          </button>
          <Link href="/rooms" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#444", textDecoration: "none" }}>
            ← Back to Rooms
          </Link>
        </div>
      </div>
    )
  }

  // Chat view
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080808", color: "#f0ede8", display: "flex", flexDirection: "column" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        .playfair { font-family: 'Playfair Display', Georgia, serif !important; }
        .dmsans   { font-family: 'DM Sans', sans-serif !important; }

        .msg-input {
          flex: 1; background: #0d0d0d; border: 1px solid #1e1e1e;
          border-radius: 2px; color: #f0ede8; padding: 12px 16px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s;
        }
        .msg-input:focus { border-color: #c8a96e; }
        .msg-input::placeholder { color: #333; }

        .send-btn {
          width: 44px; height: 44px; border: none; border-radius: 2px;
          background: #c8a96e; color: #080808; cursor: pointer;
          font-size: 16px; font-weight: 700; transition: background 0.2s;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .send-btn:hover { background: #d4b87a; }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}} />

      {/* NAV */}
      <header style={{
        position: "sticky", top: 0, zIndex: 10,
        backgroundColor: "rgba(8,8,8,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #141414",
        padding: "0 20px", height: "52px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/rooms" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#555", textDecoration: "none" }}>
          ← Rooms
        </Link>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 700, margin: 0 }}>
            {room?.name || "Private Room"}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "9px", color: "#c8a96e", letterSpacing: "2px", textTransform: "uppercase", margin: 0 }}>
            {code} · Encrypted
          </p>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(`Room: ${room?.name}\nCode: ${code}\nPass: ${password}`)
            alert("Copied!")
          }}
          style={{
            background: "none", border: "1px solid #1e1e1e", color: "#555",
            padding: "5px 10px", borderRadius: "2px",
            fontFamily: "'DM Sans', sans-serif", fontSize: "10px",
            fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", cursor: "pointer",
          }}
        >
          Invite
        </button>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto" }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#2a2a2a", fontStyle: "italic" }}>
              Room open. Start the gossip.
            </p>
          </div>
        ) : (
          messages.map(m => {
            const isMe = m.userHash === myHash
            return (
              <div key={m.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: "3px" }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "9px", color: "#2a2a2a", letterSpacing: "1px", textTransform: "uppercase" }}>
                    {isMe ? "You" : `Anon ${m.userHash.slice(0, 4)}`}
                  </span>
                </div>
                <div style={{
                  padding: "10px 14px",
                  borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  background: isMe ? "#c8a96e" : "#0d0d0d",
                  border: isMe ? "none" : "1px solid #141414",
                  color: isMe ? "#080808" : "#ccc",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px", lineHeight: "1.5",
                }}>
                  {m.content}
                </div>
                <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginTop: "3px" }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "9px", color: "#2a2a2a" }}>
                    {timeStr(m.createdAt)}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 20px 16px", borderTop: "1px solid #141414", backgroundColor: "#080808" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            className="msg-input"
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={sending || !content.trim()}
          >
            ↑
          </button>
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "9px", color: "#1e1e1e", textAlign: "center", marginTop: "8px" }}>
          Anonymous · We do not verify claims · Report inappropriate content
        </p>
      </div>
    </div>
  )
}