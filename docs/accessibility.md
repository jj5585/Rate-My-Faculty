# Rate My Faculty — Web Accessibility Architecture & Engineering Guide

## 1. Overview & Core Philosophy

Rate My Faculty is an anonymous faculty rating, review, and student discussion platform built with Next.js, React, TypeScript, Tailwind CSS, and Prisma. This document establishes the accessibility architecture, interaction patterns, and verification standards implemented across the platform to align with **WCAG 2.1 Level AA** standards.

### Core Engineering Principles
1. **First-Class Semantics Over Redundant ARIA:** Always prioritize native HTML elements (`<main>`, `<nav>`, `<header>`, `<button>`, `<fieldset>`, `<legend>`, `<input>`, `<label>`, `<dialog>`) before applying ARIA attributes. Native semantics provide reliable cross-browser assistive technology support without synthetic overhead.
2. **Visual & Brand Preservation:** Accessibility hardening preserves the signature Apple iOS Liquid Glass design language (deep slate `#030611` background, frosted glass cards with specular highlight borders, high-contrast `#F2F2F7` foreground, electric cyan `#64D2FF` and blue `#0A84FF` accents, and SF Pro / Inter typography).
3. **Intentional Screen-Reader Output:** Visual iconography (Material Symbols, badges, decorative avatar initials) is marked with `aria-hidden="true"`, while visually concise badges (e.g. `★ 4.8`) provide complete auditory equivalents (e.g. `<span className="sr-only">Rated 4.8 out of 5 stars</span>`).
4. **Resilient Keyboard Focus Management:** Interactive components provide prominent, high-contrast focus rings (`:focus-visible`), explicit programmatic focus transfers, roving tabindex for grouped controls, and bidirectional focus retention during modal lifecycle transitions.
5. **Polite, Non-Blocking Status Regions:** Real-time updates, clipboard feedback, and moderation confirmations utilize polite ARIA live regions (`role="status"`, `aria-live="polite"`) rather than invasive browser alerts.

---

## 2. Global Architecture & Foundation

### 2.1 Skip Navigation (`<SkipLink />`)
- **Location:** `src/components/SkipLink.tsx`, mounted as the initial element of the body in `src/app/layout.tsx`.
- **Target:** Direct programmatic link to `<main id="main-content" tabIndex={-1}>`.
- **Focus Transfer Mechanism:** Because modern Blink and WebKit browsers can fail to move keyboard focus when navigating in-page anchor links with smooth scroll enabled, `SkipLink` implements an explicit `onClick` handler:
  ```tsx
  const handleSkip = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("main-content");
    if (target) {
      target.tabIndex = -1;
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };
  ```
- **Consistent Landmark Target:** Every page across the application renders `<main id="main-content" tabIndex={-1} className="... outline-none">`.

### 2.2 Global Focus Indicators
- **Standard:** WCAG 2.1 AA Criterion 2.4.7 (Focus Visible) and WCAG 2.2 Criterion 2.4.13 (Focus Appearance).
- **Implementation:** Defined in `src/app/globals.css`:
  ```css
  :focus-visible {
    outline: 2px solid #64D2FF !important;
    outline-offset: 2px !important;
  }
  ```
- Focus rings are suppressed for pointer/touch interactions (`:focus:not(:focus-visible)`) to preserve clean visual glass aesthetics, but activate instantly upon `Tab` or arrow key navigation.

### 2.3 Screen Reader Utility (`.sr-only`)
- Defined in `src/app/globals.css` using standard clipping:
  ```css
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  ```

### 2.4 Reduced Motion Preference Support
- Respects operating system vestibular comfort preferences (WCAG 2.2.2 / 2.3.3):
  ```css
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }

    /* Preserve essential visual feedback (colors, borders, opacity) for interactive controls */
    a, button, input, select, textarea, [role="button"], [role="radio"], [role="tab"], [role="option"] {
      transition-property: color, background-color, border-color, opacity, box-shadow !important;
      transition-duration: 0.1s !important;
    }
  }
  ```
  *Design Rationale:* Indiscriminately killing all transitions breaks instant visual state feedback for interactive controls. This implementation disables large motion, slides, and parallax while preserving subtle color, border, and opacity transitions for clarity.

---

## 3. Accessible Component Patterns

