import { departments, manufacturingOrders, finishedProducts } from './mockData';

// ============================================================================
// PRODUCTION SCHEDULING & CAPACITY PLANNING
// ============================================================================

/**
 * Department capacity and workload information
 */
export interface DepartmentCapacity {
  departmentId: string;
  departmentName: string;
  capacity: number; // Maximum hours/units per day
  plannedLoad: number; // Currently scheduled hours/units
  actualLoad: number; // Actual completed hours/units
  utilizationPercent: number;
  availableCapacity: number;
  status: 'underutilized' | 'optimal' | 'near-capacity' | 'overloaded';
  assignedOrders: string[]; // MO IDs
  conflictingOrders?: string[]; // Orders that overlap and exceed capacity
}

/**
 * Production schedule time slot
 */
export interface ScheduleSlot {
  date: string;
  departmentId: string;
  orderId: string;
  orderName: string;
  hoursAllocated: number;
  isConflict: boolean;
}

/**
 * Order routing through departments (workflow)
 */
export interface OrderRouting {
  orderId: string;
  productName: string;
  workflow: {
    sequence: number;
    departmentId: string;
    departmentName: string;
    estimatedHours: number;
    startDate: string;
    endDate: string;
    status: 'pending' | 'in-progress' | 'completed';
    dependencies?: string[]; // Previous department IDs that must complete first
  }[];
  totalLeadTime: number;
  criticalPath: boolean;
}

/**
 * Calculate department capacity utilization
 */
export function calculateDepartmentCapacity(
  date?: string
): DepartmentCapacity[] {
  const capacities: DepartmentCapacity[] = [];
  
  // Standard capacity per department (hours per day)
  const standardCapacity: Record<string, number> = {
    'cnc-cutting': 16,
    'sewing-1': 16,
    'sewing-2': 16,
    'sewing-3': 16,
    'sewing-4': 16,
    'airbag': 12,
    'embroidery': 14,
    'qc': 12,
    'packing': 10,
  };

  departments.forEach(dept => {
    const capacity = standardCapacity[dept.id] || 16;
    
    // Get orders assigned to this department
    const assignedOrders = manufacturingOrders.filter(
      order => order.department === dept.id && 
      (order.status === 'planned' || order.status === 'in-progress')
    );

    // Calculate planned load (simplified: hours = quantity / 10)
    const plannedLoad = assignedOrders.reduce((sum, order) => {
      return sum + (order.quantity / 10); // Rough estimate: 10 units per hour
    }, 0);

    // Calculate actual load based on completion
    const actualLoad = assignedOrders.reduce((sum, order) => {
      return sum + ((order.quantity / 10) * (order.completion / 100));
    }, 0);

    const utilizationPercent = Math.round((plannedLoad / capacity) * 100);
    const availableCapacity = Math.max(0, capacity - plannedLoad);

    let status: DepartmentCapacity['status'] = 'optimal';
    if (utilizationPercent < 50) status = 'underutilized';
    else if (utilizationPercent >= 50 && utilizationPercent < 85) status = 'optimal';
    else if (utilizationPercent >= 85 && utilizationPercent < 100) status = 'near-capacity';
    else status = 'overloaded';

    capacities.push({
      departmentId: dept.id,
      departmentName: dept.name,
      capacity,
      plannedLoad: Math.round(plannedLoad * 10) / 10,
      actualLoad: Math.round(actualLoad * 10) / 10,
      utilizationPercent,
      availableCapacity: Math.round(availableCapacity * 10) / 10,
      status,
      assignedOrders: assignedOrders.map(o => o.id),
    });
  });

  return capacities.sort((a, b) => b.utilizationPercent - a.utilizationPercent);
}

/**
 * Detect scheduling conflicts (overlapping orders exceeding capacity)
 */
