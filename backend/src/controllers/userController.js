import AppDataSource from "../config/data-source.js";
import User from "../entities/User.js";

const userRepo = AppDataSource.getRepository(User);

class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  // ✅ CREATE USER (kept with service for hashing, etc.)
  createUser = async (req, res) => {
    try {
      const user = await this.userService.createUser(req.body);

      return res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // ✅ LOGIN (JWT + refresh token)
  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const { user, refreshToken } = await this.userService.login(email, password);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        refreshToken,
        data: user
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }
  };

  // ✅ LOGOUT (invalidate refresh token)
  logout = async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Token required"
        });
      }

      await this.userService.logout(refreshToken);

      return res.status(200).json({
        success: true,
        message: "Logged out successfully"
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };

  // ✅ GET ALL USERS (from second controller)
  getUsers = async (req, res) => {
    try {
      const users = await userRepo.find({
        relations: ["loyaltyProfile"]
      });

      return res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // ✅ GET USER BY ID
  getUserById = async (req, res) => {
    try {
      const user = await userRepo.findOne({
        where: { id: Number(req.params.id) },
        relations: ["loyaltyProfile"]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // ✅ UPDATE USER
  updateUser = async (req, res) => {
    try {
      const user = await userRepo.findOneBy({
        id: Number(req.params.id)
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      const { name, phone } = req.body;

      userRepo.merge(user, { name, phone });
      await userRepo.save(user);

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

  // ✅ DELETE USER
  deleteUser = async (req, res) => {
    try {
      const user = await userRepo.findOneBy({
        id: Number(req.params.id)
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      await userRepo.remove(user);

      return res.status(200).json({
        success: true,
        message: "User deleted"
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
}

export default UserController;