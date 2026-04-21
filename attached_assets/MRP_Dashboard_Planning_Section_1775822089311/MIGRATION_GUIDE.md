# Migration Guide: Using IndexedDB + PostgreSQL Data Layer

This guide shows how to update existing React components to use the new data architecture.

## Before & After Comparison

### Before: Static Mock Data

```typescript
// OLD - Using mock data directly
import { inventoryItems } from '@/data/inventory';
import { boms } from '@/data/bom';

export default function InventoryPage() {
  return (
    <div>
      {inventoryItems.map(item => (
        <div key={item.id}>{item.name}: {item.currentStock}</div>
      ))}
    </div>
  );
}
```

### After: Dynamic IndexedDB Data

```typescript
// NEW - Using async functions to fetch from IndexedDB
import { useEffect, useState } from 'react';
import { getAllInventoryItems } from '@/data/inventory';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllInventoryItems().then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}: {item.currentStock}</div>
      ))}
    </div>
  );
}
```

## Step-by-Step Migration

### Step 1: Update Imports

```typescript
// BEFORE
import { inventoryItems } from "@/data/inventory";

// AFTER
import { getAllInventoryItems, getInventoryItemById } from "@/data/inventory";
```

### Step 2: Move to useEffect with Async

```typescript
import { useEffect, useState } from 'react';
import { getAllInventoryItems } from '@/data/inventory';

export default function Component() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getAllInventoryItems();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array = run once on mount

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    // render data
  );
}
```

### Step 3: Handle Data Dependency Updates

If you need to fetch data when dependencies change:

```typescript
useEffect(() => {
  const fetchData = async () => {
    const filtered = await getInventoryItemById(selectedId);
    setData(filtered);
  };

  if (selectedId) {
    fetchData();
  }
}, [selectedId]); // Re-fetch when selectedId changes
```

### Step 4: Create a Custom Hook (Recommended)

Create `src/hooks/useInventory.ts`:

```typescript
import { useEffect, useState } from "react";
import { getAllInventoryItems, getInventoryItemById } from "@/data/inventory";

export function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllInventoryItems()
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { items, loading, error };
}

export function useInventoryItem(id) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    getInventoryItemById(id)
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [id]);

  return { item, loading, error };
}
```

Then use in components:

```typescript
import { useInventory, useInventoryItem } from '@/hooks/useInventory';

export default function InventoryPage() {
  const { items, loading, error } = useInventory();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {items.map(item => (
        <InventoryRow key={item.id} item={item} />
      ))}
    </div>
  );
}

function InventoryRow({ item: initialItem }) {
  const { item } = useInventoryItem(initialItem.id);

  return <div>{item?.name}: {item?.currentStock}</div>;
}
```

## Common Patterns

### Pattern 1: List with Filter

```typescript
import { useEffect, useState } from 'react';
import { getAllInventoryItems } from '@/data/inventory';

export default function FilteredInventory() {
  const [allItems, setAllItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    getAllInventoryItems().then(setAllItems);
  }, []);

  useEffect(() => {
    if (category === 'all') {
      setFiltered(allItems);
    } else {
      setFiltered(allItems.filter(item => item.category === category));
    }
  }, [allItems, category]);

  return (
    <>
      <select onChange={e => setCategory(e.target.value)}>
        <option value="all">All</option>
        <option value="fabric">Fabric</option>
        <option value="foam">Foam</option>
      </select>

      {filtered.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </>
  );
}
```

### Pattern 2: Form with Single Item

```typescript
import { useEffect, useState } from 'react';
import { getInventoryItemById } from '@/data/inventory';

export default function EditInventory({ itemId }) {
  const [item, setItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    getInventoryItemById(itemId).then(data => {
      setItem(data);
      setFormData(data);
    });
  }, [itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Send to API or sync service
    console.log('Saving:', formData);
  };

  if (!item) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
      />
      <button type="submit">Save</button>
    </form>
  );
}
```

### Pattern 3: Manual Sync Trigger

