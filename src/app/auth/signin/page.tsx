"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"

export default function SignInPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen flex flex-col justify-center items-center p-6 relative z-10 selection:bg-blue-600 selection:text-white pb-36 outline-none">
      <div className="w-full max-w-sm rounded-[28px] liquid-glass p-8 text-center flex flex-col items-center gap-5 border border-white/15 shadow-liquid-glow">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600/30 via-indigo-600/20 to-cyan-400/30 border border-white/20 flex items-center justify-center text-cyan-300">
          <span className="material-symbols-outlined text-[32px]" aria-hidden="true">account_circle</span>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
            Student Identity
          </span>
          <h1 className="text-[22px] font-black text-white tracking-tight m-0 mt-1">
            Rate<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">MyFaculty</span>
          </h1>
          <p className="text-[13px] text-white/60 mt-1.5 mb-0 leading-relaxed">
            Honest, verified faculty feedback by students across India.
          </p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(10,132,255,0.4)] hover:brightness-110 transition-all cursor-pointer"
        >
          <span>Continue with Google</span>
        </button>

        <p className="text-white/40 text-[11px] text-center leading-relaxed m-0">
          Your identity is never linked to your ratings. All reviews and submissions remain completely anonymous.
        </p>

        <Link href="/" className="text-[12px] text-cyan-300 hover:text-white transition-colors no-underline font-semibold">
          ← Back to Directory
        </Link>
      </div>
    </main>
  )
}
