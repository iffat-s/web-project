import { Router } from "express";
import { getAllBrands, getBrandById, createBrand, updateBrand, deleteBrand } from "../controllers/brandController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/", authMiddleware, getAllBrands);
router.get("/:id", authMiddleware, getBrandById);
router.post("/", authMiddleware, roleMiddleware("admin", "brand_manager"), createBrand);
router.put("/:id", authMiddleware, roleMiddleware("admin", "brand_manager"), updateBrand);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteBrand);

export default router;