import { Router } from "express";
import { 
  getAllBrands, 
  getBrandById, 
  createBrand, 
  updateBrand, 
  deleteBrand,
  getMyBrand,
  getUnassignedBrandManagers,
  assignBrandManager
} from "../controllers/brandController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import brandOwnershipMiddleware from "../middleware/brandOwnershipMiddleware.js";

const router = Router();

// Public routes (require auth)
router.get("/", authMiddleware, getAllBrands);

// Brand manager routes
router.get("/my-brand", authMiddleware, roleMiddleware("brand_manager"), getMyBrand);

// Admin routes
router.get("/unassigned-managers", authMiddleware, roleMiddleware("admin"), getUnassignedBrandManagers);
router.post("/", authMiddleware, roleMiddleware("admin", "brand_manager"), createBrand);
router.put("/:id/assign-manager", authMiddleware, roleMiddleware("admin"), assignBrandManager);

// Protected routes with ownership check
router.get("/:id", authMiddleware, getBrandById);
router.put("/:id", authMiddleware, brandOwnershipMiddleware, updateBrand);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteBrand);

export default router;