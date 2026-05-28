# Cofounder Dashboard Mockup Audit

## TOP 3 PICKS
1. **v07 (Cards + Summary Split)**: Achieves the best balance of cognitive load and actionability by separating the sticky executive summary from the interactive pool cards, with a flawless professional light-mode aesthetic.
2. **v04 (Giant Hero TVL)**: Immediately anchors the user on the primary metric (TVL) with a massive, centralized number, followed by a highly usable full-bleed list, offering extreme simplicity.
3. **v08 (Annual Report Style)**: Delivers immense "big business" credibility through its classic serif typography and Bloomberg-style thin-bordered tables, though mobile table usability is slightly lower.

---

## v01
- **Structural axes used**: Split-screen hero, top horizontal nav, charts-dominant data display.
- **Desktop read_media_file quote**: "The image shows a split-screen layout with a dark blue sidebar/pitch area on the left and KPIs on the right. A top horizontal navigation bar contains the main links. The color scheme is monochrome with a single blue accent. Margins are generous, creating a spacious professional look. The primary CTA 'Connect Wallet' is placed top-right."
- **Mobile read_media_file quote**: "The split-screen collapses into a vertical stack. The navigation is compressed. Touch targets for the pool interactions are large enough, but the chart areas are somewhat squished, making them harder to read on a small screen."

### Scores (Out of 65)
| Category | Principle/Axis | Score | Justification |
| :--- | :--- | :---: | :--- |
| Aesthetic | Whitespace | 4 | Margins are generous and create a spacious look on desktop. |
| Aesthetic | Type | 4 | Clean system sans used effectively. |
| Aesthetic | Palette | 4 | Monochrome with a single blue accent fits the professional constraint. |
| Aesthetic | Hierarchy | 3 | Split screen slightly dilutes the primary TVL focus. |
| Aesthetic | Restraint | 4 | No excessive shadows or decorations observed. |
| HCI | Fitts's Law | 3 | Touch targets are large enough on mobile, but chart compression reduces clarity. |
| HCI | Hick's Law | 4 | Top nav keeps choices limited and manageable. |
| HCI | Miller's 7±2 | 4 | KPIs are chunked logically in the right panel. |
| HCI | F-pattern | 3 | Split layout breaks standard F-pattern slightly. |
| HCI | Signifier vs affordance | 4 | CTA is placed predictably top-right. |
| HCI | Cognitive load | 3 | Squished charts on mobile increase effort to read data. |
| HCI | Aesthetic-usability | 4 | Clean appearance enhances perceived trustworthiness. |
| HCI | Recognition over recall | 4 | Pool names and metrics are always visible next to the charts. |
| **Total** | | **48/65** | |

---

## v02
- **Structural axes used**: Executive summary paragraph, left sidebar nav, pool table dominant.
- **Desktop read_media_file quote**: "This variation features a left sidebar navigation and an executive-summary paragraph in the main area. A wide, dominant pool table spans the content area with clear 1px borders. Typography uses a classic serif for headers and sans for body. Generous whitespace surrounds the main data table. 7-8 KPIs are clearly visible."
- **Mobile read_media_file quote**: "The left sidebar moves to the top as a hamburger or stacked list. The dominant pool table scrolls horizontally. Large 'Connect Wallet' button visible. The text density is high but readable due to the sans-serif body font."

### Scores (Out of 65)
| Category | Principle/Axis | Score | Justification |
| :--- | :--- | :---: | :--- |
| Aesthetic | Whitespace | 4 | Generous whitespace surrounds the main data table on desktop. |
| Aesthetic | Type | 5 | Mixing classic serif headers with sans body creates a highly credible report feel. |
| Aesthetic | Palette | 4 | Clean, professional table styling with light borders. |
| Aesthetic | Hierarchy | 4 | Executive summary flows logically into the detailed table. |
| Aesthetic | Restraint | 5 | 1px borders and no glassmorphism show excellent restraint. |
| HCI | Fitts's Law | 3 | Horizontal scrolling on mobile tables can lead to misclicks. |
| HCI | Hick's Law | 4 | Sidebar cleanly separates navigation from content. |
| HCI | Miller's 7±2 | 3 | 7-8 KPIs push the upper boundary of working memory. |
| HCI | F-pattern | 4 | Left sidebar and top-down flow perfectly match the F-pattern. |
| HCI | Signifier vs affordance | 4 | Table rows clearly look like data elements. |
| HCI | Cognitive load | 3 | High text density and 8 KPIs require more active reading. |
| HCI | Aesthetic-usability | 5 | The financial-report style commands immediate trust. |
| HCI | Recognition over recall | 4 | All necessary context is available in the table headers. |
| **Total** | | **52/65** | |

