import { Router } from "express";
import { getAdminDashboard, getBrandDashboard } from "../controllers/dashboardController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/admin", authMiddleware, roleMiddleware("admin"), getAdminDashboard);
router.get("/brand/:brandId", authMiddleware, roleMiddleware("admin", "brand_manager"), getBrandDashboard);

export default router;