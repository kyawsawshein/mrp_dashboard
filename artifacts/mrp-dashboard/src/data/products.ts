import { finishedProducts, type FinishedProduct } from './mockData';

export type { FinishedProduct };

export const products: FinishedProduct[] = finishedProducts;

export function getProductById(id: string): FinishedProduct | undefined {
  return products.find(p => p.id === id);
}
