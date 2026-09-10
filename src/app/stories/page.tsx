"use client"

import { useState, useEffect, useRef } from "react"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"
import useSWR from "swr"

// ─── Types ───────────────────────────────────────────────────────────
type College = { id: string; name: string; city: string | null }
type Story = {
  id: string
  title: string
  content: string
  userHash: string
  upvotes: number
  createdAt: string
  college: { id: string; name: string; city: string | null }
  _count: { comments: number }
}
type Comment = {
  id: string
  content: string
  userHash: string
  upvotes: number
  createdAt: string
}

// ─── Helpers ─────────────────────────────────────────────────────────
function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

// ─── Story Detail Modal ───────────────────────────────────────────────
function StoryModal({
  story,
  onClose,
  session,
}: {
  story: Story
  onClose: () => void
  session: any
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [comment, setComment] = useState("")
  const [posting, setPosting] = useState(false)
  const [upvoted, setUpvoted] = useState(false)
  const [upvotes, setUpvotes] = useState(story.upvotes)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const prevActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    prevActiveElement.current = document.activeElement as HTMLElement | null
    fetchComments()
    document.body.style.overflow = "hidden"
    closeBtnRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      } else if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
      prevActiveElement.current?.focus()
    }
  }, [])

  async function fetchComments() {
    setLoadingComments(true)
    try {
      const res = await fetch(`/api/stories/${story.id}`)
      const data = await res.json()
      setComments(data.story?.comments || [])
    } finally {
      setLoadingComments(false)
    }
  }

  async function handleComment() {
    if (!comment.trim()) return
    if (!session) { signIn("google"); return }
    setPosting(true)
    try {
      const res = await fetch(`/api/stories/${story.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      })
      const data = await res.json()
      if (data.comment) {
        setComments(prev => [...prev, data.comment])
        setComment("")
      }
    } finally {
      setPosting(false)
    }
  }

  async function handleUpvote() {
    if (upvoted) return
    if (!session) { signIn("google"); return }
    setUpvoted(true)
    setUpvotes(u => u + 1)
    await fetch(`/api/stories/${story.id}/upvote`, { method: "POST" })
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-modal-title"
        className="w-full max-w-lg liquid-glass-dock rounded-t-[32px] sm:rounded-[32px] border border-white/20 max-h-[90vh] flex flex-col shadow-pill-dock animate-in slide-in-from-bottom duration-300 overflow-hidden"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-white/10 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block">
              {story.college.name} {story.college.city ? `· ${story.college.city}` : ""}
            </span>
            <h2 id="story-modal-title" className="text-[18px] font-extrabold text-white tracking-tight leading-snug m-0 mt-1">
              {story.title}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-white/50">
              <span>{timeAgo(story.createdAt)}</span>
              <span>•</span>
              <span className="uppercase tracking-wider">Anonymous Student</span>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close story dialog"
            className="w-8 h-8 rounded-full bg-white/10 text-white/70 hover:text-white flex items-center justify-center text-sm flex-shrink-0 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <p className="text-[14px] leading-relaxed text-white/90 m-0">
            {story.content}
          </p>

          {/* Upvote Pill */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/10">
            <button
              onClick={handleUpvote}
              aria-label={upvoted ? `Upvoted, ${upvotes} upvotes` : `Upvote story, currently ${upvotes} upvotes`}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-all ${
                upvoted
                  ? "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                  : "liquid-glass-pill text-white/80 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: upvoted ? "'FILL' 1" : "'FILL' 0" }} aria-hidden="true">
                favorite
              </span>
              <span>{upvotes}</span>
            </button>

            <span className="text-[12px] text-white/50">
              {comments.length} {comments.length === 1 ? "comment" : "comments"}
            </span>
          </div>

          {/* Comments List */}
          <div className="flex flex-col gap-2.5 pt-2">
            <h3 className="text-[12px] font-bold text-white/60 uppercase tracking-wider m-0">
              Comments
            </h3>

            {loadingComments ? (
              <p className="text-[13px] text-white/50 m-0">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-[13px] text-white/50 italic m-0">No comments yet. Be the first to reply.</p>
            ) : (
              <ul role="list" className="flex flex-col gap-2 p-0 m-0 list-none">
                {comments.map(c => (
                  <li key={c.id} className="p-3 rounded-2xl liquid-glass border border-white/10 list-none">
                    <div className="flex justify-between items-center text-[10px] text-white/50 mb-1">
                      <span className="font-bold text-cyan-300 uppercase">Anon {c.userHash.slice(0, 4)}</span>
                      <span>{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-[13px] text-white/90 m-0 leading-relaxed">{c.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Comment Input */}
        <div className="p-3 border-t border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="flex gap-2">
            <label htmlFor="story-comment-input" className="sr-only">Add a comment</label>
            <textarea
              id="story-comment-input"
              ref={inputRef}
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleComment()
                }
              }}
              placeholder={session ? "Add an anonymous comment..." : "Sign in to comment"}
              rows={1}
              className="flex-1 liquid-glass-input px-3.5 py-2.5 rounded-xl text-[13px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none"
              onFocus={() => { if (!session) signIn("google") }}
            />
            <button
              onClick={handleComment}
              disabled={posting || !comment.trim()}
              aria-label="Post comment"
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Compose Story Modal ──────────────────────────────────────────────
function ComposeModal({
  onClose,
  onPosted,
  session,
}: {
  onClose: () => void
  onPosted: (story: Story) => void
  session: any
}) {
  const [step, setStep] = useState<"college" | "write">("college")
  const [collegeQuery, setCollegeQuery] = useState("")
  const [colleges, setColleges] = useState<College[]>([])
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState("")
  const modalRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const prevActiveElement = useRef<HTMLElement | null>(null)
  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const collegeSearchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    prevActiveElement.current = document.activeElement as HTMLElement | null
    document.body.style.overflow = "hidden"
    closeBtnRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      } else if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
      prevActiveElement.current?.focus()
    }
  }, [])

  // Shift focus when switching between step 1 (college selection) and step 2 (write story)
  useEffect(() => {
    if (step === "write") {
      titleInputRef.current?.focus()
    } else if (step === "college") {
      collegeSearchRef.current?.focus()
    }
  }, [step])

  async function searchColleges(q: string) {
    if (!q.trim()) { setColleges([]); return }
    const res = await fetch(`/api/colleges?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setColleges(data.colleges || [])
  }

  function handleCollegeInput(val: string) {
    setCollegeQuery(val)
    clearTimeout((window as any).__collegeTimer)
    ;(window as any).__collegeTimer = setTimeout(() => searchColleges(val), 300)
  }

  async function handlePost() {
    if (!selectedCollege) return
    setPosting(true); setError("")
    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, collegeId: selectedCollege.id }),
      })
      const data = await res.json()
      if (res.ok) {
        onPosted(data.story)
      } else {
        setError(data.error || "Failed to post")
      }
    } catch {
      setError("Something went wrong")
    }
    setPosting(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-modal-title"
        className="w-full max-w-lg liquid-glass-dock rounded-t-[32px] sm:rounded-[32px] border border-white/20 max-h-[90vh] flex flex-col shadow-pill-dock animate-in slide-in-from-bottom duration-300 overflow-hidden"
      >
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>

        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
              {step === "college" ? "Step 1 of 2" : "Step 2 of 2"}
            </span>
            <h2 id="compose-modal-title" className="text-[17px] font-extrabold text-white tracking-tight m-0">
              {step === "college" ? "Select Your College" : "Write Your Story"}
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close compose dialog"
            className="w-8 h-8 rounded-full bg-white/10 text-white/70 hover:text-white flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3.5">
          {step === "college" ? (
            <div className="flex flex-col gap-3">
              <label htmlFor="compose-college-search" className="sr-only">Search your college</label>
              <input
                ref={collegeSearchRef}
                id="compose-college-search"
                value={collegeQuery}
                onChange={e => handleCollegeInput(e.target.value)}
                placeholder="Type to search your college..."
                className="w-full liquid-glass-input px-3.5 py-3 rounded-xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              />

              {selectedCollege && (
                <div className="p-3 rounded-xl liquid-glass border border-cyan-400/40 flex items-center justify-between">
                  <div>
                    <span className="text-[13px] font-bold text-cyan-300 block">✓ {selectedCollege.name}</span>
                    {selectedCollege.city && <span className="text-[11px] text-white/60">{selectedCollege.city}</span>}
                  </div>
                  <button
                    onClick={() => setSelectedCollege(null)}
                    className="text-[12px] text-white/60 hover:text-white underline"
                  >
                    Change
                  </button>
                </div>
              )}

              {colleges.length > 0 && (
                <ul role="list" className="flex flex-col gap-1 p-0 m-0 list-none max-h-48 overflow-y-auto">
                  {colleges.map(c => (
                    <li key={c.id} className="list-none">
                      <button
                        onClick={() => {
                          setSelectedCollege(c)
                          setCollegeQuery(c.name)
                          setColleges([])
                        }}
                        className="w-full text-left p-3 rounded-xl liquid-glass-pill hover:bg-white/10 text-[13px] text-white transition-colors"
                      >
                        <span className="font-bold block">{c.name}</span>
                        {c.city && <span className="text-[11px] text-white/60">{c.city}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {selectedCollege && (
                <div className="inline-flex self-start px-2.5 py-1 rounded-full liquid-badge text-[11px] font-bold text-cyan-200">
                  {selectedCollege.name}
                </div>
              )}

              <div>
                <label htmlFor="compose-story-title" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                  Headline
                </label>
                <input
                  ref={titleInputRef}
                  id="compose-story-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. How our lab professor went above and beyond"
                  className="w-full liquid-glass-input px-3.5 py-2.5 rounded-xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                />
              </div>

              <div>
                <label htmlFor="compose-story-content" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                  Story Details
                </label>
                <textarea
                  id="compose-story-content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Share what happened. Be honest, be respectful, and keep it constructive."
                  rows={6}
                  className="w-full liquid-glass-input px-3.5 py-2.5 rounded-xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none"
                />
                <span className="text-[10px] text-white/50 mt-1 block">{content.length} chars (min 20)</span>
              </div>

              {error && <p role="alert" className="text-rose-400 text-[12px] m-0">{error}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex gap-2">
          {step === "college" ? (
            <button
              onClick={() => { if (selectedCollege) setStep("write") }}
              disabled={!selectedCollege}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-[14px] disabled:opacity-40 transition-opacity"
            >
              Continue to Write →
            </button>
          ) : (
            <>
              <button
                onClick={() => setStep("college")}
                className="px-4 py-3 rounded-xl liquid-glass-pill text-[13px] font-semibold text-white/80"
              >
                ← Back
              </button>
              <button
                onClick={handlePost}
                disabled={posting || !title.trim() || content.length < 20}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-[14px] disabled:opacity-40 transition-opacity"
              >
                {posting ? "Publishing..." : "Publish Story"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Stories Page ────────────────────────────────────────────────
export default function StoriesPage() {
  const { data: session } = useSession()
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [stories, setStories] = useState<Story[]>([])

  const { data, isLoading } = useSWR("/api/stories", fetcher, {
    dedupingInterval: 15000,
    revalidateOnFocus: false,
  })

  useEffect(() => {
    if (data?.stories) setStories(data.stories)
  }, [data])

  function handlePosted(story: Story) {
    setShowCompose(false)
    setStories(prev => [story, ...prev])
    setSelectedStory(story)
  }

  return (
    <div className="min-h-screen flex flex-col justify-start relative z-10 selection:bg-blue-600 selection:text-white pb-36">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full pt-2 pb-2 px-4 backdrop-blur-2xl bg-black/40 border-b border-white/[0.08]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="text-[18px] font-extrabold tracking-tight text-white no-underline">
            RateMy<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">Faculty</span>
          </Link>

          <button
            onClick={() => {
              if (!session) { signIn("google"); return }
              setShowCompose(true)
            }}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-[12px] shadow-sm active:scale-95 transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]" aria-hidden="true">add</span>
            <span>Write Story</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full px-4 pt-4 z-10 flex flex-col gap-4 max-w-md mx-auto outline-none">
        {/* Hero Capsule */}
        <section className="relative overflow-hidden rounded-[26px] liquid-glass p-5 flex flex-col gap-2">
          <div className="absolute -top-10 -right-8 w-36 h-36 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" aria-hidden="true" />
          <div className="inline-flex self-start items-center gap-1 px-3 py-1 rounded-full liquid-badge text-[11px] font-bold text-cyan-200 uppercase tracking-wide">
            Campus Experiences · Unfiltered
          </div>
          <h1 className="text-[26px] font-extrabold text-white tracking-tight leading-tight m-0">
            Stories from <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-200 to-white">campus.</span>
          </h1>
          <p className="text-[13px] text-white/70 leading-relaxed m-0">
            Anonymous, first-hand accounts of campus life, lab mentorship, and academic growth from students across India.
          </p>
        </section>

        {/* Stories List */}
        {isLoading ? (
          <div role="status" aria-live="polite" className="text-center py-12 text-cyan-300 font-semibold text-sm">
            Loading stories...
          </div>
        ) : stories.length === 0 ? (
          <div className="rounded-[22px] liquid-glass p-8 text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-white/40 text-[32px]" aria-hidden="true">auto_stories</span>
            <p className="text-white/80 font-semibold text-[15px]">No stories posted yet</p>
            <p className="text-white/50 text-[13px]">Be the first to share an anonymous story from your campus.</p>
            <button
              onClick={() => {
                if (!session) { signIn("google"); return }
                setShowCompose(true)
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold"
            >
              Write First Story
            </button>
          </div>
        ) : (
          <ul role="list" className="flex flex-col gap-2.5 p-0 m-0 list-none" aria-label="Community stories feed">
            {stories.map(story => (
              <li key={story.id} className="list-none">
                <button
                  type="button"
                  onClick={() => setSelectedStory(story)}
                  aria-label={`Read story: ${story.title} from ${story.college.name}`}
                  className="w-full text-left rounded-[22px] liquid-glass p-4 hover:border-white/30 transition-all cursor-pointer active:scale-[0.985] flex flex-col gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                >
                  <article className="flex flex-col gap-2 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                        {story.college.name}
                      </span>
                      <span className="text-[11px] text-white/50">{timeAgo(story.createdAt)}</span>
                    </div>

                    <h2 className="text-[16px] font-bold text-white leading-snug m-0">
                      {story.title}
                    </h2>

                    <p className="text-[13px] text-white/70 line-clamp-2 leading-relaxed m-0">
                      {story.content}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-white/60">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-rose-400" aria-hidden="true">favorite</span>
                          <span>{story.upvotes}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-cyan-400" aria-hidden="true">chat</span>
                          <span>{story._count.comments}</span>
                        </span>
                      </div>
                      <span className="text-cyan-300 font-semibold" aria-hidden="true">Read story →</span>
                    </div>
                  </article>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Modals */}
      {selectedStory && (
        <StoryModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          session={session}
        />
      )}
      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onPosted={handlePosted}
          session={session}
        />
      )}
    </div>
  )
}