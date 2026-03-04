# Active Context: Next.js Starter Template

## Current State

**Template Status**: ✅ Active development — Texas Hold'em poker game

The template is a clean Next.js 16 starter with TypeScript and Tailwind CSS 4. It's ready for AI-assisted expansion to build any type of application.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Full Texas Hold'em poker game (2,213 lines)
- [x] Monte Carlo win probability calculator (src/utils/monteCarlo.ts)
- [x] Win % bar displayed on each active player's seat (color-coded green/yellow/red)

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page | ✅ Ready |
| `src/app/layout.tsx` | Root layout | ✅ Ready |
| `src/app/globals.css` | Global styles | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |
| `src/gameEngine.ts` | Texas Hold'em game logic | ✅ Ready |
| `src/handEvaluator.ts` | 7-card hand evaluation | ✅ Ready |
| `src/types.ts` | Shared TypeScript types | ✅ Ready |
| `src/utils/shuffle.ts` | Deck creation & shuffle | ✅ Ready |
| `src/utils/monteCarlo.ts` | Monte Carlo win probability | ✅ Ready |
| `src/components/PokerTable.tsx` | Main game table UI | ✅ Ready |
| `src/components/PlayerSeat.tsx` | Player seat + win % bar | ✅ Ready |
| `src/components/ActionPanel.tsx` | Bet/fold/raise controls | ✅ Ready |
| `src/components/CommunityCards.tsx` | Board cards display | ✅ Ready |
| `src/components/PotDisplay.tsx` | Pot amount display | ✅ Ready |

## Current Focus

The template is ready. Next steps depend on user requirements:

1. What type of application to build
2. What features are needed
3. Design/branding preferences

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-04 | Built complete Texas Hold'em poker game (2,213 lines) |
| 2026-03-04 | Added Monte Carlo win probability (2000 simulations per phase change); shown as color-coded % bar on each player seat |
| 2026-03-04 | Fixed game table UI: removed `position:relative` CSS override on `.poker-table-felt` that was breaking the oval table layout; removed `overflow-hidden` from outer container that was clipping player seats |
