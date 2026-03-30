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
    if (!created) return;
    const shareData = {
      title: 'Gossip Room Invitation',
      text: `Join the private room: ${created.name}\nRoom Code: ${created.roomCode}\nPassword: ${created.password}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert("Credentials copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  }

  async function handleJoin() {
    if (roomCode.length < 4 || password.length < 4) {
      setError("Please enter the full 4-digit credentials")
      return
    }
    setLoading(true)
    setError("")
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
      setError(data.error || "Invalid Credentials")
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!roomName.trim()) {
      setError("Enter a room name")
      return
    }
    setLoading(true)
    setError("")
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
    } catch (e) {
      setError("Server error")
    }
    setLoading(false)
  }

  if (!session && status !== "loading") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", color: "#fff", fontFamily: "Inter, sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: "300px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "32px" }}>Gossip Rooms</h1>
          <button onClick={() => signIn("google")} style={{ width: "100%", backgroundColor: "#fff", color: "#000", padding: "16px", borderRadius: "12px", fontWeight: 700, border: "none", cursor: "pointer" }}>
            Sign in to Enter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#fff", fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      <nav style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ color: "#3f3f46", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>← EXIT</Link>
        <div style={{ height: "4px", width: "40px", backgroundColor: "#1f1f22", borderRadius: "2px" }} />
        <div style={{ width: "40px" }} />
      </nav>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 24px" }}>
        
        {created ? (
          <div style={{ backgroundColor: "#111113", border: "1px solid #10b981", borderRadius: "24px", padding: "32px 24px", width: "100%", maxWidth: "340px", textAlign: "center", animation: "fadeIn 0.5s ease" }}>
            <div style={{ width: "48px", height: "48px", backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#10b981" }}>✓</div>
            <h3 style={{ color: "#71717a", fontSize: "11px", fontWeight: 800, letterSpacing: "1px", marginBottom: "4px" }}>ROOM INITIALIZED</h3>
            <p style={{ fontSize: "20px", fontWeight: 700, marginBottom: "32px" }}>{created.name}</p>
            
            <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
                <div style={{ flex: 1, background: "#000", padding: "16px 12px", borderRadius: "16px", border: "1px solid #1f1f22" }}>
                    <p style={{ fontSize: "9px", color: "#3f3f46", fontWeight: 800, marginBottom: "8px" }}>CODE</p>
                    <p style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "2px" }}>{created.roomCode}</p>
                </div>
                <div style={{ flex: 1, background: "#000", padding: "16px 12px", borderRadius: "16px", border: "1px solid #1f1f22" }}>
                    <p style={{ fontSize: "9px", color: "#3f3f46", fontWeight: 800, marginBottom: "8px" }}>PASS</p>
                    <p style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "2px" }}>{created.password}</p>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button onClick={() => router.push(`/rooms/${created.roomCode}`)} style={{ width: "100%", backgroundColor: "#fff", color: "#000", padding: "16px", borderRadius: "14px", fontWeight: 800, border: "none", cursor: "pointer" }}>ENTER ROOM</button>
                <button onClick={handleShare} style={{ width: "100%", backgroundColor: "transparent", color: "#71717a", padding: "12px", borderRadius: "14px", fontWeight: 600, border: "1px solid #1f1f22", fontSize: "13px", cursor: "pointer" }}>SHARE ACCESS</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: "24px", marginBottom: "60px", marginTop: "20px" }}>
              <button onClick={() => { setTab("join"); setError(""); }} style={{ background: "none", border: "none", fontSize: "14px", fontWeight: 800, cursor: "pointer", color: tab === "join" ? "#fff" : "#27272a", transition: "0.2s" }}>
                JOIN ROOM
                {tab === "join" && <div style={{ height: "2px", backgroundColor: "#ef4444", marginTop: "4px" }} />}
              </button>
              <button onClick={() => { setTab("create"); setError(""); }} style={{ background: "none", border: "none", fontSize: "14px", fontWeight: 800, cursor: "pointer", color: tab === "create" ? "#fff" : "#27272a", transition: "0.2s" }}>
                CREATE NEW
                {tab === "create" && <div style={{ height: "2px", backgroundColor: "#ef4444", marginTop: "4px" }} />}
              </button>
            </div>

            <div style={{ width: "100%", maxWidth: "340px", textAlign: "center" }}>
              {tab === "join" ? (
                <div style={{ animation: "fadeIn 0.3s ease" }}>
                  <h2 style={{ fontSize: "12px", color: "#71717a", letterSpacing: "2px", marginBottom: "40px" }}>ENTER AUTHENTICATION</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    <input
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="0000"
                      style={{ width: "100%", background: "none", border: "none", borderBottom: "1px solid #1f1f22", color: "#fff", fontSize: "42px", fontWeight: 900, textAlign: "center", letterSpacing: "12px", outline: "none" }}
                    />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="••••"
                      type="password"
                      style={{ width: "100%", background: "none", border: "none", borderBottom: "1px solid #1f1f22", color: "#fff", fontSize: "42px", fontWeight: 900, textAlign: "center", letterSpacing: "12px", outline: "none" }}
                    />
                  </div>
                  {error && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "32px", fontWeight: 600 }}>{error}</p>}
                  <button onClick={handleJoin} disabled={loading} style={{ marginTop: "60px", width: "100%", backgroundColor: roomCode.length === 4 && password.length === 4 ? "#fff" : "#111", color: "#000", padding: "18px", borderRadius: "14px", fontWeight: 800, border: "none", cursor: "pointer", transition: "0.3s" }}>
                    {loading ? "VERIFYING..." : "ACCESS ROOM"}
                  </button>
                </div>
              ) : (
                <div style={{ animation: "fadeIn 0.3s ease" }}>
                  <h2 style={{ fontSize: "12px", color: "#71717a", letterSpacing: "2px", marginBottom: "40px" }}>INITIALIZE PRIVATE SPACE</h2>
                  <input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Room Identity"
                    style={{ width: "100%", background: "none", border: "none", borderBottom: "1px solid #1f1f22", color: "#fff", fontSize: "20px", fontWeight: 700, textAlign: "center", outline: "none" }}
                  />
                  {error && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "32px" }}>{error}</p>}
                  <button onClick={handleCreate} disabled={loading || !roomName} style={{ marginTop: "60px", width: "100%", backgroundColor: roomName ? "#ef4444" : "#111", color: "#fff", padding: "18px", borderRadius: "14px", fontWeight: 800, border: "none", cursor: "pointer", transition: "0.3s" }}>
                    {loading ? "GENERATING..." : "CREATE ROOM"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}