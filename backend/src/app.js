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

      // Prevent unassigned brand managers from logging in
      if (user.role === 'brand_manager') {
        try {
          const brandRepo = AppDataSource.getRepository('Brand');
          const brand = await brandRepo.findOneBy({ managerId: user.id });
          if (!brand) {
            return res.status(403).json({ message: 'Brand manager account is unassigned and cannot login' });
          }
        } catch (e) {
          // if anything goes wrong with brand lookup, deny login conservatively
          return res.status(403).json({ message: 'Brand manager account is unassigned and cannot login' });
        }
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
      const users = await userRepository.find({
        relations: ["brand"],
        order: { id: "ASC" }
      });

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

      // Perform safe deletion in a transaction to avoid foreign key errors
      await AppDataSource.transaction(async (manager) => {
        // 1) Find loyalty profile id for this user (try different column namings)
        let profileRows = [];
        try {
          profileRows = await manager.query('SELECT id FROM loyalty_profiles WHERE "userId" = $1', [userId]);
        } catch (e) {
          try {
            profileRows = await manager.query('SELECT id FROM loyalty_profiles WHERE user_id = $1', [userId]);
          } catch (e2) {
            profileRows = [];
          }
        }

        if (profileRows && profileRows.length) {
          const pid = profileRows[0].id;

          const tryDeleteChildren = async (table, colCandidates) => {
            for (const col of colCandidates) {
              try {
                await manager.query(`DELETE FROM ${table} WHERE "${col}" = $1`, [pid]);
                return;
              } catch (err) {
                // try next candidate
              }
            }
          };

          await tryDeleteChildren('redemptions', ['loyaltyProfileId', 'loyalty_profile_id']);
          await tryDeleteChildren('transactions', ['loyaltyProfileId', 'loyalty_profile_id']);
          await tryDeleteChildren('user_tiers', ['loyaltyProfileId', 'loyalty_profile_id']);

          try {
            await manager.query('DELETE FROM loyalty_profiles WHERE id = $1', [pid]);
          } catch (err) {
            // ignore
          }
        }

        // 2) Nullify brand manager link if present
        try {
          await manager.query('UPDATE brands SET "managerId" = NULL WHERE "managerId" = $1', [userId]);
        } catch (e) {
          try {
            await manager.query('UPDATE brands SET manager_id = NULL WHERE manager_id = $1', [userId]);
          } catch (err) {
            // ignore
          }
        }

        // 3) Delete the user
        await manager.query('DELETE FROM users WHERE id = $1', [userId]);
      });

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

  app.use("/brands", brandRoutes);
  app.use("/brands/:brandId/campaigns", campaignRoutes);
  app.use("/dashboard", dashboardRoutes);
  app.use("/brands/:brandId/rules", earningruleRoutes);
  app.use("/loyalty-profiles", loyaltyprofileRoutes);
  app.use("/redemptions", redemptionRoutes);
  app.use("/brands/:brandId/rewards", rewardRoutes);
  app.use("/brands/:brandId/tiers", tierlevelRoutes);
  app.use("/transactions", transactionRoutes);

  app.use(errorMiddleware);
};

export { setupRoutes };
export default app;