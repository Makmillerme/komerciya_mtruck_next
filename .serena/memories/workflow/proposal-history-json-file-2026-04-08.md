Proposal generation history moved from browser localStorage to server JSON file.

- Storage: `data/proposal-history.json` path `path.join(process.cwd(), "data", "proposal-history.json")`.
- Docker: bind `./data/history:/app/data` so file persists at `/app/data/proposal-history.json`.
- Server module: `lib/proposal-history-store.ts` (read/append/delete, max 50 entries).
- API: `GET/POST/DELETE /api/proposal-history`.
- Client: `lib/proposal-history.ts` exposes `fetchProposalHistory`, `saveProposalHistoryEntry`, `removeProposalHistoryEntry`.
- `ProposalForm` loads/refreshes via API.

Rate disclaimer: `lib/rate-disclaimer.ts`; shown under cost grid in `ProposalTemplate` and `render-proposal-html.ts` with `formatRateDisclaimerDate()`.

Git: 462a5c5.