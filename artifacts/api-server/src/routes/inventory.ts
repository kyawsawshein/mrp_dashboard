import { Router, type IRouter } from "express";
import { db, inventoryItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/inventory - Get all inventory items
router.get("/", async (_req, res) => {
    try {
        const items = await db.select().from(inventoryItemsTable);
        res.json(items);
    } catch (error) {
        console.error("Error fetching inventory items:", error);
        res.status(500).json({ error: "Failed to fetch inventory items" });
    }
});

// GET /api/inventory/:id - Get inventory item by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const item = await db
            .select()
            .from(inventoryItemsTable)
            .where(eq(inventoryItemsTable.id, id))
            .limit(1);

        if (item.length === 0) {
            return res.status(404).json({ error: "Inventory item not found" });
        }

        res.json(item[0]);
    } catch (error) {
        console.error("Error fetching inventory item:", error);
        res.status(500).json({ error: "Failed to fetch inventory item" });
    }
});

// POST /api/inventory - Create new inventory item
router.post("/", async (req, res) => {
    try {
        const newItem = req.body;
        const result = await db.insert(inventoryItemsTable).values(newItem).returning();
        res.status(201).json(result[0]);
    } catch (error) {
        console.error("Error creating inventory item:", error);
        res.status(500).json({ error: "Failed to create inventory item" });
    }
});

// PUT /api/inventory/:id - Update inventory item
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const result = await db
            .update(inventoryItemsTable)
            .set(updates)
            .where(eq(inventoryItemsTable.id, id))
            .returning();

        if (result.length === 0) {
            return res.status(404).json({ error: "Inventory item not found" });
        }

        res.json(result[0]);
    } catch (error) {
        console.error("Error updating inventory item:", error);
        res.status(500).json({ error: "Failed to update inventory item" });
    }
});

// DELETE /api/inventory/:id - Delete inventory item
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db
            .delete(inventoryItemsTable)
            .where(eq(inventoryItemsTable.id, id))
            .returning();

        if (result.length === 0) {
            return res.status(404).json({ error: "Inventory item not found" });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting inventory item:", error);
        res.status(500).json({ error: "Failed to delete inventory item" });
    }
});

export default router;