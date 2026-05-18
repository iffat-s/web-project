import { Router } from "express";
import { getCampaignsByBrand, createCampaign, updateCampaign, toggleCampaign, deleteCampaign } from "../controllers/campaignController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = Router({ mergeParams: true });

router.get("/", authMiddleware, getCampaignsByBrand);
router.post("/", authMiddleware, roleMiddleware("admin", "brand_manager"), createCampaign);
router.put("/:id", authMiddleware, roleMiddleware("admin", "brand_manager"), updateCampaign);
router.patch("/:id/toggle", authMiddleware, roleMiddleware("admin", "brand_manager"), toggleCampaign);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteCampaign);

export default router;