# Accessibility

This document describes the VerdaTraceAI frontend's approach to web accessibility, keyboard navigation, known limitations, and instructions for manual validation with assistive technologies.

---

## 1. WCAG 2.1 AA Compliance Approach

VerdaTraceAI targets **WCAG 2.1 Level AA** conformance across the React + Vite + TypeScript frontend hosted on Firebase.

### Standards Followed

- **Perceivable**: All non-text content (SVG charts, icons) carries either a descriptive `aria-label` or `aria-hidden="true"` for decorative elements. Colour is never the sole means of conveying information; text labels accompany colour-coded status indicators.
- **Operable**: All interactive controls are reachable and operable via keyboard alone. A `:focus-visible` CSS rule applies a minimum 2 px outline with at least 3:1 contrast ratio against adjacent background colours, satisfying WCAG 2.4.7 and 1.4.11.
- **Understandable**: The `<html>` element carries `lang="en"` by default. When a user switches language in the sidebar, `document.documentElement.lang` is updated immediately to the corresponding BCP-47 locale code.
- **Robust**: Semantic HTML landmarks are used throughout: `<main>` for primary content, `<nav aria-label="Primary navigation">` for the sidebar, `<header>` for the page header in `DashboardView`, and appropriate heading hierarchy (`<h1>` → `<h2>` → `<h3>`) with no skipped levels.

### Key Implementation Decisions

| Criterion | Implementation |
|-----------|---------------|
| 1.1.1 Non-text Content | SVG charts use `role="img"` and `aria-label` with chart type and a current data point |
| 1.4.3 Contrast (Minimum) | Text colours are checked against background via WCAG contrast algorithm; minimum 4.5:1 for normal text |
| 1.4.11 Non-text Contrast | Focus outlines use `#34d399` (≥3:1 on dark backgrounds) |
| 2.1.1 Keyboard | All interactive elements reachable and operable via Tab and Enter/Space |
| 2.4.3 Focus Order | DOM order matches visual reading order; no interactive element is skipped |
| 2.4.6 Headings and Labels | Exactly one `<h1>` per page view; section titles use `<h2>` or lower |
| 4.1.2 Name, Role, Value | Sidebar buttons carry `aria-label` and `aria-current="page"` for the active view |

---

## 2. Keyboard Navigation Guide

All functionality in VerdaTraceAI is accessible using a keyboard without requiring a mouse.

### General Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus forward through interactive elements |
| `Shift + Tab` | Move focus backward through interactive elements |
| `Enter` / `Space` | Activate the focused button, link, or control |
| `Esc` | Dismiss modal dialogs or close dropdown menus |

### Sidebar Navigation

1. Press `Tab` from the page's first focusable element to reach the sidebar.
2. Each sidebar navigation button has an `aria-label` describing the destination view (e.g., `aria-label="Open AI Dashboard"`).
3. The currently active view's button carries `aria-current="page"` so screen readers announce it as the current page.
4. Press `Enter` or `Space` on a sidebar button to navigate to that view.

### Dashboard and Data Views

- **Charts and Gauges**: SVG-based visualisations (e.g., the Green Score gauge, emissions trend chart, Pareto scatter plot) carry `role="img"` and an `aria-label` that includes the chart type and at least one current data point. They are included in the tab order when they convey interactive or important data.
- **Forms and Inputs**: All `<input>`, `<select>`, and `<button>` elements are labelled via `<label>` elements or `aria-label` attributes. Required fields are indicated programmatically.
- **Agent Pipeline**: Each agent node in the `AgentPipeline` component has an `aria-label` that includes the agent's name and its role (e.g., `aria-label="CarbonEstimationAgent: estimates CO2e emissions for the current workload"`).

### Skip Link (Planned)

A "Skip to main content" skip link will be added in a future update to allow keyboard users to bypass repetitive navigation on each page load.

---

## 3. Known Gaps

The following accessibility limitations are known and tracked for remediation:

