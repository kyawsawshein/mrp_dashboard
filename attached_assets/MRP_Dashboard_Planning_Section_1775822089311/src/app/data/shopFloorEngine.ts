import { manufacturingOrders, inventoryItems, finishedProducts } from './mockData';

// ============================================================================
// SHOP FLOOR EXECUTION - Real-time Production Tracking
// ============================================================================

/**
 * Material consumption record (actual vs planned)
 */
export interface MaterialConsumption {
  id: string;
  orderId: string;
  orderName: string;
  materialId: string;
  materialName: string;
  plannedQty: number;
  actualQty: number;
  scrapQty: number;
  variance: number;
  variancePercent: number;
  unit: string;
  consumedBy: string;
  consumedAt: string;
  department: string;
  notes?: string;
}

/**
 * Production event log entry
 */
export interface ProductionEvent {
  id: string;
  orderId: string;
  orderName: string;
  eventType: 'start' | 'pause' | 'resume' | 'complete' | 'quality-check' | 'material-issue' | 'scrap-report' | 'rework';
  timestamp: string;
  operator: string;
  department: string;
  quantity?: number;
  previousStatus?: string;
  newStatus?: string;
  notes?: string;
  metadata?: any;
}

/**
 * Scrap/Rework record
 */
export interface ScrapReworkRecord {
  id: string;
  orderId: string;
  orderName: string;
  type: 'scrap' | 'rework';
  quantity: number;
  unit: string;
  reason: string;
  department: string;
  reportedBy: string;
  reportedAt: string;
  cost: number;
  materialAffected?: string;
  actionTaken?: string;
  status: 'reported' | 'reviewed' | 'resolved';
}

/**
 * Work in Progress (WIP) tracking
 */
export interface WIPStatus {
  orderId: string;
  orderName: string;
  currentDepartment: string;
  progress: number;
  startedAt: string;
  expectedCompletion: string;
  materialsIssued: boolean;
  qualityChecksPassed: number;
  activeOperators: string[];
  blockers?: string[];
  estimatedTimeRemaining: number; // hours
}

/**
 * Material issue/withdrawal from inventory
 */
export interface MaterialIssue {
  id: string;
  orderId: string;
  orderName: string;
  materialId: string;
  materialName: string;
  quantityIssued: number;
  unit: string;
  issuedBy: string;
  issuedAt: string;
  department: string;
  purpose: 'production' | 'rework' | 'testing';
  returnedQty?: number;
  status: 'issued' | 'consumed' | 'partially-returned' | 'fully-returned';
}

// Sample data for demonstration
let materialConsumptions: MaterialConsumption[] = [
  {
    id: 'MC-001',
    orderId: 'MO-2026-001',
    orderName: 'Premium Leather Sedan Seat Covers',
    materialId: 'MAT-001',
    materialName: 'Premium Leather Black',
    plannedQty: 400,
    actualQty: 425,
    scrapQty: 25,
    variance: 25,
    variancePercent: 6.25,
    unit: 'sqm',
    consumedBy: 'John Martinez',
    consumedAt: '2026-04-09T14:30:00',
    department: 'cnc-cutting',
    notes: 'Higher scrap due to leather grain variations',
  },
  {
    id: 'MC-002',
    orderId: 'MO-2026-001',
    orderName: 'Premium Leather Sedan Seat Covers',
    materialId: 'MAT-003',
    materialName: 'Thread - Black Heavy Duty',
    plannedQty: 40,
    actualQty: 38,
    scrapQty: 0,
    variance: -2,
    variancePercent: -5,
    unit: 'spools',
    consumedBy: 'Sarah Chen',
    consumedAt: '2026-04-09T16:45:00',
    department: 'sewing-1',
    notes: 'Efficient usage - below planned',
  },
];

let productionEvents: ProductionEvent[] = [
  {
    id: 'PE-001',
    orderId: 'MO-2026-001',
    orderName: 'Premium Leather Sedan Seat Covers',
    eventType: 'start',
    timestamp: '2026-04-07T08:00:00',
    operator: 'John Martinez',
    department: 'cnc-cutting',
    previousStatus: 'planned',
    newStatus: 'in-progress',
    notes: 'Production started on schedule',
  },
  {
    id: 'PE-002',
    orderId: 'MO-2026-001',
    orderName: 'Premium Leather Sedan Seat Covers',
    eventType: 'material-issue',
    timestamp: '2026-04-07T08:15:00',
    operator: 'John Martinez',
    department: 'cnc-cutting',
    quantity: 400,
    notes: 'Leather issued from warehouse',
  },
  {
    id: 'PE-003',
    orderId: 'MO-2026-001',
    orderName: 'Premium Leather Sedan Seat Covers',
    eventType: 'scrap-report',
    timestamp: '2026-04-07T11:30:00',
    operator: 'John Martinez',
    department: 'cnc-cutting',
    quantity: 25,
    notes: 'Leather scrap due to grain defects',
  },
];

