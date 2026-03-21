---
allowed-tools: Read, Grep, Glob, Bash(git diff:*)
description: Review code for quality, security and best practices
---

## Code Review for $ARGUMENTS

Please review the file or folder provided and check for:

1. **Code quality** — naming conventions, readability, complexity
2. **Security** — input validation, injection risks, exposed secrets
3. **NestJS best practices** — proper use of decorators, DI, modules
4. **Next.js best practices** — correct use of App Router, SSR vs CSR
5. **TypeScript** — proper typing, no use of `any`
6. **Error handling** — are errors caught and handled properly?

Provide feedback organized by:
- 🔴 Critical issues (must fix)
- 🟡 Warnings (should fix)
- 🟢 Suggestions (nice to have)