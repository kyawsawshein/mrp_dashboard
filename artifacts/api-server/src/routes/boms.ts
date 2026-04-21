import { Router, type IRouter } from "express";
import { db, bomsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/bomsTable - Get all BOMs
router.get("/", async (_req, res) => {
    try {
        const bomList = await db.select().from(bomsTable);
        res.json(bomList);
    } catch (error) {
        console.error("Error fetching BOMs:", error);
        res.status(500).json({ error: "Failed to fetch BOMs" });
    }
});

// GET /api/bomsTable/:id - Get BOM by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const bom = await db
            .select()
            .from(bomsTable)
            .where(eq(bomsTable.id, id))
            .limit(1);

        if (bom.length === 0) {
            res.status(404).json({ error: "BOM not found" });
        }

        res.json(bom[0]);
    } catch (error) {
        console.error("Error fetching BOM:", error);
        res.status(500).json({ error: "Failed to fetch BOM" });
    }
});

// POST /api/bomsTable - Create new BOM
router.post("/", async (req, res) => {
    try {
        const newBom = req.body;
        const result = await db.insert(bomsTable).values(newBom).returning();
        res.status(201).json(result[0]);
    } catch (error) {
        console.error("Error creating BOM:", error);
        res.status(500).json({ error: "Failed to create BOM" });
    }
});

// PUT /api/bomsTable/:id - Update BOM
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const result = await db
            .update(bomsTable)
            .set(updates)
            .where(eq(bomsTable.id, id))
            .returning();

        if (result.length === 0) {
            res.status(404).json({ error: "BOM not found" });
        }

        res.json(result[0]);
    } catch (error) {
        console.error("Error updating BOM:", error);
        res.status(500).json({ error: "Failed to update BOM" });
    }
});

// DELETE /api/bomsTable/:id - Delete BOM
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db
            .delete(bomsTable)
            .where(eq(bomsTable.id, id))
            .returning();

        if (result.length === 0) {
            res.status(404).json({ error: "BOM not found" });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting BOM:", error);
        res.status(500).json({ error: "Failed to delete BOM" });
    }
});

export default router;