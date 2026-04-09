## КМП: історія (sheet/drawer) глючила; Recharts width -1

**Дата:** 2026-04-08

**Симптоми:** на КП панель історії ок; на КМП — майже не працювала; у консолі Recharts про width/height -1 чи 0.

**Причина:** `KmpHistoryDrawer` робив `document.body.style.overflow = hidden` і `paddingRight` під ширину скролбара. У застосунку скрол у `<main>`, не в `body` — з’являвся зсув верстки, повторні виміри `ResponsiveContainer`, помилкові розміри.

**Фікс:**
- `components/kmp/KmpHistoryDrawer.tsx`: прибрано portal у `body`, прибрано lock/padding на `body`, вирівняно з КП: `z-40`/`z-50`, `animate-in fade-in-0` / `slide-in-from-right`, `h-full`, `rounded-l-xl`.
- `components/kmp/KMPCharts.tsx`: для pie — `h-48 w-48 min-h-48 min-w-48 overflow-hidden`; для grid/bar cards — `min-w-0 overflow-hidden` на `Card`, `min-w-0` на grid.

**Перевірка:** `npx tsc --noEmit` OK.