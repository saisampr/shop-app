---
allowed-tools: Read, Grep, Glob
description: Generate unit tests for a given file
---

## Generate Tests for $ARGUMENTS

Analyze the file and generate unit tests:

1. **Framework** — use Jest (NestJS default)
2. **Pattern** — Arrange, Act, Assert
3. **Coverage** — happy path, edge cases, error cases
4. **Mocks** — mock external dependencies properly

For NestJS services use `Test.createTestingModule`.
For Next.js components use React Testing Library.

Generate complete, runnable test file ready to copy.