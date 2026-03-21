---
name: nestjs-conventions
description: NestJS and Next.js conventions for the shop-app project
---

## Project: shop-app

### Tech stack
- Backend: NestJS + TypeScript (port 3000)
- Frontend: Next.js 15 App Router + TypeScript (port 3001)
- No database — in-memory arrays for storage
- Tests: Jest + NestJS TestingModule

### NestJS conventions
- Every feature has: module, controller, service, dto files
- DTOs are in `feature.dto.ts` — use class-validator decorators
- Services hold all business logic — controllers are thin
- Always export services that other modules need
- Use `NotFoundException` for missing resources
- DELETE endpoints return 204 No Content with `@HttpCode(HttpStatus.NO_CONTENT)`
- Always return copies of arrays: `return [...this.items]`

### Next.js conventions
- Use App Router only — no pages/ directory
- All pages that use hooks must have `'use client'` at top
- Fetch calls go directly in components using useEffect
- Keep pages in `src/app/` following folder = route pattern

### Testing conventions
- Pattern: Arrange, Act, Assert
- Use `Test.createTestingModule` for NestJS services
- Create fresh module in `beforeEach` for test isolation
- Name KNOWN ISSUE tests clearly with `KNOWN ISSUE —` prefix
- Mock external dependencies with Jest mocks

### Code style
- No `any` types — always use proper interfaces
- Interfaces go in dedicated `.interface.ts` or `.entity.ts` files
- Keep controllers thin — all logic in services
- Always handle errors with proper NestJS exceptions
```

Save it. Now test that Claude Code picks it up automatically. In Claude Code terminal type:
```
/explain-flow backend/src/cart/cart.controller.ts