# 🏗️ MRP DASHBOARD - SYSTEM ARCHITECTURE

## 📐 HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (React)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Overview   │  │   Products   │  │     BOM      │         │
│  │   Dashboard  │  │   Management │  │  Management  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │     MRP      │  │  Production  │  │Work Centers  │         │
│  │   Planning   │  │  Scheduling  │  │  & Routing   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Shop Floor  │  │  Production  │  │  Inventory   │         │
│  │   Terminal   │  │  Analytics   │  │  Management  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Calendar   │  │    Gantt     │  │    Alerts    │         │
│  │     View     │  │     View     │  │  & Notifs    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              MRP CALCULATION ENGINE                       │  │
│  │  • Net Requirements Calculation                          │  │
│  │  • Lot Sizing (Lot-for-Lot, Fixed, EOQ)                 │  │
│  │  • Lead Time Offsetting                                  │  │
│  │  • Safety Stock Consideration                            │  │
│  │  • Pegging & Exception Management                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         PRODUCTION SCHEDULING ENGINE                      │  │
│  │  • Finite Capacity Scheduling                            │  │
│  │  • Forward/Backward Scheduling                           │  │
│  │  • Load Balancing Algorithm                              │  │
│  │  • Constraint-Based Scheduling                           │  │
│  │  • Critical Path Analysis                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           SHOP FLOOR EXECUTION ENGINE                     │  │
│  │  • Material Consumption Tracking                         │  │
│  │  • Progress Monitoring                                   │  │
│  │  • Scrap/Rework Reporting                               │  │
│  │  • Yield Calculation                                     │  │
│  │  • Real-Time Inventory Updates                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              BOM COST CALCULATION ENGINE                  │  │
│  │  • Material Cost Rollup                                  │  │
│  │  • Scrap Factor Application                              │  │
│  │  • Labor & Overhead Costing                              │  │
│  │  • Multi-Level BOM Explosion                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA ACCESS LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Products   │  │     BOM      │  │  Materials   │         │
│  │     Data     │  │     Data     │  │  & Inventory │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │Manufacturing │  │Work Centers  │  │   Routings   │         │
│  │    Orders    │  │     Data     │  │     Data     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Schedule   │  │  Shop Floor  │  │    Alerts    │         │
│  │     Data     │  │  Transactions│  │     Data     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PERSISTENCE LAYER (Future)                     │
│                     Supabase / PostgreSQL                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 DATA FLOW DIAGRAM

### Manufacturing Order Lifecycle

```
┌─────────────┐
│   Product   │
│   Master    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│     BOM     │────▶│   Routing   │
│  Definition │     │  Operations │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └─────────┬─────────┘
                 ▼
          ┌─────────────┐
          │    MRP      │
          │  Planner    │
          └──────┬──────┘
                 │
                 ▼
          ┌─────────────┐
          │  Planned    │
          │   Orders    │
          └──────┬──────┘
                 │
                 ▼
          ┌─────────────┐
          │     MO      │◀─────────┐
          │   Created   │          │
          └──────┬──────┘          │
                 │                 │
                 ▼                 │
          ┌─────────────┐          │
          │  Production │          │
          │  Scheduler  │          │
          └──────┬──────┘          │
                 │                 │
                 ▼                 │
          ┌─────────────┐          │
          │  Scheduled  │          │
          │    Date     │          │
          └──────┬──────┘          │
                 │                 │
                 ▼                 │
          ┌─────────────┐          │
          │ Work Center │          │
          │  Assignment │          │
          └──────┬──────┘          │
                 │                 │
                 ▼                 │
          ┌─────────────┐          │
          │  Materials  │          │
          │  Reserved   │          │
          └──────┬──────┘          │
                 │                 │
                 ▼                 │
          ┌─────────────┐          │
          │ Shop Floor  │          │
          │  Execution  │          │
          └──────┬──────┘          │
                 │                 │
       ┌─────────┼─────────┐       │
       ▼         ▼         ▼       │
┌───────────┐ ┌────────┐ ┌────────┐│
│ Material  │ │Progress│ │ Scrap/ ││
│Consumption│ │ Update │ │ Rework ││
└───────────┘ └────────┘ └────────┘│
       │         │         │       │
       └─────────┴─────────┘       │
                 │                 │
                 ▼                 │
          ┌─────────────┐          │
          │     MO      │──────────┘
          │  Completed  │  (Rework Loop)
          └─────────────┘
```