```typescript
import { useEffect, useState } from 'react';
import { getDataSyncService } from '@/services/dataSync';

export default function SyncStatus() {
  const [status, setStatus] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateStatus = async () => {
      const syncService = getDataSyncService();
      const syncStatus = await syncService?.getStatus();
      setStatus(syncStatus);
    };

    updateStatus();

    // Poll every 10 seconds
    const interval = setInterval(updateStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    const syncService = getDataSyncService();
    setIsSyncing(true);
    await syncService?.sync();
    setIsSyncing(false);

    const newStatus = await syncService?.getStatus();
    setStatus(newStatus);
  };

  return (
    <div>
      <p>Last Sync: {status?.lastSync || 'Never'}</p>
      <p>Online: {status?.isOnline ? '✓' : '✗'}</p>
      <p>Inventory Items: {status?.stores.inventory}</p>

      <button
        onClick={handleManualSync}
        disabled={isSyncing}
      >
        {isSyncing ? 'Syncing...' : 'Sync Now'}
      </button>
    </div>
  );
}
```

### Pattern 4: Table Component

```typescript
import { useEffect, useState } from 'react';
import { getAllInventoryItems } from '@/data/inventory';

interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  reorderPoint: number;
  [key: string]: any;
}

export default function InventoryTable() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'stock'>('name');

  useEffect(() => {
    getAllInventoryItems().then(data => {
      const sorted = [...data].sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else {
          return a.currentStock - b.currentStock;
        }
      });
      setItems(sorted);
      setLoading(false);
    });
  }, [sortBy]);

  if (loading) return <div>Loading...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th
            onClick={() => setSortBy('name')}
            style={{ cursor: 'pointer' }}
          >
            Name
          </th>
          <th
            onClick={() => setSortBy('stock')}
            style={{ cursor: 'pointer' }}
          >
            Stock
          </th>
          <th>Reorder Point</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.currentStock}</td>
            <td>{item.reorderPoint}</td>
            <td>
              {item.currentStock < item.reorderPoint ?
                '⚠️ Low' : '✓ OK'
              }
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Error Handling Best Practices

```typescript
import { useEffect, useState } from 'react';
import { getAllInventoryItems } from '@/data/inventory';

export default function SafeComponent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors

        const result = await getAllInventoryItems();

        if (!result || !Array.isArray(result)) {
          throw new Error('Invalid data format');
        }

        setItems(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Failed to fetch inventory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (error) return (
    <div style={{ color: 'red' }}>
      Error: {error}
      <button onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );

  if (!items || items.length === 0) return <div>No data</div>;

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

## Updating Existing Pages

### Example: `InventoryPage.tsx`

**Before:**

```typescript
import { inventoryItems } from '@/data/inventory';

export default function InventoryPage() {
  return (
    <div>
      {inventoryItems.map(item => <InventoryCard key={item.id} item={item} />)}
    </div>
  );
}
```

**After:**

```typescript
import { useEffect, useState } from 'react';
import { getAllInventoryItems } from '@/data/inventory';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllInventoryItems()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {items.map(item => <InventoryCard key={item.id} item={item} />)}
    </div>
  );
}
```

## Data Caching Strategy

If you need to cache data client-side to avoid excessive IndexedDB queries:

```typescript
import { useEffect, useRef, useState } from 'react';
import { getAllInventoryItems } from '@/data/inventory';

export default function CachedInventory() {
  const cacheRef = useRef<any[] | null>(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (cacheRef.current) {
        // Use cached data
        setItems(cacheRef.current);
        setLoading(false);
      } else {
        // Fetch from IndexedDB and cache
        const data = await getAllInventoryItems();
        cacheRef.current = data;
        setItems(data);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Invalidate cache on demand
  const refresh = async () => {
    cacheRef.current = null;
    const data = await getAllInventoryItems();
    cacheRef.current = data;
    setItems(data);
  };

  return (
    <>
      {loading ? <div>Loading...</div> : <div>{items.length} items</div>}
      <button onClick={refresh}>Refresh</button>
    </>
  );
}
```

## Summary Checklist

- [ ] Update all imports from static data to async functions
- [ ] Wrap data access in `useEffect`
- [ ] Add loading and error states
- [ ] Create custom hooks for frequently used data
- [ ] Test offline functionality (disconnect from network)
- [ ] Verify sync is happening (check browser DevTools)
- [ ] Remove old static mock data imports
- [ ] Update component tests with async data
- [ ] Document any custom data fetching patterns
- [ ] Monitor performance (should be fast with IndexedDB)

---

**Questions?** See `DATA_ARCHITECTURE.md` for more details or check `QUICKSTART_POSTGRESQL.md` for setup issues.
