import { pgTable, text, serial, integer, real, boolean, jsonb, timestamp, varchar, decimal } from "drizzle-orm/pg-core";

// Departments table
export const departmentsTable = pgTable("departments", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
});

export type Department = typeof departmentsTable.$inferSelect;

// Work Centers table
export const workCentersTable = pgTable("work_centers", {
  id: varchar("id", { length: 50 }).primaryKey(),
  code: varchar("code", { length: 20 }).notNull(),
  name: text("name").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  department: varchar("department", { length: 50 }).references(() => departmentsTable.id),
  description: text("description"),
  capacity: jsonb("capacity").notNull(),
  costPerHour: decimal("cost_per_hour", { precision: 10, scale: 2 }).notNull(),
  setupCostPerHour: decimal("setup_cost_per_hour", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  currentLoad: integer("current_load").notNull(),
  operatorsRequired: integer("operators_required").notNull(),
  skillLevel: varchar("skill_level", { length: 20 }).notNull(),
  lastMaintenance: timestamp("last_maintenance"),
  nextMaintenance: timestamp("next_maintenance"),
  maintenanceIntervalDays: integer("maintenance_interval_days").notNull(),
  metrics: jsonb("metrics"),
});

export type WorkCenter = typeof workCentersTable.$inferSelect;

// Inventory Items table
export const inventoryItemsTable = pgTable("inventory_items", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: text("name").notNull(),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  category: varchar("category", { length: 20 }).notNull(),
  supplier: text("supplier").notNull(),
  supplierSKU: varchar("supplier_sku", { length: 50 }),
  currentStock: integer("current_stock").notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  minStock: integer("min_stock").notNull(),
  maxStock: integer("max_stock").notNull(),
  reorderPoint: integer("reorder_point").notNull(),
  leadTimeDays: integer("lead_time_days").notNull(),
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  lastPurchaseDate: timestamp("last_purchase_date"),
  lastPurchasePrice: decimal("last_purchase_price", { precision: 10, scale: 2 }),
  location: text("location"),
  batchNumber: varchar("batch_number", { length: 50 }),
  expiryDate: timestamp("expiry_date"),
  certifications: jsonb("certifications"),
  notes: text("notes"),
  imageUrl: text("image_url"),
  status: varchar("status", { length: 20 }).notNull(),
  allocatedStock: integer("allocated_stock"),
  safetyStock: integer("safety_stock"),
  fabricSpec: jsonb("fabric_spec"),
  foamSpec: jsonb("foam_spec"),
  fastenerSpec: jsonb("fastener_spec"),
  threadSpec: jsonb("thread_spec"),
  packagingSpec: jsonb("packaging_spec"),
});

export type InventoryItem = typeof inventoryItemsTable.$inferSelect;

// Finished Products table
export const finishedProductsTable = pgTable("finished_products", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: text("name").notNull(),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  category: text("category").notNull(),
  vehicleType: text("vehicle_type").notNull(),
  currentStock: integer("current_stock").notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  minStock: integer("min_stock").notNull(),
  maxStock: integer("max_stock").notNull(),
  productionCost: decimal("production_cost", { precision: 10, scale: 2 }).notNull(),
  retailPrice: decimal("retail_price", { precision: 10, scale: 2 }).notNull(),
  lastProduced: timestamp("last_produced"),
  totalProduced: integer("total_produced").notNull(),
  totalSold: integer("total_sold").notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  bomId: varchar("bom_id", { length: 50 }),
  description: text("description"),
  leadTimeDays: integer("lead_time_days"),
});

export type FinishedProduct = typeof finishedProductsTable.$inferSelect;

// BOMs table
export const bomsTable = pgTable("boms", {
  id: varchar("id", { length: 50 }).primaryKey(),
  productId: varchar("product_id", { length: 50 }).references(() => finishedProductsTable.id),
  productName: text("product_name").notNull(),
  productSKU: varchar("product_sku", { length: 50 }).notNull(),
  version: varchar("version", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  createdBy: text("created_by").notNull(),
  createdDate: timestamp("created_date").notNull(),
  lastModified: timestamp("last_modified").notNull(),
  totalMaterialCost: decimal("total_material_cost", { precision: 10, scale: 2 }).notNull(),
  laborCost: decimal("labor_cost", { precision: 10, scale: 2 }).notNull(),
  overheadCost: decimal("overhead_cost", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
});

export type BOM = typeof bomsTable.$inferSelect;

// BOM Items table
export const bomItemsTable = pgTable("bom_items", {
  id: varchar("id", { length: 50 }).primaryKey(),
  bomId: varchar("bom_id", { length: 50 }).references(() => bomsTable.id).notNull(),
  materialId: varchar("material_id", { length: 50 }).references(() => inventoryItemsTable.id).notNull(),
  materialName: text("material_name").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  scrapFactor: decimal("scrap_factor", { precision: 5, scale: 2 }).notNull(),
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
});

export type BOMItem = typeof bomItemsTable.$inferSelect;

// Manufacturing Orders table
export const manufacturingOrdersTable = pgTable("manufacturing_orders", {
  id: varchar("id", { length: 50 }).primaryKey(),
  product: text("product").notNull(),
  quantity: integer("quantity").notNull(),
  department: varchar("department", { length: 50 }).references(() => departmentsTable.id).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  priority: varchar("priority", { length: 10 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  completion: integer("completion").notNull(),
  scrapQuantity: integer("scrap_quantity"),
  reworkQuantity: integer("rework_quantity"),
  actualQuantityProduced: integer("actual_quantity_produced"),
  defectNotes: text("defect_notes"),
  cancellationReason: text("cancellation_reason"),
  modificationHistory: jsonb("modification_history"),
});

export type ManufacturingOrder = typeof manufacturingOrdersTable.$inferSelect;

// Order Materials table
export const orderMaterialsTable = pgTable("order_materials", {
  id: serial("id").primaryKey(),
  orderId: varchar("order_id", { length: 50 }).references(() => manufacturingOrdersTable.id).notNull(),
  materialId: varchar("material_id", { length: 50 }).references(() => inventoryItemsTable.id).notNull(),
  required: decimal("required", { precision: 10, scale: 4 }).notNull(),
  available: decimal("available", { precision: 10, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
});

export type OrderMaterial = typeof orderMaterialsTable.$inferSelect;

// Alerts table
export const alertsTable = pgTable("alerts", {
  id: varchar("id", { length: 50 }).primaryKey(),
  type: varchar("type", { length: 10 }).notNull(),
  category: varchar("category", { length: 20 }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  relatedTo: varchar("related_to", { length: 50 }),
  actionable: boolean("actionable").notNull(),
});

export type Alert = typeof alertsTable.$inferSelect;
