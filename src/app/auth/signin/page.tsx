"use client"

import { signIn } from "next-auth/react"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Rate My Faculty</h1>
          <p className="text-gray-400 mt-2 text-sm">SRMIST — Honest faculty reviews by students</p>
        </div>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 px-4 rounded-xl hover:bg-gray-100 transition"
        >
          Continue with Google
        </button>
        <p className="text-gray-500 text-xs text-center">
          Your identity is never linked to your ratings. All reviews are fully anonymous.
        </p>
      </div>
    </div>
  )
}
