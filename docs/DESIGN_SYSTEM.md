# PlusX LPX Mock — Design System Spec

Derived by visual analysis of `references/yahya_mockup_pool_list.jpg` and `references/yahya_mockup_pool_detail.jpg`. Every token below is an approximation from pixel inspection; Jules must implement these exactly in Tailwind v4 CSS variables.

---

## 1. Color Tokens

### Primary Brand

| Token | Hex | Usage |
|---|---|---|
| `--color-brand-teal` | `#00D4AA` | Primary CTA buttons, active tab underline, teal APR values, "Active" badge outline, sparkline (TVL card), Add Liquidity button fill |
| `--color-brand-teal-light` | `#E6FBF7` | Teal button hover bg, stat card tint (TVL sparkline area fill) |
| `--color-brand-teal-dark` | `#00A888` | Teal button :active / pressed state |
| `--color-brand-teal-text` | `#00C49F` | APR numbers in pool list (teal-colored, e.g. "9.20%"), anchor yield numbers |

### Secondary / Accent

| Token | Hex | Usage |
|---|---|---|
| `--color-purple-icon` | `#8B5CF6` | APR Since Inception stat card icon circle bg (lavender/violet) |
| `--color-blue-icon` | `#3B82F6` | TVL stat card icon circle bg |
| `--color-pink-icon` | `#EC4899` | 24H Volume stat card icon circle bg |
| `--color-orange-icon` | `#F97316` | Fees stat card icon circle bg |
| `--color-amber-icon` | `#F59E0B` | Impermanent Loss stat card icon circle bg |
| `--color-green-dot` | `#22C55E` | "Active" status dot, Auto Compound On dot |
| `--color-purple-donut` | `#8B5CF6` | Donut chart outer ring (Fund segment) |
| `--color-teal-donut` | `#00D4AA` | Donut chart inner ring / anchor segment |
| `--color-pink-sparkline` | `#EC4899` | Volume sparkline line color |
| `--color-blue-sparkline` | `#60A5FA` | Throughput sparkline line color |

### Semantic / Status

| Token | Hex | Usage |
|---|---|---|
| `--color-up` | `#22C55E` | Positive change indicators (▲ green) |
| `--color-down` | `#EF4444` | Negative change indicators (▼ red), IL negative value |
| `--color-yield-green` | `#00D4AA` | Maker Yield, Arbitrage Yield, Total Claimable Yield dollar values |
| `--color-managed-badge` | `#6366F1` | "Managed" pill bg (indigo/purple tint) |
| `--color-managed-badge-text` | `#FFFFFF` | Managed pill text |
| `--color-active-badge-border` | `#00D4AA` | "Active" pill border (outline style, teal) |
| `--color-active-badge-text` | `#00D4AA` | "Active" pill text |

### Neutrals / Surface

| Token | Hex | Usage |
|---|---|---|
| `--color-bg-page` | `#F8FAFC` | Page background (very light cool gray) |
| `--color-bg-card` | `#FFFFFF` | Card / container background |
| `--color-bg-row-hover` | `#F0FDF9` | Table row hover (very light teal tint) |
| `--color-bg-row-favorite` | `#F0FDF9` | Favorited/selected row tint (same teal tint, with left border accent) |
| `--color-border` | `#E2E8F0` | Card borders, table dividers, input borders |
| `--color-border-active` | `#00D4AA` | Focused input border, active tab underline |
| `--color-text-primary` | `#0F172A` | Primary text (near-black slate) |
| `--color-text-secondary` | `#64748B` | Secondary / caption text (slate-500) |
| `--color-text-tertiary` | `#94A3B8` | Placeholder text, disabled (slate-400) |
| `--color-text-logo` | `#0F172A` | "PlusX" logotype text |

### Chart Colors (candlestick)

| Token | Hex | Usage |
|---|---|---|
| `--color-candle-up` | `#22C55E` | Green candle body / bullish bar |
| `--color-candle-down` | `#EF4444` | Red candle body / bearish bar |
| `--color-candle-wick` | `#94A3B8` | Candle wick lines |
| `--color-price-line-current` | `#94A3B8` | Current price dashed horizontal line |
| `--color-price-sell` | `#EF4444` | Sell price label / marker (red) |
| `--color-price-buy` | `#22C55E` | Buy price label / marker (green) |
| `--color-price-minbuy` | `#22C55E` | Min buy label (green, slightly lighter) |

