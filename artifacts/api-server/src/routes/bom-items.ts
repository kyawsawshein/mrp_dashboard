import { Router, type IRouter } from "express";
import { db, bomItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/bom-items - Get all BOM items
router.get("/", async (_req, res) => {
    try {
        const items = await db.select().from(bomItemsTable);
        res.json(items);
    } catch (error) {
        console.error("Error fetching BOM items:", error);
        res.status(500).json({ error: "Failed to fetch BOM items" });
    }
});

// GET /api/bom-items/:id - Get BOM item by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const item = await db
            .select()
            .from(bomItemsTable)
            .where(eq(bomItemsTable.id, id))
            .limit(1);

        if (item.length === 0) {
            res.status(404).json({ error: "BOM item not found" });
        }

        res.json(item[0]);
    } catch (error) {
        console.error("Error fetching BOM item:", error);
        res.status(500).json({ error: "Failed to fetch BOM item" });
    }
});

// POST /api/bom-items - Create new BOM item
router.post("/", async (req, res) => {
    try {
        const newItem = req.body;
        const result = await db.insert(bomItemsTable).values(newItem).returning();
        res.status(201).json(result[0]);
    } catch (error) {
        console.error("Error creating BOM item:", error);
        res.status(500).json({ error: "Failed to create BOM item" });
    }
});

// PUT /api/bom-items/:id - Update BOM item
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const result = await db
            .update(bomItemsTable)
            .set(updates)
            .where(eq(bomItemsTable.id, id))
            .returning();

        if (result.length === 0) {
            res.status(404).json({ error: "BOM item not found" });
        }

        res.json(result[0]);
    } catch (error) {
        console.error("Error updating BOM item:", error);
        res.status(500).json({ error: "Failed to update BOM item" });
    }
});

// DELETE /api/bom-items/:id - Delete BOM item
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db
            .delete(bomItemsTable)
            .where(eq(bomItemsTable.id, id))
            .returning();

        if (result.length === 0) {
            res.status(404).json({ error: "BOM item not found" });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting BOM item:", error);
        res.status(500).json({ error: "Failed to delete BOM item" });
    }
});

export default router;