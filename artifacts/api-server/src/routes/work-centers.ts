import { Router, type IRouter } from "express";
import { db, workCentersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/work-centers - Get all work centers
router.get("/", async (_req, res) => {
    try {
        const centers = await db.select().from(workCentersTable);
        res.json(centers);
    } catch (error) {
        console.error("Error fetching work centers:", error);
        res.status(500).json({ error: "Failed to fetch work centers" });
    }
});

// GET /api/work-centers/:id - Get work center by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const center = await db
            .select()
            .from(workCentersTable)
            .where(eq(workCentersTable.id, id))
            .limit(1);

        if (center.length === 0) {
            res.status(404).json({ error: "Work center not found" });
        }

        res.json(center[0]);
    } catch (error) {
        console.error("Error fetching work center:", error);
        res.status(500).json({ error: "Failed to fetch work center" });
    }
});

// POST /api/work-centers - Create new work center
router.post("/", async (req, res) => {
    try {
        const newCenter = req.body;
        const result = await db.insert(workCentersTable).values(newCenter).returning();
        res.status(201).json(result[0]);
    } catch (error) {
        console.error("Error creating work center:", error);
        res.status(500).json({ error: "Failed to create work center" });
    }
});

// PUT /api/work-centers/:id - Update work center
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const result = await db
            .update(workCentersTable)
            .set(updates)
            .where(eq(workCentersTable.id, id))
            .returning();

        if (result.length === 0) {
            res.status(404).json({ error: "Work center not found" });
        }

        res.json(result[0]);
    } catch (error) {
        console.error("Error updating work center:", error);
        res.status(500).json({ error: "Failed to update work center" });
    }
});

// DELETE /api/work-centers/:id - Delete work center
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db
            .delete(workCentersTable)
            .where(eq(workCentersTable.id, id))
            .returning();

        if (result.length === 0) {
            res.status(404).json({ error: "Work center not found" });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting work center:", error);
        res.status(500).json({ error: "Failed to delete work center" });
    }
});

export default router;