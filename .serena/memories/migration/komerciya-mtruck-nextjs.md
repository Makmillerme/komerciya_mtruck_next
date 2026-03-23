# Komerciya MTruck Next.js Migration

## Project: d:\Project\mtruck\komerciya_mtruck_next

## Completed
- Next.js 16, TypeScript, Tailwind v4, Shadcn (Button, Input, Label, Card, Form)
- React Hook Form + Zod schema (no price_words)
- ProposalForm with FormField, FormItem, FormLabel, FormControl
- API: POST /api/generate (PDF via Playwright), GET /api/download/[filename]
- JetBrains Mono font in layout
- Clean dark theme: bg-background, text-foreground, border-border, text-muted-foreground
- form.tsx FormControl: fixed TS spread error with `child.props as Record<string, unknown>`
- Build: npm run build passes
- Stub routes for MCP/OAuth probes: GET/POST /api/plugin/mcp, GET /.well-known/oauth-protected-resource, GET /.well-known/oauth-authorization-server, GET|POST /.well-known/oauth-protected-resource/api/plugin/mcp (no 404 in dev console)

## Key Paths
- app/page.tsx, app/layout.tsx
- components/ProposalForm.tsx, components/ui/form.tsx
- lib/schema.ts, lib/pdf-generator.ts, lib/pdf-utils.ts
- public/commercial_proposal_final.html