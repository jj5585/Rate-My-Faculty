"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RoomsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<"join" | "create">("join")
  const [roomCode, setRoomCode] = useState("")
  const [password, setPassword] = useState("")
  const [roomName, setRoomName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [created, setCreated] = useState<{ roomCode: string; password: string; name: string } | null>(null)

  async function handleShare() {
    if (!created) return
    const text = `Join my private room: ${created.name}\nCode: ${created.roomCode}\nPassword: ${created.password}`
    try {
      if (navigator.share) {
        await navigator.share({ title: "Gossip Room Invite", text, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(text)
        alert("Credentials copied!")
      }
    } catch { /* user cancelled */ }
  }

  async function handleJoin() {
    if (roomCode.length < 4 || password.length < 4) {
      setError("Enter full 4-digit credentials"); return
    }
    setLoading(true); setError("")
    const res = await fetch("/api/rooms/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomCode, password }),
    })
    const data = await res.json()
    if (data.room) {
      sessionStorage.setItem(`room_${roomCode}`, password)
      router.push(`/rooms/${roomCode}`)
    } else {
      setError(data.error || "Invalid credentials")
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!roomName.trim()) { setError("Enter a room name"); return }
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName }),
      })
      const data = await res.json()
      if (data.room) {
        sessionStorage.setItem(`room_${data.room.roomCode}`, data.room.password)
        setCreated({ roomCode: data.room.roomCode, password: data.room.password, name: data.room.name })
      } else {
        setError(data.error || "Failed to create room")
      }
    } catch {
      setError("Server error")
    }
    setLoading(false)
  }

  if (status === "loading") return <div style={{ minHeight: "100vh", backgroundColor: "#080808" }} />

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900&family=DM+Sans:wght@400;600&display=swap');` }} />
        <div style={{ textAlign: "center", maxWidth: "300px" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "#f0ede8", marginBottom: "8px" }}>
            Gossip <span style={{ color: "#c8a96e", fontStyle: "italic" }}>Rooms</span>
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#555", marginBottom: "32px" }}>
            Private anonymous chat rooms for students.
          </p>
          <button
            onClick={() => signIn("google")}
            style={{
              width: "100%", background: "#c8a96e", color: "#080808",
              border: "none", padding: "14px", borderRadius: "2px",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              fontSize: "13px", letterSpacing: "0.5px", cursor: "pointer", textTransform: "uppercase",
            }}
          >
            Sign in to Enter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080808", color: "#f0ede8" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .playfair { font-family: 'Playfair Display', Georgia, serif !important; }
        .dmsans   { font-family: 'DM Sans', sans-serif !important; }
        .tag { font-family: 'DM Sans', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #555; }

        .code-input {
          width: 100%; background: none; border: none;
          border-bottom: 1px solid #1e1e1e; color: #f0ede8;
          font-family: 'Playfair Display', serif;
          font-size: 48px; font-weight: 700; text-align: center;
          letter-spacing: 16px; outline: none;
          padding-bottom: 8px; transition: border-color 0.2s;
        }
        .code-input:focus { border-bottom-color: #c8a96e; }

        .name-input {
          width: 100%; background: none; border: none;
          border-bottom: 1px solid #1e1e1e; color: #f0ede8;
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; text-align: center;
          outline: none; padding-bottom: 8px; transition: border-color 0.2s;
        }
        .name-input:focus { border-bottom-color: #c8a96e; }
        .name-input::placeholder { color: #2a2a2a; }

        .btn-gold {
          width: 100%; background: #c8a96e; color: #080808; border: none;
          padding: 15px; font-family: 'DM Sans', sans-serif;
          font-weight: 700; font-size: 13px; letter-spacing: 0.5px;
          text-transform: uppercase; cursor: pointer; border-radius: 2px;
          transition: background 0.2s, opacity 0.2s;
        }
        .btn-gold:hover { background: #d4b87a; }
        .btn-gold:disabled { opacity: 0.4; cursor: not-allowed; }

        .tab-btn {
          background: none; border: none; color: #444;
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
          cursor: pointer; padding: 10px 0;
          border-bottom: 2px solid transparent; transition: all 0.15s;
        }
        .tab-btn.active { color: #f0ede8; border-bottom-color: #c8a96e; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
      `}} />

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: "rgba(8,8,8,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #141414",
        padding: "0 20px", height: "52px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" className="dmsans" style={{ fontSize: "12px", color: "#555", textDecoration: "none" }}>← Home</Link>
        <span className="playfair" style={{ fontSize: "16px", fontWeight: 700 }}>
          Gossip <span style={{ color: "#c8a96e", fontStyle: "italic" }}>Rooms</span>
        </span>
        <div style={{ width: "48px" }} />
      </nav>

      <main style={{ maxWidth: "400px", margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── CREATED STATE ── */}
        {created ? (
          <div className="fade-up" style={{
            background: "#0d0d0d", border: "1px solid #4ade80",
            borderRadius: "4px", padding: "32px 24px", textAlign: "center",
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", color: "#4ade80", fontSize: "16px",
            }}>✓</div>

            <span className="tag" style={{ display: "block", marginBottom: "8px" }}>Room Initialized</span>
            <p className="playfair" style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 28px" }}>
              {created.name}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px" }}>
              {[
                { label: "Room Code", val: created.roomCode },
                { label: "Password", val: created.password },
              ].map(item => (
                <div key={item.label} style={{ background: "#080808", border: "1px solid #1e1e1e", padding: "16px", borderRadius: "2px" }}>
                  <p className="tag" style={{ marginBottom: "8px" }}>{item.label}</p>
                  <p className="playfair" style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "4px", margin: 0 }}>
                    {item.val}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button className="btn-gold" onClick={() => router.push(`/rooms/${created.roomCode}`)}>
                Enter Room
              </button>
              <button
                onClick={handleShare}
                className="dmsans"
                style={{
                  background: "none", border: "1px solid #1e1e1e", color: "#666",
                  padding: "12px", borderRadius: "2px", cursor: "pointer",
                  fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase",
                }}
              >
                Share Access
              </button>
            </div>
          </div>

        ) : (
          /* ── JOIN / CREATE ── */
          <>
            {/* Tab switcher */}
            <div style={{ display: "flex", gap: "28px", borderBottom: "1px solid #141414", marginBottom: "40px" }}>
              <button className={`tab-btn${tab === "join" ? " active" : ""}`} onClick={() => { setTab("join"); setError("") }}>
                Join Room
              </button>
              <button className={`tab-btn${tab === "create" ? " active" : ""}`} onClick={() => { setTab("create"); setError("") }}>
                Create New
              </button>
            </div>

            {tab === "join" ? (
              <div className="fade-up">
                <span className="tag" style={{ display: "block", textAlign: "center", marginBottom: "36px" }}>
                  Enter Credentials
                </span>

                <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginBottom: "40px" }}>
                  <div>
                    <span className="tag" style={{ display: "block", marginBottom: "12px", textAlign: "center" }}>Room Code</span>
                    <input
                      className="code-input"
                      value={roomCode}
                      onChange={e => setRoomCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="0000"
                    />
                  </div>
                  <div>
                    <span className="tag" style={{ display: "block", marginBottom: "12px", textAlign: "center" }}>Password</span>
                    <input
                      className="code-input"
                      value={password}
                      onChange={e => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="••••"
                      type="password"
                    />
                  </div>
                </div>

                {error && <p className="dmsans" style={{ color: "#f87171", fontSize: "13px", textAlign: "center", marginBottom: "16px" }}>{error}</p>}

                <button
                  className="btn-gold"
                  onClick={handleJoin}
                  disabled={loading || roomCode.length < 4 || password.length < 4}
                >
                  {loading ? "Verifying..." : "Access Room"}
                </button>
              </div>

            ) : (
              <div className="fade-up">
                <span className="tag" style={{ display: "block", textAlign: "center", marginBottom: "36px" }}>
                  Name Your Room
                </span>

                <input
                  className="name-input"
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder="Room name..."
                  style={{ marginBottom: "40px" }}
                />

                {error && <p className="dmsans" style={{ color: "#f87171", fontSize: "13px", textAlign: "center", marginBottom: "16px" }}>{error}</p>}

                <button
                  className="btn-gold"
                  onClick={handleCreate}
                  disabled={loading || !roomName.trim()}
                >
                  {loading ? "Creating..." : "Create Room"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}