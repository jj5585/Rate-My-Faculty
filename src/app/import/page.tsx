"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ImportPage() {
  const [url, setUrl] = useState("")
  const router = useRouter()

  const handleImport = async () => {
    console.log("CLICK WORKED") // 👈 DEBUG

    if (!url) {
      alert("Enter URL")
      return
    }

    try {
      const res = await fetch("/api/import-faculty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()
      console.log("API RESPONSE:", data)

      if (data.facultyId) {
        router.push(`/faculty/${data.facultyId}`)
      } else {
        alert("Import failed")
      }
    } catch (err) {
      console.error(err)
      alert("Error occurred")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl space-y-4 w-full max-w-md">
        <h1 className="text-xl font-bold">Import Faculty</h1>

        <input
          type="text"
          placeholder="Paste URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-3 rounded bg-black border border-gray-700"
        />

        <button
          onClick={handleImport}
          className="w-full bg-white text-black py-3 rounded font-bold"
        >
          Import
        </button>
      </div>
    </div>
  )
}