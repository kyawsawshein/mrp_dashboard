import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// ============================================================================
// PRODUCTS ENDPOINTS
// ============================================================================

/**
 * GET /products - Fetch all products from PostgreSQL
 */
app.get('/products', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        id, 
        sku, 
        name, 
        description, 
        unit,
        bomId,
        supplier,
        leadTimeDays,
        costPerUnit,
        category,
        created_at,
        updated_at
      FROM products
      ORDER BY id
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

/**
 * GET /products/:id - Fetch single product
 */
app.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Product not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// ============================================================================
// INVENTORY ENDPOINTS
// ============================================================================

/**
 * GET /inventory - Fetch all inventory items
 */
app.get('/inventory', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        id,
        name,
        sku,
        category,
        supplier,
        supplierSKU,
        currentStock,
        allocatedStock,
        unit,
        minStock,
        maxStock,
        reorderPoint,
        safetyStock,
        leadTimeDays,
        costPerUnit,
        currency,
        location,
        created_at,
        updated_at
      FROM inventory
      ORDER BY id
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

/**
 * GET /inventory/:id - Fetch single inventory item
 */
app.get('/inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM inventory WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Inventory item not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

/**
 * PUT /inventory/:id - Update inventory item
 */
app.put('/inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { currentStock, allocatedStock } = req.body;

        const result = await pool.query(`
      UPDATE inventory 
      SET 
        currentStock = COALESCE($1, currentStock),
        allocatedStock = COALESCE($2, allocatedStock),
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [currentStock, allocatedStock, id]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Inventory item not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ error: 'Failed to update inventory' });
    }
});

// ============================================================================
// BOM ENDPOINTS
// ============================================================================

/**
 * GET /bom - Fetch all BOMs
 */
app.get('/bom', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        b.id,
        b.productSKU,
        b.productName,
        b.status,
        b.laborCost,
        b.overheadCost,
        b.totalMaterialCost,
        b.totalCost,
        json_agg(
          json_build_object(
            'id', bl.id,
            'materialSKU', bl.materialSKU,
            'materialName', bl.description,
            'quantity', bl.quantity,
            'unitOfMeasure', bl.unitOfMeasure,
            'scrapFactor', bl.scrapFactor,
            'netQuantity', bl.netQuantity,
            'costPerUnit', bl.costPerUnit,
            'notes', bl.notes
          )
        ) as lines,
        b.created_at,
        b.updated_at
      FROM bom b
      LEFT JOIN bom_lines bl ON b.id = bl.bom_id
      GROUP BY b.id
      ORDER BY b.id
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching BOMs:', error);
        res.status(500).json({ error: 'Failed to fetch BOMs' });
    }
});

/**
 * GET /bom/:id - Fetch single BOM
 */
app.get('/bom/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
      SELECT 
        b.id,
        b.productSKU,
        b.productName,
        b.status,
        b.laborCost,
        b.overheadCost,
        b.totalMaterialCost,
        b.totalCost,
        json_agg(
          json_build_object(
            'id', bl.id,
            'materialSKU', bl.materialSKU,
            'materialName', bl.description,
            'quantity', bl.quantity,
            'unitOfMeasure', bl.unitOfMeasure,
            'scrapFactor', bl.scrapFactor,
            'netQuantity', bl.netQuantity,
            'costPerUnit', bl.costPerUnit,
            'notes', bl.notes
          )
        ) as lines
      FROM bom b
      LEFT JOIN bom_lines bl ON b.id = bl.bom_id
      WHERE b.id = $1
      GROUP BY b.id
    `, [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'BOM not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error fetching BOM:', error);
        res.status(500).json({ error: 'Failed to fetch BOM' });
    }
});

// ============================================================================
// MANUFACTURING ORDERS ENDPOINTS
// ============================================================================

/**
 * GET /orders - Fetch all manufacturing orders
 */
app.get('/orders', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        id,
        orderNumber,
        product,
        quantity,
        status,
        startDate,
        endDate,
        notes,
        createdDate,
        created_at,
        updated_at
      FROM manufacturing_orders
      ORDER BY id DESC
    `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

/**
 * GET /orders/:id - Fetch single order
 */
app.get('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM manufacturing_orders WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Order not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

/**
 * POST /orders - Create new manufacturing order
 */
app.post('/orders', async (req, res) => {
    try {
        const { orderNumber, product, quantity, status, startDate, endDate, notes } = req.body;

        const result = await pool.query(`
      INSERT INTO manufacturing_orders 
      (orderNumber, product, quantity, status, startDate, endDate, notes, createdDate, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW())
      RETURNING *
    `, [orderNumber, product, quantity, status, startDate, endDate, notes]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

/**
 * PUT /orders/:id - Update manufacturing order
 */
app.put('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { orderNumber, product, quantity, status, startDate, endDate, notes } = req.body;

        const result = await pool.query(`
      UPDATE manufacturing_orders 
      SET 
        orderNumber = COALESCE($1, orderNumber),
        product = COALESCE($2, product),
        quantity = COALESCE($3, quantity),
        status = COALESCE($4, status),
        startDate = COALESCE($5, startDate),
        endDate = COALESCE($6, endDate),
        notes = COALESCE($7, notes),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `, [orderNumber, product, quantity, status, startDate, endDate, notes, id]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Order not found' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// ============================================================================
// SYNC ENDPOINTS - For bulk syncing data from IndexedDB to PostgreSQL
// ============================================================================

/**
 * POST /sync/inventory - Sync inventory data back to PostgreSQL
 */
app.post('/sync/inventory', async (req, res) => {
    try {
        const items = req.body;

        for (const item of items) {
            await pool.query(`
        INSERT INTO inventory (id, name, sku, currentStock, allocatedStock, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (id) DO UPDATE SET
          currentStock = $4,
          allocatedStock = $5,
          updated_at = NOW()
      `, [item.id, item.name, item.sku, item.currentStock, item.allocatedStock]);
        }

        res.json({ success: true, message: 'Inventory synced successfully' });
    } catch (error) {
        console.error('Error syncing inventory:', error);
        res.status(500).json({ error: 'Failed to sync inventory' });
    }
});

/**
 * Error handling middleware
 */
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 MRP API Server running on http://localhost:${PORT}`);
    console.log(`Database: ${process.env.DB_NAME} at ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});
