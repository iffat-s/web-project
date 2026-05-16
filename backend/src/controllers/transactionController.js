
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

// ✅ EXPORT earnPoints
 export const earnPoints = async (req, res) => {
  try {
    const { purchaseAmount, brandId, referenceNo } = req.body;

    console.log('Earn points request:', { purchaseAmount, brandId, referenceNo });

    // Check profile
    const profile = await profileRepo.findOne({ where: { user: { id: req.user.id } } });
    if (!profile) {
      console.log('❌ Profile not found for user:', req.user.id);
      return res.status(404).json({ message: "Loyalty profile not found" });
    }
    console.log('✅ Profile found:', profile.id);

    // Check rule
    const rule = await ruleRepo.findOneBy({ brand: { id: brandId }, isActive: true });
    if (!rule) {
      console.log('❌ No earning rule for brand:', brandId);
      return res.status(404).json({ message: `No active earning rule for brand ${brandId}` });
    }
    console.log('✅ Rule found:', rule.id, 'points per unit:', rule.pointsPerUnit);

    // Check campaign
    const now = new Date();
    const allCampaigns = await campaignRepo.find({
      where: { brand: { id: brandId }, isActive: true }
    });
    console.log(`Found ${allCampaigns.length} active campaigns for brand ${brandId}`);
    
    const campaign = allCampaigns.find(c => {
      const startDate = new Date(c.startDate);
      const endDate = new Date(c.endDate);
      const isValid = startDate <= now && endDate >= now;
      console.log(`Campaign ${c.name}: start=${startDate}, end=${endDate}, now=${now}, valid=${isValid}`);
      return isValid;
    });
    
    const multiplier = campaign ? campaign.bonusMultiplier : 1;
    const points = Math.floor(purchaseAmount * rule.pointsPerUnit * multiplier);
    console.log(`✅ Points calculated: ${purchaseAmount} * ${rule.pointsPerUnit} * ${multiplier} = ${points}`);

    // Update profile
    profile.totalPoints += points;
    profile.availablePoints += points;
    await profileRepo.save(profile);
    console.log('✅ Profile updated, new total points:', profile.totalPoints);

    // Assign tier
    await assignTier(profile, brandId);
    console.log('✅ Tier assigned');

    // Create transaction
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
    console.log('✅ Transaction created');

    // Send response
    res.status(201).json({ 
      success: true,
      points, 
      totalPoints: profile.totalPoints,
      campaignApplied: campaign ? campaign.name : null,
      multiplier: multiplier,
      transaction: transaction 
    });
    console.log('✅ Response sent successfully');
    
  } catch (err) {
    console.error('❌ Error in earnPoints:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
 };
// ✅ EXPORT getMyTransactions
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
    console.error('Error in getMyTransactions:', err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ EXPORT getAllTransactions
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionRepo.find({
      relations: ["loyaltyProfile", "loyaltyProfile.user", "brand", "campaign"],
      order: { createdAt: "DESC" }
    });
    res.json(transactions);
  } catch (err) {
    console.error('Error in getAllTransactions:', err);
    res.status(500).json({ message: err.message });
  }
};