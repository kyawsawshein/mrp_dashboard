// ============================================================================
// WORK CENTERS - Manufacturing Resources & Routing
// ============================================================================

/**
 * Work Center - Physical location where operations are performed
 * (machines, equipment, labor stations)
 */
export interface WorkCenter {
  id: string;
  code: string;
  name: string;
  type: 'machine' | 'manual' | 'assembly' | 'inspection' | 'packaging';
  department: string;
  description: string;
  
  // Capacity
  capacity: {
    hoursPerDay: number;
    daysPerWeek: number;
    efficiency: number; // % (85 = 85% efficient)
    utilizationTarget: number; // % target utilization
  };
  
  // Costing
  costPerHour: number;
  setupCostPerHour: number;
  
  // Status
  status: 'available' | 'busy' | 'maintenance' | 'breakdown' | 'offline';
  currentLoad: number; // % of capacity currently scheduled
  
  // Resources
  operatorsRequired: number;
  skillLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
  
  // Maintenance
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceIntervalDays: number;
  
  // Performance metrics
  metrics?: {
    actualUtilization: number; // %
    oeeScore: number; // Overall Equipment Effectiveness
    avgSetupTime: number; // hours
    avgCycleTime: number; // hours
    downtimeHours: number; // this period
  };
}

/**
 * Routing - Defines the sequence of operations to manufacture a product
 */
export interface Routing {
  id: string;
  bomId: string; // Link to BOM
  productId: string;
  productName: string;
  version: string;
  status: 'active' | 'draft' | 'obsolete';
  operations: RoutingOperation[];
  totalLeadTime: number; // hours
  totalCost: number; // $
}

/**
 * Routing Operation - A single step in the manufacturing process
 */
export interface RoutingOperation {
  operationNumber: number;
  operationName: string;
  workCenterId: string;
  workCenterName: string;
  
  // Time
  setupTime: number; // hours
  runTimePerUnit: number; // hours
  teardownTime: number; // hours
  queueTime: number; // hours (wait time before operation)
  moveTime: number; // hours (time to move to next operation)
  
  // Resources
  laborRequired: number; // number of operators
  
  // Costing
  setupCost: number;
  runCost: number;
  
  // Instructions
  instructions?: string;
  tooling?: string[];
  qualityChecks?: string[];
  
  // Dependencies
  prerequisiteOperations?: number[]; // Must complete these operations first
}

/**
 * Work Center Schedule Entry
 */
export interface WorkCenterSchedule {
  id: string;
  workCenterId: string;
  workCenterName: string;
  orderId: string;
  orderName: string;
  operationNumber: number;
  operationName: string;
  
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  
  status: 'scheduled' | 'in-progress' | 'completed' | 'delayed';
  
  estimatedHours: number;
  actualHours?: number;
  
