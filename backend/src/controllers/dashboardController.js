import AppDataSource from "../config/data-source.js";   
import LoyaltyProfile from "../entities/LoyaltyProfile.js";
import Transaction from "../entities/Transaction.js";
import Redemption from "../entities/Redemption.js";
import User from "../entities/User.js";


const userRepo = AppDataSource.getRepository(User);
const profileRepo = AppDataSource.getRepository(LoyaltyProfile);
const transactionRepo = AppDataSource.getRepository(Transaction);
const redemptionRepo = AppDataSource.getRepository(Redemption);

export const getAdminDashboard = async (req, res) => {
  try {
    const totalCustomers = await userRepo.countBy({ role: "customer" });
    const totalTransactions = await transactionRepo.count();
    const totalRedemptions = await redemptionRepo.count();
    const topCustomers = await profileRepo.find({
      relations: ["user"],
      order: { totalPoints: "DESC" },
      take: 5
    });

    res.json({ totalCustomers, totalTransactions, totalRedemptions, topCustomers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBrandDashboard = async (req, res) => {
  try {
    const brandId = Number(req.params.brandId);

    const totalTransactions = await transactionRepo.countBy({ brand: { id: brandId } });
    const totalRedemptions = await redemptionRepo.countBy({ reward: { brand: { id: brandId } } });

    res.json({ totalTransactions, totalRedemptions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};