import { Router } from "express";
import { getRewardsByBrand, getRewardById, createReward, updateReward, deleteReward } from "../controllers/rewardController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = Router({ mergeParams: true });

router.get("/", authMiddleware, getRewardsByBrand);
router.get("/:id", authMiddleware, getRewardById);
router.post("/", authMiddleware, roleMiddleware("admin", "brand_manager"), createReward);
router.put("/:id", authMiddleware, roleMiddleware("admin", "brand_manager"), updateReward);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteReward);

export default router;