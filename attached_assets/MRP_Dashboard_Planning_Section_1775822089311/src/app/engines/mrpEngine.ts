// ============================================================================
// MULTI-LEVEL MRP CALCULATION ENGINE
// ============================================================================

import { boms, type BOM, type BOMLine, getBOMById } from '../data/bom';
import { products, getProductById } from '../data/products';
import { inventoryItems, type InventoryItem } from '../data/inventory';
import { manufacturingOrders, type ManufacturingOrder } from '../data/mockData';

/**
 * Material requirement with BOM level tracking
 */
export interface MaterialRequirement {
  materialSKU: string;
  materialName: string;
  bomLevel: number; // 0 = finished product, 1 = first level component, etc.
  requiredQuantity: number;
  scrapFactor: number;
  netQuantity: number; // with scrap
  unitOfMeasure: string;
  source: {
    orderId: string;
    orderNumber: string;
    productName: string;
    parentMaterial?: string; // What BOM line this came from
  };
}

/**
 * MRP calculation result for a single material (aggregated across all levels)
 */
export interface MRPResult {
  materialSKU: string;
  materialName: string;
  unitOfMeasure: string;
  
  // Inventory status
  onHand: number;
  reserved: number;
  available: number;
  safetyStock: number;
  reorderPoint: number;
  
  // Requirements
  grossRequirement: number; // Total needed across all levels
  netRequirement: number; // After considering inventory
  
  // BOM levels where this material appears
  bomLevels: number[]; // e.g., [1, 2] means used at level 1 and level 2
  
  // Detailed allocations
  allocations: MaterialRequirement[];
  
  // Planning
  plannedOrderQty?: number;
  plannedOrderDate?: string;
  lotSizingRule: 'lot-for-lot' | 'fixed-lot' | 'eoq';
  fixedLotSize?: number;
  
  // Lead time
  leadTimeDays: number;
  earliestNeedDate?: string;
  
  // Status
  status: 'sufficient' | 'low' | 'shortage' | 'critical';
  shortageQty: number;
}

/**
 * Low-level code calculation
 * Determines the lowest level in any BOM where a material appears
 */
export function calculateLowLevelCodes(): Map<string, number> {
  const lowLevelCodes = new Map<string, number>();
  
  // Initialize all products/materials at level 0
  products.forEach(p => lowLevelCodes.set(p.sku, 0));
  inventoryItems.forEach(i => lowLevelCodes.set(i.id, 0));
  
  // Recursive function to assign levels
  function assignLevels(bomId: string, currentLevel: number, visited: Set<string> = new Set()): void {
    // Prevent circular references
    if (visited.has(bomId)) {
      console.warn(`Circular BOM reference detected: ${bomId}`);
      return;
    }
    visited.add(bomId);
    
    const bom = getBOMById(bomId);
    if (!bom) return;
    
    bom.lines.forEach(line => {
      const childLevel = currentLevel + 1;
      const currentLLC = lowLevelCodes.get(line.materialSKU) || 0;
      
      // Update to lowest level
      if (childLevel > currentLLC) {
        lowLevelCodes.set(line.materialSKU, childLevel);
      }
      
      // Check if this component has its own BOM (sub-assembly)
      const product = products.find(p => p.sku === line.materialSKU);
      if (product?.bomId) {
        assignLevels(product.bomId, childLevel, new Set(visited));
      }
    });
  }
  
  // Process all BOMs starting from finished products
  boms.forEach(bom => {
    if (bom.status === 'active') {
      assignLevels(bom.id, 0);
    }
  });
  
  return lowLevelCodes;
}

/**
 * Multi-level BOM explosion
 * Recursively explodes a BOM to all levels
 */