---

## 🧮 MRP CALCULATION FLOW

```
Start MRP Run
      │
      ▼
┌──────────────────┐
│ Select Planning  │
│     Horizon      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Load All MOs    │
│  in Horizon      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Explode BOM    │
│  for Each MO     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Calculate Gross Requirements    │
│  = MO Qty × BOM Qty × (1+Scrap%) │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│    Get Inventory Availability    │
│    Available = On-Hand - Reserved│
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│   Calculate Net Requirements     │
│   = Gross - Available - Safety   │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│      Apply Lot Sizing Rule       │
│  • Lot-for-Lot                   │
│  • Fixed Lot Size                │
│  • Economic Order Quantity       │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│     Lead Time Offsetting         │
│  Order Date = Need Date - LT     │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│   Generate Planned Orders        │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│    Create Exception Messages     │
│  • Late orders                   │
│  • Shortages                     │
│  • Excess inventory              │
└────────┬─────────────────────────┘
         │
         ▼
    MRP Complete
```

---

## ⚙️ PRODUCTION SCHEDULING ALGORITHM

```
Initialize Scheduler
      │
      ▼
┌──────────────────┐
│  Load All MOs    │
│  to Schedule     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Sort by        │
│   Priority       │
│  1. Urgent       │
│  2. High         │
│  3. Medium       │
│  4. Low          │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  For Each MO:            │
│  Load Routing Operations │
└────────┬─────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  For Each Operation:               │
│  1. Find Work Center               │
│  2. Check Capacity                 │
│  3. Calculate Duration             │
│     = Setup + (Qty × RunTime)      │
└────────┬───────────────────────────┘
         │
         ├──▶ Forward Scheduling
         │    Start Date → Add Duration → End Date
         │
         └──▶ Backward Scheduling
              Due Date → Subtract Duration → Start Date
         │
         ▼
┌────────────────────────────────────┐
│  Check for Conflicts:              │
│  • Work center overload            │
│  • Material shortages              │
│  • Overlapping operations          │
└────────┬───────────────────────────┘
         │
         ▼
    ┌───────┐
    │Conflict?│
    └───┬───┬┘
        │   │
     Yes│   │No
        │   │
        ▼   ▼
  ┌─────────┐  ┌─────────┐
  │Reschedule│  │ Commit  │
  │or Re-    │  │Schedule │
  │assign WC │  └─────────┘
  └─────────┘
        │
        └───▶ Update Work Center Load
        │
        ▼
    Schedule Complete
```

---

## 🏭 WORK CENTER CAPACITY MODEL

```
┌─────────────────────────────────────────┐
│          Work Center Capacity           │
├─────────────────────────────────────────┤
│                                         │
│  Total Hours = Hours/Day × Days/Week    │
│         │                               │
│         ▼                               │
│  Effective Hours = Total × Efficiency%  │
│         │                               │
│         ▼                               │
│  Target Load = Effective × Target%      │
│         │                               │
│         ▼                               │
│  Available = Target - Current Scheduled │
│                                         │
└─────────────────────────────────────────┘

Example:
  Work Center: CNC-01
  Hours/Day: 16
  Days/Week: 6
  Total Weekly: 96 hours
  Efficiency: 85%
  Effective: 81.6 hours
  Target Utilization: 80%
  Target Load: 65.28 hours
  Current Scheduled: 53 hours
  Available: 12.28 hours
```

---

## 🔗 MODULE DEPENDENCIES

