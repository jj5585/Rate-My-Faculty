"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [faculty, setFaculty] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [importUrl, setImportUrl] = useState("")
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState("")

  useEffect(() => {
    fetchFaculty()
  }, [query])

  async function fetchFaculty() {
    setLoading(true)
    const res = await fetch(`/api/faculty?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setFaculty(data.faculty || [])
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

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Rate My Faculty</h1>
          <p className="text-gray-400 text-xs">SRMIST — Anonymous faculty reviews</p>
        </div>
        {session ? (
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">{session.user?.name}</span>
            <button onClick={() => signOut()} className="text-gray-500 text-sm hover:text-white">Sign out</button>
          </div>
        ) : (
          <button onClick={() => signIn("google")} className="bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-100">
            Sign in
          </button>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Import box */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-300">Add a faculty member</p>
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

        {/* Search */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or department..."
          className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />

        {/* Faculty list */}
        {loading ? (
          <p className="text-gray-500 text-sm text-center">Loading...</p>
        ) : faculty.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No faculty yet. Import one above to get started.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {faculty.map((f) => (
              <Link
                key={f.id}
                href={`/faculty/${f.id}`}
                className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 flex items-center gap-4 transition"
              >
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
                    <p className="text-yellow-400 font-bold">{f.avgRating} ★</p>
                  ) : (
                    <p className="text-gray-600 text-sm">No ratings</p>
                  )}
                  <p className="text-gray-500 text-xs">{f.ratingCount} review{f.ratingCount !== 1 ? "s" : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}