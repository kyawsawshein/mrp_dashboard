# PostgreSQL + IndexedDB Data Architecture

This guide explains the new data architecture for the MRP Dashboard, which implements a three-tier system: **PostgreSQL (Server) → Express API → IndexedDB (Client)**.

## Architecture Overview

```
┌─────────────────────┐
│   PostgreSQL DB     │
│   (Server-side)     │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Express API Server │
│  (REST Endpoints)   │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   IndexedDB         │
│   (Browser Cache)   │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   React UI          │
│   (Components)      │
└─────────────────────┘
```

## Setup Instructions

### 1. PostgreSQL Database Setup

#### Prerequisites

- PostgreSQL 12+ installed locally
- `psql` command-line tool available

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mrp_dashboard;

# Exit
\q
```

#### Initialize Schema

```bash
# Navigate to server directory
cd server

# Run schema setup
psql -U postgres -d mrp_dashboard -f schema.sql
```

Alternatively, copy/paste the SQL from `server/schema.sql` in pgAdmin or your PostgreSQL client.

### 2. Environment Configuration

#### Frontend Configuration (.env.local or .env)

```env
VITE_API_URL=http://localhost:5000
```

#### Backend Configuration (.env)

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mrp_dashboard
DB_USER=postgres
DB_PASSWORD=your_password_here

# API Server
API_PORT=5000
API_HOST=localhost
```

### 3. Install Dependencies

#### Frontend

```bash
npm install
# or
pnpm install
```

#### Backend

```bash
cd server
npm install
```

### 4. Run the Application

#### Terminal 1: Start Backend Server

```bash
cd server
npm run dev
```

Output:

```
🚀 MRP API Server running on http://localhost:5000
Database: mrp_dashboard at localhost:5432
```

#### Terminal 2: Start Frontend (Vite Dev Server)

```bash
npm run dev
```

The app will open at `http://localhost:5173` (or similar)

## Data Flow

### 1. Initial Load

```
App Start
   ↓
initializeDataSync()
   ↓
IndexedDB.init()
   ↓
syncDataFromServer()
   ↓
Fetch from Express API
   ↓
API queries PostgreSQL
   ↓
Return JSON to client
   ↓
Save to IndexedDB
   ↓
UI fetches from IndexedDB
```

### 2. During Runtime

- **Auto-sync**: Every 5 minutes (configurable), the app syncs data from PostgreSQL
- **Manual sync**: Can trigger `getDataSyncService().sync()` from UI
- **Reads**: UI always reads from IndexedDB for fast performance
- **Writes**: Changes saved to IndexedDB, optionally sync back to PostgreSQL

### 3. Offline Mode

- If PostgreSQL is unavailable, app uses IndexedDB fallback
- Mock data available as last resort
- Changes made offline sync when connection restored

## API Endpoints

### Products

- `GET /products` - List all products
- `GET /products/:id` - Get single product

### Inventory

- `GET /inventory` - List all inventory items
- `GET /inventory/:id` - Get single item
- `PUT /inventory/:id` - Update inventory stock
- `POST /sync/inventory` - Sync inventory changes to PostgreSQL

### Bill of Materials (BOM)

- `GET /bom` - List all BOMs with lines
- `GET /bom/:id` - Get single BOM

### Manufacturing Orders

- `GET /orders` - List all orders
- `GET /orders/:id` - Get single order
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order

### Health & Status

- `GET /health` - API health check

## IndexedDB Store Structure

### Stores

1. **products** - Finished products
2. **bom** - Bills of materials
3. **inventory** - Raw materials and components
4. **orders** - Manufacturing orders
5. **cache** - API response cache (1 hour TTL)

## Data Sync Service Usage

### In React Components

```typescript
import { getDataSyncService } from "@/services/dataSync";

// Get current sync status
const status = await getDataSyncService()?.getStatus();
console.log(status);
// Output:
// {
//   lastSync: "2024-04-21T10:30:00Z",
//   stores: { products: 45, bom: 12, inventory: 234, orders: 8 },
//   isOnline: true
// }

// Manually trigger sync
await getDataSyncService()?.sync();

// Sync specific store
await getDataSyncService()?.syncStore("inventory");

// Check if sync in progress
const isSyncing = getDataSyncService()?.isCurrentlySyncing();
```

### Fetching Data

```typescript
import { getAllInventoryItems, getInventoryItemById } from "@/data/inventory";
import { getAllProducts } from "@/data/products";

// Get all items (from IndexedDB)
const items = await getAllInventoryItems();

// Get single item
const item = await getInventoryItemById("MAT-001");

// These functions automatically:
// 1. Try to fetch from IndexedDB
// 2. Fall back to PostgreSQL if cache empty
// 3. Use mock data if PostgreSQL unavailable
```

## Troubleshooting

### API Connection Failed

```
Error: Failed to sync products
```

**Solution:**

- Ensure backend server is running (`npm run dev` in server directory)
- Check `VITE_API_URL` environment variable
- Verify PostgreSQL is running: `psql -U postgres -c "\l"`

### IndexedDB Not Syncing

```
[IndexedDB] Error loading from IndexedDB
```

**Solution:**

- Clear browser storage: DevTools → Application → IndexedDB → Delete
- Refresh page (Ctrl+Shift+R for hard refresh)
- Check browser console for detailed errors

### PostgreSQL Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**

- Start PostgreSQL service (Windows: `pg_ctl -D "C:\Program Files\PostgreSQL\data" start`)
- Verify credentials in `.env`
- Check database exists: `psql -U postgres -l`

### Schema Missing Tables

```
Error: relation "products" does not exist
```

**Solution:**

```bash
psql -U postgres -d mrp_dashboard -f server/schema.sql
```

## Performance Optimization

### Sync Interval

Default: 5 minutes. Adjust in `App.tsx`:

```typescript
initializeDataSync({
  autoSyncInterval: 2 * 60 * 1000, // 2 minutes
});
```

### Cache Management

IndexedDB API responses cached for 1 hour. Clear cache manually:

```typescript
import { clearStoreData } from "@/lib/indexed-db";

await clearStoreData("products");
```

## Production Deployment

### Frontend

```bash
npm run build
# Deploy dist/ folder to web server
```

### Backend

1. Set environment variables on server
2. Ensure PostgreSQL is secured (firewall, authentication)
3. Build: `cd server && npm run build`
4. Run: `npm start`

## Database Backup & Restore

### Backup

```bash
pg_dump -U postgres mrp_dashboard > backup.sql
```

### Restore

```bash
psql -U postgres -d mrp_dashboard < backup.sql
```

## Next Steps

1. ✅ PostgreSQL + Schema setup
2. ✅ Backend API running
3. ✅ IndexedDB integration
4. ✅ Data sync service
5. 🔄 Add data mutation endpoints (POST/PUT)
6. 🔄 Implement real-time sync with WebSockets
7. 🔄 Add user authentication
8. 🔄 Implement data versioning/conflict resolution
