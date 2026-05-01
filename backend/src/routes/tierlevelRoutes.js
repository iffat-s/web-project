import { Router } from "express";
import { getTiersByBrand, createTier, updateTier, deleteTier } from "../controllers/tierlevelController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = Router({ mergeParams: true });

router.get("/", authMiddleware, getTiersByBrand);
router.post("/", authMiddleware, roleMiddleware("admin", "brand_manager"), createTier);
router.put("/:id", authMiddleware, roleMiddleware("admin", "brand_manager"), updateTier);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteTier);

export default router;