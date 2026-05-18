import { Router } from "express";
import { getMyProfile, getProfileById, getAllProfiles } from "../controllers/loyaltyprofileController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/", authMiddleware, roleMiddleware("admin"), getAllProfiles);
router.get("/me", authMiddleware, getMyProfile);
router.get("/:id", authMiddleware, roleMiddleware("admin", "brand_manager"), getProfileById);

export default router;