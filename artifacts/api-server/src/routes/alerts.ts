import { Router, type IRouter } from "express";
import { db, alertsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/alertsTable - Get all alertsTable
router.get("/", async (_req, res) => {
    try {
        const alertList = await db.select().from(alertsTable);
        res.json(alertList);
    } catch (error) {
        console.error("Error fetching alertsTable:", error);
        res.status(500).json({ error: "Failed to fetch alertsTable" });
    }
});

// GET /api/alertsTable/:id - Get alert by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const alert = await db
            .select()
            .from(alertsTable)
            .where(eq(alertsTable.id, id))
            .limit(1);

        if (alert.length === 0) {
            res.status(404).json({ error: "Alert not found" });
        }

        res.json(alert[0]);
    } catch (error) {
        console.error("Error fetching alert:", error);
        res.status(500).json({ error: "Failed to fetch alert" });
    }
});

// POST /api/alertsTable - Create new alert
router.post("/", async (req, res) => {
    try {
        const newAlert = req.body;
        const result = await db.insert(alertsTable).values(newAlert).returning();
        res.status(201).json(result[0]);
    } catch (error) {
        console.error("Error creating alert:", error);
        res.status(500).json({ error: "Failed to create alert" });
    }
});

// PUT /api/alertsTable/:id - Update alert
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const result = await db
            .update(alertsTable)
            .set(updates)
            .where(eq(alertsTable.id, id))
            .returning();

        if (result.length === 0) {
            res.status(404).json({ error: "Alert not found" });
        }

        res.json(result[0]);
    } catch (error) {
        console.error("Error updating alert:", error);
        res.status(500).json({ error: "Failed to update alert" });
    }
});

// DELETE /api/alertsTable/:id - Delete alert
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db
            .delete(alertsTable)
            .where(eq(alertsTable.id, id))
            .returning();

        if (result.length === 0) {
            res.status(404).json({ error: "Alert not found" });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting alert:", error);
        res.status(500).json({ error: "Failed to delete alert" });
    }
});

export default router;