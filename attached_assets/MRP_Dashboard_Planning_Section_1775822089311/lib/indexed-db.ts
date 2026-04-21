// IndexedDB utility for offline project data storage

const DB_NAME = 'MRP_DB';
const DB_VERSION = 1;
const PRODUCTS_STORE = 'products';
const BOM_STORE = 'bom';
const CACHE_STORE = 'cache';
const INVENTORY_STORE = 'inventory';
const ORDERS_STORE = 'orders';

export interface ProjectData {
  id: number;
  name: string;
  sales_order?: string;
  item_number?: string;
  color: string;
  progress: number;
  deadline?: string;
  is_overdue: boolean;
  tasks?: any[];
  documents?: any[];
  allocated_time_hours?: number;
  actual_time_seconds?: number;
  lastUpdated: string;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  private logError(error: any, context: string) {
    console.error(`[IndexedDBManager] Error during ${context}:`, error);
  }

  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        this.logError(request.error, `database initialization for '${DB_NAME}' v${DB_VERSION}`);
        reject(request.error);
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        const stores = [
          { name: PRODUCTS_STORE, key: 'id' },
          { name: BOM_STORE, key: 'id' },
          { name: INVENTORY_STORE, key: 'id' },
          { name: ORDERS_STORE, key: 'id' }
        ];

        stores.forEach(s => {
          if (!db.objectStoreNames.contains(s.name)) {
            const store = db.createObjectStore(s.name, { keyPath: s.key });
            store.createIndex('lastUpdated', 'lastUpdated', { unique: false });
          }
        });

        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          const cacheStore = db.createObjectStore(CACHE_STORE, { keyPath: 'url' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async getDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }
    return await this.init();
  }

  async clearStore(store_name: string): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([store_name], 'readwrite');
    const store = transaction.objectStore(store_name);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => {
        this.logError(request.error, `clearing store '${store_name}'`);
        reject(request.error);
      };
    });
  }

  // Cache operations for API responses
  async saveApiResponse(url: string, data: any): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([CACHE_STORE], 'readwrite');
    const store = transaction.objectStore(CACHE_STORE);

    return new Promise((resolve, reject) => {
      const cacheEntry = {
        url,
        data,
        timestamp: new Date().toISOString()
      };
      const request = store.put(cacheEntry);
      request.onsuccess = () => resolve();
      request.onerror = () => {
        this.logError(request.error, `saving API response for URL: ${url}`);
        reject(request.error);
      };
    });
  }

  async getApiResponse(url: string): Promise<any | null> {
    const db = await this.getDB();
    const transaction = db.transaction([CACHE_STORE], 'readonly');
    const store = transaction.objectStore(CACHE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.get(url);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Check if cache is still valid (1 hour)
          const cacheTime = new Date(result.timestamp).getTime();
          const currentTime = new Date().getTime();
          const oneHour = 60 * 60 * 1000;

          if (currentTime - cacheTime < oneHour) {
            resolve(result.data);
          } else {
            // Cache expired, remove it
            const deleteRequest = store.delete(url);
            deleteRequest.onerror = () => {
              this.logError(deleteRequest.error, `deleting expired cache for URL: ${url}`);
            };
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      request.onerror = () => {
        this.logError(request.error, `getting API response for URL: ${url}`);
        reject(request.error);
      };
    });
  }

  async clearCache(): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([CACHE_STORE], 'readwrite');
    const store = transaction.objectStore(CACHE_STORE);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => {
        this.logError(request.error, `clearing cache store '${CACHE_STORE}'`);
        reject(request.error);
      };
    });
  }

  // Check if database has any projects stored
  async hasProjects(): Promise<boolean> {
    const projects = await this.getProjects();
    return projects.length > 0;
  }

  // Get last update timestamp
  async getLastUpdate(): Promise<string | null> {
    const projects = await this.getProjects();
    if (projects.length === 0) return null;

    const timestamps = projects.map(p => new Date(p.lastUpdated).getTime());
    const latest = new Date(Math.max(...timestamps));
    return latest.toISOString();
  }

  async saveStore(store_name: string, datas: any[]): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([store_name], 'readwrite');
    const store = transaction.objectStore(store_name);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => {
        this.logError(transaction.error, `saving data to store '${store_name}'`);
        reject(transaction.error);
      };

      datas.forEach(data => {
        const projectWithTimestamp = {
          ...data,
          lastUpdated: new Date().toISOString()
        };
        store.put(projectWithTimestamp);
      });
    });
  }

  async getStores(store_name: string): Promise<ProjectData[]> {
    const db = await this.getDB();
    const transaction = db.transaction([store_name], 'readonly');
    const store = transaction.objectStore(store_name);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        this.logError(request.error, `getting all data from store '${store_name}'`);
        reject(request.error);
      };
    });
  }

  async getStoreId(store_name: string, id: number): Promise<ProjectData | null> {
    const db = await this.getDB();
    const transaction = db.transaction([store_name], 'readonly');
    const store = transaction.objectStore(store_name);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => {
        this.logError(request.error, `getting item with id ${id} from store '${store_name}'`);
        reject(request.error);
      };
    });
  }

  async clearStores(store_name: string): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([store_name], 'readwrite');
    const store = transaction.objectStore(store_name);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => {
        this.logError(request.error, `clearing store '${store_name}'`);
        reject(request.error);
      };
    });
  }
}