---

## v03
- **Structural axes used**: Ticker-tape scrolling KPIs, two-row nav, traffic-light health-coloring.
- **Desktop read_media_file quote**: "Shows a two-row navigation layout with the brand on top and links below. A ticker-tape scrolling KPI strip runs across the top. The layout is a split column with traffic-light health-coloring (green/red) on the APRs. The cognitive load is a bit high due to the moving ticker and colored text."
- **Mobile read_media_file quote**: "The ticker-tape is still present but moves faster or is cut off. Two-row nav takes up significant vertical space. The traffic-light colors are very prominent. Touch targets for pools are adequately sized in the bottom half of the screen."

### Scores (Out of 65)
| Category | Principle/Axis | Score | Justification |
| :--- | :--- | :---: | :--- |
| Aesthetic | Whitespace | 2 | Two-row nav and ticker consume too much vertical space. |
| Aesthetic | Type | 3 | Legible, but disrupted by the moving elements. |
| Aesthetic | Palette | 2 | Traffic-light coloring makes it feel slightly cheaper and less enterprise. |
| Aesthetic | Hierarchy | 3 | Ticker distracts from the core page content. |
| Aesthetic | Restraint | 1 | Scrolling animations violate the "conservative, serious" constraint. |
| HCI | Fitts's Law | 4 | Touch targets in the bottom half are adequately sized. |
| HCI | Hick's Law | 3 | Two rows of nav add visual clutter to choices. |
| HCI | Miller's 7±2 | 2 | Moving KPIs make chunking and retention impossible. |
| HCI | F-pattern | 3 | Horizontal scrolling ticker disrupts vertical scanning. |
| HCI | Signifier vs affordance | 3 | Red/green colors might be mistaken for actionable buttons. |
| HCI | Cognitive load | 2 | High cognitive load due to moving parts and bright colors. |
| HCI | Aesthetic-usability | 2 | Ticker tape feels more like a consumer crypto app than a bank. |
| HCI | Recognition over recall | 3 | Must wait for the ticker to loop to see lost data. |
| **Total** | | **33/65** | |

---

## v04
- **Structural axes used**: Single big TVL number centered, top horizontal + secondary tabs, single full-bleed pool list.
- **Desktop read_media_file quote**: "A massive, centralized TVL number dominates the hero section. Top horizontal nav with secondary tabs below it. A single full-bleed pool list follows. Colors are strictly two-accent (brand blue and warning red). Generous whitespace frames the central TVL number."
- **Mobile read_media_file quote**: "The massive TVL number scales down but remains central and highly visible. Full-bleed pool list stretches edge-to-edge. Touch targets for pool rows are huge, spanning the entire width, well-placed in the lower portion of the screen."

### Scores (Out of 65)
| Category | Principle/Axis | Score | Justification |
| :--- | :--- | :---: | :--- |
| Aesthetic | Whitespace | 5 | Generous whitespace frames the central TVL number beautifully. |
| Aesthetic | Type | 5 | Excellent scale contrast between the massive TVL and regular body text. |
| Aesthetic | Palette | 5 | Strictly two-accent, very disciplined and professional. |
| Aesthetic | Hierarchy | 5 | The hero number tells the exact story immediately. |
| Aesthetic | Restraint | 4 | Extremely clean, letting the typography do the work. |
| HCI | Fitts's Law | 5 | Huge full-width rows on mobile provide massive, unmissable touch targets. |
| HCI | Hick's Law | 4 | Secondary tabs neatly organize deeper navigation. |
| HCI | Miller's 7±2 | 5 | Focuses purely on one number before drilling down. |
| HCI | F-pattern | 4 | Centralized content guides the eye straight down the middle. |
| HCI | Signifier vs affordance | 4 | Full-bleed rows naturally imply they can be tapped. |
| HCI | Cognitive load | 5 | Extremely low cognitive load; one primary fact to absorb. |
| HCI | Aesthetic-usability | 5 | Feels like a high-end, exclusive dashboard. |
| HCI | Recognition over recall | 4 | All data is available on the persistent list. |
| **Total** | | **60/65** | |

---

## v05
- **Structural axes used**: KPI grid + first 5 pools, sticky nav with logo+wallet, pool cards grid.
- **Desktop read_media_file quote**: "Features a sticky top navigation containing only the logo and wallet CTA. The hero is a KPI grid, followed by a grid of pool cards. Subtle gradient backgrounds (light blue to white) are used. Sans-serif modern typography throughout. 4 KPIs are clearly visible."
- **Mobile read_media_file quote**: "The pool cards stack neatly into a single column. The sticky nav remains at the top, keeping the wallet CTA always accessible. The cards offer very large touch targets, fulfilling Fitts's Law. Margins are consistent and generous."

