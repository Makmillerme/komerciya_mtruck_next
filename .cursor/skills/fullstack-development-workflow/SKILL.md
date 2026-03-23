---
name: fullstack-development-workflow
description: Manages Next.js fullstack development workflow using Serena MCP for code/documentation, Payload Guru for CMS schemas, and shadcn/next-devtools for frontend. Use when working on Next.js projects with Prisma, Payload CMS, or frontend components.
---

# Fullstack Development Workflow

This skill defines the standard workflow for Next.js fullstack development with Serena, Payload CMS, and shadcn/ui.

## Skill 1: Serena Knowledge Management

**Always use Serena MCP for all code manipulations, documentation, and history updates.**

### Workflow

1. **Project Activation Check**
   - Before starting any task, verify if the project is activated in Serena
   - If not activated, initiate activation first using Serena MCP tools

2. **After Task Completion**
   - Update project history via Serena MCP
   - Update relevant documentation files through Serena
   - Ensure all code changes are tracked in Serena's knowledge base

3. **Code Operations**
   - Use Serena MCP tools for all code edits, refactoring, and file operations
   - Leverage Serena's symbolic tools for precise code modifications
   - Use `find_symbol`, `get_symbols_overview`, and `replace_symbol_body` for structured edits

## Skill 2: Database & Backend Guru

### Database Configuration

- **PostgreSQL**: Use local PostgreSQL for Prisma
- **Password**: `Rty45678+`
- **Connection**: Configure Prisma to use this local PostgreSQL instance

### Payload CMS 3.0 Workflow

1. **Schema Validation**
   - Use `payload-guru` MCP to validate schemas before implementation
   - Ensure all collection schemas follow Payload CMS 3.0 patterns

2. **Collection Generation**
   - Use `payload-guru` MCP to generate collections for Payload CMS 3.0
   - Follow generated patterns and structure

### Prisma Migrations

**CRITICAL**: Always ask for user confirmation before performing Prisma migrations.

- Never run `prisma migrate` or `prisma db push` without explicit user approval
- Present migration plan and wait for confirmation
- Explain potential data impact before proceeding

## Skill 3: Frontend Construction

### Pre-Coding Phase

**Before coding any UI component, describe the "Layout Tree" (component structure).**

The Layout Tree should show:
- Component hierarchy
- Parent-child relationships
- Data flow and props
- State management locations

Example format:
```
Layout Tree:
├── Page Component
│   ├── Header (navigation)
│   ├── Main Content
│   │   ├── Sidebar
│   │   └── Content Area
│   └── Footer
```

### Component Installation Workflow

1. **Search First**: Always search shadcn registry first for existing components
2. **Install via MCP**: Add components via `shadcn` MCP CLI tool
3. **Customize After**: Only customize components after installation from registry

**Never create custom primitives** (inputs, modals, buttons) - always use shadcn components.

### Layout Principles

- **Use ONLY Tailwind Grid or Flexbox** for layouts
- **Avoid `position: absolute`** unless technically unavoidable
- Follow "Shadcn First" principle strictly

### Quality Checks

- **Always utilize `next-devtools` MCP** for project analysis and quality checks
- Run analysis before finalizing frontend changes
- Address any issues identified by next-devtools

## Implementation Logic

Follow these principles:

1. **Cache-first**: Always check for existing solutions before creating new ones
2. **Step-by-step**: Break complex tasks into manageable steps
3. **MCP Integration**: Leverage MCP tools for all specialized operations

## Workflow Summary

```
Task Start
  ↓
Check Serena Activation → Activate if needed
  ↓
For Backend: Use Payload Guru MCP → Validate → Generate → Confirm Prisma migrations
  ↓
For Frontend: Describe Layout Tree → Search shadcn → Install via MCP → Customize
  ↓
Task Complete → Update Serena History & Documentation
  ↓
Run next-devtools for quality check
```
