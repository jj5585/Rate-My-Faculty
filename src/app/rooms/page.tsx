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

  async function handleJoin() {
    if (!roomCode || !password) {
      setError("Enter both room code and password")
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
      // Store password in sessionStorage so chat page can use it
      sessionStorage.setItem(`room_${roomCode}`, password)
      router.push(`/rooms/${roomCode}`)
    } else {
      setError(data.error || "Failed to join")
    }
    setLoading(false)
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
    const text = await res.text()
    console.log("Response status:", res.status, "Body:", text)
    const data = JSON.parse(text)
    if (data.room) {
      sessionStorage.setItem(`room_${data.room.roomCode}`, data.room.password)
      setCreated({ roomCode: data.room.roomCode, password: data.room.password, name: data.room.name })
    } else {
      setError(data.error || "Failed to create room")
    }
  } catch (e) {
    setError("Server error — check console")
    console.error(e)
  }
  setLoading(false)
}
  if (status === "loading") {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white p-6">
        <div className="text-center space-y-4 max-w-xs">
          <p className="text-4xl">🔒</p>
          <h1 className="text-xl font-bold">Sign in to use Gossip Rooms</h1>
          <button onClick={() => signIn("google")} className="w-full bg-white text-black font-bold py-3 rounded-xl">
            Continue with Google
          </button>
          <Link href="/" className="block text-gray-500 text-sm">← Back</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">💬 Gossip Rooms</h1>
          <p className="text-gray-400 text-xs">Private anonymous chat rooms</p>
        </div>
        <Link href="/" className="text-blue-400 text-sm">← Home</Link>
      </header>

      <main className="max-w-md mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Created room success */}
        {created && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 flex flex-col gap-3">
            <p className="text-green-400 font-bold">✓ Room created!</p>
            <p className="text-white font-medium">{created.name}</p>
            <div className="flex gap-3">
              <div className="flex-1 bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-gray-500 text-xs mb-1">Room Code</p>
                <p className="text-2xl font-black text-white tracking-widest">{created.roomCode}</p>
              </div>
              <div className="flex-1 bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-gray-500 text-xs mb-1">Password</p>
                <p className="text-2xl font-black text-white tracking-widest">{created.password}</p>
              </div>
            </div>
            <p className="text-gray-500 text-xs">Share these with your friends to join</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`Join my gossip room on Rate My Faculty!\nRoom Code: ${created.roomCode}\nPassword: ${created.password}\nhttps://rate-my-faculty.vercel.app/rooms`)
                alert("Copied to clipboard!")
              }}
              className="w-full border border-gray-700 text-gray-300 py-2 rounded-xl text-sm"
            >
              📋 Copy invite
            </button>
            <button
              onClick={() => router.push(`/rooms/${created.roomCode}`)}
              className="w-full bg-white text-black font-bold py-3 rounded-xl"
            >
              Enter Room →
            </button>
          </div>
        )}

        {/* Tabs */}
        {!created && (
          <>
            <div className="flex bg-gray-900 rounded-xl p-1">
              <button
                onClick={() => { setTab("join"); setError("") }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${tab === "join" ? "bg-white text-black" : "text-gray-400"}`}
              >
                Join a Room
              </button>
              <button
                onClick={() => { setTab("create"); setError("") }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${tab === "create" ? "bg-white text-black" : "text-gray-400"}`}
              >
                Create Room
              </button>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            {tab === "join" && (
              <div className="flex flex-col gap-3">
                <input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Room Code (4 digits)"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  maxLength={4}
                />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="Password (4 digits)"
                  type="password"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  maxLength={4}
                />
                <button
                  onClick={handleJoin}
                  disabled={loading}
                  className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {loading ? "Joining..." : "Join Room →"}
                </button>
              </div>
            )}

            {tab === "create" && (
              <div className="flex flex-col gap-3">
                <input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Room name (e.g. CSE Batch 2023)"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  maxLength={50}
                />
                <p className="text-gray-600 text-xs">A 4-digit room code and password will be generated automatically.</p>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
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