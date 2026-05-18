// 
// In your backend app.js
import cors from 'cors'


import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import AppDataSource from "./config/data-source.js";
import LoyaltyProfile from "./entities/LoyaltyProfile.js";
import Reward from "./entities/Reward.js";
import loggerMiddleware from "./middleware/loggerMiddleware.js";
import validateRegister from "./middleware/validateRegister.js";
import validateLogin from "./middleware/validateLogin.js";
import authMiddleware from "./middleware/authMiddleware.js";
import roleMiddleware from "./middleware/roleMiddleware.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

// Route Imports
import brandRoutes from "./routes/brandRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import earningruleRoutes from "./routes/earningruleRoutes.js";
import loyaltyprofileRoutes from "./routes/loyaltyprofilerRoutes.js";
import redemptionRoutes from "./routes/redemptionRoutes.js";
import rewardRoutes from "./routes/rewardRoutes.js";
import tierlevelRoutes from "./routes/tierlevelRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";


const app = express();
app.use(express.json());
app.use(loggerMiddleware);
// Allow CORS for local development: reflect the request origin so different
// frontend dev servers (3000 / 3001 / 5173) can reach the API.
app.use(cors({
  origin: true,
  credentials: true,
}));
// ================= TOKEN HELPERS =================
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

// ================= ROUTES SETUP =================
const setupRoutes = (userRepository) => {

  // ================= USERS =================

  app.post("/register", validateRegister, async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;

      const exists = await userRepository.findOneBy({ email });
      if (exists) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Validate role - only allow these 3 roles
      const validRoles = ["admin", "brand_manager", "customer"];
      const normalizedRole = (role || "customer").toLowerCase();
      
      if (!validRoles.includes(normalizedRole)) {
        return res.status(400).json({ 
          message: "Invalid role. Must be one of: admin, brand_manager, customer" 
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = userRepository.create({
        name,
        email,
        password: hashedPassword,
        role: normalizedRole
      });

      const saved = await userRepository.save(user);

      // Auto-create loyalty profile for customers only
      if (normalizedRole === "customer") {
        const profileRepo = AppDataSource.getRepository(LoyaltyProfile);
        const profile = profileRepo.create({
          user: saved,
          totalPoints: 0,
          availablePoints: 0,
          currentTier: "Bronze"
        });
        await profileRepo.save(profile);
      }

      // Sanitize user object - don't return password or refreshToken
      const { password: pwd, refreshToken, ...safeUser } = saved;
      res.status(201).json(safeUser);
    } catch (err) {
      next(err);
    }
  });

  // ================= LOGIN =================

  app.post("/login", validateLogin, async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await userRepository.findOneBy({ email });

      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      user.refreshToken = refreshToken;
      await userRepository.save(user);

      // Sanitize user object - don't return password or refreshToken
      const { password: pwd, refreshToken: rt, ...safeUser } = user;

      res.json({
        accessToken,
        refreshToken,
        user: safeUser
      });
    } catch (err) {
      next(err);
    }
  });

  // ================= REFRESH =================

  app.post("/refresh", async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
      }

      let decoded;
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      } catch (error) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
      }

      const user = await userRepository.findOneBy({ id: decoded.id });

      if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      const newToken = generateAccessToken(user);

      res.json({ accessToken: newToken });
    } catch (err) {
      next(err);
    }
  });

  // ================= LOGOUT =================

  app.post("/logout", authMiddleware, async (req, res, next) => {
    try {
      const user = await userRepository.findOneBy({ id: req.user.id });

      user.refreshToken = null;
      await userRepository.save(user);

      res.json({ message: "Logged out" });
    } catch (err) {
      next(err);
    }
  });

 
  // ================= USERS LIST =================

  app.get("/users", authMiddleware, roleMiddleware("admin"), async (req, res, next) => {
    try {
      const users = await userRepository.find(
        {
        relations: ["brand"]  
        }
      );

      const safe = users.map(({ password, refreshToken, ...u }) => u);

      res.json(safe);
    } catch (err) {
      next(err);
    }
  });
  // ================= GET USER BY ID =================
  app.get("/users/:id", authMiddleware, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user is accessing their own profile or is admin
      if (req.user.id !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const user = await userRepository.findOneBy({ id: userId });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, refreshToken, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      next(err);
    }
  });

  // ================= UPDATE USER =================
  app.put("/users/:id", authMiddleware, async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const { name, email, password, role } = req.body;
      
      // Check if user is updating their own profile or is admin
      if (req.user.id !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      // Only admins can change roles
      if (role && req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can change roles" });
      }

      const user = await userRepository.findOneBy({ id: userId });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (role && req.user.role === "admin") user.role = role;
      
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      const updated = await userRepository.save(user);
      
      const { password: pwd, refreshToken, ...safeUser } = updated;
      res.json(safeUser);
    } catch (err) {
      next(err);
    }
  });

  // ================= DELETE USER =================
  app.delete("/users/:id", authMiddleware, roleMiddleware("admin"), async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      
      const user = await userRepository.findOneBy({ id: userId });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't allow deleting yourself
      if (user.id === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      // Delete associated loyalty profile if exists
      const loyaltyProfileRepo = AppDataSource.getRepository(LoyaltyProfile);
      const profile = await loyaltyProfileRepo.findOneBy({ user: { id: userId } });
      if (profile) {
        await loyaltyProfileRepo.remove(profile);
      }

      await userRepository.remove(user);
      
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      next(err);
    }
  });


  // ================= BROWSE ALL REWARDS (for customers) =================

  app.get("/rewards", authMiddleware, async (req, res, next) => {
    try {
      const rewardRepo = AppDataSource.getRepository(Reward);
      const rewards = await rewardRepo.find({
        where: { isActive: true },
        relations: ["brand"],
        order: { id: "ASC" }
      });
      res.json(rewards);
    } catch (err) {
      next(err);
    }
  });

  // ================= MOUNT ROUTE MODULES ==================
  // All protected routes require authentication

  app.use("/brands", authMiddleware, brandRoutes);
  app.use("/brands/:brandId/campaigns", authMiddleware, campaignRoutes);
  app.use("/dashboard", authMiddleware, dashboardRoutes);
  app.use("/brands/:brandId/rules", authMiddleware, earningruleRoutes);
  app.use("/loyalty-profiles", authMiddleware, loyaltyprofileRoutes);
  app.use("/redemptions", authMiddleware, redemptionRoutes);
  app.use("/brands/:brandId/rewards", authMiddleware, rewardRoutes);
  app.use("/brands/:brandId/tiers", authMiddleware, tierlevelRoutes);
  app.use("/transactions", authMiddleware, transactionRoutes);

  app.use(errorMiddleware);
};

export { setupRoutes };
export default app;