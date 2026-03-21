---
name: smart-review
description: Intelligently routes code review to the right agent based on file type
allowed-tools: Read, Grep, Glob
context: fork
agent: code-reviewer
---

## Smart Review for $ARGUMENTS

Analyze the file(s) provided and perform a targeted review based on file type:

### Routing logic

**If file is `*.service.ts`:**
- Focus on business logic correctness
- Check for proper error handling with NestJS exceptions
- Verify no direct array references returned
- Check for missing CRUD methods

**If file is `*.controller.ts`:**
- Focus on HTTP semantics (correct status codes)
- Check for input validation via DTOs
- Verify thin controller pattern (no business logic)
- Check route naming conventions

**If file is `*.dto.ts`:**
- Focus on class-validator decorators
- Check all fields have proper validation
- Verify no missing required fields

**If file is `*.tsx` or `*.ts` in frontend:**
- Focus on Next.js 15 App Router patterns
- Check for missing `'use client'` directive
- Verify proper TypeScript interfaces
- Check for hardcoded URLs (should use env vars)

**If no specific file given — review entire project:**
- Scan all backend services first
- Then controllers
- Then frontend pages
- Summarize top 3 critical issues across the whole codebase

Always end with:
1. ✅ Top 3 things done well
2. 🎯 Top 3 priorities to fix next
```