```
┌─────────────┐
│   Products  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     BOM     │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│  Materials  │   │   Routing   │
└──────┬──────┘   └──────┬──────┘
       │                 │
       │                 ▼
       │          ┌─────────────┐
       │          │Work Centers │
       │          └──────┬──────┘
       │                 │
       └────────┬────────┘
                ▼
         ┌─────────────┐
         │     MO      │
         └──────┬──────┘
                │
       ┌────────┼────────┐
       │        │        │
       ▼        ▼        ▼
┌──────────┐┌──────────┐┌──────────┐
│   MRP    ││Scheduling││Inventory │
└────┬─────┘└────┬─────┘└────┬─────┘
     │           │           │
     └───────────┼───────────┘
                 ▼
          ┌─────────────┐
          │ Shop Floor  │
          └──────┬──────┘
                 │
                 ▼
          ┌─────────────┐
          │  Analytics  │
          └─────────────┘
```

---

## 📊 DATA ENTITY DIAGRAM

```
Product
├── id: string
├── sku: string (unique)
├── name: string
├── bomId?: string ──────┐
├── category: string     │
├── price: number        │
└── status: enum         │
                         │
                         ▼
BOM                      │
├── id: string ◀─────────┘
├── productId: string
├── productName: string
├── version: string
├── totalCost: number
├── lines: BOMLine[] ────┐
└── routingId?: string   │
                         │
                         ▼
BOMLine                  │
├── materialSKU: string ─┼──┐
├── description: string  │  │
├── quantity: number     │  │
├── scrapFactor: number  │  │
└── netQuantity: number  │  │
                         │  │
Material                 │  │
├── sku: string ◀────────┘  │
├── name: string            │
├── category: string        │
├── unitCost: number        │
├── unitOfMeasure: string   │
└── supplier: string        │
                            │
Inventory                   │
├── sku: string ◀───────────┘
├── onHand: number
├── reserved: number
├── available: number
├── reorderPoint: number
├── safetyStock: number
└── leadTime: number

Manufacturing Order
├── id: string
├── orderNumber: string (unique)
├── productId: string ────┐
├── bomId: string         │
├── quantity: number      │
├── status: enum          │
├── priority: enum        │
├── scheduledStart: date  │
├── scheduledEnd: date    │
└── department: string    │
                          │
                          ▼
MaterialRequirement       │
├── orderId: string ◀─────┘
├── materialSKU: string
├── required: number
└── reserved: number

Work Center
├── id: string
├── code: string (unique)
├── name: string
├── type: enum
├── department: string
├── capacity: object
├── costPerHour: number
└── status: enum
      │
      │
Routing
├── id: string
├── bomId: string
├── productId: string
├── operations: Operation[]
└── totalLeadTime: number
      │
      ▼
Operation
├── operationNumber: number
├── workCenterId: string ───┐
├── setupTime: number       │
├── runTimePerUnit: number  │
├── laborRequired: number   │
└── instructions: string    │
                            │
                            ▼
                     (Links to Work Center)
```

---

## 🎯 COMPONENT HIERARCHY

