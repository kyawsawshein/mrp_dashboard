import { Router, type IRouter } from "express";
import { db, finishedProductsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/finished-products - Get all finished products
router.get("/", async (_req, res) => {
    try {
        const products = await db.select().from(finishedProductsTable);
        res.json(products);
    } catch (error) {
        console.error("Error fetching finished products:", error);
        res.status(500).json({ error: "Failed to fetch finished products" });
    }
});

// GET /api/finished-products/:id - Get finished product by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await db
            .select()
            .from(finishedProductsTable)
            .where(eq(finishedProductsTable.id, id))
            .limit(1);

        if (product.length === 0) {
            res.status(404).json({ error: "Finished product not found" });
        }

        res.json(product[0]);
    } catch (error) {
        console.error("Error fetching finished product:", error);
        res.status(500).json({ error: "Failed to fetch finished product" });
    }
});

// POST /api/finished-products - Create new finished product
router.post("/", async (req, res) => {
    try {
        const newProduct = req.body;
        const result = await db.insert(finishedProductsTable).values(newProduct).returning();
        res.status(201).json(result[0]);
    } catch (error) {
        console.error("Error creating finished product:", error);
        res.status(500).json({ error: "Failed to create finished product" });
    }
});

// PUT /api/finished-products/:id - Update finished product
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const result = await db
            .update(finishedProductsTable)
            .set(updates)
            .where(eq(finishedProductsTable.id, id))
            .returning();

        if (result.length === 0) {
            res.status(404).json({ error: "Finished product not found" });
        }

        res.json(result[0]);
    } catch (error) {
        console.error("Error updating finished product:", error);
        res.status(500).json({ error: "Failed to update finished product" });
    }
});

// DELETE /api/finished-products/:id - Delete finished product
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db
            .delete(finishedProductsTable)
            .where(eq(finishedProductsTable.id, id))
            .returning();

        if (result.length === 0) {
            res.status(404).json({ error: "Finished product not found" });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting finished product:", error);
        res.status(500).json({ error: "Failed to delete finished product" });
    }
});

export default router;