| # | Gap | WCAG Criterion | Status | Planned Fix |
|---|-----|---------------|--------|-------------|
| 1 | Skip navigation link is absent; keyboard users must Tab through the full sidebar on every page load | 2.4.1 Bypass Blocks | Open | Add a visually-hidden `<a href="#main-content">Skip to main content</a>` as the first focusable element |
| 2 | Chart data is exposed only via `aria-label` summary; individual data points are not accessible in a table or list format | 1.3.1 Info and Relationships | Open | Provide an accessible data table toggle beneath each chart |
| 3 | Colour contrast of secondary (muted) text (`text-slate-400` on dark background) may fall below 4.5:1 in some theme variants | 1.4.3 Contrast (Minimum) | Under review | Audit all muted text tokens; increase to ≥4.5:1 |
| 4 | Focus management after route transitions does not programmatically move focus to the `<h1>` of the new view | 2.4.3 Focus Order | Open | On route change, call `focus()` on the page `<h1>` after React commits the update |
| 5 | `lang` attribute is not updated dynamically in all locale switching paths | 3.1.2 Language of Parts | Open | Ensure all locale-change handlers call `document.documentElement.lang = newLocale` |

Full validation against all 50 WCAG 2.1 AA criteria requires manual testing with assistive technologies (see Section 4). Automated tooling catches roughly 30–40% of WCAG issues; the gaps above were identified through combined automated and manual review.

---

## 4. Manual Validation Instructions

Automated accessibility scans (e.g., axe, Lighthouse) detect only a subset of WCAG issues. The following steps describe how to manually validate VerdaTraceAI using **NVDA** (Windows) and **VoiceOver** (macOS/iOS).

### Using NVDA (Windows — Free)

1. Download and install [NVDA](https://www.nvaccess.org/download/) (version 2023.x or later recommended).
2. Open **Google Chrome** or **Mozilla Firefox**.
3. Navigate to the VerdaTraceAI application URL (local: `http://localhost:5173`; production: Firebase hosting URL).
4. Press `Ctrl + Alt + N` to start NVDA (or launch from the desktop shortcut).
5. Verify the following:
   - Press `Tab` repeatedly and confirm NVDA announces each interactive element with a meaningful label.
   - Press `H` to cycle through headings; confirm exactly one `<h1>` per view and no skipped heading levels.
   - Press `F` to cycle through form fields; confirm all inputs have announced labels.
   - Press `G` to cycle through graphics; confirm charts announce their `aria-label` including chart type and a data value.
   - Navigate to the sidebar and press `Tab` to reach each navigation button; confirm `aria-current="page"` causes NVDA to announce "current page" for the active view.
6. After testing, press `Insert + Q` to quit NVDA.

### Using VoiceOver (macOS — Built-in)

1. Enable VoiceOver: press `Command + F5`, or go to **System Settings → Accessibility → VoiceOver**.
2. Open **Safari** (recommended for best VoiceOver compatibility).
3. Navigate to the VerdaTraceAI application URL.
4. Use the following keyboard shortcuts:
   - `Control + Option + Right Arrow` — move to the next element.
   - `Control + Option + U` — open the Web Rotor to browse headings, links, form controls, and landmarks.
   - `Control + Option + H` — cycle through headings.
5. Verify the same checklist as for NVDA above (headings, form labels, chart ARIA labels, sidebar navigation).
6. Disable VoiceOver: press `Command + F5` again.

### Using VoiceOver (iOS — Built-in)

1. Enable VoiceOver: **Settings → Accessibility → VoiceOver → On**.
2. Open **Safari** and navigate to the VerdaTraceAI production URL.
3. Swipe right to move through elements; double-tap to activate.
4. Use the rotor (rotate two fingers) to switch between Headings, Links, and Form Controls modes.
5. Verify that all interactive elements are reachable and announced with meaningful labels.

### Automated Pre-check (Before Manual Testing)

Run the axe accessibility linter as part of the development workflow:

```bash
# Install axe-core CLI globally
npm install -g @axe-core/cli

# Run against a locally running dev server
axe http://localhost:5173 --tags wcag2a,wcag2aa
```

Review and remediate any violations before proceeding to manual assistive-technology testing. Note that passing axe does not guarantee full WCAG 2.1 AA conformance — manual testing is required.
