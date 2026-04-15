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

  useEffect(() => {
    fetchComments()
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
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
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth: "680px",
        backgroundColor: "#0d0d0d",
        border: "1px solid #1e1e1e",
        borderBottom: "none",
        borderRadius: "16px 16px 0 0",
        maxHeight: "92vh",
        display: "flex", flexDirection: "column",
        animation: "slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
      }}>
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Handle bar */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px" }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#2a2a2a" }} />
        </div>

        {/* Header */}
        <div style={{ padding: "12px 20px 16px", borderBottom: "1px solid #141414" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
                color: "#c8a96e", fontWeight: 600,
              }}>
                {story.college.name}
                {story.college.city ? ` · ${story.college.city}` : ""}
              </span>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px", fontWeight: 700,
                color: "#f0ede8", margin: "6px 0 0",
                lineHeight: 1.3,
              }}>
                {story.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "#1a1a1a", border: "none", color: "#666",
                width: "32px", height: "32px", borderRadius: "50%",
                cursor: "pointer", fontSize: "16px", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
          <div style={{
            display: "flex", gap: "12px", alignItems: "center",
            marginTop: "10px",
          }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#444" }}>
              {timeAgo(story.createdAt)}
            </span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#2a2a2a" }}>·</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "#444", letterSpacing: "1px", textTransform: "uppercase" }}>
              Anonymous
            </span>
          </div>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {/* Story content */}
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "15px", lineHeight: "1.8", color: "#bbb",
            marginBottom: "24px",
          }}>
            {story.content}
          </p>

          {/* Upvote */}
          <div style={{
            display: "flex", gap: "8px", alignItems: "center",
            padding: "14px 0",
            borderTop: "1px solid #111", borderBottom: "1px solid #111",
            marginBottom: "24px",
          }}>
            <button
              onClick={handleUpvote}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: upvoted ? "rgba(200,169,110,0.1)" : "none",
                border: `1px solid ${upvoted ? "#c8a96e" : "#1e1e1e"}`,
                color: upvoted ? "#c8a96e" : "#555",
                padding: "7px 16px", borderRadius: "2px",
                fontFamily: "'DM Sans', sans-serif", fontSize: "12px",
                fontWeight: 700, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {upvoted ? "♥" : "♡"} {upvotes}
            </button>
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#444",
            }}>
              {story._count.comments} {story._count.comments === 1 ? "comment" : "comments"}
            </span>
          </div>

          {/* Comments */}
          <div style={{ marginBottom: "80px" }}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
              color: "#444", marginBottom: "16px",
            }}>
              Comments
            </p>

            {loadingComments ? (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#333" }}>
                Loading...
              </p>
            ) : comments.length === 0 ? (
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "16px", color: "#2a2a2a", fontStyle: "italic",
              }}>
                No comments yet. Be the first.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {comments.map(c => (
                  <div key={c.id} style={{
                    background: "#080808", border: "1px solid #141414",
                    borderRadius: "4px", padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: "10px",
                        color: "#c8a96e", letterSpacing: "1px", textTransform: "uppercase",
                        fontWeight: 700,
                      }}>
                        Anon {c.userHash.slice(0, 4)}
                      </span>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: "10px", color: "#333",
                      }}>
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px", lineHeight: "1.6", color: "#aaa",
                      margin: 0,
                    }}>
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comment input — fixed at bottom */}
        <div style={{
          padding: "12px 16px 20px",
          borderTop: "1px solid #141414",
          backgroundColor: "#0d0d0d",
        }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <textarea
              ref={inputRef}
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleComment()
                }
              }}
              placeholder={session ? "Add a comment..." : "Sign in to comment"}
              rows={1}
              style={{
                flex: 1,
                background: "#0a0a0a", border: "1px solid #1e1e1e",
                borderRadius: "2px", color: "#f0ede8",
                padding: "11px 14px", fontSize: "13px",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none", resize: "none",
                lineHeight: "1.5",
                transition: "border-color 0.2s",
              }}
              onFocus={e => { if (!session) { signIn("google") } }}
            />
            <button
              onClick={handleComment}
              disabled={posting || !comment.trim()}
              style={{
                background: "#c8a96e", color: "#080808", border: "none",
                width: "42px", height: "42px", borderRadius: "2px",
                cursor: "pointer", fontSize: "16px", fontWeight: 700,
                flexShrink: 0, opacity: posting || !comment.trim() ? 0.4 : 1,
                transition: "opacity 0.15s",
              }}
            >
              ↑
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

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

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
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: "100%", maxWidth: "680px",
        backgroundColor: "#0d0d0d",
        border: "1px solid #1e1e1e",
        borderBottom: "none",
        borderRadius: "16px 16px 0 0",
        maxHeight: "90vh",
        display: "flex", flexDirection: "column",
        animation: "slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 6px" }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#2a2a2a" }} />
        </div>

        <div style={{
          padding: "12px 20px 16px",
          borderBottom: "1px solid #141414",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
              color: "#555", marginBottom: "4px",
            }}>
              {step === "college" ? "Step 1 of 2" : "Step 2 of 2"}
            </p>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "20px", fontWeight: 700, color: "#f0ede8", margin: 0,
            }}>
              {step === "college" ? "Pick your college" : "Write your story"}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#1a1a1a", border: "none", color: "#666",
              width: "32px", height: "32px", borderRadius: "50%",
              cursor: "pointer", fontSize: "16px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {step === "college" ? (
            <div>
              <input
                autoFocus
                value={collegeQuery}
                onChange={e => handleCollegeInput(e.target.value)}
                placeholder="Search your college..."
                style={{
                  width: "100%", background: "#080808",
                  border: "1px solid #1e1e1e", borderRadius: "2px",
                  color: "#f0ede8", padding: "14px 16px",
                  fontSize: "15px", fontFamily: "'DM Sans', sans-serif",
                  outline: "none", marginBottom: "12px",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "#c8a96e"}
                onBlur={e => e.currentTarget.style.borderColor = "#1e1e1e"}
              />

              {selectedCollege && (
                <div style={{
                  background: "rgba(200,169,110,0.08)",
                  border: "1px solid rgba(200,169,110,0.3)",
                  borderRadius: "4px", padding: "12px 16px",
                  marginBottom: "12px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <p style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px", color: "#c8a96e", fontWeight: 600, margin: "0 0 2px",
                    }}>
                      ✓ {selectedCollege.name}
                    </p>
                    {selectedCollege.city && (
                      <p style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "11px", color: "#555", margin: 0,
                      }}>
                        {selectedCollege.city}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedCollege(null)}
                    style={{
                      background: "none", border: "none", color: "#555",
                      cursor: "pointer", fontSize: "12px",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Change
                  </button>
                </div>
              )}

              {colleges.length > 0 && (
                <div style={{
                  background: "#080808", border: "1px solid #1e1e1e",
                  borderRadius: "4px", overflow: "hidden",
                }}>
                  {colleges.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCollege(c)
                        setCollegeQuery(c.name)
                        setColleges([])
                      }}
                      style={{
                        width: "100%", textAlign: "left",
                        background: "none", border: "none",
                        borderBottom: "1px solid #111",
                        padding: "14px 16px", cursor: "pointer",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#0d0d0d")}
                      onMouseLeave={e => (e.currentTarget.style.background = "none")}
                    >
                      <p style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "14px", color: "#f0ede8",
                        fontWeight: 500, margin: "0 0 2px",
                      }}>
                        {c.name}
                      </p>
                      {c.city && (
                        <p style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "11px", color: "#555", margin: 0,
                        }}>
                          {c.city}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {collegeQuery && colleges.length === 0 && !selectedCollege && (
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px", color: "#444",
                }}>
                  No colleges found. <Link href="/" style={{ color: "#c8a96e" }}>Submit yours →</Link>
                </p>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "80px" }}>
              {selectedCollege && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  background: "rgba(200,169,110,0.08)",
                  border: "1px solid rgba(200,169,110,0.2)",
                  borderRadius: "2px", padding: "6px 12px",
                  alignSelf: "flex-start",
                }}>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "11px", color: "#c8a96e", fontWeight: 600,
                  }}>
                    {selectedCollege.name}
                  </span>
                </div>
              )}

              <div>
                <label style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "10px", letterSpacing: "2px",
                  textTransform: "uppercase", color: "#555",
                  display: "block", marginBottom: "8px",
                }}>
                  Title
                </label>
                <input
                  autoFocus
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Give your story a headline..."
                  style={{
                    width: "100%", background: "#080808",
                    border: "1px solid #1e1e1e", borderRadius: "2px",
                    color: "#f0ede8", padding: "13px 16px",
                    fontSize: "15px", fontFamily: "'Playfair Display', serif",
                    fontWeight: 700, outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = "#c8a96e"}
                  onBlur={e => e.currentTarget.style.borderColor = "#1e1e1e"}
                />
              </div>

              <div>
                <label style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "10px", letterSpacing: "2px",
                  textTransform: "uppercase", color: "#555",
                  display: "block", marginBottom: "8px",
                }}>
                  Story
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Share what happened. Be honest, be respectful."
                  rows={8}
                  style={{
                    width: "100%", background: "#080808",
                    border: "1px solid #1e1e1e", borderRadius: "2px",
                    color: "#f0ede8", padding: "13px 16px",
                    fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
                    lineHeight: "1.7", outline: "none", resize: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = "#c8a96e"}
                  onBlur={e => e.currentTarget.style.borderColor = "#1e1e1e"}
                />
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "10px", color: "#333", marginTop: "6px",
                }}>
                  {content.length} chars · minimum 20
                </p>
              </div>

              {error && (
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px", color: "#f87171",
                }}>
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer action */}
        <div style={{
          padding: "12px 16px 20px",
          borderTop: "1px solid #141414",
          backgroundColor: "#0d0d0d",
          display: "flex", gap: "10px",
        }}>
          {step === "college" ? (
            <button
              onClick={() => { if (selectedCollege) setStep("write") }}
              disabled={!selectedCollege}
              style={{
                flex: 1, background: selectedCollege ? "#c8a96e" : "#1a1a1a",
                color: selectedCollege ? "#080808" : "#333",
                border: "none", padding: "14px",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                fontSize: "13px", letterSpacing: "0.5px", textTransform: "uppercase",
                cursor: selectedCollege ? "pointer" : "not-allowed",
                borderRadius: "2px", transition: "all 0.2s",
              }}
            >
              Continue →
            </button>
          ) : (
            <>
              <button
                onClick={() => setStep("college")}
                style={{
                  background: "none", border: "1px solid #1e1e1e",
                  color: "#555", padding: "14px 20px",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                  fontSize: "12px", cursor: "pointer", borderRadius: "2px",
                  whiteSpace: "nowrap",
                }}
              >
                ← Back
              </button>
              <button
                onClick={handlePost}
                disabled={posting || !title.trim() || content.length < 20}
                style={{
                  flex: 1,
                  background: posting || !title.trim() || content.length < 20
                    ? "#1a1a1a" : "#c8a96e",
                  color: posting || !title.trim() || content.length < 20
                    ? "#333" : "#080808",
                  border: "none", padding: "14px",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                  fontSize: "13px", letterSpacing: "0.5px", textTransform: "uppercase",
                  cursor: posting ? "not-allowed" : "pointer",
                  borderRadius: "2px", transition: "all 0.2s",
                }}
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

// ─── Story Card ───────────────────────────────────────────────────────
function StoryCard({ story, onClick }: { story: Story; onClick: () => void }) {
  return (
    <article
      onClick={onClick}
      style={{
        background: "#0d0d0d",
        border: "1px solid #141414",
        borderRadius: "4px", padding: "20px",
        cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#1e1e1e"
        e.currentTarget.style.background = "#0f0f0f"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#141414"
        e.currentTarget.style.background = "#0d0d0d"
      }}
    >
      {/* College tag */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        marginBottom: "10px",
      }}>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "10px", letterSpacing: "1.5px",
          textTransform: "uppercase", color: "#c8a96e",
          fontWeight: 700,
        }}>
          {story.college.name}
        </span>
        {story.college.city && (
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "10px", color: "#333",
          }}>
            · {story.college.city}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "17px", fontWeight: 700,
        color: "#f0ede8", lineHeight: "1.3",
        margin: "0 0 8px", letterSpacing: "-0.2px",
      }}>
        {story.title}
      </h3>

      {/* Excerpt */}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13px", lineHeight: "1.6", color: "#666",
        margin: "0 0 14px",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      } as any}>
        {story.content}
      </p>

      {/* Footer */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: "1px solid #111", paddingTop: "12px",
      }}>
        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "11px", color: "#555",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            ♡ {story.upvotes}
          </span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "11px", color: "#555",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            💬 {story._count.comments}
          </span>
        </div>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "10px", color: "#333",
        }}>
          {timeAgo(story.createdAt)}
        </span>
      </div>
    </article>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function StoriesPage() {
  const { data: session } = useSession()
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [filterCollegeId, setFilterCollegeId] = useState<string | null>(null)
  const [stories, setStories] = useState<Story[]>([])

  const swrKey = `/api/stories${filterCollegeId ? `?collegeId=${filterCollegeId}` : ""}`
  const { data, isLoading, mutate } = useSWR(swrKey, fetcher, {
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
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#080808",
      color: "#f0ede8",
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .playfair { font-family: 'Playfair Display', Georgia, serif !important; }
        .dmsans   { font-family: 'DM Sans', sans-serif !important; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease forwards; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
      `}} />

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: "rgba(8,8,8,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1a1a1a",
        padding: "0 20px", height: "52px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "18px", fontWeight: 700, color: "#f0ede8",
          }}>
            Rate<span style={{ color: "#c8a96e" }}>My</span>Faculty
          </span>
        </Link>
        <button
          onClick={() => {
            if (!session) { signIn("google"); return }
            setShowCompose(true)
          }}
          style={{
            background: "#c8a96e", color: "#080808", border: "none",
            padding: "8px 16px", borderRadius: "2px",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
            fontSize: "11px", letterSpacing: "0.5px",
            textTransform: "uppercase", cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#d4b87a")}
          onMouseLeave={e => (e.currentTarget.style.background = "#c8a96e")}
        >
          + Write Story
        </button>
      </nav>

      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 20px 120px" }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: "32px" }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "10px", letterSpacing: "2px",
            textTransform: "uppercase", color: "#555",
            display: "block", marginBottom: "10px",
          }}>
            Community Stories
          </span>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(32px, 7vw, 52px)",
            fontWeight: 900, letterSpacing: "-1px",
            lineHeight: 1.05, margin: "0 0 12px", color: "#f0ede8",
          }}>
            Stories from<br />
            <span style={{ fontStyle: "italic", color: "#c8a96e" }}>campus.</span>
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px", color: "#555", lineHeight: "1.6",
          }}>
            Anonymous stories from students across India.
          </p>
        </div>

        {/* Feed */}
        {isLoading ? (
          <div style={{
            padding: "60px 0", textAlign: "center",
            fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#333",
          }}>
            Loading stories...
          </div>
        ) : stories.length === 0 ? (
          <div style={{
            padding: "60px 20px", textAlign: "center",
            border: "1px solid #141414", borderRadius: "4px",
          }}>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "22px", color: "#2a2a2a", fontStyle: "italic",
              margin: "0 0 12px",
            }}>
              No stories yet.
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px", color: "#444", marginBottom: "24px",
            }}>
              Be the first to share one.
            </p>
            <button
              onClick={() => {
                if (!session) { signIn("google"); return }
                setShowCompose(true)
              }}
              style={{
                background: "#c8a96e", color: "#080808", border: "none",
                padding: "12px 24px", borderRadius: "2px",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                fontSize: "12px", letterSpacing: "0.5px",
                textTransform: "uppercase", cursor: "pointer",
              }}
            >
              Write First Story
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {stories.map((story, i) => (
              <div
                key={story.id}
                className="fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <StoryCard
                  story={story}
                  onClick={() => setSelectedStory(story)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FLOATING BOTTOM NAV */}
      <div style={{
        position: "fixed",
        bottom: "28px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(13, 13, 13, 0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid #1e1e1e",
        borderRadius: "40px",
        display: "flex",
        padding: "6px 8px",
        gap: "4px",
        zIndex: 200,
        boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
      }}>
        <Link
          href="/"
          style={{
            padding: "10px 22px", borderRadius: "30px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "12px", color: "#666",
            textDecoration: "none", fontWeight: 600,
            whiteSpace: "nowrap", transition: "color 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#f0ede8")}
          onMouseLeave={e => (e.currentTarget.style.color = "#666")}
        >
          Home
        </Link>
        <Link
          href="/stories"
          style={{
            padding: "10px 22px", borderRadius: "30px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "12px", color: "#fff",
            textDecoration: "none", fontWeight: 700,
            whiteSpace: "nowrap",
            background: "rgba(200,169,110,0.12)",
            border: "1px solid rgba(200,169,110,0.2)",
          }}
        >
          Stories
        </Link>
      </div>

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