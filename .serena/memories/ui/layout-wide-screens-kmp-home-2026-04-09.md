## Responsive layout (wide screens + scroll)

**Problem:** On 1920×1080, `max-w-5xl` (~64rem) left large empty margins beside sidebar; KMP import card used `max-w-2xl`, fields did not use column width. Footer content could feel clipped without bottom padding in `main`.

**Changes:**
- `app/kmp/page.tsx`, `app/page.tsx`: widen container — `max-w-6xl` → `lg:max-w-7xl` → `xl:max-w-[85rem]` → `2xl:max-w-[92rem]`, add `min-w-0`, horizontal padding `px-3 sm:px-4 lg:px-6`.
- `components/ConditionalLayout.tsx`: `main` gets `min-w-0`, `overflow-x-hidden`, `overflow-y-auto`, `pb-10` / `sm:pb-12`, slightly tighter `p-4` on small.
- `components/kmp/KMPCalculator.tsx`: outer grids use `min-w-0`; xl grid adds `2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]`; right column wrapped in `div.min-w-0`.
- `components/kmp/KmpCalculatorLiveBlocks.tsx`: root panel `min-w-0`.
- `components/kmp/KmpImportFromProposalCard.tsx`: removed `max-w-2xl` on inner stack → `w-full min-w-0`.
- `components/AppHeader.tsx`: stacks on narrow (`flex-col`), `sm:` row layout; title `min-w-0`, rates wrap with `flex-wrap`.