---

## 2. Typography

### Font Family

The mockup renders with a clean, geometric sans-serif consistent with Inter or Geist Sans. Jules must use:

```
font-family: 'Inter', 'Geist', system-ui, -apple-system, sans-serif;
```

Import Inter via `next/font/google`. Weight range needed: 400, 500, 600, 700.

### Type Scale

| Role | Size | Weight | Line Height | Color Token | Usage |
|---|---|---|---|---|---|
| `logo` | 22px / 1.375rem | 700 | 1.2 | `--color-text-logo` | "PlusX" nav brand |
| `h1` | 36px / 2.25rem | 700 | 1.1 | `--color-brand-teal` | Stat card large numbers ($130,369,555.55) |
| `h2` | 24px / 1.5rem | 700 | 1.2 | `--color-brand-teal` | Pool detail stat numbers ($2.98M) |
| `h3` | 20px / 1.25rem | 600 | 1.3 | `--color-text-primary` | Pool pair heading (WPLS / DAI(ETH)) |
| `stat-label` | 13px / 0.8125rem | 500 | 1.4 | `--color-text-secondary` | "Total TVL", "24H Volume" card labels |
| `body` | 14px / 0.875rem | 400 | 1.5 | `--color-text-primary` | Table row text, form labels |
| `body-medium` | 14px / 0.875rem | 500 | 1.5 | `--color-text-primary` | Pool pair names in table |
| `caption` | 12px / 0.75rem | 400 | 1.4 | `--color-text-secondary` | Change % labels, "vs last 7 days" |
| `caption-mono` | 11px / 0.6875rem | 400 | 1.3 | `--color-text-tertiary` | Contract addresses, price range values |
| `badge` | 11px / 0.6875rem | 600 | 1 | varies | "Active", "Managed", "Immutable" pills |
| `tab` | 15px / 0.9375rem | 500 | 1 | `--color-text-primary` | Nav tabs |
| `tab-active` | 15px / 0.9375rem | 600 | 1 | `--color-text-primary` | Active nav tab |
| `btn-primary` | 14px / 0.875rem | 600 | 1 | `#FFFFFF` | CTA button text |
| `btn-secondary` | 14px / 0.875rem | 500 | 1 | `--color-text-primary` | Secondary button text |
| `number-mono` | 14px / 0.875rem | 500 | 1 | `--color-text-primary` | TVL, Volume table values |
| `apr-number` | 14px / 0.875rem | 600 | 1 | `--color-brand-teal-text` | APR column values (teal-colored) |

---

## 3. Spacing Scale

Tailwind v4 uses the default spacing scale. Use these gap / padding classes:

| Token | px | Use cases |
|---|---|---|
| `gap-1` / `p-1` | 4px | Icon internal spacing |
| `gap-2` / `p-2` | 8px | Badge internal padding, tight row gaps |
| `gap-3` / `p-3` | 12px | Stat card internal gaps |
| `gap-4` / `p-4` | 16px | Card padding (mobile), table row padding-y |
| `gap-6` / `p-6` | 24px | Card padding (desktop), section gaps |
| `gap-8` / `p-8` | 32px | Between major layout sections |
| `gap-10` | 40px | Page-level vertical rhythm |
| Page horizontal padding | 48px | Max-width content container padding-x |
| Max content width | 1280px | `max-w-7xl mx-auto` |

---

## 4. Card / Container Patterns

### Standard Card

```
background: var(--color-bg-card)        /* #FFFFFF */
border: 1px solid var(--color-border)   /* #E2E8F0 */
border-radius: 16px                     /* rounded-2xl */
padding: 24px                           /* p-6 */
box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
```

### Stat Card (header row — TVL, Volume, Throughput)

- Same as Standard Card
- Fixed height: ~120px
- Left section: label + large number + change indicator
- Right section: sparkline (fills 50% width, bottom-aligned)
- Icon circle: 40x40px, border-radius 50%, color-tinted background (see icon circle colors), contains a Lucide icon at 20px

### Table Container

```
background: var(--color-bg-card)
border: 1px solid var(--color-border)
border-radius: 16px
overflow: hidden          /* clips row hovers to card corners */
```

