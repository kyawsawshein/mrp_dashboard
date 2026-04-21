import { Router, type IRouter } from "express";
import { db, departmentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// GET /api/departmentsTable - Get all departmentsTable
router.get("/", async (_req, res) => {
    try {
        const deps = await db.select().from(departmentsTable);
        res.json(deps);
    } catch (error) {
        console.error("Error fetching departmentsTable:", error);
        res.status(500).json({ error: "Failed to fetch departmentsTable" });
    }
});

// GET /api/departmentsTable/:id - Get department by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const dep = await db
            .select()
            .from(departmentsTable)
            .where(eq(departmentsTable.id, id))
            .limit(1);

        if (dep.length === 0) {
            res.status(404).json({ error: "Department not found" });
        }

        res.json(dep[0]);
    } catch (error) {
        console.error("Error fetching department:", error);
        res.status(500).json({ error: "Failed to fetch department" });
    }
});

// POST /api/departmentsTable - Create new department
router.post("/", async (req, res) => {
    try {
        const newDep = req.body;
        const result = await db.insert(departmentsTable).values(newDep).returning();
        res.status(201).json(result[0]);
    } catch (error) {
        console.error("Error creating department:", error);
        res.status(500).json({ error: "Failed to create department" });
    }
});

// PUT /api/departmentsTable/:id - Update department
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const result = await db
            .update(departmentsTable)
            .set(updates)
            .where(eq(departmentsTable.id, id))
            .returning();

        if (result.length === 0) {
            res.status(404).json({ error: "Department not found" });
        }

        res.json(result[0]);
    } catch (error) {
        console.error("Error updating department:", error);
        res.status(500).json({ error: "Failed to update department" });
    }
});

// DELETE /api/departmentsTable/:id - Delete department
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db
            .delete(departmentsTable)
            .where(eq(departmentsTable.id, id))
            .returning();

        if (result.length === 0) {
            res.status(404).json({ error: "Department not found" });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting department:", error);
        res.status(500).json({ error: "Failed to delete department" });
    }
});

export default router;