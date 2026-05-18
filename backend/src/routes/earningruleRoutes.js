import { Router } from "express";
import { getRulesByBrand, createRule, updateRule, deleteRule } from "../controllers/earningruleController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = Router({ mergeParams: true });

router.get("/", authMiddleware, getRulesByBrand);
router.post("/", authMiddleware, roleMiddleware("admin", "brand_manager"), createRule);
router.put("/:id", authMiddleware, roleMiddleware("admin", "brand_manager"), updateRule);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteRule);

export default router;