/**
 * Synchronizes local IndexedDB with PostgreSQL via API
 * Handles full data sync with error recovery
 */
export async function syncDataFromServer() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  if (!API_URL) {
    console.warn('[Sync] API_URL not configured, skipping server sync');
    return;
  }

  const endpoints = [
    { path: '/products', store: PRODUCTS_STORE },
    { path: '/bom', store: BOM_STORE },
    { path: '/inventory', store: INVENTORY_STORE },
    { path: '/orders', store: ORDERS_STORE },
  ];

  console.log(`[Sync] Starting data sync from ${API_URL}`);

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint.path}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      await clearStoreData(endpoint.store);
      await saveToIndexedDB(endpoint.store, data);
      console.log(`✓ Synced ${endpoint.store} from PostgreSQL (${data.length} items)`);
    } catch (error) {
      console.error(`✗ Failed to sync ${endpoint.store}:`, error);
    }
  }

  console.log('[Sync] Data sync completed');
}

/**
 * Sync a specific store from the server
 */
export async function syncStoreFromServer(storeName: string): Promise<boolean> {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const pathMap: { [key: string]: string } = {
    [PRODUCTS_STORE]: '/products',
    [BOM_STORE]: '/bom',
    [INVENTORY_STORE]: '/inventory',
    [ORDERS_STORE]: '/orders',
  };

  const path = pathMap[storeName];
  if (!path) {
    console.error(`Unknown store: ${storeName}`);
    return false;
  }

  try {
    const response = await fetch(`${API_URL}${path}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    await clearStoreData(storeName);
    await saveToIndexedDB(storeName, data);
    console.log(`✓ Synced ${storeName}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to sync ${storeName}:`, error);
    return false;
  }
}

/**
 * Sync inventory changes back to PostgreSQL
 */
export async function syncInventoryToServer(items: any[]): Promise<boolean> {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  try {
    const response = await fetch(`${API_URL}/sync/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    console.log('✓ Inventory synced to PostgreSQL');
    return true;
  } catch (error) {
    console.error('✗ Failed to sync inventory to server:', error);
    return false;
  }
}

/**
 * Get sync status and metadata
 */
export async function getSyncStatus(): Promise<{
  lastSync: string | null;
  stores: { [key: string]: number };
  isOnline: boolean;
}> {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  try {
    const response = await fetch(`${API_URL}/health`);
    const isOnline = response.ok;

    const storeNames = [PRODUCTS_STORE, BOM_STORE, INVENTORY_STORE, ORDERS_STORE];
    const stores: { [key: string]: number } = {};

    for (const store of storeNames) {
      try {
        const data = await getDatasFromIndexedDB(store);
        stores[store] = data.length;
      } catch (e) {
        stores[store] = 0;
      }
    }

    return {
      lastSync: await indexedDBManager.getLastUpdate(),
      stores,
      isOnline,
    };
  } catch (error) {
    return {
      lastSync: await indexedDBManager.getLastUpdate(),
      stores: { products: 0, bom: 0, inventory: 0, orders: 0 },
      isOnline: false,
    };
  }
}

// Create a singleton instance
export const indexedDBManager = new IndexedDBManager();

// Utility functions for common operations
export async function saveToIndexedDB(store_name: string, datas: any[]): Promise<void> {
  await indexedDBManager.saveStore(store_name, datas);
}

export async function getDatasFromIndexedDB(store_name: string): Promise<any[]> {
  console.log(`[IndexedDB] Getting data from store: ${store_name}`);
  const data = await indexedDBManager.getStores(store_name);
  return data;
}

export async function getDatasDIFromIndexedDB(store_name: string, id: number | string) {
  console.log(`[IndexedDB] Getting item from store: ${store_name}, id: ${id}`);
  return await indexedDBManager.getStoreId(store_name, typeof id === 'string' ? parseInt(id) : id);
}

export async function clearStoreData(store_name: string): Promise<void> {
  console.log(`[IndexedDB] Clearing store: ${store_name}`);
  await indexedDBManager.clearStore(store_name);
}

/**
 * Initialize IndexedDB on app load
 */
export async function initializeIndexedDB(): Promise<void> {
  try {
    await indexedDBManager.init();
    console.log('[IndexedDB] Initialized successfully');

    // Attempt to sync from server on init
    console.log('[IndexedDB] Attempting to sync with PostgreSQL...');
    await syncDataFromServer();
  } catch (error) {
    console.error('[IndexedDB] Initialization error:', error);
  }
}
