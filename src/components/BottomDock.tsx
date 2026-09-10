"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BottomDock() {
  const pathname = usePathname()

  // Hide dock on full-screen rating flow if preferred, or keep everywhere
  const isHome = pathname === "/" || pathname?.startsWith("/colleges")
  const isToday = pathname === "/today" || pathname?.startsWith("/leaderboard")
  const isStories = pathname === "/stories" || pathname?.startsWith("/incidents")
  const isRooms = pathname?.startsWith("/rooms")
  const isProfile = pathname === "/profile"

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 pointer-events-none pb-2 pt-1 flex flex-col items-center">
      {/* Floating Ultra-Frosted Pill Dock */}
      <nav
        aria-label="Main App Navigation"
        className="pointer-events-auto w-[calc(100%-2rem)] max-w-sm rounded-[32px] liquid-glass-dock shadow-pill-dock px-3 py-2"
      >
        <div className="flex justify-around items-center h-14">
          {/* Tab 1: Colleges */}
          <Link
            href="/"
            aria-current={isHome ? "page" : undefined}
            aria-label="Colleges Directory"
            className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-full transition-all active:scale-95 ${
              isHome
                ? "text-cyan-300 bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(100,210,255,0.25)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isHome ? "'FILL' 1" : "'FILL' 0" }}
              aria-hidden="true"
            >
              account_balance
            </span>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">Colleges</span>
          </Link>

          {/* Tab 2: Reviews / Today */}
          <Link
            href="/today"
            aria-current={isToday ? "page" : undefined}
            aria-label="Today's Reviews"
            className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-full transition-all active:scale-95 ${
              isToday
                ? "text-cyan-300 bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(100,210,255,0.25)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isToday ? "'FILL' 1" : "'FILL' 0" }}
              aria-hidden="true"
            >
              rate_review
            </span>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Reviews</span>
          </Link>

          {/* Tab 3: Stories */}
          <Link
            href="/stories"
            aria-current={isStories ? "page" : undefined}
            aria-label="Campus Stories"
            className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-full transition-all active:scale-95 ${
              isStories
                ? "text-cyan-300 bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(100,210,255,0.25)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isStories ? "'FILL' 1" : "'FILL' 0" }}
              aria-hidden="true"
            >
              auto_stories
            </span>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Stories</span>
          </Link>

          {/* Tab 4: Rooms */}
          <Link
            href="/rooms"
            aria-current={isRooms ? "page" : undefined}
            aria-label="Study & Gossip Rooms"
            className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-full transition-all active:scale-95 ${
              isRooms
                ? "text-cyan-300 bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(100,210,255,0.25)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isRooms ? "'FILL' 1" : "'FILL' 0" }}
              aria-hidden="true"
            >
              forum
            </span>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Rooms</span>
          </Link>

          {/* Tab 5: Profile */}
          <Link
            href="/profile"
            aria-current={isProfile ? "page" : undefined}
            aria-label="User Profile"
            className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-full transition-all active:scale-95 ${
              isProfile
                ? "text-cyan-300 bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(100,210,255,0.25)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isProfile ? "'FILL' 1" : "'FILL' 0" }}
              aria-hidden="true"
            >
              person
            </span>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Profile</span>
          </Link>
        </div>
      </nav>

      {/* iOS Home Indicator Pill Bar */}
      <div className="w-36 h-1 rounded-full bg-white/40 mt-2 pointer-events-auto" aria-hidden="true" />
    </div>
  )
}
