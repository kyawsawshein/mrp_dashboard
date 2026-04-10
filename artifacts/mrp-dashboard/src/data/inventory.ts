import { inventoryItems as rawInventory, type InventoryItem as MockInventoryItem } from './mockData';

export type { MockInventoryItem as InventoryItem };

export const inventoryItems: MockInventoryItem[] = rawInventory;