### Detail Stat Card (pool detail page — 5 cards across top)

- Smaller than header stats: ~100px height
- Icon circle: 36x36px on left
- Label above, large number below
- Sub-label (e.g. "▲ 8784.71% vs yesterday") below number in caption size

---

## 5. Pill / Badge Patterns

### "Active" badge (outline style)

```
border: 1.5px solid var(--color-active-badge-border)  /* teal */
color: var(--color-active-badge-text)
background: transparent
border-radius: 9999px   /* rounded-full */
padding: 2px 10px
font-size: 11px
font-weight: 600
```

Optionally prefix with a green dot (6px circle, `--color-green-dot`) for detail page.

### "Managed" badge (solid indigo)

```
background: var(--color-managed-badge)  /* #6366F1 */
color: #FFFFFF
border-radius: 9999px
padding: 2px 10px
font-size: 11px
font-weight: 600
```

Optionally show a shield icon (Lucide `ShieldCheck`, 12px) inline before the text on detail page.

### "Custom LPX" / "Solo" / "Immutable" badges

- Custom LPX: outline teal (same as Active badge)
- Solo: outline slate border, slate text
- Immutable: outline amber border, amber text

### Mode filter chips (Favorites / Managed Pools / Solo Pools)

```
border: 1px solid var(--color-border)
background: var(--color-bg-card)
color: var(--color-text-secondary)
border-radius: 9999px
padding: 6px 16px
font-size: 13px
font-weight: 500
```

Active chip:
```
border-color: var(--color-brand-teal)
color: var(--color-brand-teal)
background: var(--color-brand-teal-light)
```

---

## 6. Button Variants

### Primary Solid Teal (Connect Wallet, Add Liquidity, Claim Yield)

```
background: var(--color-brand-teal)   /* #00D4AA */
color: #FFFFFF
border-radius: 12px       /* rounded-xl */
padding: 10px 20px
font-size: 14px
font-weight: 600
border: none
transition: background 150ms ease
:hover → background: var(--color-brand-teal-dark)
:active → scale(0.98)
```

The "Claim Yield" button in the detail page uses the same style at full width within its container.

### Outline Secondary (Zap Yield into Pool, Share)

```
background: transparent
border: 1.5px solid var(--color-border)
color: var(--color-text-primary)
border-radius: 12px
padding: 10px 20px
font-size: 14px
font-weight: 500
:hover → border-color: var(--color-brand-teal), color: var(--color-brand-teal)
```

### Ghost / Icon-Only (Back arrow, settings gear, info circle)

```
background: transparent
border: none
color: var(--color-text-secondary)
padding: 8px
border-radius: 8px
:hover → background: var(--color-bg-row-hover), color: var(--color-text-primary)
```

### MAX Button (inside token input)

```
background: var(--color-brand-teal-light)
color: var(--color-brand-teal)
border-radius: 6px
padding: 2px 8px
font-size: 11px
font-weight: 700
border: none
:hover → background: var(--color-brand-teal), color: #FFFFFF
```

### Tab Sub-buttons (Add Liquidity / Remove Liquidity / Price Range / Settings)

```
background: transparent
border-bottom: 2px solid transparent
color: var(--color-text-secondary)
padding: 10px 16px
font-size: 14px
font-weight: 500
:hover → color: var(--color-text-primary)
```

Active tab:
```
border-bottom-color: var(--color-brand-teal)
color: var(--color-text-primary)
font-weight: 600
```

---

## 7. Table Row Pattern

### Column headers

```
font-size: 13px
font-weight: 500
color: var(--color-text-secondary)
padding: 12px 16px
border-bottom: 1px solid var(--color-border)
```

Sort indicator: Lucide `ChevronUp`/`ChevronDown` icon at 14px, color `--color-text-tertiary`. Active sort column shows `--color-brand-teal` chevron and slightly darker header text.

### Table row (default)

```
padding: 14px 16px
border-bottom: 1px solid var(--color-border)
font-size: 14px
background: transparent
transition: background 100ms ease
```

### Table row hover

```
background: var(--color-bg-row-hover)  /* #F0FDF9 */
cursor: pointer
```

### Favorited / selected row

```
background: var(--color-bg-row-favorite)   /* #F0FDF9 */
border-left: 3px solid var(--color-brand-teal)
```

