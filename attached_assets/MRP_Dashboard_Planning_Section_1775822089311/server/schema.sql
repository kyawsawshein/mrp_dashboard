-- PostgreSQL Schema for MRP Dashboard

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50),
    bomId VARCHAR(255),
    supplier VARCHAR(255),
    leadTimeDays INTEGER DEFAULT 0,
    costPerUnit DECIMAL(10, 2) DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(255),
    category VARCHAR(100),
    supplier VARCHAR(255),
    supplierSKU VARCHAR(255),
    currentStock DECIMAL(10, 2) DEFAULT 0,
    allocatedStock DECIMAL(10, 2) DEFAULT 0,
    unit VARCHAR(50),
    minStock DECIMAL(10, 2) DEFAULT 0,
    maxStock DECIMAL(10, 2) DEFAULT 0,
    reorderPoint DECIMAL(10, 2) DEFAULT 0,
    safetyStock DECIMAL(10, 2) DEFAULT 0,
    leadTimeDays INTEGER DEFAULT 0,
    costPerUnit DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOM (Bill of Materials) Table
CREATE TABLE IF NOT EXISTS bom (
    id VARCHAR(255) PRIMARY KEY,
    productSKU VARCHAR(255) NOT NULL,
    productName VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    laborCost DECIMAL(10, 2) DEFAULT 0,
    overheadCost DECIMAL(10, 2) DEFAULT 0,
    totalMaterialCost DECIMAL(10, 2) DEFAULT 0,
    totalCost DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOM Lines Table
CREATE TABLE IF NOT EXISTS bom_lines (
    id VARCHAR(255) PRIMARY KEY,
    bom_id VARCHAR(255) NOT NULL REFERENCES bom (id) ON DELETE CASCADE,
    materialSKU VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    quantity DECIMAL(10, 4) DEFAULT 1,
    unitOfMeasure VARCHAR(50),
    scrapFactor DECIMAL(5, 2) DEFAULT 0,
    netQuantity DECIMAL(10, 4) DEFAULT 1,
    costPerUnit DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manufacturing Orders Table
CREATE TABLE IF NOT EXISTS manufacturing_orders (
    id VARCHAR(255) PRIMARY KEY,
    orderNumber VARCHAR(255) UNIQUE NOT NULL,
    product VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'planned',
    startDate DATE,
    endDate DATE,
    notes TEXT,
    createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for better query performance
CREATE INDEX idx_products_sku ON products (sku);

CREATE INDEX idx_inventory_sku ON inventory (sku);

CREATE INDEX idx_inventory_category ON inventory (category);

CREATE INDEX idx_bom_product_sku ON bom (productSKU);

CREATE INDEX idx_bom_lines_bom_id ON bom_lines (bom_id);

CREATE INDEX idx_bom_lines_material_sku ON bom_lines (materialSKU);

CREATE INDEX idx_orders_status ON manufacturing_orders (status);

CREATE INDEX idx_orders_product ON manufacturing_orders (product);