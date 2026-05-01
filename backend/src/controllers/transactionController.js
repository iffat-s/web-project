import AppDataSource from "../config/data-source.js";
import Transaction from "../entities/Transaction.js";
import LoyaltyProfile from "../entities/LoyaltyProfile.js";
import EarningRule from "../entities/EarningRule.js";
import Campaign from "../entities/Campaign.js";
import TierLevel from "../entities/TierLevel.js";
import UserTier from "../entities/UserTier.js";


const transactionRepo = AppDataSource.getRepository(Transaction);
const profileRepo = AppDataSource.getRepository(LoyaltyProfile);
const ruleRepo = AppDataSource.getRepository(EarningRule);
const campaignRepo = AppDataSource.getRepository(Campaign);
const tierRepo = AppDataSource.getRepository(TierLevel);
const userTierRepo = AppDataSource.getRepository(UserTier);

const assignTier = async (profile, brandId) => {
  const tiers = await tierRepo.findBy({ brand: { id: brandId } });
  const earned = tiers
    .filter((t) => profile.totalPoints >= t.minPoints)
    .sort((a, b) => b.minPoints - a.minPoints)[0];

  if (!earned) return;

  const existing = await userTierRepo.findOne({
    where: { loyaltyProfile: { id: profile.id }, brand: { id: brandId } }
  });

  if (existing) {
    existing.tierLevel = earned;
    await userTierRepo.save(existing);
  } else {
    await userTierRepo.save(
      userTierRepo.create({ loyaltyProfile: profile, tierLevel: earned, brand: { id: brandId } })
    );
  }

  profile.currentTier = earned.name;
};

export const earnPoints = async (req, res) => {
  try {
    const { purchaseAmount, brandId, referenceNo } = req.body;

    const profile = await profileRepo.findOne({ where: { user: { id: req.user.id } } });
    if (!profile) return res.status(404).json({ message: "Loyalty profile not found" });

    const rule = await ruleRepo.findOneBy({ brand: { id: brandId }, isActive: true });
    if (!rule) return res.status(404).json({ message: "No active earning rule for this brand" });

    const now = new Date();
    const campaign = await campaignRepo.findOneBy({ brand: { id: brandId }, isActive: true });
    const multiplier =
      campaign && new Date(campaign.startDate) <= now && new Date(campaign.endDate) >= now
        ? campaign.bonusMultiplier
        : 1;

    const points = Math.floor(purchaseAmount * rule.pointsPerUnit * multiplier);

    profile.totalPoints += points;
    profile.availablePoints += points;

    await assignTier(profile, brandId);
    await profileRepo.save(profile);

    const transaction = transactionRepo.create({
      type: "earn",
      points,
      purchaseAmount,
      referenceNo,
      loyaltyProfile: profile,
      brand: { id: brandId },
      campaign: campaign || null
    });
    await transactionRepo.save(transaction);

    res.status(201).json({ points, totalPoints: profile.totalPoints, transaction: transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyTransactions = async (req, res) => {
  try {
    const profile = await profileRepo.findOne({ where: { user: { id: req.user.id } } });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const transactions = await transactionRepo.find({
      where: { loyaltyProfile: { id: profile.id } },
      relations: ["brand", "campaign"],
      order: { createdAt: "DESC" }
    });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionRepo.find({
      relations: ["loyaltyProfile", "loyaltyProfile.user", "brand", "campaign"],
      order: { createdAt: "DESC" }
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};