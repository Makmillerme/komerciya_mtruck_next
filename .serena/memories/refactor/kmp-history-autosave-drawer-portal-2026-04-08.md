## KMP: автозбереження історії + drawer через портал (2026-04-08)

- **Кнопка «Зберегти в історію»** прибрана з `KmpHistoryToolbar` (як на КП).
- **Автозбереження:** `KMPCalculator` — `useEffect` із дебаунсом 1.5 с після змін `watched` / `historyPick`. Зберігає лише коли `kmpFormSchema.safeParse` успішний і `computeHtmlLoan` не `null`. Дедуплікація через `kmpHistoryAutoSaveFingerprint` у `lib/kmp-history-fingerprint.ts` + ref `kmpAutoSaveFingerprintRef`; після завантаження запису з історії ref виставляється у `loadKmpHistoryEntry`, щоб не дублювати той самий знімок. Конкурентні POST блокує `kmpAutoSaveInFlightRef` + `onSettled` у `mutate`.
- **Drawer:** `KmpHistoryDrawer` рендериться через `createPortal(..., document.body)`, `z-[100]`/`z-[101]`, `aria-modal`/`role="dialog"`, `body { overflow: hidden }` при відкритті; скрол списку через `flex min-h-0 flex-1 overflow-y-auto`.
- **Копірайт тулбару:** автозбереження та шлях до `data/kmp-history.json` у футері `HistoryActionBar`.
