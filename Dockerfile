FROM mcr.microsoft.com/playwright:v1.58.2-noble AS deps
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY package*.json ./
RUN npm ci

FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM mcr.microsoft.com/playwright:v1.58.2-noble AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

RUN mkdir -p /app/uploads /app/output /app/.proposal-print-temp

EXPOSE 3000

CMD ["npm", "run", "start"]
