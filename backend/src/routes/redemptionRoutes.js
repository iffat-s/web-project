import { Router } from "express";
import { redeemReward, getMyRedemptions, getAllRedemptions, updateRedemptionStatus } from "../controllers/redemptionController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/", authMiddleware, roleMiddleware("customer"), redeemReward);
router.get("/my", authMiddleware, roleMiddleware("customer"), getMyRedemptions);
router.get("/", authMiddleware, roleMiddleware("admin", "brand_manager"), getAllRedemptions);
router.patch("/:id/status", authMiddleware, roleMiddleware("admin", "brand_manager"), updateRedemptionStatus);

export default router;