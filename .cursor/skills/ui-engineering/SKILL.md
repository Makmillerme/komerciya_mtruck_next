---
name: ui-engineering
description: Enforces Shadcn First principle for UI development. Guides component selection via shadcn registry search, CLI installation, and customization with tailwind-merge. Enforces Tailwind Grid/Flex layouts and Zod schema validation for forms. Use when creating UI components, building forms, implementing layouts, or when the user requests UI work.
---

# UI Engineering

## Core Principle: Shadcn First

**Never create custom primitives** (inputs, modals, buttons, etc.). Always search shadcn registry first, add via CLI, then customize.

## Component Workflow

### Step 1: Search Registry via MCP

Use `search_items_in_registries` MCP tool to find components:

```typescript
// Search for components matching your need
call_mcp_tool({
  server: "user-shadcn",
  toolName: "search_items_in_registries",
  arguments: {
    registries: ["@shadcn"],
    query: "button" // or "modal", "form", etc.
  }
})
```

If needed, use `list_items_in_registries` to browse available components.

### Step 2: Add Component via CLI

Get the CLI command using MCP:

```typescript
call_mcp_tool({
  server: "user-shadcn",
  toolName: "get_add_command_for_items",
  arguments: {
    items: ["@shadcn/button"] // Use the exact registry path from search results
  }
})
```

Execute the returned command (e.g., `npx shadcn@latest add button`).

### Step 3: Customize with tailwind-merge

Use the `cn` utility from `lib/utils.ts` (which uses `tailwind-merge`) to merge Tailwind classes:

```typescript
import { cn } from "@/lib/utils"

<Button className={cn(
  "base-classes",
  condition && "conditional-classes",
  customClasses
)}>
```

**Never** use string concatenation or template literals for class merging. Always use `cn()`.

## Layout Guidelines

### Use Tailwind Grid or Flexbox

**Preferred:**
```tsx
<div className="flex flex-col gap-4">
<div className="grid grid-cols-3 gap-4">
```

**Avoid:**
```tsx
<div className="absolute top-0 left-0">
// Only use position:absolute when technically unavoidable
```

### Layout Patterns

- **Flexbox**: For one-dimensional layouts (rows/columns)
- **Grid**: For two-dimensional layouts (complex grids)
- **Gap utilities**: Always use `gap-*` instead of margins for spacing

## Form Validation

**Always use Zod schemas** for form validation with React Hook Form:

```typescript
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const formSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(2, "Name must be at least 2 characters")
})

type FormValues = z.infer<typeof formSchema>

const form = useForm<FormValues>({
  resolver: zodResolver(formSchema)
})
```

**Never** skip schema validation or use manual validation.

## Quick Reference Checklist

When implementing UI:

- [ ] Searched shadcn registry via MCP first
- [ ] Added component via CLI (not manually created)
- [ ] Used `cn()` from `lib/utils.ts` for class merging
- [ ] Used Tailwind Grid or Flexbox (avoided position:absolute)
- [ ] Created Zod schema for any form
- [ ] Used React Hook Form with zodResolver

## Anti-Patterns

❌ Creating custom Button, Input, Modal components  
❌ Using `className={base + " " + conditional}`  
❌ Using `position: absolute` for layout  
❌ Form validation without Zod schemas  
❌ Manual form state management instead of React Hook Form