let scrapReworkRecords: ScrapReworkRecord[] = [
  {
    id: 'SR-001',
    orderId: 'MO-2026-001',
    orderName: 'Premium Leather Sedan Seat Covers',
    type: 'scrap',
    quantity: 25,
    unit: 'sqm',
    reason: 'Leather grain defects and cutting errors',
    department: 'cnc-cutting',
    reportedBy: 'John Martinez',
    reportedAt: '2026-04-07T11:30:00',
    cost: 625, // 25 sqm * $25/sqm
    materialAffected: 'Premium Leather Black',
    status: 'reviewed',
  },
  {
    id: 'SR-002',
    orderId: 'MO-2026-003',
    orderName: 'Sport Mesh SUV Seat Covers',
    type: 'rework',
    quantity: 15,
    unit: 'pcs',
    reason: 'Stitching quality issues - seams not aligned',
    department: 'sewing-2',
    reportedBy: 'Lisa Wong',
    reportedAt: '2026-04-08T14:00:00',
    cost: 180, // 15 pcs * $12 labor cost
    actionTaken: 'Re-stitching with double-check on alignment',
    status: 'resolved',
  },
];

let materialIssues: MaterialIssue[] = [
  {
    id: 'MI-001',
    orderId: 'MO-2026-001',
    orderName: 'Premium Leather Sedan Seat Covers',
    materialId: 'MAT-001',
    materialName: 'Premium Leather Black',
    quantityIssued: 400,
    unit: 'sqm',
    issuedBy: 'John Martinez',
    issuedAt: '2026-04-07T08:15:00',
    department: 'cnc-cutting',
    purpose: 'production',
    status: 'consumed',
  },
];

/**
 * Log material consumption with variance tracking
 */
export function logMaterialConsumption(
  orderId: string,
  materialId: string,
  actualQty: number,
  scrapQty: number,
  operator: string,
  department: string,
  notes?: string
): MaterialConsumption {
  const order = manufacturingOrders.find(o => o.id === orderId);
  const material = inventoryItems.find(m => m.id === materialId);
  
  if (!order || !material) {
    throw new Error('Order or material not found');
  }

  // Find planned quantity from order materials
  const plannedMaterial = order.materials.find(m => m.id === materialId);
  const plannedQty = plannedMaterial?.required || 0;

  const variance = actualQty - plannedQty;
  const variancePercent = plannedQty > 0 ? (variance / plannedQty) * 100 : 0;

  const consumption: MaterialConsumption = {
    id: `MC-${String(materialConsumptions.length + 1).padStart(3, '0')}`,
    orderId,
    orderName: order.product,
    materialId,
    materialName: material.name,
    plannedQty,
    actualQty,
    scrapQty,
    variance,
    variancePercent: Math.round(variancePercent * 100) / 100,
    unit: material.unit,
    consumedBy: operator,
    consumedAt: new Date().toISOString(),
    department,
    notes,
  };

  materialConsumptions.push(consumption);
  
  // Update inventory
  const inventoryIndex = inventoryItems.findIndex(i => i.id === materialId);
  if (inventoryIndex !== -1) {
    inventoryItems[inventoryIndex].currentStock -= actualQty;
  }

  return consumption;
}

/**
 * Log production event
 */
