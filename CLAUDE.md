# Shop App — Project Context

## What this project is
A full-stack e-commerce app built to learn Claude Code
power features (slash commands, skills, sub-agents,
dynamic agent workflows).

## Tech Stack
- Backend: NestJS + TypeScript + TypeORM + PostgreSQL
- Frontend: Next.js 15 + TypeScript
- Database: PostgreSQL (shopapp db, port 5432)
- Auth: JWT (complete)

## Running the project
- Backend: cd backend && npm run start:dev (port 3000)
- Frontend: cd frontend && npm run dev (port 3001)
- Database: PostgreSQL localhost:5432 shopapp

## Project structure
- backend/src/products/ — Products CRUD + stock management
- backend/src/cart/ — Cart with real stock updates
- backend/src/orders/ — Order placement
- backend/src/auth/ — JWT auth (AuthService, AuthController, JwtStrategy, guards)
- backend/src/users/ — User entity + UsersService
- frontend/src/app/ — Next.js pages
- frontend/src/hooks/useAuth.ts — JWT auth hook (reads localStorage, decodes token)
- .claude/commands/ — Custom slash commands
- .claude/skills/ — Auto-loaded conventions
- .claude/agents/ — Sub-agents

## Claude Code commands available
- /review [file] — code review
- /gen-tests [file] — generate tests
- /explain-flow [file] — explain code flow
- /smart-review [file/folder] — smart routing review

## What's been built
- 100 products across 10 categories in PostgreSQL
- Category filter + pagination + search
- Add product modal + delete product
- Stock management (decreases on cart add, restores on remove)
- DTO validation with class-validator
- TypeORM with PostgreSQL
- JWT authentication (complete)
  - POST /auth/register and POST /auth/login → { access_token }
  - JwtAuthGuard protects: POST /cart, DELETE /cart, DELETE /cart/:id, GET /orders, POST /orders
  - RolesGuard (admin only) protects: POST /products, DELETE /products/:id
  - Admin seeded on startup: admin@shop.com / admin123
- Frontend auth
  - Login page (/login), Register page (/register)
  - useAuth hook decodes JWT from localStorage
  - Header shows Login/Register or email + Logout
  - Add Product and Delete buttons visible to admins only
  - Cart page redirects to /login if not authenticated
  - Authorization: Bearer token header on all protected fetches

## Database
- Host: localhost
- Port: 5432
- Username: postgres
- Password: 0000
- Database: shopapp
- Tables: product, cart_item, order, user

## Seeded data
- 100 products (10 per category)
- Admin user: admin@shop.com / admin123 (seeded on backend startup)

## Known issues to fix
- float price type should be decimal(10,2)
- No MaxLength on string fields
- affected === undefined edge case in remove()