### 3.1 Roving Tabindex Rating Radio Group
- **Location:** `src/app/rate/[id]/page.tsx`
- **Pattern:** WAI-ARIA Radio Group Design Pattern.
- **Implementation Highlights:**
  - 6 distinct criteria (`Teaching Clarity`, `Approachability`, `Grading Fairness`, `Punctuality`, `Not Partial`, `Behaviour`).
  - Each criterion is enclosed in a semantic `<fieldset>` with `<legend>`.
  - Container element uses `role="radiogroup"`, `aria-required="true"`, and points to its criterion description via `aria-describedby`.
  - Score buttons (1 to 5) utilize `role="radio"`, `aria-checked="{isChecked}"`, and dynamic roving tabindex (`tabIndex={isChecked || (currentScore === 0 && num === 1) ? 0 : -1}`).
  - **Keyboard Navigation:**
    - `ArrowRight` / `ArrowDown`: Moves to the next score, wrapping around from 5 to 1.
    - `ArrowLeft` / `ArrowUp`: Moves to the previous score, wrapping around from 1 to 5.
    - `Space` / `Enter`: Selects the currently focused score.
  - **Error Validation State:** On submission with unrated criteria, invalid groups receive `aria-invalid="true"`, subtle red border highlighting, and link dynamically to the error banner via `aria-describedby="form-error-banner {id}-desc"`.

### 3.2 Modal Dialogs with Focus Trap & Bidirectional Focus Shifts
- **Location:** `src/app/stories/page.tsx` (`StoryModal`, `ComposeModal`), `src/app/HomeClientShell.tsx`, `src/app/colleges/[id]/CollegeClientShell.tsx`
- **Pattern:** WAI-ARIA Modal Dialog Pattern.
- **Attributes:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby="{titleId}"`.
- **Keyboard Trapping:**
  - Active `keydown` listener intercepts `Tab` and `Shift + Tab`.
  - Cycles focus strictly between the first and last focusable elements inside the modal.
- **Step Transitions (`ComposeModal`):**
  - When advancing from Step 1 (College Selection) to Step 2 (Write Story), focus shifts automatically to the `#compose-story-title` input.
  - When clicking "← Back" to return to Step 1, focus is programmatically restored to `#compose-college-search`.
- **Dismissal & Focus Restoration:**
  - Pressing `Escape` closes the active modal or expanded form.
  - Upon close, keyboard focus returns programmatically to the exact trigger button that opened the interaction.

### 3.3 Accessible Combobox with Keyboard Navigation
- **Location:** `src/app/profile/page.tsx` (College Selection Combobox)
- **Pattern:** WAI-ARIA 1.2 Combobox Pattern with Listbox Popup.
- **Attributes:**
  - Input: `role="combobox"`, `aria-expanded="{isOpen && results.length > 0}"`, `aria-autocomplete="list"`, `aria-controls="profile-college-results"`.
  - Conditional `aria-activedescendant`: Points to the active option ID only when the dropdown is open and an item is actively highlighted.
  - Options list: `role="listbox"`, containing items with `role="option"`, unique IDs, and `aria-selected`.
- **Keyboard Navigation:**
  - `ArrowDown`: Opens dropdown (if closed) or advances active descendant.
  - `ArrowUp`: Decrements active descendant, wrapping to the end.
  - `Enter`: Selects the highlighted option and collapses the menu.
  - `Escape`: Closes the suggestions dropdown and resets active state.

### 3.4 Bottom Navigation Dock (`<BottomDock />`)
- **Location:** `src/components/BottomDock.tsx`
- **Semantics:** Native `<nav aria-label="Main App Navigation">` landmark.
- **Active State:** The active route link dynamically indicates `aria-current="page"`.
- **Touch Target:** Navigation links provide touch targets exceeding 44×44px with active scale feedback.

### 3.5 Asynchronous Status Feedback & Live Regions
- **Polite Status Regions:** Configured with `role="status"` and `aria-live="polite"`:
  - Clipboard copy feedback (`ShareButton`).
  - Moderation reporting feedback (`RatingReportButton`).
  - Search filter results counter in `HomeClientShell` (`search-live-status`) and `CollegeClientShell`.
- **Assertive Alerts:** Configured with `role="alert"` and `aria-live="assertive"` for submission errors and missing validation fields.

---

## 4. Color & Contrast Architecture

The dark aesthetic utilizes a deep space background (`#030611`). All text and functional elements comply with WCAG 2.1 AA minimum contrast standards:
- **Normal Text (< 18pt or < 14pt bold):** Minimum contrast ratio of **4.5:1**.
- **Large Text (≥ 18pt or ≥ 14pt bold):** Minimum contrast ratio of **3.0:1**.
- **UI Components & Graphical Controls:** Minimum contrast ratio of **3.0:1**.

