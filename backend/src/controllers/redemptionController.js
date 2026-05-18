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
      reward,
      status: "approved"
    });
    await redemptionRepo.save(redemption);

    const transaction = transactionRepo.create({
      type: "redeem",
      points: -reward.pointsRequired,
      loyaltyProfile: profile,
      brand: reward.brand,
      referenceNo: `RED-${Date.now()}`
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
    const redemption = await redemptionRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["reward", "loyaltyProfile", "loyaltyProfile.user"]
    });
    if (!redemption) return res.status(404).json({ message: "Redemption not found" });

    const newStatus = req.body.status;
    const valid = ["pending", "approved", "rejected", "fulfilled", "redeemed"];
    if (!valid.includes(newStatus)) return res.status(400).json({ message: "Invalid status" });

    // No-op if same status
    if (redemption.status === newStatus) return res.json(redemption);

    // Approve flow: validate stock and points, then deduct and create transaction
    if (newStatus === "approved") {
      if (redemption.status !== "pending") return res.status(400).json({ message: "Only pending redemptions can be approved" });

      const reward = await rewardRepo.findOneBy({ id: redemption.reward.id });
      const profile = await profileRepo.findOneBy({ id: redemption.loyaltyProfile.id });

      if (!reward || !profile) return res.status(404).json({ message: "Related reward or profile not found" });
      if (reward.stock <= 0) return res.status(400).json({ message: "Out of stock" });
      if (profile.availablePoints < redemption.pointsSpent) return res.status(400).json({ message: "Insufficient points" });

      // apply changes
      profile.availablePoints -= redemption.pointsSpent;
      reward.stock -= 1;
      await profileRepo.save(profile);
      await rewardRepo.save(reward);

      const txn = transactionRepo.create({
        type: "redeem",
        points: -redemption.pointsSpent,
        referenceNo: `APPROVE-${Date.now()}`,
        loyaltyProfile: profile,
        brand: reward.brand
      });
      await transactionRepo.save(txn);

      redemption.status = "approved";
      await redemptionRepo.save(redemption);
      return res.json(redemption);
    }

    // Reject flow: only pending can be rejected safely
    if (newStatus === "rejected") {
      if (redemption.status !== "pending") return res.status(400).json({ message: "Only pending redemptions can be rejected" });
      redemption.status = "rejected";
      await redemptionRepo.save(redemption);
      return res.json(redemption);
    }

    // Other transitions: allow setting fulfilled/redeemed only from approved
    if (newStatus === "fulfilled" || newStatus === "redeemed") {
      if (redemption.status !== "approved") return res.status(400).json({ message: "Only approved redemptions can be fulfilled or marked redeemed" });
      redemption.status = newStatus;
      await redemptionRepo.save(redemption);
      return res.json(redemption);
    }

    // Fallback - set status
    redemption.status = newStatus;
    await redemptionRepo.save(redemption);
    res.json(redemption);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};