### Scores (Out of 65)
| Category | Principle/Axis | Score | Justification |
| :--- | :--- | :---: | :--- |
| Aesthetic | Whitespace | 4 | Consistent and generous margins around the grids. |
| Aesthetic | Type | 4 | Modern sans-serif works well for a clean look. |
| Aesthetic | Palette | 3 | Subtle gradient backgrounds border on consumer-app territory, though light. |
| Aesthetic | Hierarchy | 4 | Grid-to-grid flow is logical but lacks a strong anchor. |
| Aesthetic | Restraint | 3 | Gradients slightly violate strict big-business restraint. |
| HCI | Fitts's Law | 5 | Sticky CTA and large cards offer excellent touch targets. |
| HCI | Hick's Law | 4 | Stripping nav to just logo+wallet focuses the user. |
| HCI | Miller's 7±2 | 5 | 4 KPIs are perfectly within working memory limits. |
| HCI | F-pattern | 4 | Card grids allow easy scanning. |
| HCI | Signifier vs affordance | 5 | Cards inherently look like clickable objects. |
| HCI | Cognitive load | 4 | Data is well-chunked into distinct card containers. |
| HCI | Aesthetic-usability | 4 | High usability, though slightly generic SaaS look. |
| HCI | Recognition over recall | 4 | Sticky nav ensures context is never lost. |
| **Total** | | **53/65** | |

---

## v06
- **Structural axes used**: Split-screen hero, left sidebar, color-by-section grouping, monospace numbers.
- **Desktop read_media_file quote**: "Left sidebar with an executive-report layout containing distinct section headings. The data display groups items by color-by-section. Typography uses monospace numbers for the financial terminal vibe. The visual hierarchy is very clear with large section headers."
- **Mobile read_media_file quote**: "The sidebar collapses, and the sections stack vertically. Monospace numbers ensure all data aligns perfectly, reducing cognitive load. The layout is dense but highly structured like a financial report."

### Scores (Out of 65)
| Category | Principle/Axis | Score | Justification |
| :--- | :--- | :---: | :--- |
| Aesthetic | Whitespace | 4 | Structured sections allow the dense data to breathe. |
| Aesthetic | Type | 5 | Monospace numbers provide a stellar financial-terminal vibe. |
| Aesthetic | Palette | 3 | Color-by-section introduces slightly too many colors for strict minimalism. |
| Aesthetic | Hierarchy | 5 | Large section headers create a very clear scale. |
| Aesthetic | Restraint | 4 | Highly structured and aligned. |
| HCI | Fitts's Law | 4 | Stacked sections on mobile leave adequate room for interactions. |
| HCI | Hick's Law | 4 | Sidebar keeps secondary choices tucked away. |
| HCI | Miller's 7±2 | 4 | Grouping by section effectively chunks the data. |
| HCI | F-pattern | 4 | Sidebar to main content flows perfectly left-to-right. |
| HCI | Signifier vs affordance | 4 | Monospace alignment makes tabular data obviously readable. |
| HCI | Cognitive load | 5 | Aligned numbers drastically reduce the effort to compare values. |
| HCI | Aesthetic-usability | 4 | Looks like a serious tool for serious people. |
| HCI | Recognition over recall | 4 | Section headers keep users grounded in their current context. |
| **Total** | | **54/65** | |

---

## v07
- **Structural axes used**: Split column (cards left, summary right), top horizontal nav, monochrome color signaling.
- **Desktop read_media_file quote**: "Top horizontal nav with a dropdown and 'Connect Wallet' button. Split column layout: 2/3 width for 'Active Liquidity Pools' as distinct white cards on a light grey background, 1/3 width for a sticky 'Protocol Overview' right panel containing 4 KPIs. Monochrome with dark slate text and blue buttons. Very clean, generous whitespace. Clickable 'Manage' buttons on cards."
- **Mobile read_media_file quote**: "Layout stacks vertically: sticky nav, then Protocol Overview, then a vertical stack of Liquidity Pool cards. 'Manage' buttons on the cards provide large touch targets (44pt+) in the bottom half of the screen. Text is crisp and hierarchical."

