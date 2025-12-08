# Executive Balatro - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based - Balatro Gaming Aesthetic
**Justification:** This executive training card game requires visual impact and engagement that mirrors premium gaming experiences while maintaining professional credibility. The Balatro visual language provides the perfect balance of sophisticated aesthetics and compelling interaction.

**Primary Reference:** Balatro (poker roguelike game)
**Key Design Patterns:**
- Dark, luxurious backgrounds with subtle texture
- Illuminated card borders with glow effects
- Spotlight/vignette focus on active gameplay area
- Premium casino/card game visual language
- Smooth, purposeful animations that enhance rather than distract

**Core Principles:**
- Premium gaming aesthetics: Polished, sophisticated, high-end
- Executive intelligence: Smart gamification without trivializing content
- Visual hierarchy through lighting and glow, not just size
- Focused immersion: Eliminate distractions during decision-making

---

## Typography

**Font Families (Google Fonts CDN):**
- Primary: Outfit (modern, clean, slightly geometric - perfect for gaming UI)
- Accent: Cinzel (elegant serif for card names and titles)
- Monospace: JetBrains Mono (card IDs, scores, metrics)

**Hierarchy:**
- Game title/headers: Cinzel, text-4xl font-bold
- Card names: Cinzel, text-2xl font-semibold
- Card IDs: JetBrains Mono, text-xs uppercase tracking-widest
- Scenario text: Outfit, text-base leading-relaxed
- Challenge questions: Outfit, text-lg font-medium
- UI labels: Outfit, text-sm font-semibold uppercase tracking-wide
- Metrics/scores: JetBrains Mono, text-2xl font-bold

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16

**Three-Panel Layout Structure:**
```
Top Bar (fixed, h-20): Round info, timer, current score/streak
Left Panel (w-80): Diagnosis panel, decision history, strategic insights
Center Stage (flex-1): 6 game cards in 2x3 or 3x2 grid with spotlight effect
Right Panel (w-80): Performance indicators, achievements, live metrics
```

**Card Grid:**
- Cards: grid-cols-2 md:grid-cols-3 gap-6 with generous padding p-12
- Each card: aspect-[2/3] (poker card proportions)
- Center area uses flex centering with max-w-6xl

---

## Component Library

### Navigation & Status

**Top Bar:**
- Full-width banner with subtle gradient
- Left: Round number with icon, session timer
- Center: Current scoring streak indicator
- Right: Total score with animated counter, settings icon
- Divider lines with glow effect between sections

**Panel Headers:**
- Uppercase tracking-wide labels with icon
- Subtle divider line with glow underneath
- Collapse/expand functionality with smooth transitions

### Card Components

**Game Card (Premium Design):**
- Container: Rounded corners (rounded-xl), elevated with shadow-2xl
- Border: 2px illuminated border with subtle animated glow pulse
- Header section (p-4):
  - Card ID badge (top-left, monospace, glowing pill)
  - Category icon (top-right, outlined with glow)
- Content area (p-6):
  - Card name (Cinzel font, centered)
  - Scenario text (Outfit, comfortable line height)
  - Challenge question (emphasized with subtle highlight panel)
- Hover state: Increased glow intensity, slight elevation boost
- Selected state: Stronger border glow, pulsing effect
- Card back: Elegant pattern with logo when face-down

**Card States:**
- Face-down: Geometric pattern, dimmed, slight scale reduction
- Revealing: Flip animation (Framer Motion rotateY)
- Active: Full brightness, prominent glow
- Used: Reduced opacity, dimmed glow

### Interactive Panels

**Left Panel - Diagnosis:**
- Title section with icon
- Analysis cards showing decision patterns
- Expandable historical decisions
- Strategic recommendation chips
- Smooth accordion animations for details

**Right Panel - Performance:**
- Live metric cards (grid layout):
  - Round score with trend indicator
  - Streak counter with animation
  - Category mastery progress bars
  - Achievement badges (earned/locked states)
- Animated number counting on score updates
- Radial progress indicators for percentages

### Action Elements

**Primary Button:**
- Solid fill with subtle gradient
- Icon + text combination
- Hover: Glow effect increase, slight scale (1.02)
- Active state: Inner glow
- Disabled: Reduced opacity, no glow

**Secondary Actions:**
- Outline style with glowing border
- Ghost buttons for tertiary actions
- Icon-only buttons for compact areas

**Response Input (when needed):**
- Minimal textarea with subtle border glow on focus
- Character counter with monospace font
- Submit action triggers card animation sequence

---

## Visual Treatments

**Glow & Lighting Effects:**
- Card borders: box-shadow with appropriate glow values
- Active elements: Pulsing glow animation (subtle, 2s loop)
- Hover interactions: Glow intensity increase (1.5x)
- Focus states: ring-2 with matching glow
- Vignette effect on center play area to focus attention

**Category Visual Distinction:**
Each of 6 categories receives unique border glow treatment:
- Context (Briefcase icon): Warm amber glow
- Finance (Chart icon): Cool cyan glow
- Projects (Clipboard icon): Electric blue glow
- Governance (Shield icon): Royal purple glow
- Storytelling (Chat icon): Soft pink glow
- Strategy (Lightbulb icon): Vibrant green glow

**Icons:** Heroicons (outline variant) via CDN
- Gameplay: sparkles, lightning-bolt, trophy, star
- Categories: As specified in existing guidelines
- Navigation: chevron-down, x-mark, bars-3
- Metrics: arrow-trending-up, chart-bar, fire

---

## Animations (Framer Motion)

**Card Interactions:**
- Initial deal: Staggered fade-in + slide from deck position (0.8s ease-out)
- Flip reveal: 3D rotate on Y-axis (0.6s)
- Selection: Scale pulse (1.05x) + glow intensify
- Discard: Slide out + fade (0.4s)

**UI Feedback:**
- Score update: Number count-up animation + brief scale pulse
- Panel transitions: Slide + fade (0.3s ease-in-out)
- Achievement unlock: Scale burst + glow flash (0.8s)
- Hover states: Smooth glow transition (0.2s)

**Constraints:**
- Keep animations purposeful, not distracting
- Respect prefers-reduced-motion
- Max 3 simultaneous card animations
- Disable animations during rapid interactions

---

## Responsive Behavior

**Desktop (lg:+):** Full three-panel layout as described
**Tablet (md:):** Left/right panels collapse to drawer overlays, center cards remain
**Mobile:** Single column, swipeable panels, cards in 2-column grid, top bar condenses

---

## Accessibility

- All interactive elements min-h-11
- Focus states: ring-2 with matching category glow
- Keyboard navigation: Arrow keys for card selection, Enter to confirm
- ARIA labels for all icons and card states
- Reduced motion alternative: Fade transitions only
- High contrast mode support: Maintain glow visibility