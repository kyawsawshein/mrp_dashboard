# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## MRP Dashboard (`artifacts/mrp-dashboard`)

A full-featured MRP (Material Requirements Planning) Dashboard for a car seat cover, tent, and garment manufacturing company.

### Features
- **Overview** — Dashboard with manufacturing stats, department capacity charts, and quick stats
- **Manufacturing Orders** — Full CRUD with status, priority, progress tracking across departments
- **MRP Planning** — Multi-level BOM explosion, material requirements calculation, purchase recommendations
- **Production Scheduling** — Capacity planning, conflict detection, order routing
- **Shop Floor Terminal** — Real-time WIP tracking, operator assignment, material consumption logging
- **Production Analytics** — Material variance analysis, scrap/rework tracking
- **Bill of Materials (BOM)** — Manage BOMs with items, costs, versions
- **Inventory/Materials** — Stock levels, reorder points, value tracking
- **Products** — Finished product management
- **Calendar View** — Production calendar
- **Gantt Chart** — Drag-and-drop order scheduling (requires react-dnd)
- **Work Centers & Routing** — Machine/workstation management
- **Alerts** — Material shortage and schedule alerts
- **Analytics & KPIs** — Production trends, department performance, defect analysis

### Tech Stack
- React + Vite + TypeScript
- react-router v7 for routing (with `basename: import.meta.env.BASE_URL`)
- Tailwind CSS v4 with shadcn/ui components
- Recharts for charts
- react-dnd for Gantt drag-and-drop
- sonner for toast notifications

### Data Structure
- `src/data/mockData.ts` — All mock data: inventory, orders, BOMs, products, alerts, analytics
- `src/data/bom.ts` — Adapter re-exporting BOMs in mrpEngine's expected format (`lines` not `items`)
- `src/data/products.ts` — Re-exports `finishedProducts` as `products`
- `src/data/inventory.ts` — Re-exports `inventoryItems`
- `src/data/workCenters.ts` — Work center and machine data
- `src/data/schedulingEngine.ts` — Production scheduling calculations
- `src/data/shopFloorEngine.ts` — Shop floor tracking calculations
- `src/engines/mrpEngine.ts` — Multi-level MRP calculation engine

### Port
- Dev server: `$PORT` (19051)
