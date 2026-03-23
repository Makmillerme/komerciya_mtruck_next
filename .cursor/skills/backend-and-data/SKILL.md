---
name: backend-and-data
description: Manages backend data layer with Payload CMS and Prisma. Uses payload-guru MCP for Payload configs and schema validation. Handles Prisma migrations with local PostgreSQL. Always prompts user to choose between Prisma and Payload for new modules. Use when working with databases, creating data models, setting up backend schemas, or configuring CMS.
---

# Backend and Data

## Database Choice Workflow

**Always ask the user to choose** between Prisma and Payload CMS for new modules:

```
"Database Preference: Should this module use Prisma (local PostgreSQL) or Payload CMS?"
```

Do not assume or proceed without explicit user choice.

## Payload CMS

### Configuration Generation

Use `payload-guru` MCP server to generate configs and validate schemas:

```typescript
// Check available tools first
call_mcp_tool({
  server: "user-payload-guru",
  toolName: "[tool-name]", // Check available tools via MCP
  arguments: {
    // Tool-specific arguments
  }
})
```

**Workflow:**
1. Use payload-guru MCP tools to generate collection configs
2. Validate schemas before implementation
3. Follow Payload CMS 3.0 patterns

### Schema Validation

Always validate Payload schemas using payload-guru MCP before applying changes.

## Prisma

### Local PostgreSQL Connection

Connect to local PostgreSQL database. Use password: `Rty45678+` for local Prisma connections.

### Migration Workflow

**Critical:** Always check migrations before applying:

1. **Generate migration:**
   ```bash
   npx prisma migrate dev --name [migration-name]
   ```

2. **Review migration files** before applying:
   - Check `prisma/migrations/` directory
   - Verify schema changes are correct
   - Ensure no data loss

3. **Apply migration:**
   ```bash
   npx prisma migrate deploy
   ```

**Never skip migration review.** Always verify migration files match intended schema changes.

### Prisma Best Practices

- Use `prisma migrate dev` for development
- Use `prisma migrate deploy` for production
- Always backup database before major migrations
- Review generated SQL in migration files

## Quick Reference Checklist

When setting up backend data layer:

- [ ] Asked user to choose between Prisma and Payload CMS
- [ ] For Payload: Used payload-guru MCP for config generation
- [ ] For Payload: Validated schemas before implementation
- [ ] For Prisma: Reviewed migration files before applying
- [ ] For Prisma: Verified local PostgreSQL connection (password: Rty45678+)
- [ ] Confirmed no data loss in migration changes

## Anti-Patterns

❌ Assuming database choice without asking user  
❌ Applying Prisma migrations without reviewing files  
❌ Creating Payload configs manually without using payload-guru MCP  
❌ Skipping schema validation for Payload collections