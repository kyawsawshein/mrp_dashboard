import { Router, type IRouter } from "express";
import { db, manufacturingOrdersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/manufacturing-orders - Get all manufacturing orders
router.get("/", async (_req, res) => {
    try {
        const orders = await db.select().from(manufacturingOrdersTable);
        res.json(orders);
    } catch (error) {
        console.error("Error fetching manufacturing orders:", error);
        res.status(500).json({ error: "Failed to fetch manufacturing orders" });
    }
});

// GET /api/manufacturing-orders/:id - Get manufacturing order by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const order = await db
            .select()
            .from(manufacturingOrdersTable)
            .where(eq(manufacturingOrdersTable.id, id))
            .limit(1);

        if (order.length === 0) {
            res.status(404).json({ error: "Manufacturing order not found" });
        }

        res.json(order[0]);
    } catch (error) {
        console.error("Error fetching manufacturing order:", error);
        res.status(500).json({ error: "Failed to fetch manufacturing order" });
    }
});

// POST /api/manufacturing-orders - Create new manufacturing order
router.post("/", async (req, res) => {
    try {
        const newOrder = req.body;
        const result = await db.insert(manufacturingOrdersTable).values(newOrder).returning();
        res.status(201).json(result[0]);
    } catch (error) {
        console.error("Error creating manufacturing order:", error);
        res.status(500).json({ error: "Failed to create manufacturing order" });
    }
});

// PUT /api/manufacturing-orders/:id - Update manufacturing order
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const result = await db
            .update(manufacturingOrdersTable)
            .set(updates)
            .where(eq(manufacturingOrdersTable.id, id))
            .returning();

        if (result.length === 0) {
            res.status(404).json({ error: "Manufacturing order not found" });
        }

        res.json(result[0]);
    } catch (error) {
        console.error("Error updating manufacturing order:", error);
        res.status(500).json({ error: "Failed to update manufacturing order" });
    }
});

// DELETE /api/manufacturing-orders/:id - Delete manufacturing order
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db
            .delete(manufacturingOrdersTable)
            .where(eq(manufacturingOrdersTable.id, id))
            .returning();

        if (result.length === 0) {
            res.status(404).json({ error: "Manufacturing order not found" });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting manufacturing order:", error);
        res.status(500).json({ error: "Failed to delete manufacturing order" });
    }
});

export default router;