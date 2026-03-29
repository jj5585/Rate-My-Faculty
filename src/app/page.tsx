"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState("")
  const [allFaculty, setAllFaculty] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [importUrl, setImportUrl] = useState("")
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState("")
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchFaculty()
  }, [])

  async function fetchFaculty() {
    setLoading(true)
    const res = await fetch("/api/faculty")
    const data = await res.json()
    setAllFaculty(data.faculty || [])
    setLoading(false)
  }

  async function handleImport() {
    if (!importUrl) return
    setImporting(true)
    setImportMsg("")
    const res = await fetch("/api/import-faculty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: importUrl }),
    })
    const data = await res.json()
    if (data.facultyId) {
      setImportMsg("✓ Faculty added successfully!")
      setImportUrl("")
      fetchFaculty()
      router.push(`/faculty/${data.facultyId}`)
    } else {
      setImportMsg(`✗ ${data.error || "Failed to import"}`)
    }
    setImporting(false)
  }

  const isSearching = query.trim().length > 0

  const displayList = isSearching
    ? allFaculty.filter((f) => {
        const q = query.toLowerCase()
        return (
          f.name?.toLowerCase().includes(q) ||
          f.department?.toLowerCase().includes(q)
        )
      })
    : allFaculty
        .filter((f) => f.ratingCount >= 1)
        .sort((a: any, b: any) => {
          const diff = parseFloat(b.avgRating) - parseFloat(a.avgRating)
          if (diff !== 0) return diff
          return b.ratingCount - a.ratingCount
        })
        .slice(0, 40)

  const ratingColor = (avg: string) => {
    const n = parseFloat(avg)
    if (n >= 4.5) return "text-green-400"
    if (n >= 3.5) return "text-yellow-400"
    if (n >= 2.5) return "text-orange-400"
    return "text-red-400"
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Rate My Faculty</h1>
          <p className="text-gray-400 text-xs">SRMIST — Anonymous faculty reviews</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/today" className="text-purple-400 text-xs font-medium">
            💬 Today
          </Link>
          <Link href="/incidents" className="text-red-400 text-xs font-medium">
            🚨 Feed
          </Link>
          {mounted && status !== "loading" && (
            session ? (
              <button onClick={() => signOut()} className="text-gray-500 text-sm hover:text-white">
                Sign out
              </button>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Sign in
              </button>
            )
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Search */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search faculty by name or department..."
          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
        />

        {/* Import button + box */}
        <button
          onClick={() => setShowImport(!showImport)}
          className="w-full bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl px-4 py-3 text-sm text-gray-300 font-medium flex items-center justify-between transition"
        >
          <span>➕ Add a faculty member</span>
          <span className="text-gray-600 text-xs">{showImport ? "▲ Hide" : "▼ Show"}</span>
        </button>

        {showImport && (
          <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-4 flex flex-col gap-3">
            <p className="text-xs text-gray-500">
              Find them on{" "}
              <a href="https://www.srmist.edu.in/staff-finder/" target="_blank" className="text-blue-400 underline">
                SRMIST Staff Finder
              </a>
              , open their profile, copy the URL and paste below.
            </p>
            <div className="flex gap-2">
              <input
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://www.srmist.edu.in/faculty/dr-..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleImport}
                disabled={importing}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                {importing ? "Importing..." : "Import"}
              </button>
            </div>
            {importMsg && (
              <p className={`text-xs ${importMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>{importMsg}</p>
            )}
          </div>
        )}

        {/* Section label */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {isSearching ? `Results for "${query}"` : "🏆 Top Rated Faculty"}
          </p>
          {!isSearching && (
            <p className="text-gray-600 text-xs">Ranked by student reviews</p>
          )}
        </div>

        {/* Faculty list */}
        {loading ? (
          <p className="text-gray-500 text-sm text-center mt-6">Loading...</p>
        ) : displayList.length === 0 ? (
          <div className="text-center mt-10 space-y-2">
            <p className="text-gray-500 text-sm">
              {isSearching
                ? `No faculty found for "${query}"`
                : "No rated faculty yet. Be the first to rate someone!"}
            </p>
            {isSearching && (
              <button
                onClick={() => setShowImport(true)}
                className="text-blue-400 text-xs underline"
              >
                Import their profile
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayList.map((f: any, i: number) => (
              <Link
                key={f.id}
                href={`/faculty/${f.id}`}
                className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 flex items-center gap-3 transition"
              >
                {!isSearching && (
                  <div className="text-sm font-black w-5 text-center shrink-0 text-gray-600">
                    {i + 1}
                  </div>
                )}

                {f.photoUrl ? (
                  <img
                    src={`/api/image-proxy?url=${encodeURIComponent(f.photoUrl)}`}
                    alt={f.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-300 shrink-0">
                    {f.name?.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{f.name}</p>
                  <p className="text-gray-400 text-sm truncate">{f.department}</p>
                </div>

                <div className="text-right shrink-0">
                  {f.avgRating ? (
                    <>
                      <p className={`font-bold text-lg ${ratingColor(f.avgRating)}`}>{f.avgRating} ★</p>
                      <p className="text-gray-500 text-xs">{f.ratingCount} review{f.ratingCount !== 1 ? "s" : ""}</p>
                    </>
                  ) : (
                    <p className="text-gray-600 text-sm">No ratings</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}