  assignedOperators: string[];
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const workCenters: WorkCenter[] = [
  // CNC Cutting Department
  {
    id: 'WC-001',
    code: 'CNC-01',
    name: 'CNC Leather Cutting Machine #1',
    type: 'machine',
    department: 'cnc-cutting',
    description: 'High-precision CNC cutter for leather and fabric',
    capacity: {
      hoursPerDay: 16,
      daysPerWeek: 6,
      efficiency: 85,
      utilizationTarget: 80,
    },
    costPerHour: 45,
    setupCostPerHour: 60,
    status: 'available',
    currentLoad: 65,
    operatorsRequired: 1,
    skillLevel: 'advanced',
    maintenanceIntervalDays: 30,
    lastMaintenance: '2026-03-15',
    nextMaintenance: '2026-04-14',
    metrics: {
      actualUtilization: 72,
      oeeScore: 78,
      avgSetupTime: 0.5,
      avgCycleTime: 2.5,
      downtimeHours: 8,
    },
  },
  {
    id: 'WC-002',
    code: 'CNC-02',
    name: 'CNC Leather Cutting Machine #2',
    type: 'machine',
    department: 'cnc-cutting',
    description: 'High-precision CNC cutter for leather and fabric',
    capacity: {
      hoursPerDay: 16,
      daysPerWeek: 6,
      efficiency: 88,
      utilizationTarget: 80,
    },
    costPerHour: 45,
    setupCostPerHour: 60,
    status: 'available',
    currentLoad: 58,
    operatorsRequired: 1,
    skillLevel: 'advanced',
    maintenanceIntervalDays: 30,
    lastMaintenance: '2026-03-20',
    nextMaintenance: '2026-04-19',
    metrics: {
      actualUtilization: 68,
      oeeScore: 82,
      avgSetupTime: 0.4,
      avgCycleTime: 2.3,
      downtimeHours: 4,
    },
  },
  
  // Sewing Department
  {
    id: 'WC-003',
    code: 'SEW-01',
    name: 'Industrial Sewing Station #1',
    type: 'manual',
    department: 'sewing-1',
    description: 'Heavy-duty industrial sewing machine for leather',
    capacity: {
      hoursPerDay: 8,
      daysPerWeek: 5,
      efficiency: 75,
      utilizationTarget: 85,
    },
    costPerHour: 25,
    setupCostPerHour: 25,
    status: 'available',
    currentLoad: 82,
    operatorsRequired: 1,
    skillLevel: 'expert',
    maintenanceIntervalDays: 60,
    lastMaintenance: '2026-02-10',
    nextMaintenance: '2026-04-11',
    metrics: {
      actualUtilization: 88,
      oeeScore: 68,
      avgSetupTime: 0.25,
      avgCycleTime: 4.5,
      downtimeHours: 2,
    },
  },
  {
    id: 'WC-004',
    code: 'SEW-02',
    name: 'Industrial Sewing Station #2',
    type: 'manual',
    department: 'sewing-1',
    description: 'Heavy-duty industrial sewing machine for leather',
    capacity: {
      hoursPerDay: 8,
      daysPerWeek: 5,
      efficiency: 78,
      utilizationTarget: 85,
    },
    costPerHour: 25,
    setupCostPerHour: 25,
    status: 'available',
    currentLoad: 79,
    operatorsRequired: 1,
    skillLevel: 'expert',
    maintenanceIntervalDays: 60,
    lastMaintenance: '2026-02-15',
    nextMaintenance: '2026-04-16',
    metrics: {
      actualUtilization: 85,
      oeeScore: 71,
      avgSetupTime: 0.3,
      avgCycleTime: 4.2,
      downtimeHours: 3,
    },
  },
  
  // Embroidery
  {
    id: 'WC-005',
    code: 'EMB-01',
    name: 'Multi-Head Embroidery Machine',
    type: 'machine',
    department: 'embroidery',
    description: '6-head computerized embroidery machine',
    capacity: {
      hoursPerDay: 12,
      daysPerWeek: 6,
      efficiency: 82,
      utilizationTarget: 75,
    },
    costPerHour: 35,
    setupCostPerHour: 50,
    status: 'available',
    currentLoad: 45,
    operatorsRequired: 1,
    skillLevel: 'intermediate',
    maintenanceIntervalDays: 45,
    lastMaintenance: '2026-03-01',
    nextMaintenance: '2026-04-15',
    metrics: {
      actualUtilization: 52,
      oeeScore: 74,
      avgSetupTime: 1.0,
      avgCycleTime: 3.5,
      downtimeHours: 6,
    },
  },
  
  // Airbag Section
  {
    id: 'WC-006',
    code: 'AIR-01',
    name: 'Airbag Compatible Assembly Station',
    type: 'assembly',
    department: 'airbag-section',
    description: 'Specialized workstation for airbag-compatible covers',
    capacity: {
      hoursPerDay: 8,
      daysPerWeek: 5,
      efficiency: 80,
      utilizationTarget: 80,
    },
    costPerHour: 30,
    setupCostPerHour: 30,
    status: 'available',
    currentLoad: 55,
    operatorsRequired: 2,
    skillLevel: 'expert',
    maintenanceIntervalDays: 90,
    lastMaintenance: '2026-01-15',
    nextMaintenance: '2026-04-15',
    metrics: {
      actualUtilization: 62,
      oeeScore: 76,
      avgSetupTime: 0.5,
      avgCycleTime: 2.0,
      downtimeHours: 4,
    },
  },
  
  // QC
  {
    id: 'WC-007',
    code: 'QC-01',
    name: 'Quality Inspection Station',
    type: 'inspection',
    department: 'qc',
    description: 'Quality control and final inspection',
    capacity: {
      hoursPerDay: 8,
      daysPerWeek: 5,
      efficiency: 90,
      utilizationTarget: 75,
    },
    costPerHour: 20,
    setupCostPerHour: 20,
    status: 'available',
    currentLoad: 70,
    operatorsRequired: 1,
    skillLevel: 'intermediate',
    maintenanceIntervalDays: 180,
    lastMaintenance: '2025-12-01',
    nextMaintenance: '2026-06-01',
    metrics: {
      actualUtilization: 73,
      oeeScore: 85,
      avgSetupTime: 0.1,
      avgCycleTime: 0.5,
      downtimeHours: 1,
    },
  },
  
  // Packing
  {
    id: 'WC-008',
    code: 'PACK-01',
    name: 'Packaging Line #1',
    type: 'packaging',
    department: 'packing',
    description: 'Final packaging and labeling station',
    capacity: {
      hoursPerDay: 8,
      daysPerWeek: 5,
      efficiency: 85,
      utilizationTarget: 70,
    },
    costPerHour: 18,
    setupCostPerHour: 18,
    status: 'available',
    currentLoad: 60,
    operatorsRequired: 2,
    skillLevel: 'basic',
    maintenanceIntervalDays: 120,
    lastMaintenance: '2026-02-01',
    nextMaintenance: '2026-06-01',
    metrics: {
      actualUtilization: 65,
      oeeScore: 80,
      avgSetupTime: 0.2,
      avgCycleTime: 0.3,
      downtimeHours: 2,
    },
  },
];

// Sample Routings
export const routings: Routing[] = [
  {
    id: 'RTG-001',
    bomId: 'BOM-001',
    productId: 'PROD-001',
    productName: 'Premium Leather Sedan Seat Cover',
    version: '1.0',
    status: 'active',
    totalLeadTime: 12.5,
    totalCost: 387.50,
    operations: [
      {
        operationNumber: 10,
        operationName: 'Cut Leather Panels',
        workCenterId: 'WC-001',
        workCenterName: 'CNC Leather Cutting Machine #1',
        setupTime: 0.5,
        runTimePerUnit: 0.08, // 0.08 hours per seat cover = ~5 minutes
        teardownTime: 0.2,
        queueTime: 0.5,
        moveTime: 0.25,
        laborRequired: 1,
        setupCost: 30,
        runCost: 3.60, // 0.08 * $45
        instructions: 'Load leather roll, calibrate cutting head, verify pattern alignment',
        tooling: ['Leather cutting blade', 'Vacuum hold-down system'],
        qualityChecks: ['Verify cut accuracy ±0.5mm', 'Check for material defects'],
      },
      {
        operationNumber: 20,
        operationName: 'Sew Main Seams',
        workCenterId: 'WC-003',
        workCenterName: 'Industrial Sewing Station #1',
        setupTime: 0.25,
        runTimePerUnit: 0.5, // 30 minutes per unit
        teardownTime: 0.1,
        queueTime: 1.0,
        moveTime: 0.25,
        laborRequired: 1,
        setupCost: 6.25,
        runCost: 12.50,
        instructions: 'Use heavy-duty thread, double-stitch all main seams',
        tooling: ['Size 18 needle', 'Black heavy-duty thread'],
        qualityChecks: ['Stitch tension check', 'Seam strength test', 'Visual inspection'],
        prerequisiteOperations: [10],
      },
      {
        operationNumber: 30,
        operationName: 'Add Embroidery (if applicable)',
        workCenterId: 'WC-005',
        workCenterName: 'Multi-Head Embroidery Machine',
        setupTime: 1.0,
        runTimePerUnit: 0.33, // 20 minutes
        teardownTime: 0.2,
        queueTime: 0.5,
        moveTime: 0.25,
        laborRequired: 1,
        setupCost: 50,
        runCost: 11.55,
        instructions: 'Load design file, test stitch on scrap, hoop material securely',
        tooling: ['Embroidery hoop', 'Stabilizer backing'],
        qualityChecks: ['Design alignment', 'Thread tension', 'No thread breaks'],
        prerequisiteOperations: [20],
      },
      {
        operationNumber: 40,
        operationName: 'Airbag Panel Integration',
        workCenterId: 'WC-006',
        workCenterName: 'Airbag Compatible Assembly Station',
        setupTime: 0.5,
        runTimePerUnit: 0.25, // 15 minutes
        teardownTime: 0.1,
        queueTime: 0.5,
        moveTime: 0.25,
        laborRequired: 2,
        setupCost: 15,
        runCost: 7.50,
        instructions: 'Install tear-away seam panel, verify airbag deployment path clear',
        tooling: ['Heat sealer', 'Tear strength tester'],
        qualityChecks: ['Tear-away seam force test', 'Deployment clearance check'],
        prerequisiteOperations: [30],
      },
      {
        operationNumber: 50,
        operationName: 'Quality Inspection',
        workCenterId: 'WC-007',
        workCenterName: 'Quality Inspection Station',
        setupTime: 0.1,
        runTimePerUnit: 0.08, // 5 minutes
        teardownTime: 0.05,
        queueTime: 0.25,
        moveTime: 0.1,
        laborRequired: 1,
        setupCost: 2,
        runCost: 1.60,
        instructions: 'Complete quality checklist, verify fit template',
        qualityChecks: ['Dimension check', 'Stitching inspection', 'Material defect scan', 'Fit test'],
        prerequisiteOperations: [40],
      },
      {
        operationNumber: 60,
        operationName: 'Final Packaging',
        workCenterId: 'WC-008',
        workCenterName: 'Packaging Line #1',
        setupTime: 0.2,
        runTimePerUnit: 0.05, // 3 minutes
        teardownTime: 0.1,
        queueTime: 0.1,
        moveTime: 0.05,
        laborRequired: 2,
        setupCost: 3.60,
        runCost: 0.90,
        instructions: 'Place in poly bag, add installation instructions, box and label',
        tooling: ['Poly bags', 'Heat sealer', 'Label printer'],
        qualityChecks: ['Package integrity', 'Label accuracy', 'Documentation complete'],
        prerequisiteOperations: [50],
      },
    ],
  },
];

// ============================================================================
// WORK CENTER FUNCTIONS
// ============================================================================

/**
 * Calculate available capacity for a work center in a time period
 */
export function calculateWorkCenterCapacity(
  workCenter: WorkCenter,
  days: number
): {
  totalHours: number;
  effectiveHours: number;
  utilizationTarget: number;
  availableHours: number;
} {
  const totalHours = workCenter.capacity.hoursPerDay * days;
  const effectiveHours = totalHours * (workCenter.capacity.efficiency / 100);
  const utilizationTarget = effectiveHours * (workCenter.capacity.utilizationTarget / 100);
  const currentlyScheduled = effectiveHours * (workCenter.currentLoad / 100);
  const availableHours = utilizationTarget - currentlyScheduled;

  return {
    totalHours,
    effectiveHours,
    utilizationTarget,
    availableHours: Math.max(0, availableHours),
  };
}

/**
 * Calculate total manufacturing time for a routing
 */
export function calculateRoutingLeadTime(routing: Routing, quantity: number): {
  setupTime: number;
  runTime: number;
  queueTime: number;
  moveTime: number;
  totalTime: number;
} {
  let setupTime = 0;
  let runTime = 0;
  let queueTime = 0;
  let moveTime = 0;

  routing.operations.forEach(op => {
    setupTime += op.setupTime + op.teardownTime;
    runTime += op.runTimePerUnit * quantity;
    queueTime += op.queueTime;
    moveTime += op.moveTime;
  });

  return {
    setupTime,
    runTime,
    queueTime,
    moveTime,
    totalTime: setupTime + runTime + queueTime + moveTime,
  };
}

/**
 * Calculate total manufacturing cost for a routing
 */
export function calculateRoutingCost(routing: Routing, quantity: number): {
  setupCost: number;
  runCost: number;
  totalCost: number;
  costPerUnit: number;
} {
  let setupCost = 0;
  let runCost = 0;

  routing.operations.forEach(op => {
    setupCost += op.setupCost;
    runCost += op.runCost * quantity;
  });

  const totalCost = setupCost + runCost;

  return {
    setupCost,
    runCost,
    totalCost,
    costPerUnit: quantity > 0 ? totalCost / quantity : 0,
  };
}

/**
 * Get work center utilization summary
 */
export function getWorkCenterUtilizationSummary() {
  const byDepartment = new Map<string, {
    department: string;
    workCenters: number;
    avgUtilization: number;
    avgOEE: number;
    totalDowntime: number;
  }>();

  workCenters.forEach(wc => {
    if (!byDepartment.has(wc.department)) {
      byDepartment.set(wc.department, {
        department: wc.department,
        workCenters: 0,
        avgUtilization: 0,
        avgOEE: 0,
        totalDowntime: 0,
      });
    }

    const dept = byDepartment.get(wc.department)!;
    dept.workCenters += 1;
    dept.avgUtilization += wc.metrics?.actualUtilization || 0;
    dept.avgOEE += wc.metrics?.oeeScore || 0;
    dept.totalDowntime += wc.metrics?.downtimeHours || 0;
  });

  return Array.from(byDepartment.values()).map(dept => ({
    ...dept,
    avgUtilization: dept.avgUtilization / dept.workCenters,
    avgOEE: dept.avgOEE / dept.workCenters,
  }));
}

/**
 * Find bottleneck work centers
 */
export function findBottleneckWorkCenters(): WorkCenter[] {
  return workCenters
    .filter(wc => wc.currentLoad > wc.capacity.utilizationTarget)
    .sort((a, b) => b.currentLoad - a.currentLoad);
}

/**
 * Get work centers needing maintenance
 */
export function getMaintenanceDue(): WorkCenter[] {
  const today = new Date();
  const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  return workCenters.filter(wc => {
    if (!wc.nextMaintenance) return false;
    const maintDate = new Date(wc.nextMaintenance);
    return maintDate <= oneWeekFromNow;
  });
}

/**
 * Get optimal work center for an operation (load balancing)
 */
export function getOptimalWorkCenter(
  department: string,
  type: WorkCenter['type']
): WorkCenter | null {
  const candidates = workCenters.filter(
    wc => wc.department === department && 
         wc.type === type && 
         wc.status === 'available'
  );

  if (candidates.length === 0) return null;

  // Sort by current load (ascending) - prefer least loaded
  candidates.sort((a, b) => a.currentLoad - b.currentLoad);

  return candidates[0];
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Create a new work center
 */
export function createWorkCenter(data: Partial<WorkCenter>): WorkCenter {
  // Validate required fields
  if (!data.code || !data.name || !data.department) {
    throw new Error('Code, name, and department are required');
  }

  // Check for duplicate code
  if (workCenters.some(wc => wc.code === data.code)) {
    throw new Error(`Work center with code ${data.code} already exists`);
  }

  // Generate ID
  const maxId = workCenters.reduce((max, wc) => {
    const num = parseInt(wc.id.split('-')[1]);
    return num > max ? num : max;
  }, 0);
  const newId = `WC-${String(maxId + 1).padStart(3, '0')}`;

  const newWorkCenter: WorkCenter = {
    id: newId,
    code: data.code,
    name: data.name,
    type: data.type || 'manual',
    department: data.department,
    description: data.description || '',
    capacity: data.capacity || {
      hoursPerDay: 8,
      daysPerWeek: 5,
      efficiency: 85,
      utilizationTarget: 80,
    },
    costPerHour: data.costPerHour || 0,
    setupCostPerHour: data.setupCostPerHour || 0,
    status: data.status || 'available',
    currentLoad: data.currentLoad || 0,
    operatorsRequired: data.operatorsRequired || 1,
    skillLevel: data.skillLevel || 'intermediate',
    maintenanceIntervalDays: data.maintenanceIntervalDays || 30,
    lastMaintenance: data.lastMaintenance,
    nextMaintenance: data.nextMaintenance,
    metrics: data.metrics,
  };

  workCenters.push(newWorkCenter);
  return newWorkCenter;
}

/**
 * Update an existing work center
 */
export function updateWorkCenter(id: string, data: Partial<WorkCenter>): WorkCenter {
  const index = workCenters.findIndex(wc => wc.id === id);
  if (index === -1) {
    throw new Error(`Work center ${id} not found`);
  }

  // Check for duplicate code (if code is being changed)
  if (data.code && data.code !== workCenters[index].code) {
    if (workCenters.some(wc => wc.code === data.code && wc.id !== id)) {
      throw new Error(`Work center with code ${data.code} already exists`);
    }
  }

  // Merge updates
  workCenters[index] = {
    ...workCenters[index],
    ...data,
    id: workCenters[index].id, // Preserve ID
    capacity: data.capacity || workCenters[index].capacity,
    metrics: data.metrics || workCenters[index].metrics,
  };

  return workCenters[index];
}

/**
 * Delete a work center
 */
export function deleteWorkCenter(id: string): boolean {
  const index = workCenters.findIndex(wc => wc.id === id);
  if (index === -1) {
    throw new Error(`Work center ${id} not found`);
  }

  // Check if work center is in use in any routing
  const inUse = routings.some(routing =>
    routing.operations.some(op => op.workCenterId === id)
  );

  if (inUse) {
    throw new Error('Cannot delete work center that is used in active routings');
  }

  workCenters.splice(index, 1);
  return true;
}

/**
 * Get work center by ID
 */
export function getWorkCenterById(id: string): WorkCenter | undefined {
  return workCenters.find(wc => wc.id === id);
}

/**
 * Get work center by code
 */
export function getWorkCenterByCode(code: string): WorkCenter | undefined {
  return workCenters.find(wc => wc.code === code);
}

/**
 * Get all work centers
 */
export function getAllWorkCenters(): WorkCenter[] {
  return [...workCenters];
}

/**
 * Get work centers by department
 */
export function getWorkCentersByDepartment(department: string): WorkCenter[] {
  return workCenters.filter(wc => wc.department === department);
}

/**
 * Get work centers by type
 */
export function getWorkCentersByType(type: WorkCenter['type']): WorkCenter[] {
  return workCenters.filter(wc => wc.type === type);
}

/**
 * Get work centers by status
 */
export function getWorkCentersByStatus(status: WorkCenter['status']): WorkCenter[] {
  return workCenters.filter(wc => wc.status === status);
}

/**
 * Update work center metrics
 */
export function updateWorkCenterMetrics(
  id: string,
  metrics: Partial<WorkCenter['metrics']>
): WorkCenter {
  const index = workCenters.findIndex(wc => wc.id === id);
  if (index === -1) {
    throw new Error(`Work center ${id} not found`);
  }

  workCenters[index].metrics = {
    ...workCenters[index].metrics!,
    ...metrics,
  };

  return workCenters[index];
}

/**
 * Update work center status
 */
export function updateWorkCenterStatus(
  id: string,
  status: WorkCenter['status']
): WorkCenter {
  const index = workCenters.findIndex(wc => wc.id === id);
  if (index === -1) {
    throw new Error(`Work center ${id} not found`);
  }

  workCenters[index].status = status;
  return workCenters[index];
}

/**
 * Update work center load
 */
export function updateWorkCenterLoad(
  id: string,
  load: number
): WorkCenter {
  const index = workCenters.findIndex(wc => wc.id === id);
  if (index === -1) {
    throw new Error(`Work center ${id} not found`);
  }

  workCenters[index].currentLoad = Math.max(0, Math.min(100, load));
  return workCenters[index];
}