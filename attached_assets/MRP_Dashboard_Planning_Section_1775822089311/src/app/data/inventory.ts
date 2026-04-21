import { inventoryItems as rawInventory, type InventoryItem as MockInventoryItem } from './mockData';
import { getDatasFromIndexedDB } from '../../../lib/indexed-db';

export type { MockInventoryItem as InventoryItem };

/**
 * Retrieves inventory items from IndexedDB (synced from PostgreSQL)
 * Falls back to mock data if DB is empty
 */
export async function getAllInventoryItems(): Promise<MockInventoryItem[]> {
    try {
        const dbItems = await getDatasFromIndexedDB('inventory');
        if (dbItems && dbItems.length > 0) {
            console.log(`[Inventory] Loaded ${dbItems.length} items from IndexedDB`);
            return dbItems as any;
        }
    } catch (error) {
        console.warn('[Inventory] Error loading from IndexedDB, using mock data:', error);
    }

    console.log('[Inventory] Using mock data');
    return rawInventory;
}

export async function getInventoryItemById(id: string): Promise<MockInventoryItem | undefined> {
    try {
        const allItems = await getAllInventoryItems();
        return allItems.find(item => item.id === id);
    } catch (error) {
        console.error('[Inventory] Error fetching item:', error);
        return rawInventory.find(item => item.id === id);
    }
}

// Static export for backward compatibility (will be populated on first access)
export const inventoryItems: MockInventoryItem[] = rawInventory;
