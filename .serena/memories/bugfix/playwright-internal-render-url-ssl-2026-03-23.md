Fixed deployed PDF generation error `net::ERR_SSL_PROTOCOL_ERROR` where Playwright attempted to open `https://localhost:3000/proposal-print?...`.

Root cause:
- Server-side PDF route used external/request-derived base URL, which can resolve to localhost over https behind reverse proxy.

Changes:
- app/api/generate/route.ts:
  - replaced external base URL logic with internal rendering URL:
    `const internalBaseUrl = process.env.INTERNAL_RENDER_URL ?? "http://127.0.0.1:3000"`
  - Playwright `printUrl` now always targets internal HTTP endpoint.
- docker-compose.yml:
  - added `INTERNAL_RENDER_URL` env with default `http://127.0.0.1:3000`.

Validation:
- Local `npm run build` succeeds.
- No linter errors in updated route file.