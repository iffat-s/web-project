import { Router } from "express";
import { earnPoints, getMyTransactions, getAllTransactions } from "../controllers/transactionController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/earn", authMiddleware, roleMiddleware("customer"), earnPoints);
router.get("/my", authMiddleware, roleMiddleware("customer"), getMyTransactions);
router.get("/", authMiddleware, roleMiddleware("admin", "brand_manager"), getAllTransactions);

export default router;