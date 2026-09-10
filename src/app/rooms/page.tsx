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
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    if (!created) return
    const text = `Join my private room: ${created.name}\nCode: ${created.roomCode}\nPassword: ${created.password}`
    try {
      if (navigator.share) {
        await navigator.share({ title: "Gossip Room Invite", text, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 4000)
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

  if (status === "loading") return <div className="min-h-screen bg-[#030611]" />

  if (!session) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-screen flex items-center justify-center px-4 py-12 outline-none">
        <div className="rounded-[26px] liquid-glass p-8 text-center max-w-sm w-full flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full liquid-glass flex items-center justify-center text-cyan-300 shadow-liquid-glow">
            <span className="material-symbols-outlined text-[32px]" aria-hidden="true">forum</span>
          </div>
          <h1 className="text-[22px] font-extrabold text-white tracking-tight m-0">
            Private Gossip Rooms
          </h1>
          <p className="text-[13px] text-white/70 leading-relaxed m-0">
            Encrypted, anonymous real-time discussion rooms for university students.
          </p>
          <button
            onClick={() => signIn("google")}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-[14px] shadow-[0_4px_16px_rgba(10,132,255,0.4)] active:scale-95 transition-all"
          >
            Sign in to Enter
          </button>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-start relative z-10 selection:bg-blue-600 selection:text-white pb-36">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full pt-2 pb-2 px-4 backdrop-blur-2xl bg-black/40 border-b border-white/[0.08]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full liquid-glass-pill text-[12px] font-semibold text-cyan-300 hover:text-white transition-all no-underline"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
            <span>Home</span>
          </Link>

          <h1 className="text-[17px] font-extrabold text-white tracking-tight m-0">
            Gossip <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">Rooms</span>
          </h1>

          <div className="w-12" aria-hidden="true" />
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full px-4 pt-4 z-10 flex flex-col gap-4 max-w-md mx-auto outline-none">
        {created ? (
          /* Created State */
          <div role="status" aria-live="polite" className="rounded-[26px] liquid-glass p-6 text-center flex flex-col items-center gap-4 border border-emerald-400/40 shadow-liquid-glow">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">check</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">Room Initialized</span>
              <h2 className="text-[20px] font-extrabold text-white tracking-tight m-0 mt-1">{created.name}</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full my-1">
              <div className="p-3.5 rounded-2xl liquid-glass-input text-center">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">Room Code</span>
                <span className="text-[22px] font-extrabold text-cyan-300 tracking-widest">{created.roomCode}</span>
              </div>
              <div className="p-3.5 rounded-2xl liquid-glass-input text-center">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">Passkey</span>
                <span className="text-[22px] font-extrabold text-cyan-300 tracking-widest">{created.password}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={() => router.push(`/rooms/${created.roomCode}`)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-[14px] shadow-[0_4px_16px_rgba(10,132,255,0.4)] active:scale-95 transition-all"
              >
                Enter Room
              </button>
              <button
                onClick={handleShare}
                className="w-full py-3 rounded-xl liquid-glass-pill text-[13px] font-semibold text-white/80 hover:text-white"
              >
                Share Room Access
              </button>
              {copied && (
                <p role="status" aria-live="polite" className="text-[12px] text-emerald-300 m-0">
                  ✓ Credentials copied to clipboard!
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Join / Create Tabs */
          <div className="rounded-[26px] liquid-glass p-5 flex flex-col gap-4">
            {/* Segmented Tab Switcher */}
            <div role="tablist" aria-label="Room actions" className="flex p-1 rounded-2xl liquid-glass-input">
              <button
                role="tab"
                id="tab-join"
                aria-selected={tab === "join"}
                aria-controls="panel-join"
                onClick={() => { setTab("join"); setError("") }}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                  tab === "join"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Join Room
              </button>
              <button
                role="tab"
                id="tab-create"
                aria-selected={tab === "create"}
                aria-controls="panel-create"
                onClick={() => { setTab("create"); setError("") }}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                  tab === "create"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Create New
              </button>
            </div>

            {tab === "join" ? (
              <div role="tabpanel" id="panel-join" aria-labelledby="tab-join" className="flex flex-col gap-3.5 pt-1">
                <div>
                  <label htmlFor="room-code-input" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                    Room Code (4 Digits)
                  </label>
                  <input
                    id="room-code-input"
                    className="w-full liquid-glass-input text-center text-[28px] font-extrabold tracking-[12px] py-2.5 rounded-xl text-cyan-300 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    value={roomCode}
                    onChange={e => setRoomCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="0000"
                    inputMode="numeric"
                    maxLength={4}
                    aria-describedby={error ? "join-error" : undefined}
                  />
                </div>

                <div>
                  <label htmlFor="room-password-input" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                    Password (4 Digits)
                  </label>
                  <input
                    id="room-password-input"
                    className="w-full liquid-glass-input text-center text-[28px] font-extrabold tracking-[12px] py-2.5 rounded-xl text-cyan-300 placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    value={password}
                    onChange={e => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="••••"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    aria-describedby={error ? "join-error" : undefined}
                  />
                </div>

                {error && (
                  <p id="join-error" role="alert" className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[12px] m-0">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleJoin}
                  disabled={loading || roomCode.length < 4 || password.length < 4}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-[14px] shadow-[0_4px_16px_rgba(10,132,255,0.4)] active:scale-95 transition-all disabled:opacity-40"
                >
                  {loading ? "Verifying Credentials..." : "Access Room"}
                </button>
              </div>
            ) : (
              <div role="tabpanel" id="panel-create" aria-labelledby="tab-create" className="flex flex-col gap-3.5 pt-1">
                <div>
                  <label htmlFor="room-name-input" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                    Room Name
                  </label>
                  <input
                    id="room-name-input"
                    className="w-full liquid-glass-input px-3.5 py-3 rounded-xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    value={roomName}
                    onChange={e => setRoomName(e.target.value)}
                    placeholder="e.g. SRM CSE 3rd Year Gossip"
                    aria-describedby={error ? "create-error" : undefined}
                  />
                </div>

                {error && (
                  <p id="create-error" role="alert" className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[12px] m-0">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleCreate}
                  disabled={loading || !roomName.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-[14px] shadow-[0_4px_16px_rgba(10,132,255,0.4)] active:scale-95 transition-all disabled:opacity-40"
                >
                  {loading ? "Creating..." : "Initialize Room"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}