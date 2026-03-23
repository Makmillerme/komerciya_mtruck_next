---
name: bot-engineer
description: Specializes in Telegram Bot API development using grammY framework, Web App authentication, Redis session management, and API documentation. Uses next-devtools for quality analysis and fetch for retrieving Telegram API documentation. Use when building Telegram bots, implementing Web App authentication, configuring Redis sessions, or when detailed Telegram API knowledge is required.
---

# Bot Engineer

Specialized skill for Telegram Bot API development with focus on grammY framework, Web App authentication, Redis sessions, and API documentation access.

## Core Focus Areas

- **Telegram Bot API**: Deep knowledge of Telegram Bot API methods, types, and best practices
- **grammY Framework**: Expert-level grammY patterns, middleware, and architecture
- **Web App Authentication**: Secure Web App init data validation and user authentication
- **Redis Sessions**: Production-ready session management with Redis adapters

## Tools & Resources

### next-devtools Integration

**Always use next-devtools MCP for quality analysis** when working on bot-related code:

```typescript
// Use next-devtools MCP to analyze bot implementation
call_mcp_tool({
  server: "user-next-devtools",
  toolName: "[analysis-tool]", // Check available tools
  arguments: {
    // Tool-specific arguments
  }
})
```

**Workflow:**
1. Implement bot feature
2. Run next-devtools analysis
3. Address any quality issues identified
4. Verify performance and best practices

### API Documentation Access

**Use fetch tool to retrieve Telegram API documentation** when needed:

```typescript
// Fetch Telegram Bot API documentation
const apiDocs = await fetch("https://core.telegram.org/bots/api")
```

**Common documentation sources:**
- Telegram Bot API: `https://core.telegram.org/bots/api`
- grammY Documentation: `https://grammy.dev/`
- Web App API: `https://core.telegram.org/bots/webapps`

**When to fetch docs:**
- Unfamiliar API method or type
- Need to verify parameter requirements
- Checking for API updates or new features
- Understanding Web App authentication flow

## grammY Framework Patterns

### Bot Initialization

```typescript
import { Bot } from "grammy"

const bot = new Bot(process.env.BOT_TOKEN!)

// Configure bot settings
bot.api.config.use((prev, method, payload) => {
  // Add custom configuration
  return prev(method, payload)
})
```

### Middleware Architecture

```typescript
// Sequential middleware
bot.use(async (ctx, next) => {
  // Pre-processing
  await next()
  // Post-processing
})

// Conditional middleware
bot.filter((ctx) => ctx.from?.id === ADMIN_ID).use(adminMiddleware)
```

### Command Handlers

```typescript
bot.command("start", async (ctx) => {
  await ctx.reply("Welcome!", {
    reply_markup: {
      keyboard: [[{ text: "Open Web App", web_app: { url: process.env.WEB_APP_URL! } }]],
      resize_keyboard: true
    }
  })
})
```

## Web App Authentication

### Frontend: Init Data Retrieval

```typescript
"use client"

import { useTelegram } from "@telegram-apps/sdk-react"

export function WebAppAuth() {
  const { initData, initDataRaw } = useTelegram()
  
  // Send initData to backend for validation
  const authenticate = async () => {
    const response = await fetch("/api/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: initDataRaw })
    })
  }
}
```

### Backend: Init Data Validation

```typescript
import { validateWebAppData } from "@telegram-apps/sdk"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { initData } = await request.json()
  
  // Validate init data
  const isValid = validateWebAppData(
    process.env.BOT_TOKEN!,
    initData
  )
  
  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid authentication data" },
      { status: 401 }
    )
  }
  
  // Parse user data from validated init data
  const userData = parseInitData(initData)
  
  // Create or update user session
  return NextResponse.json({ user: userData })
}
```

### Manual Validation (Alternative)

```typescript
import crypto from "crypto"

function validateInitData(initData: string, botToken: string): boolean {
  const urlParams = new URLSearchParams(initData)
  const hash = urlParams.get("hash")
  urlParams.delete("hash")
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")
  
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest()
  
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex")
  
  return calculatedHash === hash
}
```

## Redis Session Management

### Redis Adapter Setup

```typescript
import { Bot } from "grammy"
import { session } from "grammy"
import { RedisAdapter } from "@grammyjs/storage-redis"
import { Redis } from "ioredis"

const redis = new Redis(process.env.REDIS_URL!, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  }
})

const bot = new Bot(process.env.BOT_TOKEN!)

// Session configuration
interface SessionData {
  userId?: number
  state?: string
  data?: Record<string, unknown>
}

bot.use(
  session({
    initial: (): SessionData => ({}),
    storage: new RedisAdapter<SessionData>(redis, {
      prefix: "bot:session:"
    })
  })
)
```

### Session Usage Patterns

```typescript
// Set session data
bot.command("set", async (ctx) => {
  ctx.session.data = { key: "value" }
  await ctx.reply("Data saved")
})

// Access session data
bot.command("get", async (ctx) => {
  const data = ctx.session.data
  await ctx.reply(`Data: ${JSON.stringify(data)}`)
})

// Clear session
bot.command("clear", async (ctx) => {
  ctx.session = {}
  await ctx.reply("Session cleared")
})
```

### Redis Connection Management

```typescript
// Health check
redis.on("error", (err) => {
  console.error("Redis connection error:", err)
})

redis.on("connect", () => {
  console.log("Redis connected")
})

// Graceful shutdown
process.on("SIGTERM", async () => {
  await redis.quit()
  process.exit(0)
})
```

## Webhook Implementation

### Next.js API Route

```typescript
import { Bot } from "grammy"
import { NextRequest, NextResponse } from "next/server"
import bot from "@/lib/telegram/bot"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle update
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

// Webhook info endpoint
export async function GET() {
  const webhookInfo = await bot.api.getWebhookInfo()
  return NextResponse.json(webhookInfo)
}
```

### Webhook Security

```typescript
// Verify webhook secret (if using custom header)
export async function POST(request: NextRequest) {
  const secretHeader = request.headers.get("X-Telegram-Bot-Api-Secret-Token")
  
  if (secretHeader !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  
  // Process webhook
}
```

## Development Workflow

### 1. Setup Phase

```bash
# Install dependencies
npm install grammy @grammyjs/storage-redis ioredis @telegram-apps/sdk-react
```

### 2. Implementation Phase

1. **Fetch API docs** if needed for specific methods
2. **Implement bot logic** using grammY patterns
3. **Configure Redis** for session storage
4. **Set up Web App authentication** if required

### 3. Quality Check Phase

1. **Run next-devtools** analysis
2. **Review code quality** issues
3. **Test session persistence** with Redis
4. **Verify Web App authentication** flow

### 4. Production Deployment

1. **Set webhook URL** in production
2. **Configure Redis** connection
3. **Set environment variables**
4. **Monitor webhook health**

## Quick Reference Checklist

When implementing Telegram bot features:

- [ ] Using grammY framework (not alternatives)
- [ ] Redis adapter configured for sessions
- [ ] Web App authentication validated on backend
- [ ] Webhook API route created for production
- [ ] next-devtools analysis completed
- [ ] API documentation consulted for complex methods
- [ ] Error handling implemented for Redis connections
- [ ] Session data properly typed with TypeScript

## Anti-Patterns

❌ Using in-memory session storage in production  
❌ Skipping init data validation for Web Apps  
❌ Not handling Redis connection errors  
❌ Using long polling in production  
❌ Hardcoding bot tokens or secrets  
❌ Not fetching API docs for unfamiliar methods  
❌ Skipping next-devtools quality checks