```
App
│
├── DashboardLayout
│   ├── Sidebar Navigation
│   ├── Header
│   │   ├── GlobalSearch
│   │   └── CreateOrderDialog
│   │
│   └── Outlet (Router)
│       │
│       ├── Overview
│       │   ├── KPI Summary Cards
│       │   ├── Department Status Grid
│       │   ├── Recent Orders Table
│       │   └── Charts (recharts)
│       │
│       ├── ProductsPage
│       │   ├── Product List
│       │   └── ProductDialog (CRUD)
│       │
│       ├── BOMPage
│       │   ├── BOM List
│       │   ├── BOMDialog (CRUD)
│       │   └── BOM Detail View
│       │
│       ├── ManufacturingOrdersPage
│       │   ├── Order List
│       │   ├── OrderDialog (CRUD)
│       │   └── Order Detail View
│       │
│       ├── InventoryPage
│       │   ├── Material List
│       │   ├── MaterialDialog (CRUD)
│       │   └── Transaction History
│       │
│       ├── MRPPlanningPage
│       │   ├── MRP Run Configuration
│       │   ├── Net Requirements Table
│       │   └── Planned Orders Grid
│       │
│       ├── ProductionSchedulingPage
│       │   ├── Schedule Configuration
│       │   ├── Work Center Load Chart
│       │   └── Schedule Results Table
│       │
│       ├── WorkCentersPage
│       │   ├── Work Center Grid
│       │   ├── WorkCenterDialog (CRUD)
│       │   ├── Utilization Charts
│       │   └── Routing Display
│       │
│       ├── ShopFloorTerminal
│       │   ├── Active Orders List
│       │   ├── Material Consumption Form
│       │   ├── Progress Update Form
│       │   └── Scrap/Rework Form
│       │
│       ├── ProductionAnalyticsPage
│       │   ├── KPI Cards
│       │   ├── Department Performance
│       │   ├── Trend Charts
│       │   └── Variance Analysis
│       │
│       ├── AlertsPage
│       │   ├── Alert Categories
│       │   ├── Alert List
│       │   └── Alert Actions
│       │
│       ├── CalendarView
│       │   ├── Month/Week/Day Toggle
│       │   └── Draggable Order Cards
│       │
│       ├── GanttView
│       │   ├── Timeline Header
│       │   ├── Draggable Task Bars
│       │   └── Dependency Lines
│       │
│       └── DepartmentPlanning
│           ├── Department Selector
│           ├── Order Queue
│           └── Capacity Metrics
│
└── UI Components (shadcn/ui)
    ├── Card
    ├── Button
    ├── Dialog
    ├── Input
    ├── Select
    ├── Table
    ├── Badge
    ├── Progress
    └── Toast (sonner)
```

---

## 🔐 FUTURE SECURITY ARCHITECTURE

```
┌─────────────────────────────────────────┐
│         Authentication Layer             │
│  • User Login (Supabase Auth)          │
│  • Session Management                   │
│  • JWT Tokens                           │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│         Authorization Layer              │
│  • Role-Based Access Control (RBAC)    │
│    - Admin                              │
│    - Production Manager                 │
│    - Planner                            │
│    - Shop Floor Operator                │
│    - Viewer                             │
│  • Resource-Level Permissions           │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│          API Gateway Layer               │
│  • Request Validation                   │
│  • Rate Limiting                        │
│  • Audit Logging                        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│         Business Logic Layer             │
│  (Current Implementation)                │
└─────────────────────────────────────────┘
```

---

## 📈 SCALABILITY CONSIDERATIONS

### Current State (Client-Side)
- ✅ Handles ~100 products
- ✅ Handles ~500 manufacturing orders
- ✅ Handles ~200 materials
- ✅ Real-time calculations in browser

### Future State (Backend)
- 🎯 Target: 10,000+ products
- 🎯 Target: 100,000+ manufacturing orders
- 🎯 Target: 5,000+ materials
- 🎯 Server-side calculations
- 🎯 Database indexing
- 🎯 Caching layer (Redis)
- 🎯 Message queue for heavy jobs (MRP runs)

---

## 🛠️ TECHNOLOGY STACK

### Frontend
- **Framework:** React 18+ with TypeScript
- **Routing:** React Router v7
- **State Management:** React Hooks (useState, useContext)
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Notifications:** Sonner (toast)
- **Drag & Drop:** Custom implementation
- **Date Handling:** Native JavaScript Date

### Backend (Planned)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **API:** REST API (Supabase Functions)
- **Real-time:** Supabase Realtime
- **Storage:** Supabase Storage (for file uploads)

### DevOps (Future)
- **Hosting:** Vercel / Netlify
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry
- **Analytics:** PostHog / Mixpanel

---

## 📦 PROJECT STRUCTURE