### Scores (Out of 65)
| Category | Principle/Axis | Score | Justification |
| :--- | :--- | :---: | :--- |
| Aesthetic | Whitespace | 5 | Very clean, generous whitespace between the cards and columns. |
| Aesthetic | Type | 5 | Crisp and hierarchical sans-serif provides excellent readability. |
| Aesthetic | Palette | 5 | Monochrome with dark slate text and a single blue accent is perfectly corporate. |
| Aesthetic | Hierarchy | 5 | The split between the overview panel and interactive cards is flawless. |
| Aesthetic | Restraint | 5 | Plain white cards on light grey with no unnecessary shadows show great restraint. |
| HCI | Fitts's Law | 5 | 'Manage' buttons on cards provide large touch targets (44pt+) in the bottom half of mobile. |
| HCI | Hick's Law | 5 | Dropdown nav and single CTA keep top-level choices under 7. |
| HCI | Miller's 7±2 | 5 | 4 KPIs grouped in the side panel are easily held in working memory. |
| HCI | F-pattern | 4 | Brand top-left, wallet top-right, followed by left-aligned cards. |
| HCI | Signifier vs affordance | 5 | Explicit 'Manage' buttons eliminate any mystery-meat navigation. |
| HCI | Cognitive load | 5 | Numbers sit inside their context on the cards, requiring zero eye-travel. |
| HCI | Aesthetic-usability | 5 | Extremely professional read equals high perceived trustworthiness. |
| HCI | Recognition over recall | 5 | Sticky overview panel means context is never lost. |
| **Total** | | **64/65** | |

---

## v08
- **Structural axes used**: Single big TVL centered, left sidebar, pool table dominant, classic enterprise serif typography.
- **Desktop read_media_file quote**: "Left sidebar navigation. Main content features a giant, centered TVL '$951,356' in a serif font, looking like a corporate annual report. Below are 3 KPI cards with top-border accents (blue, red, blue). A clean, thin-bordered 'Liquidity Pools' table sits at the bottom. Typography heavily relies on traditional serif headers. High perceived trustworthiness."
- **Mobile read_media_file quote**: "Sidebar stacks at the top. The giant serif TVL is very prominent. The KPI cards stack vertically. The table requires horizontal scrolling. The navigation targets in the stacked sidebar are somewhat clustered."

### Scores (Out of 65)
| Category | Principle/Axis | Score | Justification |
| :--- | :--- | :---: | :--- |
| Aesthetic | Whitespace | 4 | Good spacing, though the centered TVL creates some trapped whitespace. |
| Aesthetic | Type | 5 | The traditional serif font explicitly anchors the "big business" credibility. |
| Aesthetic | Palette | 5 | Conservative dark blue and warning red accents. |
| Aesthetic | Hierarchy | 5 | Massive centered TVL perfectly establishes the primary focal point. |
| Aesthetic | Restraint | 5 | Thin borders and zero gradients mirror institutional financial reports. |
| HCI | Fitts's Law | 3 | Navigation targets on the stacked mobile sidebar are somewhat clustered. |
| HCI | Hick's Law | 4 | Sidebar effectively limits main-stage choices. |
| HCI | Miller's 7±2 | 5 | 3 KPI cards plus 1 main TVL fit perfectly under the limit. |
| HCI | F-pattern | 3 | Centered content breaks the standard F-pattern scan. |
| HCI | Signifier vs affordance | 4 | Thin table rows are clean, though slightly less obviously clickable than cards. |
| HCI | Cognitive load | 5 | Data is cleanly separated into high-level cards and low-level tables. |
| HCI | Aesthetic-usability | 5 | The design practically radiates institutional trustworthiness. |
| HCI | Recognition over recall | 4 | All necessary token pairs are persistently visible in the table. |
| **Total** | | **57/65** | |

---

## WINNER
**v07** wins with a score of 64/65. It brilliantly nailed the HCI principles of **Fitts's Law** (large, explicit "Manage" buttons providing 44pt+ targets) and **Cognitive load** (keeping numbers strictly attached to their contexts in cards while anchoring the global stats in a sticky side panel). The monochrome-plus-one-accent palette hit the professional constraint perfectly.

## WHAT TO FIX
To perfect v07 for production, make exactly these 3 concrete tweaks:
1. **Reduce header padding on mobile**: The sticky "Protocol Overview" panel takes up slightly too much vertical space on mobile; tighten the top/bottom padding to expose more of the pool cards immediately without scrolling.
2. **Increase contrast of secondary text**: The light grey text used for "Vol" and "APR" labels needs to be bumped up a few shades darker to ensure WCAG AA compliance against the white cards.
3. **Add a subtle hover state to the cards**: While the "Manage" button signifies clickability, giving the entire card a 1px border color shift on desktop hover will improve the affordance further without breaking the flat design restraint.

verdict: v07 wins on Cognitive load with total 64/65