export function logProductionEvent(
  orderId: string,
  eventType: ProductionEvent['eventType'],
  operator: string,
  department: string,
  options?: {
    quantity?: number;
    previousStatus?: string;
    newStatus?: string;
    notes?: string;
    metadata?: any;
  }
): ProductionEvent {
  const order = manufacturingOrders.find(o => o.id === orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  const event: ProductionEvent = {
    id: `PE-${String(productionEvents.length + 1).padStart(3, '0')}`,
    orderId,
    orderName: order.product,
    eventType,
    timestamp: new Date().toISOString(),
    operator,
    department,
    ...options,
  };

  productionEvents.push(event);
  return event;
}

/**
 * Report scrap or rework
 */
export function reportScrapRework(
  orderId: string,
  type: 'scrap' | 'rework',
  quantity: number,
  reason: string,
  department: string,
  operator: string,
  materialAffected?: string,
  actionTaken?: string
): ScrapReworkRecord {
  const order = manufacturingOrders.find(o => o.id === orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  // Estimate cost (simplified)
  const costPerUnit = type === 'scrap' ? 25 : 12;
  const cost = quantity * costPerUnit;

  const record: ScrapReworkRecord = {
    id: `SR-${String(scrapReworkRecords.length + 1).padStart(3, '0')}`,
    orderId,
    orderName: order.product,
    type,
    quantity,
    unit: 'pcs',
    reason,
    department,
    reportedBy: operator,
    reportedAt: new Date().toISOString(),
    cost,
    materialAffected,
    actionTaken,
    status: 'reported',
  };

  scrapReworkRecords.push(record);
  
  // Log as production event
  logProductionEvent(orderId, 'scrap-report', operator, department, {
    quantity,
    notes: `${type}: ${reason}`,
  });

  return record;
}

/**
 * Issue material from inventory to production
 */
export function issueMaterial(
  orderId: string,
  materialId: string,
  quantity: number,
  operator: string,
  department: string,
  purpose: MaterialIssue['purpose'] = 'production'
): MaterialIssue {
  const order = manufacturingOrders.find(o => o.id === orderId);
  const material = inventoryItems.find(m => m.id === materialId);
  
  if (!order || !material) {
    throw new Error('Order or material not found');
  }

  // Check inventory availability
  if (material.currentStock < quantity) {
    throw new Error(`Insufficient inventory. Available: ${material.currentStock} ${material.unit}`);
  }

  const issue: MaterialIssue = {
    id: `MI-${String(materialIssues.length + 1).padStart(3, '0')}`,
    orderId,
    orderName: order.product,
    materialId,
    materialName: material.name,
    quantityIssued: quantity,
    unit: material.unit,
    issuedBy: operator,
    issuedAt: new Date().toISOString(),
    department,
    purpose,
    status: 'issued',
  };

  materialIssues.push(issue);
  
  // Log event
  logProductionEvent(orderId, 'material-issue', operator, department, {
    quantity,
    notes: `Issued ${quantity} ${material.unit} of ${material.name}`,
  });

  return issue;
}

/**
 * Update production progress
 */
export function updateProductionProgress(
  orderId: string,
  newCompletion: number,
  operator: string,
  department: string,
  notes?: string
): void {
  const orderIndex = manufacturingOrders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) {
    throw new Error('Order not found');
  }

  const previousCompletion = manufacturingOrders[orderIndex].completion;
  manufacturingOrders[orderIndex].completion = Math.min(100, Math.max(0, newCompletion));

  // Update status based on completion
  if (newCompletion >= 100) {
    manufacturingOrders[orderIndex].status = 'completed';
    logProductionEvent(orderId, 'complete', operator, department, {
      previousStatus: 'in-progress',
      newStatus: 'completed',
      notes: notes || 'Order completed',
    });
  } else if (previousCompletion === 0 && newCompletion > 0) {
    manufacturingOrders[orderIndex].status = 'in-progress';
    logProductionEvent(orderId, 'start', operator, department, {
      previousStatus: 'planned',
      newStatus: 'in-progress',
      notes: notes || 'Production started',
    });
  }
}

/**
 * Get WIP status for all active orders
 */
export function getWIPStatus(): WIPStatus[] {
  const wipOrders = manufacturingOrders.filter(
    o => o.status === 'in-progress'
  );

  return wipOrders.map(order => {
    const orderEvents = productionEvents.filter(e => e.orderId === order.id);
    const startEvent = orderEvents.find(e => e.eventType === 'start');
    const qualityChecks = orderEvents.filter(e => e.eventType === 'quality-check');
    const materialsIssued = materialIssues.some(m => m.orderId === order.id);
    
    // Calculate estimated time remaining (simplified)
    const totalHours = 40; // Estimate
    const hoursUsed = (order.completion / 100) * totalHours;
    const estimatedTimeRemaining = Math.max(0, totalHours - hoursUsed);

    return {
      orderId: order.id,
      orderName: order.product,
      currentDepartment: order.department,
      progress: order.completion,
      startedAt: startEvent?.timestamp || order.startDate,
      expectedCompletion: order.endDate,
      materialsIssued,
      qualityChecksPassed: qualityChecks.length,
      activeOperators: [...new Set(orderEvents.map(e => e.operator))],
      estimatedTimeRemaining,
    };
  });
}

/**
 * Get material consumption variance report
 */
export function getMaterialVarianceReport(): {
  totalVarianceCost: number;
  positiveVariances: number;
  negativeVariances: number;
  avgVariancePercent: number;
  byMaterial: {
    materialId: string;
    materialName: string;
    totalPlanned: number;
    totalActual: number;
    totalVariance: number;
    variancePercent: number;
    occurrences: number;
  }[];
} {
  const byMaterial = new Map<string, any>();

  materialConsumptions.forEach(consumption => {
    if (!byMaterial.has(consumption.materialId)) {
      byMaterial.set(consumption.materialId, {
        materialId: consumption.materialId,
        materialName: consumption.materialName,
        totalPlanned: 0,
        totalActual: 0,
        totalVariance: 0,
        occurrences: 0,
      });
    }

    const mat = byMaterial.get(consumption.materialId);
    mat.totalPlanned += consumption.plannedQty;
    mat.totalActual += consumption.actualQty;
    mat.totalVariance += consumption.variance;
    mat.occurrences += 1;
  });

  const byMaterialArray = Array.from(byMaterial.values()).map(mat => ({
    ...mat,
    variancePercent: mat.totalPlanned > 0 
      ? Math.round((mat.totalVariance / mat.totalPlanned) * 10000) / 100 
      : 0,
  }));

  const positiveVariances = materialConsumptions.filter(m => m.variance > 0).length;
  const negativeVariances = materialConsumptions.filter(m => m.variance < 0).length;
  const avgVariancePercent = materialConsumptions.length > 0
    ? materialConsumptions.reduce((sum, m) => sum + m.variancePercent, 0) / materialConsumptions.length
    : 0;

  // Calculate total variance cost (simplified)
  const totalVarianceCost = materialConsumptions.reduce((sum, consumption) => {
    const material = inventoryItems.find(m => m.id === consumption.materialId);
    const cost = material ? Math.abs(consumption.variance) * material.costPerUnit : 0;
    return sum + cost;
  }, 0);

  return {
    totalVarianceCost: Math.round(totalVarianceCost * 100) / 100,
    positiveVariances,
    negativeVariances,
    avgVariancePercent: Math.round(avgVariancePercent * 100) / 100,
    byMaterial: byMaterialArray,
  };
}

/**
 * Get scrap and rework summary
 */
export function getScrapReworkSummary(): {
  totalScrapCost: number;
  totalReworkCost: number;
  totalScrapQty: number;
  totalReworkQty: number;
  byDepartment: {
    department: string;
    scrapQty: number;
    reworkQty: number;
    totalCost: number;
  }[];
  topReasons: {
    reason: string;
    count: number;
    totalCost: number;
  }[];
} {
  const scrapRecords = scrapReworkRecords.filter(r => r.type === 'scrap');
  const reworkRecords = scrapReworkRecords.filter(r => r.type === 'rework');

  const totalScrapCost = scrapRecords.reduce((sum, r) => sum + r.cost, 0);
  const totalReworkCost = reworkRecords.reduce((sum, r) => sum + r.cost, 0);
  const totalScrapQty = scrapRecords.reduce((sum, r) => sum + r.quantity, 0);
  const totalReworkQty = reworkRecords.reduce((sum, r) => sum + r.quantity, 0);

  // By department
  const deptMap = new Map<string, any>();
  scrapReworkRecords.forEach(record => {
    if (!deptMap.has(record.department)) {
      deptMap.set(record.department, { 
        department: record.department, 
        scrapQty: 0, 
        reworkQty: 0, 
        totalCost: 0 
      });
    }
    const dept = deptMap.get(record.department);
    if (record.type === 'scrap') dept.scrapQty += record.quantity;
    else dept.reworkQty += record.quantity;
    dept.totalCost += record.cost;
  });

  // Top reasons
  const reasonMap = new Map<string, any>();
  scrapReworkRecords.forEach(record => {
    if (!reasonMap.has(record.reason)) {
      reasonMap.set(record.reason, { reason: record.reason, count: 0, totalCost: 0 });
    }
    const reason = reasonMap.get(record.reason);
    reason.count += 1;
    reason.totalCost += record.cost;
  });

  const topReasons = Array.from(reasonMap.values())
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 5);

  return {
    totalScrapCost: Math.round(totalScrapCost * 100) / 100,
    totalReworkCost: Math.round(totalReworkCost * 100) / 100,
    totalScrapQty,
    totalReworkQty,
    byDepartment: Array.from(deptMap.values()),
    topReasons,
  };
}

// Export data for access
export { materialConsumptions, productionEvents, scrapReworkRecords, materialIssues };