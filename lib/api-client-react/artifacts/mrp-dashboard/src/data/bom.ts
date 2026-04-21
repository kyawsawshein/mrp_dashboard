import { boms as rawBoms, type BOM as MockBOM, type BOMItem } from './mockData';

export type { BOMItem };

export interface BOMLine {
  id: string;
  materialSKU: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  scrapFactor: number;
  netQuantity: number;
  costPerUnit: number;
  notes?: string;
}

export interface BOM {
  id: string;
  productSKU: string;
  productName: string;
  status: 'active' | 'draft' | 'obsolete';
  lines: BOMLine[];
  laborCost: number;
  overheadCost: number;
  totalMaterialCost: number;
  totalCost: number;
}

function convertBOM(raw: MockBOM): BOM {
  return {
    id: raw.id,
    productSKU: raw.productSKU,
    productName: raw.productName,
    status: raw.status,
    laborCost: raw.laborCost,
    overheadCost: raw.overheadCost,
    totalMaterialCost: raw.totalMaterialCost,
    totalCost: raw.totalCost,
    lines: raw.items.map((item: BOMItem): BOMLine => ({
      id: item.id,
      materialSKU: item.materialId,
      description: item.materialName,
      quantity: item.quantity,
      unitOfMeasure: item.unit,
      scrapFactor: item.scrapFactor / 100,
      netQuantity: item.quantity * (1 + item.scrapFactor / 100),
      costPerUnit: item.costPerUnit,
      notes: item.notes,
    })),
  };
}

export const boms: BOM[] = rawBoms.map(convertBOM);

export function getBOMById(id: string): BOM | undefined {
  return boms.find(b => b.id === id);
}
