# Executive Stories - Design Guidelines

## Design Approach

**Selected Approach:** Design System - Fluent Design influenced
**Justification:** This executive training application requires professional credibility, clear information hierarchy, and efficient task completion. The utility-focused nature demands consistency and usability over visual experimentation.

**Core Principles:**
- Executive professionalism: Clean, authoritative, trustworthy
- Information clarity: Complex scenarios presented digestibly
- Focused interaction: Minimize cognitive load during decision-making
- Session continuity: Clear progress and history tracking

---

## Typography

**Font Families:**
- Primary: Inter or Roboto (via Google Fonts CDN)
- Monospace: JetBrains Mono (for card IDs like "F3", "E7")

**Hierarchy:**
- Page titles: text-3xl font-semibold
- Card category headers: text-2xl font-semibold
- Card names: text-xl font-semibold
- Card IDs: text-sm font-mono uppercase tracking-wide
- Body text (scenarios): text-base leading-relaxed
- Challenge questions: text-lg font-medium
- UI labels: text-sm font-medium
- Helper text: text-sm

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-6, p-8
- Section spacing: space-y-6, space-y-8
- Card gaps: gap-4, gap-6
- Input spacing: p-4
- Container margins: mx-auto with max-w-7xl

**Grid Structure:**
- Main container: max-w-7xl mx-auto px-6
- Card deck display: Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6)
- Active scenario: Two-column split (lg:grid-cols-2) - cards on left, response on right

---

## Component Library

### Navigation
- Top navigation bar with session controls
- Deck category tabs (horizontal scrollable on mobile)
- Breadcrumb: Session > Round > Response
- Action buttons: "New Round", "View History", "Save Session"

### Card Components

**Deck Card (Unopened):**
- Aspect ratio container (aspect-square or 3:4)
- Category identifier badge (top-left)
- Card count indicator
- Hover state: subtle elevation increase

**Scenario Card (Active):**
- Distinct card container with border
- Header: Card ID (monospace) + Card name
- Body section: Situation description in paragraph format
- Footer section: Challenge question in emphasized text
- Generous padding (p-6 or p-8)

### Interactive Elements

**Response Area:**
- Large textarea (min-h-48)
- Character count indicator
- "Submit Response" primary button
- "Skip Round" secondary button (text-only or outline)

**History Panel:**
- Collapsible accordion for past rounds
- Timeline-style layout with visual connectors
- Each entry shows: Round number, cards drawn, player response (truncated)
- Expand to view full details

### Session Controls
- Session timer/round counter
- "Start New Session" button
- "Continue Previous" option with session list

### Data Display
- Card statistics: Rounds played, cards encountered
- Simple metrics cards (grid-cols-3) showing: Total rounds, Average response time, Categories explored

---

## Information Architecture

**Main Views:**

1. **Home/Start Screen:**
   - Welcome message
   - "Start New Game" prominent CTA
   - Brief game explanation (2-3 sentences)
   - "Continue Session" if applicable

2. **Active Game View:**
   - Top: Session info bar (round number, timer)
   - Left column: Drawn cards (stack or grid - 6 cards visible)
   - Right column: Response input area with submit controls
   - Bottom: "Draw Next Round" action

3. **History View:**
   - Chronological list of past rounds
   - Filter by card category
   - Search functionality
   - Export session option

---

## Visual Treatments

**Card Visual Identity:**
- Each of 6 categories gets subtle visual distinction through border accent (minimal, 2-3px left border)
- Cards use elevation (shadow-md, shadow-lg on hover)
- Rounded corners: rounded-lg for cards, rounded-md for inputs

**Icons:**
Use Heroicons (outline variant) via CDN for:
- Category badges: briefcase (Context), chart-bar (Finance), clipboard-list (Projects), shield-check (Governance), chat-bubble (Storytelling), light-bulb (Strategy)
- UI actions: arrow-right, clock, bookmark, download
- Navigation: home, chevron-right, menu

**Spacing & Rhythm:**
- Consistent vertical rhythm: py-12 for major sections
- Card internal spacing: p-6 or p-8
- Form elements: p-4
- Button padding: px-6 py-3

---

## Responsive Behavior

**Mobile (base):**
- Single column stack
- Cards in vertical list
- Response area below cards
- Collapsible card details

**Tablet (md:):**
- Two-column where appropriate
- Larger touch targets (min-h-12 for buttons)
- Cards in 2-column grid

**Desktop (lg:):**
- Three-column card grid for deck selection
- Side-by-side scenario + response
- Persistent history sidebar (optional toggle)

---

## Accessibility & Interaction

- All interactive elements min-h-11
- Focus states: ring-2 with appropriate offset
- ARIA labels for card categories
- Keyboard navigation: Tab through cards, Enter to select
- Skip links for main content areas
- Adequate contrast ratios (follow WCAG AA minimum)