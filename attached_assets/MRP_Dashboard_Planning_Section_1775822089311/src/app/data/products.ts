import { finishedProducts, type FinishedProduct } from './mockData';
import { getDatasFromIndexedDB, getDatasDIFromIndexedDB } from '../../../lib/indexed-db';

export type { FinishedProduct };

// export const products: FinishedProduct[] = finishedProducts;

/**
 * Retrieves products from IndexedDB (synced from Postgres)
 * Falls back to mock data if DB is empty
 */
export async function getAllProducts(): Promise<FinishedProduct[]> {
  const dbProducts = await getDatasFromIndexedDB('products');
  return dbProducts.length > 0 ? (dbProducts as any) : finishedProducts;
}

export async function getProductById(id: string): Promise<FinishedProduct | undefined> {
  const dbProduct = await getDatasDIFromIndexedDB('products', parseInt(id.replace(/\D/g, '')));
  if (dbProduct) return dbProduct as any;
  return finishedProducts.find(p => p.id === id);
}
