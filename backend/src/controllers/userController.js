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
        relations: ["loyaltyProfile"],
        order: { id: "ASC" }
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

      // Perform safe deletion in a transaction: remove dependent rows and nullify brand manager
      await AppDataSource.transaction(async (manager) => {
        const uid = Number(req.params.id);

        // 1) Find loyalty profile id for this user (try common column namings)
        let profileRows = [];
        try {
          profileRows = await manager.query('SELECT id FROM loyalty_profiles WHERE "userId" = $1', [uid]);
        } catch (e) {
          try {
            profileRows = await manager.query('SELECT id FROM loyalty_profiles WHERE user_id = $1', [uid]);
          } catch (e2) {
            profileRows = [];
          }
        }

        if (profileRows && profileRows.length) {
          const pid = profileRows[0].id;

          // Helper to try deleting from tables with possible fk column names
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

          // Delete dependent records referencing the loyalty profile
          await tryDeleteChildren('redemptions', ['loyaltyProfileId', 'loyalty_profile_id']);
          await tryDeleteChildren('transactions', ['loyaltyProfileId', 'loyalty_profile_id']);
          await tryDeleteChildren('user_tiers', ['loyaltyProfileId', 'loyalty_profile_id']);

          // Finally delete the loyalty profile itself
          try {
            await manager.query('DELETE FROM loyalty_profiles WHERE id = $1', [pid]);
          } catch (err) {
            // ignore and continue
          }
        }

        // 2) If this user is a brand manager, nullify the brand.manager reference
        try {
          await manager.query('UPDATE brands SET "managerId" = NULL WHERE "managerId" = $1', [uid]);
        } catch (e) {
          try {
            await manager.query('UPDATE brands SET manager_id = NULL WHERE manager_id = $1', [uid]);
          } catch (err) {
            // ignore
          }
        }

        // 3) Delete the user row
        await manager.query('DELETE FROM users WHERE id = $1', [uid]);
      });

      return res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
}

export default UserController;