import express from "express";
import { register, login } from "../controllers/auth.controller.js";

const router = express.Router();

// The paths here will be combined with the prefix in index.js
// Instructor's Register Route
router.post("/register", register);


router.post("/login", login);

export default router;