export function explodeBOM(
  bomId: string,
  quantity: number,
  orderId: string,
  orderNumber: string,
  productName: string,
  currentLevel: number = 0,
  maxLevel: number = 10,
  parentMaterial?: string
): MaterialRequirement[] {
  // Safety check for infinite recursion
  if (currentLevel > maxLevel) {
    console.error(`BOM explosion exceeded max level (${maxLevel})`);
    return [];
  }
  
  const bom = getBOMById(bomId);
  if (!bom) {
    console.warn(`BOM not found: ${bomId}`);
    return [];
  }
  
  const requirements: MaterialRequirement[] = [];
  
  bom.lines.forEach(line => {
    // Calculate net quantity with scrap factor
    const netQty = quantity * line.netQuantity;
    
    // Add this component to requirements
    requirements.push({
      materialSKU: line.materialSKU,
      materialName: line.description,
      bomLevel: currentLevel + 1,
      requiredQuantity: quantity * line.quantity,
      scrapFactor: line.scrapFactor,
      netQuantity: netQty,
      unitOfMeasure: line.unitOfMeasure,
      source: {
        orderId,
        orderNumber,
        productName,
        parentMaterial: parentMaterial || productName,
      },
    });
    
    // Check if this component is itself a product with a BOM (sub-assembly)
    const childProduct = products.find(p => p.sku === line.materialSKU);
    if (childProduct?.bomId) {
      // Recursive explosion
      const childRequirements = explodeBOM(
        childProduct.bomId,
        netQty, // Use net quantity as the quantity for child BOM
        orderId,
        orderNumber,
        productName,
        currentLevel + 1,
        maxLevel,
        line.description
      );
      requirements.push(...childRequirements);
    }
  });
  
  return requirements;
}

/**
 * Calculate MRP with multi-level explosion
 */