export function detectScheduleConflicts(): {
  hasConflicts: boolean;
  conflicts: {
    date: string;
    departmentId: string;
    departmentName: string;
    capacity: number;
    plannedLoad: number;
    overload: number;
    affectedOrders: string[];
  }[];
} {
  const conflicts: any[] = [];
  const departmentCapacities = calculateDepartmentCapacity();

  departmentCapacities.forEach(deptCap => {
    if (deptCap.status === 'overloaded') {
      conflicts.push({
        date: new Date().toISOString().split('T')[0],
        departmentId: deptCap.departmentId,
        departmentName: deptCap.departmentName,
        capacity: deptCap.capacity,
        plannedLoad: deptCap.plannedLoad,
        overload: deptCap.plannedLoad - deptCap.capacity,
        affectedOrders: deptCap.assignedOrders,
      });
    }
  });

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Suggest load balancing for overloaded departments
 */
export function suggestLoadBalancing(): {
  suggestions: {
    fromDepartment: string;
    toDepartment: string;
    orderId: string;
    orderName: string;
    reason: string;
    estimatedImprovement: number;
  }[];
} {
  const suggestions: any[] = [];
  const capacities = calculateDepartmentCapacity();

  // Find overloaded and underutilized departments
  const overloaded = capacities.filter(c => c.status === 'overloaded' || c.status === 'near-capacity');
  const underutilized = capacities.filter(c => c.status === 'underutilized' || c.status === 'optimal');

  // Suggest moving orders from overloaded to underutilized departments of same type
  overloaded.forEach(overDept => {
    // Find similar departments (e.g., sewing-1 to sewing-2)
    const similarDepts = underutilized.filter(underDept => {
      const overType = overDept.departmentId.split('-')[0];
      const underType = underDept.departmentId.split('-')[0];
      return overType === underType && underDept.availableCapacity > 0;
    });

    if (similarDepts.length > 0) {
      const targetDept = similarDepts[0];
      const ordersToMove = overDept.assignedOrders.slice(0, 1); // Suggest moving one order

      ordersToMove.forEach(orderId => {
        const order = manufacturingOrders.find(o => o.id === orderId);
        if (order && order.status === 'planned') {
          suggestions.push({
            fromDepartment: overDept.departmentName,
            toDepartment: targetDept.departmentName,
            orderId: order.id,
            orderName: order.product,
            reason: `${overDept.departmentName} is at ${overDept.utilizationPercent}% capacity. ${targetDept.departmentName} has ${targetDept.availableCapacity}h available.`,
            estimatedImprovement: Math.min(20, overDept.utilizationPercent - 85),
          });
        }
      });
    }
  });

  return { suggestions };
}

/**
 * Generate order routing/workflow through departments
 */
export function generateOrderRouting(orderId: string): OrderRouting | null {
  const order = manufacturingOrders.find(o => o.id === orderId);
  if (!order) return null;

  // Standard workflow for car seat covers
  const standardWorkflow = [
    { dept: 'cnc-cutting', hours: 8, name: 'CNC Cutting' },
    { dept: 'sewing-1', hours: 12, name: 'Sewing Dept 1' },
    { dept: 'airbag', hours: 6, name: 'Airbag Section' },
    { dept: 'embroidery', hours: 8, name: 'Embroidery' },
    { dept: 'qc', hours: 4, name: 'Quality Control' },
    { dept: 'packing', hours: 3, name: 'Packing' },
  ];

  const workflow = standardWorkflow.map((step, index) => {
    const startDate = new Date(order.startDate);
    startDate.setDate(startDate.getDate() + index * 2); // 2 days per step
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    return {
      sequence: index + 1,
      departmentId: step.dept,
      departmentName: step.name,
      estimatedHours: step.hours,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: (index === 0 ? 'in-progress' : 'pending') as 'pending' | 'in-progress' | 'completed',
      dependencies: index > 0 ? [standardWorkflow[index - 1].dept] : undefined,
    };
  });

  const totalLeadTime = standardWorkflow.reduce((sum, step) => sum + step.hours, 0);

  return {
    orderId: order.id,
    productName: order.product,
    workflow,
    totalLeadTime,
    criticalPath: order.priority === 'high',
  };
}

/**
 * Calculate optimal production sequence based on priority and dependencies
 */
export function optimizeProductionSequence(
  departmentId: string
): {
  optimizedSequence: {
    orderId: string;
    productName: string;
    priority: string;
    suggestedStartDate: string;
    reason: string;
  }[];
  estimatedEfficiencyGain: number;
} {
  const deptOrders = manufacturingOrders.filter(
    o => o.department === departmentId && o.status === 'planned'
  );

  // Sort by priority (high > medium > low) and then by start date
  const optimizedSequence = deptOrders
    .sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    })
    .map((order, index) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + index * 3); // 3 days spacing

      let reason = '';
      if (order.priority === 'high') {
        reason = 'High priority - scheduled first';
      } else if (index === 0) {
        reason = 'Earliest due date';
      } else {
        reason = 'Optimized for workflow efficiency';
      }

      return {
        orderId: order.id,
        productName: order.product,
        priority: order.priority,
        suggestedStartDate: startDate.toISOString().split('T')[0],
        reason,
      };
    });

  const estimatedEfficiencyGain = deptOrders.length > 0 ? 
    Math.min(15, deptOrders.length * 2) : 0;

  return {
    optimizedSequence,
    estimatedEfficiencyGain,
  };
}

/**
 * Get production schedule overview
 */
export function getProductionScheduleOverview(days: number = 14): {
  totalOrders: number;
  scheduledOrders: number;
  conflicts: number;
  avgUtilization: number;
  bottleneckDepartment: string | null;
  timeline: {
    date: string;
    ordersScheduled: number;
    departments: { id: string; name: string; load: number }[];
  }[];
} {
  const capacities = calculateDepartmentCapacity();
  const conflicts = detectScheduleConflicts();
  
  const avgUtilization = Math.round(
    capacities.reduce((sum, c) => sum + c.utilizationPercent, 0) / capacities.length
  );

  const bottleneck = capacities.find(c => c.status === 'overloaded');

  // Generate timeline
  const timeline: any[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const ordersOnDate = manufacturingOrders.filter(o => {
      const start = new Date(o.startDate);
      const end = new Date(o.endDate);
      return date >= start && date <= end;
    });

    timeline.push({
      date: dateStr,
      ordersScheduled: ordersOnDate.length,
      departments: capacities.map(c => ({
        id: c.departmentId,
        name: c.departmentName,
        load: c.utilizationPercent,
      })),
    });
  }

  return {
    totalOrders: manufacturingOrders.length,
    scheduledOrders: manufacturingOrders.filter(o => o.status === 'planned' || o.status === 'in-progress').length,
    conflicts: conflicts.conflicts.length,
    avgUtilization,
    bottleneckDepartment: bottleneck?.departmentName || null,
    timeline,
  };
}
