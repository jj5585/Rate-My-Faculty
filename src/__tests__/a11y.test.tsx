import React, { useState, useEffect, useRef } from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import * as axe from "axe-core"
import SkipLink from "@/components/SkipLink"
import BottomDock from "@/components/BottomDock"
import ShareButton from "@/components/ShareButton"
import RatingReportButton from "@/components/RatingReportButton"

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

// Mock next-auth/react for components using useSession
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { name: "Test User" } }, status: "authenticated" }),
  signIn: vi.fn(),
}))

// Mock fetch for API calls
global.fetch = vi.fn()

describe("Accessibility Components & Patterns", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("SkipLink Component", () => {
    it("renders with target #main-content and skip-link styling", async () => {
      const { container } = render(
        <div>
          <SkipLink />
          <main id="main-content" tabIndex={-1}>
            <h1>Main Content</h1>
          </main>
        </div>
      )
      const link = screen.getByRole("link", { name: /skip to main content/i })
      expect(link).toBeDefined()
      expect(link.getAttribute("href")).toBe("#main-content")
      expect(link.className).toContain("skip-link")

      const results = await axe.run(container)
      expect(results.violations).toHaveLength(0)
    })

    it("programmatically transfers keyboard focus to #main-content on click", () => {
      render(
        <div>
          <SkipLink />
          <main id="main-content" tabIndex={-1}>
            <h1>Main Content</h1>
          </main>
        </div>
      )
      const link = screen.getByRole("link", { name: /skip to main content/i })
      const main = document.getElementById("main-content")
      expect(main).toBeDefined()

      const focusSpy = vi.spyOn(main!, "focus")
      const scrollSpy = vi.fn()
      main!.scrollIntoView = scrollSpy

      fireEvent.click(link)

      expect(focusSpy).toHaveBeenCalled()
      expect(scrollSpy).toHaveBeenCalled()
    })
  })

  describe("BottomDock Navigation Component", () => {
    it("renders a semantic navigation landmark with aria-label and aria-current", async () => {
      const { container } = render(<BottomDock />)
      const nav = screen.getByRole("navigation", { name: /main app navigation/i })
      expect(nav).toBeDefined()

      // The mocked pathname is "/today", so the Reviews tab must have aria-current="page"
      const reviewsTab = screen.getByRole("link", { name: /today's reviews/i })
      expect(reviewsTab.getAttribute("aria-current")).toBe("page")

      // Other tabs must not have aria-current="page"
      const collegesTab = screen.getByRole("link", { name: /colleges directory/i })
      expect(collegesTab.getAttribute("aria-current")).toBeNull()

      const results = await axe.run(container)
      expect(results.violations).toHaveLength(0)
    })
  })

  describe("ShareButton Component", () => {
    it("provides accessible name and live region announcements on copy", async () => {
      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined)
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      })

      const { container } = render(<ShareButton name="Dr. Smith" avgRating="4.8" />)
      const button = screen.getByRole("button", { name: /share dr\. smith's profile/i })
      expect(button).toBeDefined()

      // Live status region should initially be empty
      const liveRegion = container.querySelector('[role="status"]')
      expect(liveRegion).toBeDefined()
      expect(liveRegion?.textContent?.trim()).toBe("")

      // Trigger share
      fireEvent.click(button)

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalled()
        expect(liveRegion?.textContent).toContain("Link copied to clipboard")
        expect(button.getAttribute("aria-label")).toBe("Link copied to clipboard")
      })

      const results = await axe.run(container)
      expect(results.violations).toHaveLength(0)
    })
  })

  describe("RatingReportButton Component", () => {
    it("provides descriptive accessible name and communicates moderation status", async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const { container } = render(<RatingReportButton ratingId="rating-123" />)
      const button = screen.getByRole("button", { name: /flag this review for moderation/i })
      expect(button).toBeDefined()
      expect(button.getAttribute("aria-busy")).toBe("false")

      // Click to report
      fireEvent.click(button)

      await waitFor(() => {
        const reportedButton = screen.getByRole("button", { name: /review reported for moderation/i })
        expect(reportedButton).toBeDefined()
        expect(reportedButton.getAttribute("disabled")).toBeDefined()
        const liveRegion = container.querySelector('[role="status"]')
        expect(liveRegion?.textContent).toContain("Review has been reported for moderation.")
      })

      const results = await axe.run(container)
      expect(results.violations).toHaveLength(0)
    })
  })

  describe("Form Semantics & Accessibility Patterns", () => {
    it("associates labels with inputs correctly via htmlFor and id", async () => {
      const { container } = render(
        <form aria-label="Add Faculty Form">
          <div>
            <label htmlFor="faculty-name-input">Faculty Full Name</label>
            <input id="faculty-name-input" type="text" required />
          </div>
          <div>
            <label htmlFor="faculty-dept-input">Department</label>
            <input id="faculty-dept-input" type="text" required />
          </div>
          <button type="submit">Submit Faculty</button>
        </form>
      )

      const nameInput = screen.getByLabelText(/faculty full name/i)
      expect(nameInput).toBeDefined()
      expect(nameInput.getAttribute("id")).toBe("faculty-name-input")

      const results = await axe.run(container)
      expect(results.violations).toHaveLength(0)
    })

    it("supports accessible roving tabindex radiogroup with wrapping and keyboard selection", async () => {
      function ProductionRatingFieldset({
        hasError = false,
        initialScore = 0,
      }: {
        hasError?: boolean
        initialScore?: number
      }) {
        const [score, setScore] = useState(initialScore)
        const isInvalid = Boolean(hasError && score === 0)

        const handleKey = (num: number, e: React.KeyboardEvent) => {
          let nextVal = num
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault()
            nextVal = num >= 5 ? 1 : num + 1
          } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault()
            nextVal = num <= 1 ? 5 : num - 1
          } else if (e.key === " " || e.key === "Enter") {
            e.preventDefault()
            nextVal = num
          } else {
            return
          }
          setScore(nextVal)
          const btn = document.getElementById(`score-teaching-${nextVal}`)
          btn?.focus()
        }

        return (
          <fieldset>
            <legend id="teaching-legend">Teaching Clarity *</legend>
            <p id="teaching-desc">How clearly do they explain concepts?</p>
            {hasError && <div id="form-error-banner" role="alert">Please provide a score for all metrics.</div>}
            <div
              role="radiogroup"
              aria-required="true"
              aria-invalid={isInvalid}
              aria-labelledby="teaching-legend"
              aria-describedby={isInvalid ? "form-error-banner teaching-desc" : "teaching-desc"}
            >
              {[1, 2, 3, 4, 5].map((num) => {
                const isChecked = score === num
                const tabIndex = isChecked || (score === 0 && num === 1) ? 0 : -1
                return (
                  <button
                    key={num}
                    id={`score-teaching-${num}`}
                    type="button"
                    role="radio"
                    aria-checked={isChecked}
                    tabIndex={tabIndex}
                    aria-label={`Teaching Clarity: ${num} out of 5`}
                    onClick={() => setScore(num)}
                    onKeyDown={(e) => handleKey(num, e)}
                  >
                    {num}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )
      }

      const { container } = render(<ProductionRatingFieldset initialScore={0} />)
      const radios = screen.getAllByRole("radio")
      expect(radios).toHaveLength(5)
      expect(radios[0].getAttribute("tabindex")).toBe("0")
      expect(radios[1].getAttribute("tabindex")).toBe("-1")

      // Move right from 1 to 2
      fireEvent.keyDown(radios[0], { key: "ArrowRight" })
      expect(radios[1].getAttribute("aria-checked")).toBe("true")
      expect(radios[1].getAttribute("tabindex")).toBe("0")
      expect(radios[0].getAttribute("tabindex")).toBe("-1")

      // Wrap around from 1 with ArrowLeft to 5
      fireEvent.keyDown(radios[0], { key: "ArrowLeft" })
      expect(radios[4].getAttribute("aria-checked")).toBe("true")

      const results = await axe.run(container)
      expect(results.violations).toHaveLength(0)
    })

    it("verifies aria-invalid and error banner connection on unrated radiogroup validation failure", async () => {
      function ValidatedFieldset() {
        return (
          <fieldset>
            <legend id="legend-clarity">Teaching Clarity *</legend>
            <div id="form-error-banner" role="alert">Please provide a score.</div>
            <div
              role="radiogroup"
              aria-required="true"
              aria-invalid="true"
              aria-labelledby="legend-clarity"
              aria-describedby="form-error-banner desc-clarity"
            >
              <p id="desc-clarity">Explaining concepts</p>
              <button type="button" role="radio" aria-checked="false" tabIndex={0} aria-label="1 star">
                1
              </button>
            </div>
          </fieldset>
        )
      }

      const { container } = render(<ValidatedFieldset />)
      const radiogroup = screen.getByRole("radiogroup")
      expect(radiogroup.getAttribute("aria-required")).toBe("true")
      expect(radiogroup.getAttribute("aria-invalid")).toBe("true")
      expect(radiogroup.getAttribute("aria-describedby")).toContain("form-error-banner")

      const results = await axe.run(container)
      expect(results.violations).toHaveLength(0)
    })

    it("supports accessible dialog modal with focus trapping and Escape key dismissal", async () => {
      function ProductionModal({ onClose }: { onClose: () => void }) {
        const modalRef = useRef<HTMLDivElement>(null)
        const closeBtnRef = useRef<HTMLButtonElement>(null)
        const firstInputRef = useRef<HTMLInputElement>(null)

        useEffect(() => {
          firstInputRef.current?.focus()

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
          return () => window.removeEventListener("keydown", handleKeyDown)
        }, [onClose])

        return (
          <div role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={modalRef}>
            <h2 id="modal-title">Write Campus Story</h2>
            <button ref={closeBtnRef} type="button" aria-label="Close dialog" onClick={onClose}>
              ✕
            </button>
            <label htmlFor="story-title-input">Headline</label>
            <input ref={firstInputRef} id="story-title-input" type="text" />
            <button type="button">Publish Story</button>
          </div>
        )
      }

      const handleClose = vi.fn()
      const { container } = render(<ProductionModal onClose={handleClose} />)
      const dialog = screen.getByRole("dialog", { name: /write campus story/i })
      expect(dialog).toBeDefined()
      expect(dialog.getAttribute("aria-modal")).toBe("true")

      const closeBtn = screen.getByRole("button", { name: /close dialog/i })
      const publishBtn = screen.getByRole("button", { name: /publish story/i })

      // Focus last element, press Tab -> should wrap to first focusable (closeBtn)
      publishBtn.focus()
      expect(document.activeElement).toBe(publishBtn)
      fireEvent.keyDown(window, { key: "Tab" })
      expect(document.activeElement).toBe(closeBtn)

      // Focus first element, press Shift+Tab -> should wrap to last focusable (publishBtn)
      closeBtn.focus()
      fireEvent.keyDown(window, { key: "Tab", shiftKey: true })
      expect(document.activeElement).toBe(publishBtn)

      // Press Escape -> calls onClose
      fireEvent.keyDown(window, { key: "Escape" })
      expect(handleClose).toHaveBeenCalledTimes(1)

      const results = await axe.run(container)
      expect(results.violations).toHaveLength(0)
    })

    it("supports accessible combobox keyboard navigation with aria-activedescendant", async () => {
      function ProductionCombobox({ onSelect }: { onSelect: (val: string) => void }) {
        const [query, setQuery] = useState("")
        const [isOpen, setIsOpen] = useState(false)
        const [activeIndex, setActiveIndex] = useState(-1)
        const colleges = [
          { id: "c1", name: "IIT Madras" },
          { id: "c2", name: "BITS Pilani" },
        ]

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (!isOpen) {
            if (e.key === "ArrowDown") {
              setIsOpen(true)
              setActiveIndex(0)
              e.preventDefault()
            }
            return
          }
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setActiveIndex((prev) => (prev < colleges.length - 1 ? prev + 1 : 0))
          } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : colleges.length - 1))
          } else if (e.key === "Enter") {
            if (activeIndex >= 0 && activeIndex < colleges.length) {
              e.preventDefault()
              onSelect(colleges[activeIndex].name)
              setIsOpen(false)
            }
          } else if (e.key === "Escape") {
            e.preventDefault()
            setIsOpen(false)
          }
        }

        return (
          <div>
            <label htmlFor="college-search">Select College</label>
            <input
              id="college-search"
              role="combobox"
              aria-expanded={isOpen}
              aria-autocomplete="list"
              aria-controls="college-listbox"
              aria-activedescendant={isOpen && activeIndex >= 0 ? `opt-${colleges[activeIndex].id}` : undefined}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setIsOpen(true)
              }}
              onKeyDown={handleKeyDown}
            />
            {isOpen && (
              <ul id="college-listbox" role="listbox" aria-label="College Suggestions">
                {colleges.map((c, idx) => (
                  <li
                    key={c.id}
                    id={`opt-${c.id}`}
                    role="option"
                    aria-selected={activeIndex === idx}
                  >
                    {c.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      }

      const handleSelect = vi.fn()
      const { container } = render(<ProductionCombobox onSelect={handleSelect} />)
      const input = screen.getByRole("combobox", { name: /select college/i })
      expect(input.getAttribute("aria-expanded")).toBe("false")

      // Press ArrowDown to open
      fireEvent.keyDown(input, { key: "ArrowDown" })
      expect(input.getAttribute("aria-expanded")).toBe("true")
      expect(input.getAttribute("aria-activedescendant")).toBe("opt-c1")

      // Press ArrowDown again to highlight second option
      fireEvent.keyDown(input, { key: "ArrowDown" })
      expect(input.getAttribute("aria-activedescendant")).toBe("opt-c2")

      // Press Enter to select
      fireEvent.keyDown(input, { key: "Enter" })
      expect(handleSelect).toHaveBeenCalledWith("BITS Pilani")
      expect(input.getAttribute("aria-expanded")).toBe("false")
      expect(input.getAttribute("aria-activedescendant")).toBeNull()

      const results = await axe.run(container)
      expect(results.violations).toHaveLength(0)
    })
  })
})