export function calculateMultiLevelMRP(
  orders: ManufacturingOrder[] = manufacturingOrders,
  lotSizingRules: Map<string, { rule: MRPResult['lotSizingRule']; fixedLotSize?: number }> = new Map()
): MRPResult[] {
  const mrpResults = new Map<string, MRPResult>();
  
  // Step 1: Calculate low-level codes
  const lowLevelCodes = calculateLowLevelCodes();
  
  // Step 2: Initialize MRP results for all materials
  inventoryItems.forEach(item => {
    const lotSizing = lotSizingRules.get(item.id) || { rule: 'lot-for-lot' };
    
    mrpResults.set(item.id, {
      materialSKU: item.id,
      materialName: item.name,
      unitOfMeasure: item.unit,
      onHand: item.currentStock,
      reserved: item.allocatedStock || 0,
      available: item.currentStock - (item.allocatedStock || 0),
      safetyStock: item.safetyStock || 0,
      reorderPoint: item.reorderPoint,
      grossRequirement: 0,
      netRequirement: 0,
      bomLevels: [],
      allocations: [],
      lotSizingRule: lotSizing.rule,
      fixedLotSize: lotSizing.fixedLotSize,
      leadTimeDays: item.leadTimeDays,
      status: 'sufficient',
      shortageQty: 0,
    });
  });
  
  // Step 3: Process all active manufacturing orders
  const activeOrders = orders.filter(order => 
    order.status === 'planned' || order.status === 'in-progress' || order.status === 'released'
  );
  
  activeOrders.forEach(order => {
    // Find product
    const product = products.find(p => p.name === order.product);
    if (!product || !product.bomId) {
      console.warn(`Product or BOM not found for order ${order.orderNumber}`);
      return;
    }
    
    // Multi-level BOM explosion
    const requirements = explodeBOM(
      product.bomId,
      order.quantity,
      order.id,
      order.orderNumber,
      order.product
    );
    
    // Aggregate requirements by material
    requirements.forEach(req => {
      const mrp = mrpResults.get(req.materialSKU);
      if (!mrp) {
        console.warn(`MRP result not found for material: ${req.materialSKU}`);
        return;
      }
      
      // Add to gross requirement
      mrp.grossRequirement += req.netQuantity;
      
      // Track BOM levels
      if (!mrp.bomLevels.includes(req.bomLevel)) {
        mrp.bomLevels.push(req.bomLevel);
        mrp.bomLevels.sort((a, b) => a - b);
      }
      
      // Add allocation
      mrp.allocations.push(req);
      
      // Track earliest need date
      if (order.endDate) {
        if (!mrp.earliestNeedDate || order.endDate < mrp.earliestNeedDate) {
          mrp.earliestNeedDate = order.endDate;
        }
      }
    });
  });
  
  // Step 4: Calculate net requirements and generate planned orders
  mrpResults.forEach(mrp => {
    // Net requirement = Gross - Available
    const netReq = Math.max(0, mrp.grossRequirement - mrp.available);
    mrp.netRequirement = netReq;
    mrp.shortageQty = netReq;
    
    // Apply lot sizing
    if (netReq > 0) {
      switch (mrp.lotSizingRule) {
        case 'lot-for-lot':
          mrp.plannedOrderQty = netReq;
          break;
        
        case 'fixed-lot':
          if (mrp.fixedLotSize) {
            mrp.plannedOrderQty = Math.ceil(netReq / mrp.fixedLotSize) * mrp.fixedLotSize;
          } else {
            mrp.plannedOrderQty = netReq;
          }
          break;
        
        case 'eoq':
          // Simplified EOQ calculation
          // In real implementation, would use: sqrt((2 * demand * ordering_cost) / holding_cost)
          const eoq = Math.max(100, Math.ceil(netReq * 1.2)); // Placeholder
          mrp.plannedOrderQty = eoq;
          break;
      }
      
      // Calculate planned order date with lead time offset
      if (mrp.earliestNeedDate) {
        const needDate = new Date(mrp.earliestNeedDate);
        needDate.setDate(needDate.getDate() - mrp.leadTimeDays - 2); // Add 2-day buffer
        mrp.plannedOrderDate = needDate.toISOString().split('T')[0];
      }
    }
    
    // Determine status
    if (mrp.grossRequirement === 0) {
      mrp.status = 'sufficient';
    } else if (mrp.available <= 0) {
      mrp.status = 'critical';
    } else if (netReq > 0) {
      mrp.status = 'shortage';
    } else if (mrp.available < mrp.reorderPoint) {
      mrp.status = 'low';
    } else {
      mrp.status = 'sufficient';
    }
  });
  
  // Step 5: Return results sorted by low-level code (process higher levels first)
  return Array.from(mrpResults.values())
    .filter(mrp => mrp.grossRequirement > 0 || mrp.status !== 'sufficient')
    .sort((a, b) => {
      // Sort by status priority first
      const statusPriority = { critical: 0, shortage: 1, low: 2, sufficient: 3 };
      const statusDiff = statusPriority[a.status] - statusPriority[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // Then by low-level code (ascending - higher levels first)
      const aLevel = Math.min(...a.bomLevels);
      const bLevel = Math.min(...b.bomLevels);
      return aLevel - bLevel;
    });
}

/**
 * Get material requirements by BOM level
 */
export function getMaterialsByLevel(mrpResults: MRPResult[]): Map<number, MRPResult[]> {
  const byLevel = new Map<number, MRPResult[]>();
  
  mrpResults.forEach(mrp => {
    mrp.bomLevels.forEach(level => {
      if (!byLevel.has(level)) {
        byLevel.set(level, []);
      }
      byLevel.get(level)!.push(mrp);
    });
  });
  
  return byLevel;
}

/**
 * Get pegging information (demand traceability)
 * Shows which orders are driving demand for a material
 */
export function getPeggingInfo(materialSKU: string, mrpResults: MRPResult[]): {
  material: string;
  totalRequirement: number;
  sources: {
    orderNumber: string;
    productName: string;
    quantity: number;
    bomLevel: number;
    parentMaterial: string;
  }[];
} | null {
  const mrp = mrpResults.find(m => m.materialSKU === materialSKU);
  if (!mrp) return null;
  
  const sources = mrp.allocations.map(alloc => ({
    orderNumber: alloc.source.orderNumber,
    productName: alloc.source.productName,
    quantity: alloc.netQuantity,
    bomLevel: alloc.bomLevel,
    parentMaterial: alloc.source.parentMaterial || alloc.source.productName,
  }));
  
  return {
    material: mrp.materialName,
    totalRequirement: mrp.grossRequirement,
    sources,
  };
}

/**
 * Generate planned orders from MRP results
 */
export interface PlannedOrder {
  id: string;
  materialSKU: string;
  materialName: string;
  quantity: number;
  unitOfMeasure: string;
  plannedOrderDate: string;
  requiredDate: string;
  leadTimeDays: number;
  priority: 'critical' | 'high' | 'normal';
  status: 'planned' | 'firmed' | 'released';
  source: 'mrp-generated';
  // For compatibility with purchase order display
  supplier?: string;
  unit?: string;
  costPerUnit?: number;
  totalCost?: number;
  orderDate?: string;
  expectedDelivery?: string;
  notes?: string;
}

export function generatePlannedOrders(mrpResults: MRPResult[]): PlannedOrder[] {
  const plannedOrders: PlannedOrder[] = [];
  
  mrpResults
    .filter(mrp => mrp.plannedOrderQty && mrp.plannedOrderQty > 0)
    .forEach((mrp, index) => {
      // Get inventory item for additional details
      const invItem = inventoryItems.find(inv => inv.id === mrp.materialSKU);
      
      const plannedOrderDate = mrp.plannedOrderDate || new Date().toISOString().split('T')[0];
      const requiredDate = mrp.earliestNeedDate || new Date().toISOString().split('T')[0];
      
      // Calculate expected delivery
      const orderDateObj = new Date(plannedOrderDate);
      const deliveryDate = new Date(orderDateObj);
      deliveryDate.setDate(deliveryDate.getDate() + mrp.leadTimeDays);
      
      // Calculate cost
      const costPerUnit = invItem?.costPerUnit || 0;
      const totalCost = mrp.plannedOrderQty! * costPerUnit;
      
      // Generate notes based on status
      let notes = '';
      if (mrp.status === 'critical') {
        notes = 'URGENT: Critical shortage - order immediately';
      } else if (mrp.status === 'shortage') {
        notes = 'Material shortage detected - order soon';
      } else if (mrp.status === 'low') {
        notes = 'Stock level below reorder point';
      }
      
      plannedOrders.push({
        id: `PLN-${new Date().getFullYear()}-${String(index + 1).padStart(5, '0')}`,
        materialSKU: mrp.materialSKU,
        materialName: mrp.materialName,
        quantity: mrp.plannedOrderQty!,
        unitOfMeasure: mrp.unitOfMeasure,
        plannedOrderDate,
        requiredDate,
        leadTimeDays: mrp.leadTimeDays,
        priority: mrp.status === 'critical' ? 'critical' : mrp.status === 'shortage' ? 'high' : 'normal',
        status: 'planned',
        source: 'mrp-generated',
        // Additional fields for purchase order display
        supplier: invItem?.supplier || 'TBD',
        unit: mrp.unitOfMeasure,
        costPerUnit,
        totalCost,
        orderDate: plannedOrderDate,
        expectedDelivery: deliveryDate.toISOString().split('T')[0],
        notes,
      });
    });
  
  return plannedOrders;
}

/**
 * MRP Exception Messages
 */
export interface MRPException {
  type: 'late-order' | 'shortage' | 'excess' | 'past-due';
  severity: 'critical' | 'warning' | 'info';
  materialSKU: string;
  materialName: string;
  message: string;
  quantity?: number;
  date?: string;
  recommendation: string;
}

export function generateMRPExceptions(mrpResults: MRPResult[]): MRPException[] {
  const exceptions: MRPException[] = [];
  const today = new Date();
  
  mrpResults.forEach(mrp => {
    // Critical shortage
    if (mrp.status === 'critical') {
      exceptions.push({
        type: 'shortage',
        severity: 'critical',
        materialSKU: mrp.materialSKU,
        materialName: mrp.materialName,
        message: `Critical shortage: ${mrp.shortageQty} ${mrp.unitOfMeasure} needed, 0 available`,
        quantity: mrp.shortageQty,
        recommendation: 'Expedite purchase order or reschedule manufacturing orders',
      });
    }
    
    // Regular shortage
    if (mrp.status === 'shortage' && mrp.status !== 'critical') {
      exceptions.push({
        type: 'shortage',
        severity: 'warning',
        materialSKU: mrp.materialSKU,
        materialName: mrp.materialName,
        message: `Material shortage: ${mrp.shortageQty} ${mrp.unitOfMeasure} short`,
        quantity: mrp.shortageQty,
        recommendation: 'Place purchase order',
      });
    }
    
    // Past due order
    if (mrp.plannedOrderDate && new Date(mrp.plannedOrderDate) < today) {
      exceptions.push({
        type: 'past-due',
        severity: 'critical',
        materialSKU: mrp.materialSKU,
        materialName: mrp.materialName,
        message: `Planned order is past due (should have ordered on ${mrp.plannedOrderDate})`,
        date: mrp.plannedOrderDate,
        recommendation: 'Expedite order immediately or reschedule dependent MOs',
      });
    }
    
    // Excess inventory (more than 2x max requirement)
    const maxAllocation = Math.max(...mrp.allocations.map(a => a.netQuantity), 0);
    if (mrp.onHand > maxAllocation * 2 && maxAllocation > 0) {
      exceptions.push({
        type: 'excess',
        severity: 'info',
        materialSKU: mrp.materialSKU,
        materialName: mrp.materialName,
        message: `Excess inventory: ${mrp.onHand} ${mrp.unitOfMeasure} on hand, max need is ${maxAllocation}`,
        quantity: mrp.onHand - maxAllocation,
        recommendation: 'Consider reducing safety stock or cancelling pending orders',
      });
    }
  });
  
  return exceptions.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}