// 
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import loggerMiddleware from "./middleware/loggerMiddleware.js";
import validateRegister from "./middleware/validateRegister.js";
import validateLogin from "./middleware/validateLogin.js";
import authMiddleware from "./middleware/authMiddleware.js";
import roleMiddleware from "./middleware/roleMiddleware.js";
import errorMiddleware from "./middleware/errorMiddleware.js";


const app = express();
app.use(express.json());
app.use(loggerMiddleware);

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

  app.post("/register", async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;

      const exists = await userRepository.findOneBy({ email });
      if (exists) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = userRepository.create({
        name,
        email,
        password: hashedPassword,
        role: role || "user"
      });

      const saved = await userRepository.save(user);

      res.status(201).json(saved);
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

      res.json({
        accessToken,
        refreshToken,
        user
      });
    } catch (err) {
      next(err);
    }
  });

  // ================= REFRESH =================

  app.post("/refresh", async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

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

  app.get("/users", async (req, res, next) => {
    try {
      const users = await userRepository.find();

      const safe = users.map(({ password, refreshToken, ...u }) => u);

      res.json(safe);
    } catch (err) {
      next(err);
    }
  });

  app.use(errorMiddleware);
};

export { setupRoutes };
export default app;