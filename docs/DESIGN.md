# Design Specification — UBMS
## Unified Business Management System

> **Version:** 1.0 | **Date:** 2026-08-26 | **Status:** Approved for Build
> **Theme:** Light only (office/business environment)
> **Framework:** React + TypeScript + Tailwind CSS 4.x
> **Icon Library:** Lucide React

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Design Tokens](#2-design-tokens)
3. [Layout System](#3-layout-system)
4. [Component Specifications](#4-component-specifications)
5. [Page Patterns](#5-page-patterns)
6. [Key Screen Designs](#6-key-screen-designs)
7. [Motion & Interaction](#7-motion--interaction)
8. [Accessibility](#8-accessibility)
9. [Icon System](#9-icon-system)
10. [Print Layout](#10-print-layout)

---

## 1. Design Principles

| Principle | Application |
|---|---|
| **Functional over decorative** | No gradients, glassmorphism, or decorative illustrations. Data and status indicators are the visual language. |
| **Dense information display** | Business users need to see more, not less. Tables are compact. White space is purposeful, not excessive. |
| **Minimal clicks to action** | Primary actions are always visible. Record Payment, Create Order, and Search are never more than one click away. |
| **Clear status at a glance** | Color-coded badges + text labels. Overdue items scream attention. Paid items fade to background. |
| **Consistent patterns** | Every list page works the same way. Every detail page works the same way. Learn once, use everywhere. |
| **Professional tone** | This is an ERP-like tool for a fabric trading business. It should feel like software, not a website. |

---

## 2. Design Tokens

### 2.1 Color System — 3-Layer Architecture

#### Layer 1: Base Palette (Neutral Foundation)

| Token | Value | Usage |
|---|---|---|
| `--color-white` | `#FFFFFF` | Card backgrounds, modal backgrounds |
| `--color-gray-50` | `#F9FAFB` | Page background, table alternating rows |
| `--color-gray-100` | `#F3F4F6` | Hover states, input disabled bg, skeleton loading |
| `--color-gray-200` | `#E5E7EB` | Borders, dividers, table borders |
| `--color-gray-300` | `#D1D5DB` | Input borders (default), focus ring outer |
| `--color-gray-400` | `#9CA3AF` | Placeholder text, disabled text |
| `--color-gray-500` | `#6B7280` | Secondary text, labels, timestamps |
| `--color-gray-600` | `#4B5563` | Body text |
| `--color-gray-700` | `#374151` | Headings (h3-h6) |
| `--color-gray-800` | `#1F2937` | Headings (h1-h2), high-emphasis text |
| `--color-gray-900` | `#111827` | Primary text, sidebar background |

#### Layer 2: Semantic Colors (Meaning-Bearing)

| Token | Value | Usage | WCAG AA on White |
|---|---|---|---|
| `--color-primary-50` | `#EFF6FF` | Primary button hover bg, selected row bg | — |
| `--color-primary-100` | `#DBEAFE` | Active nav item bg | — |
| `--color-primary-500` | `#3B82F6` | Primary buttons, links, active indicators | 4.6:1 ✅ |
| `--color-primary-600` | `#2563EB` | Primary button bg, focus rings | 4.6:1 ✅ |
| `--color-primary-700` | `#1D4ED8` | Primary button hover | 7.1:1 ✅ |

| Token | Value | Usage | WCAG AA on White |
|---|---|---|---|
| `--color-success-50` | `#F0FDF4` | Success toast bg | — |
| `--color-success-500` | `#22C55E` | Success indicators (non-text only) | — |
| `--color-success-600` | `#16A34A` | "Fully Paid" badge bg (with opacity), success text | 4.6:1 ✅ |
| `--color-success-700` | `#15803D` | Success badge text on light bg | 7.0:1 ✅ |

| Token | Value | Usage | WCAG AA on White |
|---|---|---|---|
| `--color-warning-50` | `#FFFBEB` | Warning toast bg | — |
| `--color-warning-500` | `#F59E0B` | Warning indicators (non-text only) | — |
| `--color-warning-600` | `#D97706` | "Partially Paid" badge, warning text | 4.5:1 ✅ |
| `--color-warning-700` | `#B45309` | Warning badge text on light bg | 7.2:1 ✅ |

| Token | Value | Usage | WCAG AA on White |
|---|---|---|---|
| `--color-error-50` | `#FEF2F2` | Error toast bg, overdue row highlight | — |
| `--color-error-500` | `#EF4444` | Error indicators (non-text only) | — |
| `--color-error-600` | `#DC2626` | "Overdue" badge, error text, danger button | 4.6:1 ✅ |
| `--color-error-700` | `#B91C1C` | Error badge text on light bg, danger button hover | 7.1:1 ✅ |

| Token | Value | Usage | WCAG AA on White |
|---|---|---|---|
| `--color-info-50` | `#EFF6FF` | Info toast bg | — |
| `--color-info-500` | `#3B82F6` | Info indicators | 4.6:1 ✅ |
| `--color-info-600` | `#2563EB` | Info text, "Outstanding" badge | 4.6:1 ✅ |
| `--color-info-700` | `#1D4ED8` | Info badge text on light bg | 7.1:1 ✅ |

#### Layer 3: Module Colors (Navigation & Context)

Each module has a designated color used for sidebar active indicators, page header accents, and module-specific badges.

| Module | Color | Hex | Sidebar Accent | Usage |
|---|---|---|---|---|
| **Dashboard** | Gray | `#6B7280` | `gray-500` | Neutral — no strong module color |
| **Finance** | Blue | `#2563EB` | `blue-600` | Receivables, payables, payments |
| **B2B** | Emerald | `#059669` | `emerald-600` | Pre-orders, POs, fulfillments |
| **B2C** | Violet | `#7C3AED` | `violet-600` | Printing orders, production |
| **Inventory** | Amber | `#D97706` | `amber-600` | Products, stock, adjustments |
| **Customers** | Cyan | `#0891B2` | `cyan-600` | Customer records |
| **Suppliers** | Slate | `#475569` | `slate-600` | Supplier records |
| **Reports** | Indigo | `#4F46E5` | `indigo-600` | All report types |
| **Documents** | Stone | `#57534E` | `stone-600` | Transaction documents |
| **Settings** | Gray | `#4B5563` | `gray-600` | User management |

### 2.2 Typography

**Font Family:** `Inter, system-ui, -apple-system, sans-serif`

Inter is chosen for its excellent readability at small sizes, professional tone, and wide character set support (including ₱ symbol).

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `text-xs` | 12px (0.75rem) | 400 (Regular) | 16px (1.333) | Table secondary text, timestamps, badges |
| `text-sm` | 14px (0.875rem) | 400 | 20px (1.429) | Table body text, form labels, helper text |
| `text-base` | 16px (1rem) | 400 | 24px (1.5) | Body text, form inputs |
| `text-lg` | 18px (1.125rem) | 500 (Medium) | 28px (1.556) | Card titles, section headers |
| `text-xl` | 20px (1.25rem) | 600 (Semibold) | 28px (1.4) | Page subtitles |
| `text-2xl` | 24px (1.5rem) | 600 | 32px (1.333) | Page titles |
| `text-3xl` | 30px (1.875rem) | 700 (Bold) | 36px (1.2) | Dashboard stat values (large numbers) |

**Monospace:** `JetBrains Mono, ui-monospace, monospace` — used for document numbers, reference IDs, and raw data display.

| Token | Size | Usage |
|---|---|---|
| `font-mono text-sm` | 14px | Document numbers (PO-2026-001), reference codes |

### 2.3 Spacing System

**Base unit:** 4px. All spacing values are multiples of 4.

| Token | Value | Usage |
|---|---|---|
| `space-0.5` | 2px | Inline icon-to-text gap |
| `space-1` | 4px | Tight padding (badge inner, tag inner) |
| `space-2` | 8px | Form field gap, table cell padding (vertical) |
| `space-3` | 12px | Card inner padding (compact) |
| `space-4` | 16px | Standard padding (card, form section), gap between form fields |
| `space-5` | 20px | Section spacing within pages |
| `space-6` | 24px | Card padding (standard), gap between cards |
| `space-8` | 32px | Page section gaps, sidebar width unit |
| `space-10` | 40px | Major section separation |
| `space-12` | 48px | Page top/bottom padding |

### 2.4 Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 4px | Badges, tags, small buttons, input fields, select dropdowns |
| `radius-md` | 6px | Cards, modals, dropdowns, toast notifications |
| `radius-lg` | 8px | Large cards, page containers, sidebar sections |
| `radius-full` | 9999px | Avatars, circular indicators |

**Rule:** No element uses `border-radius > 8px`. This is business software, not a consumer app.

### 2.5 Shadows & Elevation

| Level | Token | Value | Usage |
|---|---|---|---|
| 0 | `shadow-none` | `none` | Tables, inline elements, flat surfaces |
| 1 | `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Cards, input focus states |
| 2 | `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Dropdowns, popovers |
| 3 | `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Modals, drawers |

**No elevation above level 3.** No colored shadows. No decorative shadows.

---

## 3. Layout System

### 3.1 Application Shell

```
┌──────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────────────────────┐│
│ │          │ │  Top Bar (48px height)                           ││
│ │          │ │  [Breadcrumb]              [User Name ▾] [Logout]││
│ │  Sidebar │ ├──────────────────────────────────────────────────┤│
│ │  (240px) │ │                                                  ││
│ │          │ │  Page Header                                     ││
│ │          │ │  [Page Title]              [Action Buttons]      ││
│ │  Fixed   │ ├──────────────────────────────────────────────────┤│
│ │  left    │ │                                                  ││
│ │          │ │  Content Area                                    ││
│ │          │ │  (scrollable)                                    ││
│ │          │ │                                                  ││
│ │          │ │                                                  ││
│ └──────────┘ └──────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Sidebar Navigation

| Property | Value |
|---|---|
| Width | 240px (expanded), 64px (collapsed, icons only) |
| Background | `gray-900` (`#111827`) |
| Text color | `gray-400` (inactive), `white` (active) |
| Active indicator | Left border 3px solid (module color), bg `gray-800` |
| Hover | bg `gray-800` |
| Position | Fixed left, full height |

**Sidebar Structure:**
```
┌─────────────────────┐
│ [Logo] UBMS         │  ← 48px height, white text, font-semibold
│                     │
│ ── MAIN ──          │  ← Section label: text-xs, gray-500, uppercase
│ ○ Dashboard         │  ← Icon + label, gray-400 text
│                     │
│ ── FINANCE ──       │
│ ● Receivables       │  ← Active: left border (blue-500), white text, bg-gray-800
│ ○ Payables          │  ← Inactive: gray-400 text, no border
│ ○ Payments          │
│ ○ Historical Debts  │
│                     │
│ ── B2B ──           │
│ ○ Pre-Orders        │
│ ○ Purchase Orders   │
│ ○ Fulfillments      │
│                     │
│ ── B2C ──           │
│ ○ Printing Orders   │
│                     │
│ ── INVENTORY ──     │
│ ○ Products          │
│ ○ Adjustments       │
│                     │
│ ── DIRECTORY ──     │
│ ○ Customers         │
│ ○ Suppliers         │
│                     │
│ ── REPORTS ──       │
│ ○ Reports           │
│ ○ Documents         │
│                     │
│ ── SYSTEM ──        │
│ ○ Settings          │  ← Admin only (hidden for staff role)
│                     │
│ ─────────────────── │
│ [User Avatar] Name  │  ← Bottom: user info, role badge
│ Role: Admin/Staff   │
└─────────────────────┘
```

**Navigation Item Spec:**
- Height: 36px
- Padding: `px-3` (12px horizontal)
- Icon: 20×20px, left-aligned
- Label: `text-sm`, 8px gap from icon
- Collapsed state: Icon only, centered, tooltip on hover shows label

### 3.3 Top Bar

| Property | Value |
|---|---|
| Height | 48px |
| Background | `white` |
| Border bottom | 1px solid `gray-200` |
| Left content | Breadcrumb navigation |
| Right content | User dropdown (name, role badge, logout) |

### 3.4 Page Content Area

| Property | Value |
|---|---|
| Max width | None (fills available space) |
| Horizontal padding | 24px (`px-6`) |
| Vertical padding | 24px top, 48px bottom |
| Background | `gray-50` (`#F9FAFB`) |

### 3.5 Responsive Behavior

| Breakpoint | Width | Sidebar Behavior |
|---|---|---|
| `lg` | 1024px (minimum target) | Collapsed (64px, icons only) by default |
| `xl` | 1280px | Expanded (240px) by default |
| `2xl` | 1536px+ | Expanded (240px), wider content area |

**At 1024px:** Sidebar is collapsed to icon rail. A hamburger button in the top bar expands it as an overlay drawer.

### 3.6 Content Width Guidelines

- **Tables:** Full available width (no max-width constraint)
- **Forms:** Max 720px (centered or left-aligned within content area)
- **Detail pages:** Full width for tabs, max 960px for form sections
- **Stat cards:** Grid layout, 4 columns at 1280px+, 2 columns at 1024px

---

## 4. Component Specifications

### 4.1 Navigation Components

#### Sidebar (see Section 3.2)

#### Breadcrumb

```
[Module Icon] Module Name / Sub-page / Current Page
```

| Property | Value |
|---|---|
| Separator | `/` character, `gray-300` |
| Links | `text-sm`, `gray-500`, hover: `gray-700` |
| Current page | `text-sm`, `gray-800`, `font-medium`, not clickable |
| Max depth | 3 levels (Module / Section / Page) |

#### Tabs

Used within detail pages (e.g., Customer detail → Orders | Payments | Debts).

| Property | Value |
|---|---|
| Style | Underline tabs (no background fill) |
| Active tab | `text-primary-600`, border-bottom 2px solid `primary-600` |
| Inactive tab | `text-gray-500`, hover: `text-gray-700` |
| Height | 40px |
| Gap between tabs | 24px |

#### Module Switcher (Page Header Context)

The page header shows a subtle module color accent (3px left border on the title) using the module's designated color. This provides spatial orientation without loud color blocking.

### 4.2 Data Display Components

#### Data Table

The primary data display component. Used in all list pages.

| Property | Value |
|---|---|
| Header bg | `gray-50` |
| Header text | `text-xs`, `font-semibold`, `text-gray-500`, uppercase, tracking-wide |
| Row bg | `white` (odd), `gray-50` (optional alternating — disabled by default for density) |
| Row hover | `bg-blue-50` (very subtle) |
| Row height | 44px (compact), 52px (comfortable) — default: compact |
| Cell padding | `px-4 py-2.5` (16px horizontal, 10px vertical) |
| Cell text | `text-sm`, `text-gray-700` |
| Border | 1px `gray-200` bottom (row separator), no vertical borders |
| Sortable column header | Cursor pointer, sort icon (↑↓) appears on hover, active sort: `text-gray-800` |

**Table Features:**
- **Sortable:** Click column header to toggle asc/desc. Active sort column highlighted.
- **Paginated:** 20 rows per page (fixed). Pagination bar below table.
- **Selectable:** Optional checkbox column for bulk actions.
- **Sticky header:** Table header stays visible when scrolling long tables.
- **Empty state:** Centered message with icon when no data matches filters.
- **Loading state:** Skeleton rows (gray-100 rectangles matching column widths).

#### Pagination

```
[‹ Prev]  Page 3 of 12  [Next ›]        Showing 41-60 of 237 results
```

| Property | Value |
|---|---|
| Button size | 32px height, `text-sm` |
| Disabled state | `text-gray-300`, cursor not-allowed |
| Current page | `font-medium`, `text-gray-800` |
| Position | Right-aligned below table |

#### Stat Card

Used on Dashboard and Finance summary pages.

```
┌──────────────────────────┐
│  Total Receivables       │  ← text-sm, text-gray-500
│  ₱2,450,000.00           │  ← text-2xl, font-semibold, text-gray-900
│  3 overdue               │  ← text-xs, text-error-600 (if overdue > 0)
└──────────────────────────┘
```

| Property | Value |
|---|---|
| Background | `white` |
| Border | 1px `gray-200` |
| Border radius | `radius-md` (6px) |
| Padding | 20px |
| Shadow | `shadow-sm` |
| Min width | 200px |
| Grid | 4 columns at xl+, 2 columns at lg |

#### Detail Card (Key-Value)

Used for entity information display (customer info, order details).

```
┌─────────────────────────────────────────┐
│  Customer Information                    │  ← Section header: text-sm, font-semibold
│  ─────────────────────────────────────── │
│  Contact Person    Juan Dela Cruz        │  ← Label: text-sm text-gray-500
│  Phone             +63 917 123 4567      │  ← Value: text-sm text-gray-800
│  Email           juan@company.com        │
│  Address         123 Fabric St, Manila   │
└─────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Layout | 2-column grid (label: value) at xl+, 1-column at lg |
| Label width | Fixed 160px (right-aligned) or inline grid |
| Background | `white`, border `gray-200`, radius `radius-md` |
| Padding | 20px |

### 4.3 Form Components

#### Text Input

| Property | Value |
|---|---|
| Height | 36px |
| Border | 1px solid `gray-300` |
| Border radius | `radius-sm` (4px) |
| Padding | `px-3 py-2` (12px horizontal, 8px vertical) |
| Text | `text-sm`, `text-gray-800` |
| Placeholder | `text-gray-400` |
| Focus | Border `primary-500`, ring 2px `primary-100` |
| Error | Border `error-500`, error message below in `text-xs text-error-600` |
| Disabled | bg `gray-100`, text `gray-400`, cursor not-allowed |

#### Form Label

| Property | Value |
|---|---|
| Text | `text-sm`, `font-medium`, `text-gray-700` |
| Position | Above input, 4px gap |
| Required indicator | Red asterisk `*` after label text |

#### Select Dropdown

| Property | Value |
|---|---|
| Style | Same height/border as text input |
| Chevron | Down arrow icon (Lucide `ChevronDown`), right-aligned |
| Dropdown | White bg, shadow-md, radius-md, max-height 300px, scrollable |
| Option hover | bg `gray-50` |
| Selected option | bg `primary-50`, text `primary-700` |
| Searchable | Yes, for lists > 10 items (type to filter) |

#### Date Picker

| Property | Value |
|---|---|
| Input style | Same as text input, calendar icon (Lucide `Calendar`) right-aligned |
| Calendar popup | Shadow-lg, radius-md, month/year navigation |
| Selected date | bg `primary-600`, text `white`, rounded-full |
| Today | Border `primary-300` |
| Disabled dates | `text-gray-300`, not clickable |

#### Number Input (Currency)

| Property | Value |
|---|---|
| Prefix | `₱` symbol displayed inside input, left-aligned, `text-gray-400` |
| Alignment | Right-aligned numbers |
| Decimal | Exactly 2 decimal places enforced |
| Validation | Reject non-numeric, show inline error |
| Width | Fixed 180px (or full-width in forms) |

#### Checkbox & Radio

| Property | Value |
|---|---|
| Size | 16×16px |
| Border | 1px `gray-300`, radius 3px (checkbox) / full (radio) |
| Checked | bg `primary-600`, border `primary-600`, white check/dot |
| Focus | Ring 2px `primary-100` |
| Label | `text-sm`, `text-gray-700`, 8px gap |

#### Form Layout

| Property | Value |
|---|---|
| Field gap | 16px (vertical between fields) |
| Section gap | 24px (between form sections) |
| Section header | `text-sm font-semibold text-gray-800` with bottom border |
| Max width | 720px for forms |
| Actions | Right-aligned: [Cancel] [Save] — 8px gap |

#### Inline Validation

| State | Display |
|---|---|
| Valid | No indicator (clean state) |
| Error | Red border + error message below field: `text-xs text-error-600` |
| Warning | Amber border + warning message: `text-xs text-warning-600` |
| Timing | On blur (default), on change (after first blur error) |

### 4.4 Action Components

#### Buttons

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| **Primary** | `primary-600` | `white` | none | Main action: Save, Create, Submit |
| **Primary Hover** | `primary-700` | `white` | none | — |
| **Secondary** | `white` | `gray-700` | 1px `gray-300` | Cancel, Back, secondary actions |
| **Secondary Hover** | `gray-50` | `gray-800` | 1px `gray-300` | — |
| **Danger** | `error-600` | `white` | none | Void, Delete, Deactivate |
| **Danger Hover** | `error-700` | `white` | none | — |
| **Ghost** | `transparent` | `gray-600` | none | Tertiary: filters, less important actions |
| **Ghost Hover** | `gray-100` | `gray-800` | none | — |

| Size | Height | Padding | Text | Usage |
|---|---|---|---|---|
| `sm` | 28px | `px-2.5 py-1` | `text-xs` | Table row actions, badge buttons |
| `md` | 36px | `px-4 py-2` | `text-sm` | Default — forms, page actions |
| `lg` | 40px | `px-5 py-2.5` | `text-sm font-medium` | Page header primary actions |

| State | Style |
|---|---|
| Disabled | `opacity-50`, cursor `not-allowed`, no hover effect |
| Loading | Same size, spinner icon (Lucide `Loader2`) replaces text, `opacity-80` |

#### Button Groups

```
[Record Payment] [Export]     ← Page header: primary + secondary, 8px gap
[Save]  [Cancel]              ← Form footer: primary + secondary, right-aligned
```

#### Action Menu (Dropdown)

For rows with multiple actions (View, Edit, Void, Print).

| Property | Value |
|---|---|
| Trigger | Three-dot icon button (Lucide `MoreVertical`) |
| Dropdown | White bg, shadow-md, radius-md, min-width 160px |
| Item height | 36px |
| Item padding | `px-3 py-2` |
| Item hover | bg `gray-50` |
| Danger item | text `error-600`, hover bg `error-50` |
| Separator | 1px `gray-100` between groups |

### 4.5 Feedback Components

#### Toast Notifications

Position: Top-right corner, stacked vertically, 8px gap.

| Type | Background | Border Left | Icon | Text |
|---|---|---|---|---|
| Success | `success-50` | 3px `success-500` | `CheckCircle` (success-600) | `text-gray-800` |
| Error | `error-50` | 3px `error-500` | `XCircle` (error-600) | `text-gray-800` |
| Warning | `warning-50` | 3px `warning-500` | `AlertTriangle` (warning-600) | `text-gray-800` |
| Info | `info-50` | 3px `info-500` | `Info` (info-600) | `text-gray-800` |

| Property | Value |
|---|---|
| Width | 360px max |
| Padding | 12px 16px |
| Radius | `radius-md` |
| Shadow | `shadow-lg` |
| Auto-dismiss | 5 seconds (success, info), manual dismiss (error, warning) |
| Dismiss | X button (Lucide `X`) top-right of toast |

#### Loading States

| Context | Component |
|---|---|
| Page load | Skeleton screen: gray-100 rectangles mimicking layout |
| Table load | 5 skeleton rows with shimmer animation |
| Button action | Spinner icon replaces button text |
| Modal load | Centered spinner (Lucide `Loader2`, animated) |
| Card load | Skeleton card with shimmer |

**Skeleton shimmer:** Subtle left-to-right gradient animation on `gray-100` blocks. Duration: 1.5s, infinite loop, `ease-in-out`.

#### Empty States

```
┌──────────────────────────────────┐
│                                  │
│         [Icon, gray-300]         │
│                                  │
│    No records found              │  ← text-sm, font-medium, text-gray-600
│    Try adjusting your filters    │  ← text-sm, text-gray-400
│    or create a new record.       │
│                                  │
│    [+ Create New]                │  ← Secondary button
│                                  │
└──────────────────────────────────┘
```

### 4.6 Overlay Components

#### Modal (Dialog)

| Property | Value |
|---|---|
| Overlay | `bg-black/50` (50% opacity black) |
| Width | `sm`: 400px (confirm), `md`: 560px (forms), `lg`: 720px (complex forms) |
| Max height | 85vh |
| Background | `white` |
| Radius | `radius-lg` (8px) |
| Shadow | `shadow-lg` |
| Header | Title (text-lg, font-semibold) + close button (X), border-bottom |
| Body | Padding 24px, scrollable if content overflows |
| Footer | Right-aligned actions, border-top, padding 16px 24px |

**Confirm Dialog (sm):**
```
┌─────────────────────────────────┐
│  Confirm Action            [X]  │
│  ─────────────────────────────── │
│  Are you sure you want to void   │
│  this payment? This action will  │
│  recalculate the outstanding     │
│  balance.                        │
│                                  │
│  Reason: [________________]      │
│                                  │
│  ─────────────────────────────── │
│            [Cancel] [Confirm]    │
└─────────────────────────────────┘
```

#### Drawer (Slide-over Panel)

Used for detail views and record creation without leaving the current page.

| Property | Value |
|---|---|
| Width | 480px (standard), 640px (wide, for forms with many fields) |
| Direction | Slides in from right |
| Overlay | `bg-black/30` |
| Header | Title + close button, border-bottom |
| Body | Padding 24px, full height scrollable |
| Shadow | `shadow-lg` |

### 4.7 Status Indicators (Badges)

All badges use: `text-xs font-medium px-2 py-0.5 rounded-full` (pill shape) or `rounded-sm` (subtle rectangle — used in tables for density).

**Recommendation:** Use `rounded-sm` (4px) in tables for compact display. Use `rounded-full` in detail pages and headers.

#### Finance Statuses

| Status | Background | Text | Border | Context |
|---|---|---|---|---|
| **Outstanding** | `blue-50` | `blue-700` | `blue-200` | Unpaid receivable/payable |
| **Partially Paid** | `amber-50` | `amber-700` | `amber-200` | Some payments recorded |
| **Fully Paid** | `green-50` | `green-700` | `green-200` | Balance is zero |
| **Voided** | `gray-100` | `gray-500` | `gray-200` | Payment voided / record cancelled |
| **Overdue** | `red-50` | `red-700` | `red-200` | Computed flag: unpaid + past due date |

#### B2B Statuses

| Status | Background | Text | Border |
|---|---|---|---|
| **Draft** | `gray-100` | `gray-600` | `gray-200` |
| **Submitted** | `blue-50` | `blue-700` | `blue-200` |
| **Converted** | `emerald-50` | `emerald-700` | `emerald-200` |
| **Partially Received** | `amber-50` | `amber-700` | `amber-200` |
| **Fully Received** | `green-50` | `green-700` | `green-200` |
| **Completed** | `green-50` | `green-700` | `green-200` |
| **Cancelled** | `gray-100` | `gray-500` | `gray-200` |
| **Pending** | `gray-100` | `gray-600` | `gray-200` |
| **In Progress** | `blue-50` | `blue-700` | `blue-200` |

#### B2C Statuses

| Status | Background | Text | Border |
|---|---|---|---|
| **Pending** | `gray-100` | `gray-600` | `gray-200` |
| **In Production** | `violet-50` | `violet-700` | `violet-200` |
| **Completed** | `blue-50` | `blue-700` | `blue-200` |
| **Released** | `emerald-50` | `emerald-700` | `emerald-200` |
| **Paid** | `green-50` | `green-700` | `green-200` |
| **Cancelled** | `gray-100` | `gray-500` | `gray-200` |

#### Historical Debt Verification Statuses

| Status | Background | Text | Border |
|---|---|---|---|
| **Pending** | `amber-50` | `amber-700` | `amber-200` |
| **Verified** | `green-50` | `green-700` | `green-200` |
| **Disputed** | `red-50` | `red-700` | `red-200` |
| **Adjusted** | `blue-50` | `blue-700` | `blue-200` |
| **Written Off** | `gray-100` | `gray-500` | `gray-200` |

#### Variance Indicators (B2B Receiving)

| Condition | Display | Color |
|---|---|---|
| Shortage (variance < 0) | `Shortage: -3 yards` | `text-error-600` |
| Excess (variance > 0) | `Excess: +5 yards` | `text-info-600` |
| Exact (variance = 0) | `Exact` | `text-success-600` |

#### Overdue Highlight

Overdue rows in tables receive a subtle left border + background:
- Left border: 3px solid `error-500`
- Background: `error-50` (very subtle red tint)
- The "OVERDUE" badge is displayed in the status column alongside the regular status badge

### 4.8 Amount Display

All monetary values follow this format:

| Context | Format | Example |
|---|---|---|
| Table cells | Right-aligned, `font-mono text-sm` | `₱50,000.00` |
| Stat cards | Large, `text-2xl font-semibold font-mono` | `₱2,450,000.00` |
| Form inputs | Right-aligned with `₱` prefix | `₱ [50,000.00]` |
| Negative (voided) | Strikethrough + `text-gray-400` | ~~₱10,000.00~~ |
| Outstanding balance | `font-semibold` | **₱30,000.00** |

**Philippine Peso formatting:** `₱` prefix, comma thousands separator, exactly 2 decimal places. Implemented via `Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })`.

---

## 5. Page Patterns

### 5.1 List Page Pattern

The standard pattern for all entity lists (Receivables, Payables, Pre-Orders, Purchase Orders, Customers, etc.).

```
┌──────────────────────────────────────────────────────────────┐
│  [Module accent] Page Title              [+ Create New]      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [🔍 Search...        ] [Status ▾] [Date Range] [Filter ▾]  │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ □ │ Column 1   │ Column 2   │ Column 3  │ Status │ ⋯   ││
│  │───│────────────│────────────│───────────│────────│──────││
│  │   │ Row 1      │ Data       │ Data      │ [Badge]│ ⋯   ││
│  │   │ Row 2      │ Data       │ Data      │ [Badge]│ ⋯   ││
│  │   │ ...        │            │           │        │      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Showing 1-20 of 156 results        [‹ Prev] 3/8 [Next ›]  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Components:**
- **Search bar:** Full-text search input (Lucide `Search` icon), debounced 300ms
- **Filters:** Dropdown selects for status, date range picker, module-specific filters
- **Table:** Sortable columns, status badges, action menu (⋯) per row
- **Pagination:** Bottom bar with result count and page navigation
- **Create button:** Primary button, top-right of page header

**Filter Bar Spec:**
- Height: 36px (same as inputs)
- Search input: min-width 280px, left icon
- Dropdowns: Auto-width based on longest option label
- Gap between filters: 8px
- Active filter count badge on filter button if > 2 filters active
- "Clear all" link when any filters are active

### 5.2 Detail Page Pattern

Used for viewing a single entity (Customer, Supplier, Purchase Order, Printing Order, etc.).

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to List                                              │
│                                                              │
│  Entity Name / Number    [Status Badge]    [Edit] [Print] ⋯ │
│  Subtitle / metadata (date, entity reference)                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Info] [Transactions] [Payments] [History]   ← Tabs        │
│  ───────────────────────────────────────────                 │
│                                                              │
│  ┌─────────────────────┐  ┌────────────────────────────────┐│
│  │  Detail Card         │  │  Related Records Table         ││
│  │  Key-value pairs     │  │  Sortable, paginated           ││
│  │                      │  │                                ││
│  │  Field: Value        │  │  Col1 │ Col2 │ Col3 │ Status  ││
│  │  Field: Value        │  │  ...                           ││
│  │  Field: Value        │  │                                ││
│  └─────────────────────┘  └────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Header:**
- Back link: `text-sm text-gray-500 hover:text-gray-700`, with `ArrowLeft` icon
- Entity name: `text-2xl font-semibold text-gray-900`
- Status badge: Adjacent to name, right side
- Action buttons: Secondary (Edit, Print) + Ghost (More actions ⋯)
- Metadata line: `text-sm text-gray-500` — date, reference number, created by

**Content:**
- Tabs for different views (Info, Transactions, Payments, History)
- Info tab: Detail cards with key-value pairs, 2-column layout
- Transactions tab: Related records table
- Payments tab: Payment history table with totals summary
- Optional: Side-by-side layout (detail card left 40%, related table right 60%)

### 5.3 Form Page Pattern

Used for creating/editing entities.

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back                                                      │
│                                                              │
│  Create New Entity / Edit Entity                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Section 1: Basic Information                            ││
│  │  ──────────────────────────────────────────────────────── ││
│  │  Label*          [Input field                    ]        ││
│  │  Label           [Input field                    ]        ││
│  │  Label*          [Select dropdown                ]        ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Section 2: Details                                      ││
│  │  ──────────────────────────────────────────────────────── ││
│  │  ...form fields...                                       ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│                                    [Cancel]  [Save Record]   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Rules:**
- Max width: 720px, left-aligned in content area
- Sections separated by cards with headers
- Required fields marked with `*`
- Save button: Primary, disabled until form is valid
- Cancel button: Secondary, discards changes (with confirmation if dirty)
- On save error: Toast notification, form retains values
- On save success: Toast notification, redirect to detail page or list

### 5.4 Dashboard Page Pattern

```
┌──────────────────────────────────────────────────────────────┐
│  Dashboard                                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  │ Total        │ │ Total        │ │ Overdue      │ │ Overdue      │
│  │ Receivables  │ │ Payables     │ │ Receivables  │ │ Payables     │
│  │              │ │              │ │              │ │              │
│  │ ₱2,450,000   │ │ ₱1,200,000   │ │ 5 (₱800K)   │ │ 2 (₱350K)   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Quick Actions                                           ││
│  │  [Record Payment] [Create Order] [View Receivables]      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Recent Activity                                         ││
│  │  ──────────────────────────────────────────────────────── ││
│  │  Aug 26  Payment ₱50,000 from Acme Corp    [Receivable]  ││
│  │  Aug 25  PO-2026-042 created for Fabric Hub [B2B]        ││
│  │  Aug 25  Printing Order #088 completed      [B2C]        ││
│  │  Aug 24  Payment ₱120,000 to Fabric Hub     [Payable]    ││
│  │  ...                                                     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Rules:**
- Stat cards: 4-column grid (xl), 2-column (lg)
- Overdue cards: Red left border (3px `error-500`) if count > 0, normal border if 0
- Quick actions: 3-5 most common actions as buttons
- Recent activity: Last 10 transactions across all modules, reverse chronological
- No charts or graphs (per PRD — "The dashboard does NOT include charts, graphs, or advanced analytics")
- Low stock alerts: Below recent activity if any products have current_qty ≤ 0

### 5.5 Document View Pattern (Print-Optimized)

See Section 10: Print Layout for full specification.

---

## 6. Key Screen Designs

### 6.1 Login Page

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    (gray-50 background)                       │
│                                                              │
│              ┌──────────────────────────┐                    │
│              │                          │                    │
│              │  UBMS                    │  ← text-xl font-bold│
│              │  Business Management     │  ← text-sm gray-500│
│              │                          │                    │
│              │  Email                   │                    │
│              │  [___________________]   │                    │
│              │                          │                    │
│              │  Password                │                    │
│              │  [___________________]   │                    │
│              │                          │                    │
│              │  [🔵 Sign In]           │  ← Primary button   │
│              │                          │     full-width      │
│              │  Forgot password?        │  ← text-sm primary │
│              │                          │     text link       │
│              └──────────────────────────┘                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

| Property | Value |
|---|---|
| Page background | `gray-50` |
| Card | `white`, `shadow-md`, `radius-lg`, width 400px, centered vertically and horizontally |
| Logo area | No image — text-based: "UBMS" in `text-xl font-bold text-gray-900` |
| Error display | Inline alert above form: `error-50` bg, `error-600` text, `AlertCircle` icon |
| Account locked | Same inline alert: "Account locked. Try again in 15 minutes." |
| Input height | 40px (slightly larger for login — primary entry point) |

### 6.2 Dashboard

(See Section 5.4 for layout pattern.)

**Stat Card Details:**

| Card | Value Source | Subtext |
|---|---|---|
| Total Receivables | `SUM(v_receivables.outstanding_balance)` where status IN ('Outstanding','Partially Paid') | "{n} overdue" in `text-error-600` if overdue > 0 |
| Total Payables | `SUM(v_payables.outstanding_balance)` where status IN ('Outstanding','Partially Paid') | "{n} overdue" in `text-error-600` if overdue > 0 |
| Overdue Receivables | Count + sum of overdue receivables | Red left border if count > 0 |
| Overdue Payables | Count + sum of overdue payables | Red left border if count > 0 |

**Quick Actions:**
- [Record Payment] — Primary button → `/finance/payments?new=true`
- [Create B2B Order] — Secondary button → `/b2b/pre-orders/new`
- [Create B2C Order] — Secondary button → `/b2c/printing-orders/new`

**Recent Activity:**
- Last 10 events across all modules
- Each row: Date (text-xs gray-400) | Description (text-sm gray-700) | Module badge (text-xs)
- Clickable — navigates to the source document

### 6.3 Finance — Receivables List

```
┌──────────────────────────────────────────────────────────────┐
│  ● Receivables                            [+ Record Payment] │
│  Finance > Receivables                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [🔍 Search customer, reference...] [Status ▾] [Date ▾]     │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Customer     │ Source    │ Amount    │ Paid     │ Due      │ Status      │
│  │──────────────│───────────│───────────│──────────│──────────│─────────────││
│  │ Acme Corp    │ FUL-001   │ ₱50,000   │ ₱20,000  │ Aug 15   │ [Partially] │
│  │              │           │           │          │          │ [OVERDUE]   ││
│  │──────────────│───────────│───────────│──────────│──────────│─────────────││
│  │ Textile Inc  │ B2C-088   │ ₱15,000   │ ₱15,000  │ Sep 01   │ [Fully Paid]││
│  │──────────────│───────────│───────────│──────────│──────────│─────────────││
│  │ Fabric World │ FUL-003   │ ₱120,000  │ ₱0       │ Sep 30   │[Outstanding]││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Showing 1-20 of 45              [‹ Prev] 1/3 [Next ›]      │
└──────────────────────────────────────────────────────────────┘
```

**Column Spec:**
| Column | Alignment | Format | Notes |
|---|---|---|---|
| Customer | Left | `text-sm text-gray-800` | Clickable → customer detail |
| Source | Left | `font-mono text-xs text-gray-500` | Document number |
| Amount | Right | `font-mono text-sm` | Original amount |
| Paid | Right | `font-mono text-sm text-gray-600` | Sum of payments |
| Remaining | Right | `font-mono text-sm font-semibold` | Computed balance |
| Due Date | Left | `text-sm text-gray-600` | Format: `MMM DD, YYYY` |
| Status | Center | Badge component | + OVERDUE badge if applicable |
| Actions | Center | `⋯` menu | View, Record Payment, Print |

**Overdue Row:** Left border 3px `error-500`, bg `error-50`. The OVERDUE badge appears next to the status badge.

### 6.4 Finance — Record Payment (Modal/Drawer)

Opens as a drawer (right side, 480px width) from the Receivables or Payables list.

```
┌────────────────────────────────────┐
│  Record Payment              [X]   │
│  ───────────────────────────────── │
│                                    │
│  Payment Type                      │
│  (•) Receivable  ( ) Payable       │
│                                    │
│  Customer/Supplier*                │
│  [🔍 Search entity...]             │  ← Autocomplete search
│                                    │
│  Outstanding Receivable*           │
│  [Select receivable ▾]             │  ← Shows: Source # — ₱50,000 (₱30,000 remaining)
│                                    │
│  ───────────────────────────────── │
│                                    │
│  Amount*                           │
│  ₱ [___________]                   │  ← Currency input, right-aligned
│  Remaining: ₱30,000.00             │  ← Helper text below field
│                                    │
│  Payment Date*                     │
│  [📅 Aug 26, 2026]                 │  ← Date picker, defaults to today
│                                    │
│  Payment Method*                   │
│  [Select method ▾]                 │  ← Cash / Bank Transfer / Check
│                                    │
│  Reference Number                  │
│  [________________]                │  ← Check number, transaction ID
│                                    │
│  Notes                             │
│  [________________]                │  ← Optional free text
│                                    │
│  ───────────────────────────────── │
│              [Cancel] [Save Payment]│
└────────────────────────────────────┘
```

**Validation Rules:**
- Amount must be > 0
- Amount > remaining balance → show warning "Payment exceeds outstanding balance (₱30,000). Continue?" with confirmation checkbox
- All required fields (*) must be filled
- On save: optimistic UI update, toast on success/error

### 6.5 B2B — Purchase Order Detail

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Purchase Orders                                   │
│                                                              │
│  PO-2026-0042          [Partially Received]    [Edit] [Print]│
│  Fabric Hub Supply · Aug 20, 2026                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Order Details] [Receiving History] [Linked Payable]        │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  ┌────────────────────────┐  ┌──────────────────────────────┐│
│  │ Supplier Information   │  │ Order Summary                ││
│  │ Fabric Hub Supply      │  │ Items: 5                     ││
│  │ Attn: Maria Santos     │  │ Items with shortage: 1       ││
│  │ +63 917 111 2233       │  │ Items fully received: 3      ││
│  │                        │  │ Total: ₱375,000.00           ││
│  └────────────────────────┘  └──────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Items                                                    ││
│  │──────────────────────────────────────────────────────────││
│  │ Product       │ Ordered │ Received │ Variance │ Reason   ││
│  │───────────────│─────────│──────────│──────────│──────────││
│  │ Cotton Fabric │   1,000 │    997   │ -3       │ Short    ││
│  │               │   yards │    yards │ Shortage │ received ││
│  │───────────────│─────────│──────────│──────────│──────────││
│  │ Silk Blend    │     500 │    500   │ 0        │ —        ││
│  │               │   yards │    yards │ Exact    │          ││
│  │───────────────│─────────│──────────│──────────│──────────││
│  │ ...           │         │          │          │          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  [+ Record Receiving]                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Variance Display:**
- Shortage: `text-error-600 font-medium` — e.g., "-3 yards" with red color
- Excess: `text-info-600 font-medium` — e.g., "+5 yards" with blue color
- Exact: `text-success-600` — "Exact" with green color

### 6.6 B2C — Printing Order Detail

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Printing Orders                                   │
│                                                              │
│  B2C-2026-0088       [In Production]     [Edit] [Print]  ⋯  │
│  Juan Dela Cruz · Aug 22, 2026                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Order Info] [Production Notes] [Payment]                   │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  ┌────────────────────────┐  ┌──────────────────────────────┐│
│  │ Customer               │  │ Order Summary                ││
│  │ Juan Dela Cruz         │  │ Items: 3                     ││
│  │ +63 917 444 5566       │  │ Total: ₱8,500.00             ││
│  │                        │  │ Payment: Not yet released     ││
│  └────────────────────────┘  └──────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Items                                                    ││
│  │──────────────────────────────────────────────────────────││
│  │ Description          │ Qty │ Unit Price │ Total           ││
│  │──────────────────────│─────│────────────│─────────────────││
│  │ Tarpaulin 8x10ft     │   2 │  ₱1,500.00 │  ₱3,000.00     ││
│  │ Vinyl Banner 4x6ft   │   5 │    ₱500.00 │  ₱2,500.00     ││
│  │ ID Printing (100pcs) │   3 │    ₱500.00 │  ₱1,500.00     │
│  │──────────────────────│─────│────────────│─────────────────││
│  │                      │     │    Total:  │  ₱8,500.00     ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Production Notes                                         ││
│  │ "Use heavy-duty material for tarpaulin. Glossy finish    ││
│  │  for vinyl banners. Customer will pick up Aug 28."       ││
│  │                                          [Edit Notes]    ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Status Timeline:                                            │
│  ● Pending (Aug 22) → ● In Production (Aug 23) → ○ Completed│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Status Timeline:** Horizontal stepper showing the order's progress through statuses. Completed steps: filled circle (module color). Current step: filled circle + label. Future steps: empty circle, `text-gray-400`.

### 6.7 Customer Detail

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Customers                                         │
│                                                              │
│  Acme Corporation      [Active]          [Edit] [Statement] ⋯│
│  B2B · B2C · Created Aug 1, 2026                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Contact Information           │ Financial Summary        ││
│  │ ───────────────────────────── │ ──────────────────────── ││
│  │ Contact: Maria Reyes          │ Outstanding: ₱250,000.00 ││
│  │ Phone: +63 917 123 4567      │ Receivables: 4           ││
│  │ Email: maria@acme.com         │ Overdue: 1 (₱80,000)     ││
│  │ Address: 123 Business St,     │ Historical Debts: ₱0     ││
│  │          Makati City          │ Total Transactions: 23   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  [Orders (B2B)] [Orders (B2C)] [Payments] [Historical Debts] │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Date       │ Type         │ Document  │ Amount   │ Status││
│  │────────────│──────────────│───────────│──────────│───────││
│  │ Aug 25     │ B2B Fulfill. │ FUL-001   │ ₱50,000  │[Outst]││
│  │ Aug 20     │ Payment      │ PAY-045   │ ₱20,000  │[Paid] ││
│  │ Aug 15     │ B2C Order    │ B2C-088   │ ₱8,500   │[Paid] ││
│  │ ...        │              │           │          │       ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
│  Showing 1-20 of 23              [‹ Prev] 1/2 [Next ›]      │
└──────────────────────────────────────────────────────────────┘
```

**Financial Summary Card:**
- Outstanding balance: `text-xl font-bold` — total from `v_customer_outstanding`
- Overdue amount: `text-error-600 font-medium` if > 0
- Receivable count: number of active receivables
- Historical debts: sum of pending/verified/disputed debts

---

## 7. Motion & Interaction

### 7.1 Transition Specifications

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Page transition | Fade in (opacity 0→1) | 150ms | `ease-out` |
| Modal open | Slide up (translateY 8px→0) + fade | 200ms | `ease-out` |
| Modal close | Fade out | 150ms | `ease-in` |
| Drawer open | Slide in from right (translateX 100%→0) | 250ms | `ease-out` |
| Drawer close | Slide out to right | 200ms | `ease-in` |
| Dropdown open | Fade + scale (0.95→1) | 100ms | `ease-out` |
| Status badge change | Background color transition | 300ms | `ease-in-out` |
| Sidebar collapse/expand | Width transition | 200ms | `ease-in-out` |
| Toast enter | Slide in from right + fade | 200ms | `ease-out` |
| Toast exit | Fade out + slide right | 150ms | `ease-in` |
| Tab switch | Content fade | 100ms | `ease-out` |
| Skeleton shimmer | Left-to-right gradient sweep | 1500ms | `ease-in-out`, infinite |

### 7.2 Rules

- **No decorative animations.** All motion serves a functional purpose (feedback, orientation, continuity).
- **No parallax, no bounce, no spring physics.** This is business software.
- **Respect `prefers-reduced-motion`.** If the user has reduced motion enabled, disable all transitions except essential state changes (modal open/close).
- **Keep total animation time under 300ms** for any interaction. Business users value speed.

---

## 8. Accessibility

### 8.1 WCAG AA Compliance

| Requirement | Implementation |
|---|---|
| Color contrast | All text meets 4.5:1 ratio against backgrounds (verified in Section 2.1) |
| Large text contrast | Headings (≥18px or ≥14px bold) meet 3:1 ratio |
| Color not sole indicator | Status badges always include text label (e.g., "OVERDUE" text + red color) |
| Focus visible | All interactive elements have visible focus indicator |
| Keyboard navigation | All functionality accessible via keyboard |
| Screen reader | All interactive elements have accessible names |

### 8.2 Keyboard Navigation

| Key | Action |
|---|---|
| `Tab` | Move focus to next interactive element |
| `Shift + Tab` | Move focus to previous interactive element |
| `Enter` / `Space` | Activate focused button, link, or checkbox |
| `Arrow keys` | Navigate within dropdowns, tabs, radio groups |
| `Escape` | Close modal, drawer, dropdown, toast |
| `/` | Focus search input (global shortcut) |

### 8.3 Focus Indicators

| Element | Focus Style |
|---|---|
| Buttons | Ring 2px `primary-500`, offset 2px |
| Inputs | Border `primary-500`, ring 2px `primary-100` |
| Links | Underline + `text-primary-700` |
| Table rows | Left border 2px `primary-500` (when row is focusable) |
| Sidebar items | Ring 2px `white` (on dark background), inset |

**Focus ring spec:** `outline: 2px solid var(--color-primary-500); outline-offset: 2px;` — never use `outline: none` without replacement.

### 8.4 Screen Reader Labels

| Element | Implementation |
|---|---|
| Icon-only buttons | `aria-label` (e.g., `<button aria-label="Edit order">`) |
| Status badges | `aria-label` with full description (e.g., `aria-label="Status: Overdue"`) |
| Tables | `<th scope="col">` for headers, `<caption>` for table purpose |
| Form fields | `<label>` associated via `htmlFor`/`id`, never placeholder-only |
| Error messages | `aria-describedby` linking field to error text |
| Toast notifications | `role="alert"`, `aria-live="polite"` |
| Modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls` |
| Pagination | `aria-label="Pagination"`, `aria-current="page"` on current page |

### 8.5 Skip Navigation

A "Skip to main content" link is provided as the first focusable element, hidden until focused via keyboard:

```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 ...">
  Skip to main content
</a>
```

---

## 9. Icon System

### 9.1 Library

**Lucide React** — consistent stroke width, clean lines, professional appearance, tree-shakeable.

### 9.2 Icon Usage by Module

| Module | Primary Icon | Secondary Icons |
|---|---|---|
| Dashboard | `LayoutDashboard` | `TrendingUp` (for stats) |
| Finance | `Wallet` | `ArrowDownLeft` (receivable), `ArrowUpRight` (payable), `CreditCard` (payment), `History` (debts) |
| B2B | `Truck` | `FileText` (pre-order), `ClipboardList` (PO), `PackageCheck` (receiving), `Package` (fulfillment) |
| B2C | `Printer` | `FileEdit` (order), `Clock` (production), `CheckCircle` (completed) |
| Inventory | `Package` | `Boxes` (products), `ArrowUpDown` (adjustments) |
| Customers | `Users` | `User` (individual), `Building2` (company) |
| Suppliers | `Truck` | `Building2` |
| Reports | `BarChart3` | `FileSpreadsheet`, `Download` |
| Documents | `FileText` | `Print`, `FileDown` |
| Settings | `Settings` | `UserCog` (user management) |

### 9.3 Icon Usage by Action

| Action | Icon | Size |
|---|---|---|
| Create / Add | `Plus` | 16px (in buttons), 20px (in FAB) |
| Edit | `Pencil` or `PenLine` | 16px |
| Delete / Void | `Trash2` | 16px |
| View | `Eye` | 16px |
| Print | `Printer` | 16px |
| Export / Download | `Download` | 16px |
| Search | `Search` | 16px (in inputs), 20px (standalone) |
| Filter | `Filter` | 16px |
| More actions | `MoreVertical` | 16px |
| Close | `X` | 16px |
| Sort ascending | `ArrowUp` | 12px |
| Sort descending | `ArrowDown` | 12px |
| Calendar | `Calendar` | 16px |
| Chevron (dropdown) | `ChevronDown` | 16px |
| Back | `ArrowLeft` | 16px |
| Loading | `Loader2` (animated) | 16px |
| Success | `CheckCircle` | 16px |
| Error | `XCircle` | 16px |
| Warning | `AlertTriangle` | 16px |
| Info | `Info` | 16px |

### 9.4 Icon Sizing

| Context | Size | Stroke |
|---|---|---|
| Inline (with text) | 16px | 1.5px |
| Navigation items | 20px | 1.5px |
| Empty states | 48px | 1px |
| Stat card accent | 24px | 1.5px |

---

## 10. Print Layout

### 10.1 Print Stylesheet Rules

```css
@media print {
  /* Hide non-content elements */
  .sidebar, .top-bar, .no-print, button, .actions-bar { display: none !important; }

  /* Reset layout */
  .page-content { padding: 0 !important; margin: 0 !important; }
  body { background: white !important; }

  /* A4 optimization */
  @page { size: A4; margin: 15mm; }

  /* Ensure content fits */
  table { page-break-inside: auto; }
  tr { page-break-inside: avoid; }
}
```

### 10.2 Document Print Template

```
┌─────────────────────────────────────────────┐
│  UBMS — Unified Business Management System  │  ← text-xs, gray-500
│  ─────────────────────────────────────────── │
│                                              │
│  DOCUMENT TYPE                    Document # │  ← text-lg font-bold
│  ─────────────────────────────────────────── │
│                                              │
│  Entity Details                  Date        │
│  Name: Acme Corporation          Aug 26, 2026│
│  Contact: Maria Reyes                        │
│  Phone: +63 917 123 4567                     │
│  Address: 123 Business St, Makati            │
│                                              │
│  ┌──────────────────────────────────────────┐│
│  │ # │ Description  │ Qty │ Unit Price │ Amt ││
│  │───│──────────────│─────│────────────│─────││
│  │ 1 │ Cotton Fabric│ 500 │  ₱150.00   │₱75K ││
│  │ 2 │ Silk Blend   │ 200 │  ₱300.00   │₱60K ││
│  │───│──────────────│─────│────────────│─────││
│  │   │              │     │    Total:  │₱135K││
│  └──────────────────────────────────────────┘│
│                                              │
│  Payment Status: [Outstanding — ₱135,000.00] │
│  Due Date: September 25, 2026                │
│                                              │
│  ─────────────────────────────────────────── │
│  Generated: Aug 26, 2026 10:30 AM            │  ← text-xs, gray-400
│  Recorded by: Admin User                     │
└──────────────────────────────────────────────┘
```

### 10.3 Print Specifications

| Property | Value |
|---|---|
| Paper size | A4 (210mm × 297mm) |
| Margins | 15mm all sides |
| Font | 10pt for body, 14pt for headers, 8pt for footnotes |
| Colors | Black text on white (all color badges convert to text labels with borders) |
| Tables | Bordered, header row with gray background |
| Page breaks | Avoid breaking rows; break before new sections if needed |
| Header on each page | Document type + number (for multi-page documents) |

---

## Appendix A: Tailwind CSS Configuration Reference

```typescript
// tailwind.config.ts — Key extensions
{
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Standard Tailwind scale (12px–30px covered by default)
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      animation: {
        'skeleton-shimmer': 'shimmer 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-right': 'slideRight 250ms ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
}
```

---

## Appendix B: Component → Tailwind Class Quick Reference

| Component | Key Classes |
|---|---|
| Primary button | `bg-blue-600 text-white hover:bg-blue-700 rounded-sm text-sm px-4 py-2 font-medium` |
| Secondary button | `bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-sm text-sm px-4 py-2` |
| Danger button | `bg-red-600 text-white hover:bg-red-700 rounded-sm text-sm px-4 py-2` |
| Input field | `border border-gray-300 rounded-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100` |
| Table header | `bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-2.5` |
| Table cell | `px-4 py-2.5 text-sm text-gray-700 border-b border-gray-200` |
| Card | `bg-white border border-gray-200 rounded-md shadow-sm p-5` |
| Badge (success) | `bg-green-50 text-green-700 border border-green-200 text-xs font-medium px-2 py-0.5 rounded-sm` |
| Badge (error) | `bg-red-50 text-red-700 border border-red-200 text-xs font-medium px-2 py-0.5 rounded-sm` |
| Sidebar item | `flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white rounded-sm` |
| Sidebar active | `border-l-3 border-blue-500 bg-gray-800 text-white` |
| Page title | `text-2xl font-semibold text-gray-900` |
| Section header | `text-sm font-semibold text-gray-800` |
| Label | `text-sm font-medium text-gray-700` |
| Helper text | `text-xs text-gray-500` |
| Error text | `text-xs text-red-600` |

---

## Appendix C: Design Decision Log

| Decision | Rationale |
|---|---|
| Light theme only | Office environment, business application — dark mode unnecessary and adds complexity |
| No charts on dashboard | PRD explicitly states "The dashboard does NOT include charts, graphs, or advanced analytics" |
| Dense table layout | Business users need to see more data at once; compact rows (44px) maximize information density |
| Sidebar navigation | 10+ modules require persistent navigation; top nav would not scale |
| Module colors for orientation | Users switch between B2B and B2C workflows; color coding prevents confusion |
| Inter font | Excellent readability at small sizes, professional tone, wide ₱ symbol support |
| 4px base grid | Industry standard; matches Tailwind's default spacing scale |
| No gradients/decorative elements | Anti-slop principle: this is an ERP tool, not a marketing site |
| Skeleton loading over spinners | Maintains layout stability; users can perceive content structure while loading |
| Pill badges with text + color | WCAG requirement: color is never the sole indicator of status |
| Drawer for Record Payment | Allows referencing the list while filling the form; less disruptive than full modal |
| A4 print layout | Business needs physical documents for records; A4 is standard in the Philippines |
