---
name: telegram-engineering
description: Enforces Telegram development standards using grammY for bots, Webhooks via Next.js API Routes for production, Redis adapter for session state, and @telegram-apps/sdk-react for Mini Apps. Use when creating Telegram bots, Mini Apps, webhooks, or integrating Telegram features.
---

# Telegram Engineering

## Core Principles

- **Framework**: Always use grammY for all Telegram bots
- **Architecture**: Use Webhooks (Next.js API Routes) for production deployments
- **State Management**: Never store session data in RAM. Always use Redis adapter
- **Mini Apps**: Use @telegram-apps/sdk-react for frontend integration

## Bot Development with grammY

### Installation

```bash
npm install grammy
npm install @grammyjs/storage-redis
```

### Basic Bot Setup

```typescript
import { Bot } from "grammy"

const bot = new Bot(process.env.BOT_TOKEN!)

// Add middleware, commands, handlers
bot.command("start", (ctx) => ctx.reply("Hello!"))

export default bot
```

### Session Storage with Redis

**Never use in-memory storage in production:**

```typescript
import { Bot } from "grammy"
import { RedisAdapter } from "@grammyjs/storage-redis"
import { Redis } from "ioredis"

const redis = new Redis(process.env.REDIS_URL!)

const bot = new Bot(process.env.BOT_TOKEN!)

// Use Redis adapter for sessions
bot.use(
  session({
    initial: () => ({}),
    storage: new RedisAdapter(redis)
  })
)
```

**Avoid:**
```typescript
// ❌ Never use in-memory storage
import { MemorySessionStorage } from "@grammyjs/storage-memory"
storage: new MemorySessionStorage() // Don't do this
```

## Webhook Architecture (Production)

### Next.js API Route Setup

Create `app/api/telegram/webhook/route.ts`:

```typescript
import { Bot } from "grammy"
import { NextRequest, NextResponse } from "next/server"
import bot from "@/lib/telegram/bot"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await bot.handleUpdate(body)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

### Webhook Configuration

Set webhook URL in production:

```typescript
// scripts/set-webhook.ts
import { Bot } from "grammy"

const bot = new Bot(process.env.BOT_TOKEN!)

async function setWebhook() {
  await bot.api.setWebhook(process.env.WEBHOOK_URL!, {
    allowed_updates: ["message", "callback_query"]
  })
  console.log("Webhook set successfully")
}

setWebhook()
```

**For development**, use polling instead:

```typescript
// Only in development
if (process.env.NODE_ENV === "development") {
  bot.start()
}
```

## Mini Apps Integration

### Frontend Setup

Install SDK:

```bash
npm install @telegram-apps/sdk-react
```

### React Component Integration

```typescript
"use client"

import { SDKProvider, useTelegram } from "@telegram-apps/sdk-react"

export default function TelegramApp() {
  return (
    <SDKProvider>
      <AppContent />
    </SDKProvider>
  )
}

function AppContent() {
  const { user, themeParams, initData } = useTelegram()

  return (
    <div>
      <h1>Hello, {user?.firstName}!</h1>
      {/* Your app content */}
    </div>
  )
}
```

### Backend Validation

Validate init data from Mini App:

```typescript
import { validateWebAppData } from "@telegram-apps/sdk"

export async function POST(request: NextRequest) {
  const { initData } = await request.json()
  
  const isValid = validateWebAppData(
    process.env.BOT_TOKEN!,
    initData
  )
  
  if (!isValid) {
    return NextResponse.json({ error: "Invalid data" }, { status: 401 })
  }
  
  // Process request
}
```

## Quick Reference Checklist

When implementing Telegram features:

- [ ] Using grammY framework (not other libraries)
- [ ] Redis adapter configured for sessions (not in-memory)
- [ ] Webhook API route created for production
- [ ] Polling only used in development
- [ ] @telegram-apps/sdk-react used for Mini Apps frontend
- [ ] Init data validated on backend

## Anti-Patterns

❌ Using other bot frameworks (node-telegram-bot-api, telegraf)  
❌ Storing sessions in memory (`MemorySessionStorage`)  
❌ Using long polling in production  
❌ Manual Telegram SDK integration instead of @telegram-apps/sdk-react  
❌ Skipping init data validation in Mini Apps
