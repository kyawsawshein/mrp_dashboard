import { Router, type IRouter } from "express";
import healthRouter from "./health";
import inventoryRouter from "./inventory";
import manufacturingOrdersRouter from "./manufacturing-orders";
import bomsRouter from "./boms";
import finishedProductsRouter from "./finished-products";
import departmentsRouter from "./departments";
import workCentersRouter from "./work-centers";
import alertsRouter from "./alerts";
import bomItemsRouter from "./bom-items";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/inventory", inventoryRouter);
router.use("/manufacturing-orders", manufacturingOrdersRouter);
router.use("/boms", bomsRouter);
router.use("/finished-products", finishedProductsRouter);
router.use("/departments", departmentsRouter);
router.use("/work-centers", workCentersRouter);
router.use("/alerts", alertsRouter);
router.use("/bom-items", bomItemsRouter);

export default router;
