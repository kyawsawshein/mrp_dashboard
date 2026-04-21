# Quick Start Guide - PostgreSQL + IndexedDB Integration

## 30-Second Setup

### 1. Database

```bash
# Create database
psql -U postgres -c "CREATE DATABASE mrp_dashboard;"

# Initialize schema
psql -U postgres -d mrp_dashboard -f server/schema.sql
```

### 2. Environment

Create `.env` in root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mrp_dashboard
DB_USER=postgres
DB_PASSWORD=postgres

API_PORT=5000
```

### 3. Install & Run

**Terminal 1 - Backend:**

```bash
cd server && npm install && npm run dev
```

**Terminal 2 - Frontend:**

```bash
npm install
npm run dev
```

✅ Done! App syncs automatically from PostgreSQL → IndexedDB

## Key Features

✓ **Offline First**: App works without internet via IndexedDB  
✓ **Auto-Sync**: Every 5 minutes from PostgreSQL  
✓ **Fast UI**: All reads from IndexedDB (no network latency)  
✓ **Fallback**: Mock data if PostgreSQL unavailable  
✓ **Type-Safe**: TypeScript throughout

## Common Commands

```bash
# Sync data manually (in browser console)
await getDataSyncService()?.sync()

# Check sync status
await getDataSyncService()?.getStatus()

# Fetch from IndexedDB
const items = await getAllInventoryItems()

# Reset database
psql -U postgres -d mrp_dashboard -f server/schema.sql
```

## Architecture at a Glance

```
PostgreSQL (Server)
    ↓
Express API (localhost:5000)
    ↓
IndexedDB (Browser)
    ↓
React UI (Instant, no network delays)
```

## Troubleshooting

| Error                                | Fix                                                                  |
| ------------------------------------ | -------------------------------------------------------------------- |
| `Connection refused :5432`           | Start PostgreSQL service                                             |
| `VITE_API_URL not configured`        | Add to `.env.local`: `VITE_API_URL=http://localhost:5000`            |
| `Relation "products" does not exist` | Run schema: `psql -U postgres -d mrp_dashboard -f server/schema.sql` |
| `IndexedDB empty`                    | Trigger manual sync or refresh page                                  |

## File Structure

```
├── server/                    # Backend
│   ├── index.ts              # Express API server
│   ├── db.ts                 # PostgreSQL connection
│   ├── schema.sql            # Database schema
│   ├── package.json          # Backend dependencies
│   └── tsconfig.json         # TypeScript config
├── lib/
│   └── indexed-db.ts         # IndexedDB manager
├── src/
│   ├── services/
│   │   └── dataSync.ts       # Data sync service
│   ├── data/
│   │   ├── inventory.ts      # Fetch from IndexedDB
│   │   ├── products.ts       # Fetch from IndexedDB
│   │   └── bom.ts            # Fetch from IndexedDB
│   └── app/App.tsx           # Initialize sync
├── .env.example              # Example config
└── package.json              # Frontend dependencies
```

## Next Level: Custom Queries

Need to fetch specific data? Update backend endpoints in `server/index.ts`:

```typescript
app.get("/inventory/low-stock", async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM inventory 
    WHERE currentStock < reorderPoint
    ORDER BY currentStock ASC
  `);
  res.json(result.rows);
});
```

Then sync/fetch from frontend.

---

**For detailed docs, see `DATA_ARCHITECTURE.md`**