The WPLS row in the mockup has a teal left border and very slight teal background tint.

### Pool icon pair

Two token icon circles (32x32px each) stacked with -8px overlap. Each circle has a white 2px ring between tokens. Use colored SVG placeholders per token (WPLS = purple + teal gradient, DAI = yellow, HEX = dark red, PLSX = purple, etc.).

### Star / favorite icon

Lucide `Star` icon at 16px. Unfavorited: stroke only, `--color-text-tertiary`. Favorited: filled teal `--color-brand-teal`. Click toggles; persist in localStorage key `plusx_favorites`.

---

## 8. Color-Tinted Icon Circles for Stat Cards

Each stat card on the detail page has a 36-40px circle with a light tint and a matching-color icon at 18-20px:

| Stat | Circle bg | Icon color | Icon (Lucide) |
|---|---|---|---|
| APR Since Inception | `#EDE9FE` (violet-100) | `#8B5CF6` | `Target` or `TrendingUp` |
| TVL | `#DBEAFE` (blue-100) | `#3B82F6` | `BarChart3` |
| 24H Volume | `#FCE7F3` (pink-100) | `#EC4899` | `Activity` |
| Fees (24H) | `#DBEAFE` (blue-100) | `#3B82F6` | `Wallet` |
| Impermanent Loss | `#FEF3C7` (amber-100) | `#F59E0B` | `TrendingDown` |

Header stat cards (pool list page) use slightly larger circles (~40px) in the same color families.

---

## 9. Top Nav / Tab Pattern

```
nav {
  height: 64px
  background: #FFFFFF
  border-bottom: 1px solid var(--color-border)
  padding: 0 48px
  display: flex
  align-items: center
  justify-content: space-between
}
```

**Logo:** "PlusX" in 700 weight, ~22px. No icon — text only in the mockup.

**Tabs (center):** Horizontal list with 32px gap between items.

```
tab {
  font-size: 15px
  font-weight: 500
  color: var(--color-text-secondary)
  padding: 8px 4px
  position: relative
  border-bottom: 2px solid transparent
  transition: color 150ms, border-color 150ms
}
tab.active {
  font-weight: 600
  color: var(--color-text-primary)
  border-bottom-color: var(--color-brand-teal)
}
```

**Right side:** PulseChain chain-selector pill + Connect Wallet button.

Chain selector pill:
```
border: 1px solid var(--color-border)
border-radius: 9999px
padding: 6px 12px
font-size: 13px
font-weight: 500
display: flex
align-items: center
gap: 6px
```

Contains a small PulseChain logo SVG (circular purple/pink gradient), the text "PulseChain", and a `ChevronDown` icon. Clicking opens a dropdown.

---

## 10. Sparkline Styling

Used in the 3 header stat cards on the pool list page.

