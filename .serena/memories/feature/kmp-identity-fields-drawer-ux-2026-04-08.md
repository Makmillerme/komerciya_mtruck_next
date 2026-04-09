## KMP: поля ідентифікації + drawer без джиттеру

- **Схема:** `lib/kmp-form.ts` — `identityModel`, `identityVin`, `identityContractor` (`z.string().default("")`), експорт `kmpFormEmptyValues()` для мерджу з чернеткою/історією (`form.reset({ ...kmpFormEmptyValues(), ...data })`).
- **Імпорт з КП:** у `onProposalHistoryIdChange` підставляються марка/рік у `identityModel`, VIN у `identityVin`, `identityContractor` очищується.
- **UI:** `KmpImportFromProposalCard` приймає `control`, поля під «Запис історії», блок з оціночною вартістю з КП лишився компактним під полями. Картка всередині `<Form>`.
- **Пошук у drawer:** `filterKmpHistoryBySearch` + рядок ідентичності; плейсхолдер пошуку розширено; `kmpHistoryEntryIdentityLine` на картках.
- **Drawer:** прибрано `animate-in` / `slide-in-from-right` (джерело джиттеру разом зі скролбаром); backdrop без анімації; `paddingRight` на `body` = ширина скролбара при `overflow: hidden`; панель `h-dvh max-h-[100dvh]`, `overscroll-contain` на скролі списку.
