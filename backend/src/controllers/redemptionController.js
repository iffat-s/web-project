import AppDataSource from "../config/data-source.js";
import Redemption from "../entities/Redemption.js";
import LoyaltyProfile from "../entities/LoyaltyProfile.js";
import Reward from "../entities/Reward.js";
import Transaction from "../entities/Transaction.js";


const redemptionRepo = AppDataSource.getRepository(Redemption);
const profileRepo = AppDataSource.getRepository(LoyaltyProfile);
const rewardRepo = AppDataSource.getRepository(Reward);
const transactionRepo = AppDataSource.getRepository(Transaction);

export const redeemReward = async (req, res) => {
  try {
    const { rewardId } = req.body;

    const profile = await profileRepo.findOne({ where: { user: { id: req.user.id } } });
    if (!profile) return res.status(404).json({ message: "Loyalty profile not found" });

    const reward = await rewardRepo.findOne({ where: { id: rewardId }, relations: ["brand"] });
    if (!reward) return res.status(404).json({ message: "Reward not found" });
    if (!reward.isActive) return res.status(400).json({ message: "Reward is not active" });
    if (reward.stock <= 0) return res.status(400).json({ message: "Out of stock" });
    if (profile.availablePoints < reward.pointsRequired)
      return res.status(400).json({ message: "Insufficient points" });

    profile.availablePoints -= reward.pointsRequired;
    reward.stock -= 1;

    await profileRepo.save(profile);
    await rewardRepo.save(reward);

    const redemption = redemptionRepo.create({
      pointsSpent: reward.pointsRequired,
      loyaltyProfile: profile,
      reward
    });
    await redemptionRepo.save(redemption);

    const transaction = transactionRepo.create({
      type: "redeem",
      points: -reward.pointsRequired,
      loyaltyProfile: profile,
      brand: reward.brand
    });
    await transactionRepo.save(transaction);

    res.status(201).json({ redemption, remainingPoints: profile.availablePoints });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyRedemptions = async (req, res) => {
  try {
    const profile = await profileRepo.findOne({ where: { user: { id: req.user.id } } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const redemptions = await redemptionRepo.find({
      where: { loyaltyProfile: { id: profile.id } },
      relations: ["reward", "reward.brand"],
      order: { redeemedAt: "DESC" }
    });

    res.json(redemptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllRedemptions = async (req, res) => {
  try {
    const redemptions = await redemptionRepo.find({
      relations: ["loyaltyProfile", "loyaltyProfile.user", "reward"],
      order: { redeemedAt: "DESC" }
    });
    res.json(redemptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRedemptionStatus = async (req, res) => {
  try {
    const redemption = await redemptionRepo.findOneBy({ id: Number(req.params.id) });
    if (!redemption) return res.status(404).json({ message: "Redemption not found" });

    redemption.status = req.body.status;
    await redemptionRepo.save(redemption);
    res.json(redemption);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};