- Library: Recharts `AreaChart` or `LineChart`
- Dimensions: fills card width minus padding, height ~50px
- No axes, no grid, no tooltip by default (or minimal hover tooltip)
- Line width: 2px
- Area fill: gradient from line color at 30% opacity → transparent at 0%
- TVL sparkline: teal line (`#00D4AA`), teal area fill
- Volume sparkline: pink/magenta line (`#EC4899`), pink area fill
- Throughput sparkline: blue line (`#60A5FA`), blue area fill
- Data: generate ~30 pseudo-random data points with a realistic-looking curve (seeded from pool ID so it's stable across renders)

---

## 11. Candlestick Chart Styling

Used in pool detail page (bottom left panel).

- Library: Recharts `ComposedChart` with custom `Bar` shapes for candle bodies + `ErrorBar` or SVG for wicks
- OR use a lightweight custom SVG candlestick renderer (preferred for precision)
- Background: white card, no grid lines visible (or very faint `#F1F5F9` horizontal lines)
- X-axis: date labels (`17`, `19`, `21`, `23`, `25`) in 11px slate text
- Y-axis: hidden (values shown in price label callouts on right side)
- Price labels (right side): "Sell 0.0000073", "Current 0.0000072", "Buy 0.0000070", "Min Buy 0.0000068" — each as a small pill/badge
  - Sell: red `#EF4444` filled pill
  - Buy/Min Buy: green `#22C55E` filled pill
  - Current: gray `#64748B` text, no fill
- Time interval buttons (5m / 15m / 1h / 4h / 1d) below chart: text-only, active one in teal underline or teal text
- Pool label "#1 WPLS/DAI(ETH)" bottom right, in caption size slate text
- Chart height: ~150px within its container

---

## 12. Donut Chart (My Position) Styling

- Library: Recharts `PieChart` with `innerRadius` ~60% of radius
- Two segments: Fund (outer arc, purple `#8B5CF6`) and Anchor (inner arc / second segment, teal `#00D4AA`)
- Center text: "0.85%" in 20px 700 weight, "Share of Pool" in 11px slate-500 below
- Below center: a small info `(i)` icon in slate-400
- No legend — position details listed in the text column to the right of the donut
- Stroke: 2px white gap between segments
- Donut outer diameter: ~130px, inner hole diameter ~80px (so ring thickness ~25px)

---

## 13. Form Input Pattern (Token Selector + Amount + MAX)

Used in Add Liquidity panel.

### Token selector row

```
container {
  border: 1px solid var(--color-border)
  border-radius: 12px
  padding: 12px 16px
  background: var(--color-bg-card)
  display: flex
  align-items: center
  justify-content: space-between
}
```

Left side: Token icon (24px) + token name ("WPLS") + `ChevronDown` icon — clicking opens token selector dropdown.

Right side: Amount input (right-aligned, large text) + USD equivalent below in caption + "Balance: 0.0000 WPLS" + MAX button.

Amount input:
```
font-size: 24px
font-weight: 600
text-align: right
border: none
background: transparent
color: var(--color-text-primary)
width: 100%
:focus → outline: none
```

The two token rows are separated by a small `+` icon centered between them (circle with plus, `--color-text-tertiary`).

### Input focus state

When the container has a focused input inside:
```
border-color: var(--color-brand-teal)
box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15)
```

---

## 14. Slider Pattern (Compound / Harvest)

Used in Compound/Harvest Settings panel on pool detail page.

- Native HTML `<input type="range">` styled with Tailwind + custom CSS
- Track: full width, height 6px, border-radius 3px
- Track left of thumb: `--color-brand-teal` (teal fill)
- Track right of thumb: `--color-border` (gray)
- Thumb: 20px circle, white fill, 2px teal border, subtle drop shadow
- Labels below: "Compound" on left (teal dot, "75%"), "Harvest" on right (purple dot, "25%") — purple for harvest to match the donut chart
- Auto Compound / Auto Harvest: each is a label + custom toggle switch
  - Toggle ON: teal track + white thumb
  - Toggle OFF: gray track + white thumb

---

## 15. Info (i) Icon + Tooltip Pattern

- Icon: Lucide `Info` at 14px, color `--color-text-tertiary`
- Appears inline after metric labels (APR, NTZ, My Position, etc.)
- On hover/focus: show tooltip popover
  - Background: `#0F172A` (dark slate)
  - Text: `#F8FAFC` (near white)
  - Font: 12px, 400 weight, max-width 280px
  - Border-radius: 8px
  - Padding: 8px 12px
  - Arrow: 6px triangle pointing toward the icon
  - Animation: fade in over 150ms

All tooltip text comes verbatim from `data/copy.json` → `tooltips` object. Never invent tooltip text.

---

## 16. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| `sm` | 640px | Stack stat cards vertically |
| `md` | 768px | Show 2 stat cards per row |
| `lg` | 1024px | 3 stat cards in a row, full table visible |
| `xl` | 1280px | Full layout as per mockups |

This is a mock for Telegram link sharing — target 1280px desktop as primary. Mobile is secondary but should not be broken.

---

## 17. Animation / Transitions

- All hover states: `transition: all 150ms ease`
- Row hover: `transition: background 100ms ease`
- Modal open/close: framer-motion `AnimatePresence` with `opacity` 0→1 and `scale` 0.95→1 over 200ms
- Chain dropdown: framer-motion slide down (`y: -8 → 0`, `opacity: 0 → 1`) over 150ms
- Tooltip: CSS `opacity` 0→1 over 150ms, `pointer-events: none` when hidden
- Candlestick chart: Recharts default animate on mount (keep it)
- Donut chart: Recharts default animate on mount (keep it)
- Star toggle: scale 1.3 then 1.0 over 300ms on click