| Semantic Element | Color Token | Background | Measured Ratio | Conformance |
| :--- | :--- | :--- | :--- | :--- |
| Primary Body & Headings | `#F2F2F7` / `#FFFFFF` | `#030611` | **18.4:1** | WCAG AAA |
| Cyan Accent & Links | `#64D2FF` | `#030611` | **11.2:1** | WCAG AAA |
| Supporting Metadata / Labels | `#FFFFFF` with `opacity-70` / `#9CA3AF` | `#030611` | **7.1:1** | WCAG AAA |
| High-Rating Star Badge | `#FBBF24` (Amber 400) | `#030611` | **11.6:1** | WCAG AAA |
| Focus Ring Indicator | `#64D2FF` | `#030611` | **11.2:1** | WCAG AA / AAA |
| Error Text & Borders | `#F87171` (Rose 400) | `#030611` | **6.4:1** | WCAG AA |

---

## 5. Automated Regression Testing

Automated accessibility testing is built into the testing pipeline using **Vitest**, **React Testing Library**, and **Axe-Core**.

### Running Automated Accessibility Tests
```bash
npm run test:a11y
```

### Coverage in `src/__tests__/a11y.test.tsx`
- **SkipLink:** Target validation, programmatic `.focus()` transfer, and 0 axe violations.
- **BottomDock:** Navigation landmark, `aria-current="page"` state, and 0 axe violations.
- **ShareButton:** Accessible name calculation, polite live region announcement, clipboard copy, and 0 axe violations.
- **RatingReportButton:** Moderation status change, `aria-busy` state, live region output, and 0 axe violations.
- **Rating Roving Tabindex Radiogroup:** Arrow navigation, wrapping (1↔5), Space/Enter selection, validation `aria-invalid` / error banner linking, and 0 axe violations.
- **Dialog Focus Trap & Escape:** Tab and Shift+Tab focus containment, Escape key dismissal, and 0 axe violations.
- **Combobox Keyboard Navigation:** ArrowDown / ArrowUp navigation, `aria-activedescendant` integrity, Enter selection, and 0 axe violations.

---

## 6. Manual Testing Verification Checklists

Automated tools detect only a subset of real-world accessibility issues. Every production release should complete the following manual verification checklists:

### 6.1 Keyboard Navigation Checklist
1. Disconnect mouse / trackpad.
2. Press `Tab` on initial page load: verify the **Skip to main content** link appears prominently at the top-left.
3. Press `Enter`: verify keyboard focus moves to `<main id="main-content">` and visual viewport scrolls smoothly.
4. Press `Tab` through each route:
   - Verify every link, button, input, and interactive control displays a clean cyan (`#64D2FF`) 2px focus ring.
   - Verify focus order is logical and mirrors the visual reading hierarchy.
5. In `rate/[id]`: Verify rating buttons navigate via arrow keys and can be selected via `Space` or `Enter`.
6. In `stories`: Open compose modal, verify focus is placed inside the dialog, Tab wraps within the dialog, and `Escape` closes the dialog and restores focus to the trigger.

### 6.2 macOS Safari + VoiceOver Checklist
1. Enable VoiceOver (`Cmd + F5`).
2. Open Rotor (`Control + Option + U`):
   - Navigate to **Landmarks**: Verify `banner`, `main`, and `navigation` landmarks exist and are distinct.
   - Navigate to **Headings**: Verify hierarchical progression (`h1` -> `h2` -> `h3`).
   - Navigate to **Form Controls**: Verify all inputs announce associated labels and required indicators.
3. Test rating badges: Verify VoiceOver announces "Rated X out of 5 stars" rather than just the number.

### 6.3 iOS Safari + VoiceOver Checklist
1. Enable VoiceOver (`Settings > Accessibility > VoiceOver`).
2. Swipe right to cycle elements: verify touch targets are responsive and decorative symbols are ignored.
3. Test modal dialogs: verify background content is obscured from VoiceOver cursor while modal is active.

### 6.4 200% to 400% Zoom Reflow Checklist
1. In desktop browser, zoom page to 200% (`Cmd + +`): verify text does not clip and buttons do not overflow containers.
2. Zoom page to 400%: verify the layout reflows into a single-column layout without requiring horizontal scrollbars (WCAG 1.4.10).