```
/src
├── /app
│   ├── /components
│   │   ├── /ui                    # shadcn/ui components
│   │   ├── /layout
│   │   │   └── DashboardLayout.tsx
│   │   ├── GlobalSearch.tsx
│   │   ├── CreateOrderDialog.tsx
│   │   ├── WorkCenterDialog.tsx
│   │   ├── BOMDialog.tsx
│   │   └── ...                    # Feature-specific dialogs
│   │
│   ├── /pages
│   │   ├── Overview.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── BOMPage.tsx
│   │   ├── ManufacturingOrdersPage.tsx
│   │   ├── InventoryPage.tsx
│   │   ├── MRPPlanningPage.tsx
│   │   ├── ProductionSchedulingPage.tsx
│   │   ├── WorkCentersPage.tsx
│   │   ├── ShopFloorTerminal.tsx
│   │   ├── ProductionAnalyticsPage.tsx
│   │   ├── AlertsPage.tsx
│   │   ├── CalendarView.tsx
│   │   ├── GanttView.tsx
│   │   └── DepartmentPlanning.tsx
│   │
│   ├── /data
│   │   ├── mockData.ts            # Manufacturing Orders, Departments
│   │   ├── products.ts            # Product master data + CRUD
│   │   ├── bom.ts                 # BOM data + calculation engine
│   │   ├── inventory.ts           # Inventory data + transactions
│   │   ├── alerts.ts              # Alert definitions
│   │   ├── workCenters.ts         # Work centers + routings
│   │   └── analytics.ts           # KPI calculations
│   │
│   ├── /engines
│   │   ├── mrpEngine.ts           # MRP calculation logic
│   │   ├── schedulingEngine.ts    # Production scheduling
│   │   └── shopFloorEngine.ts     # Shop floor tracking
│   │
│   ├── routes.tsx                 # React Router configuration
│   └── App.tsx                    # Main app component
│
├── /styles
│   ├── theme.css                  # Tailwind theme + tokens
│   └── fonts.css                  # Font imports
│
└── /public                        # Static assets

/SYSTEM_AUDIT.md                   # This audit document
/ARCHITECTURE.md                   # Architecture documentation
/README.md                         # Project readme
```

---

## 🔄 STATE MANAGEMENT STRATEGY

### Current: Local State + Module-Level Data
```typescript
// Module-level data stores (imported across pages)
import { products } from '../data/products';
import { boms } from '../data/bom';
import { workCenters } from '../data/workCenters';

// Component-level state
const [selectedOrder, setSelectedOrder] = useState(null);
const [filters, setFilters] = useState({...});
```

### Future: Supabase Realtime + React Query
```typescript
// Server state management
const { data: products, isLoading } = useQuery('products', fetchProducts);
const mutation = useMutation(createProduct);

// Realtime subscriptions
const subscription = supabase
  .from('manufacturing_orders')
  .on('*', handleChange)
  .subscribe();
```

---

## ⚡ PERFORMANCE OPTIMIZATION PLAN

### Frontend
1. **Code Splitting** - Lazy load routes
2. **Memoization** - useMemo for expensive calculations
3. **Virtual Scrolling** - For large tables (react-window)
4. **Debouncing** - Search inputs
5. **Image Optimization** - Lazy loading, WebP format

### Backend
1. **Database Indexing** - On frequently queried fields
2. **Query Optimization** - Use Supabase's RPC for complex queries
3. **Caching** - Cache reference data (products, BOMs)
4. **Pagination** - Limit results per page
5. **Background Jobs** - Queue MRP runs, large reports

---

## 🎯 SUMMARY

This architecture supports a **production-grade MRP system** with:

✅ **Clear separation of concerns** (Presentation, Logic, Data)  
✅ **Modular design** (14 independent but integrated modules)  
✅ **Scalable patterns** (Ready for backend integration)  
✅ **Business logic engines** (MRP, Scheduling, Shop Floor)  
✅ **Comprehensive data model** (Products → BOM → Routing → MO → Execution)  
✅ **Professional UI/UX** (Consistent patterns, responsive design)  

The system is **backend-ready** with clearly defined:
- API endpoints required
- Data relationships
- Business logic separation
- Security considerations

**Next Phase:** Address critical gaps, then integrate Supabase backend.

---

**Document Version:** 1.0  
**Last Updated:** April 10, 2026  
**Maintained By:** Development Team
