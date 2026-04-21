CREATE TABLE "alerts" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"type" varchar(10) NOT NULL,
	"category" varchar(20) NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"timestamp" timestamp NOT NULL,
	"related_to" varchar(50),
	"actionable" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bom_items" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"bom_id" varchar(50) NOT NULL,
	"material_id" varchar(50) NOT NULL,
	"material_name" text NOT NULL,
	"quantity" numeric(10, 4) NOT NULL,
	"unit" varchar(20) NOT NULL,
	"scrap_factor" numeric(5, 2) NOT NULL,
	"cost_per_unit" numeric(10, 2) NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "boms" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"product_id" varchar(50),
	"product_name" text NOT NULL,
	"product_sku" varchar(50) NOT NULL,
	"version" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"effective_date" timestamp NOT NULL,
	"created_by" text NOT NULL,
	"created_date" timestamp NOT NULL,
	"last_modified" timestamp NOT NULL,
	"total_material_cost" numeric(10, 2) NOT NULL,
	"labor_cost" numeric(10, 2) NOT NULL,
	"overhead_cost" numeric(10, 2) NOT NULL,
	"total_cost" numeric(10, 2) NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finished_products" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sku" varchar(50) NOT NULL,
	"category" text NOT NULL,
	"vehicle_type" text NOT NULL,
	"current_stock" integer NOT NULL,
	"unit" varchar(20) NOT NULL,
	"min_stock" integer NOT NULL,
	"max_stock" integer NOT NULL,
	"production_cost" numeric(10, 2) NOT NULL,
	"retail_price" numeric(10, 2) NOT NULL,
	"last_produced" timestamp,
	"total_produced" integer NOT NULL,
	"total_sold" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"bom_id" varchar(50),
	"description" text,
	"lead_time_days" integer,
	CONSTRAINT "finished_products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sku" varchar(50) NOT NULL,
	"category" varchar(20) NOT NULL,
	"supplier" text NOT NULL,
	"supplier_sku" varchar(50),
	"current_stock" integer NOT NULL,
	"unit" varchar(20) NOT NULL,
	"min_stock" integer NOT NULL,
	"max_stock" integer NOT NULL,
	"reorder_point" integer NOT NULL,
	"lead_time_days" integer NOT NULL,
	"cost_per_unit" numeric(10, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"last_purchase_date" timestamp,
	"last_purchase_price" numeric(10, 2),
	"location" text,
	"batch_number" varchar(50),
	"expiry_date" timestamp,
	"certifications" jsonb,
	"notes" text,
	"image_url" text,
	"status" varchar(20) NOT NULL,
	"allocated_stock" integer,
	"safety_stock" integer,
	"fabric_spec" jsonb,
	"foam_spec" jsonb,
	"fastener_spec" jsonb,
	"thread_spec" jsonb,
	"packaging_spec" jsonb,
	CONSTRAINT "inventory_items_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "manufacturing_orders" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"product" text NOT NULL,
	"quantity" integer NOT NULL,
	"department" varchar(50) NOT NULL,
	"status" varchar(20) NOT NULL,
	"priority" varchar(10) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"completion" integer NOT NULL,
	"scrap_quantity" integer,
	"rework_quantity" integer,
	"actual_quantity_produced" integer,
	"defect_notes" text,
	"cancellation_reason" text,
	"modification_history" jsonb
);
--> statement-breakpoint
CREATE TABLE "order_materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" varchar(50) NOT NULL,
	"material_id" varchar(50) NOT NULL,
	"required" numeric(10, 4) NOT NULL,
	"available" numeric(10, 4) NOT NULL,
	"unit" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_centers" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"department" varchar(50),
	"description" text,
	"capacity" jsonb NOT NULL,
	"cost_per_hour" numeric(10, 2) NOT NULL,
	"setup_cost_per_hour" numeric(10, 2) NOT NULL,
	"status" varchar(20) NOT NULL,
	"current_load" integer NOT NULL,
	"operators_required" integer NOT NULL,
	"skill_level" varchar(20) NOT NULL,
	"last_maintenance" timestamp,
	"next_maintenance" timestamp,
	"maintenance_interval_days" integer NOT NULL,
	"metrics" jsonb
);
--> statement-breakpoint
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_bom_id_boms_id_fk" FOREIGN KEY ("bom_id") REFERENCES "public"."boms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bom_items" ADD CONSTRAINT "bom_items_material_id_inventory_items_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "boms" ADD CONSTRAINT "boms_product_id_finished_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."finished_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manufacturing_orders" ADD CONSTRAINT "manufacturing_orders_department_departments_id_fk" FOREIGN KEY ("department") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_materials" ADD CONSTRAINT "order_materials_order_id_manufacturing_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."manufacturing_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_materials" ADD CONSTRAINT "order_materials_material_id_inventory_items_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_centers" ADD CONSTRAINT "work_centers_department_departments_id_fk" FOREIGN KEY ("department") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;