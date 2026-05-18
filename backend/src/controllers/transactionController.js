
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

    // Select applicable earning rule(s) for the brand.
    // Behavior:
    // - Only consider rules with `isActive = true`.
    // - Rule must satisfy date window (if startDate/endDate present).
    // - Rule must satisfy `minPurchase` (if provided).
    // - If multiple rules apply, prefer the one with the latest `startDate` (newer rules override older ones). If startDate equal or absent, prefer higher `id`.
    const now = new Date();
    const allRules = await ruleRepo.find({ where: { brand: { id: brandId }, isActive: true } });
    const applicableRules = allRules.filter(r => {
      // date window check
      if (r.startDate && new Date(r.startDate) > now) return false;
      if (r.endDate && new Date(r.endDate) < now) return false;
      // min purchase check (if provided)
      if (r.minPurchase && purchaseAmount < r.minPurchase) return false;
      return true;
    });

    if (!applicableRules || applicableRules.length === 0) {
      console.log('❌ No applicable earning rule for brand:', brandId);
      return res.status(404).json({ message: `No active earning rule for brand ${brandId}` });
    }

    // Choose the MOST SPECIFIC rule: highest qualifying minPurchase wins.
    // Tie-breaker: higher id (most recently created) wins.
    applicableRules.sort((a, b) => {
      const aMin = a.minPurchase || 0;
      const bMin = b.minPurchase || 0;
      if (bMin !== aMin) return bMin - aMin;
      return (b.id || 0) - (a.id || 0);
    });

    const rule = applicableRules[0];
    console.log('✅ Rule selected (highest minPurchase wins):', rule.id, 'type:', rule.ruleType, 'pointsPerUnit:', rule.pointsPerUnit, 'minPurchase:', rule.minPurchase);

    // Check campaign
    const allCampaigns = await campaignRepo.find({ where: { brand: { id: brandId }, isActive: true } });
    console.log(`Found ${allCampaigns.length} active campaigns for brand ${brandId}`);

    // Choose the campaign with the highest bonusMultiplier among campaigns
    // that are currently valid (startDate <= now <= endDate).
    const validCampaigns = allCampaigns.filter(c => {
      const startDate = new Date(c.startDate);
      const endDate = new Date(c.endDate);
      const isValid = startDate <= now && endDate >= now;
      console.log(`Campaign ${c.name}: start=${startDate}, end=${endDate}, now=${now}, valid=${isValid}`);
      return isValid;
    });

    let campaign = null;
    if (validCampaigns.length > 0) {
      validCampaigns.sort((a, b) => {
        const aMul = a.bonusMultiplier || 1;
        const bMul = b.bonusMultiplier || 1;
        if (bMul !== aMul) return bMul - aMul; // higher multiplier first
        // tie-breaker: more recent startDate wins
        const aStart = a.startDate ? new Date(a.startDate).getTime() : 0;
        const bStart = b.startDate ? new Date(b.startDate).getTime() : 0;
        if (bStart !== aStart) return bStart - aStart;
        return (b.id || 0) - (a.id || 0);
      });
      campaign = validCampaigns[0];
    }

    const multiplier = campaign ? campaign.bonusMultiplier : 1;

    // Compute points based on rule type
    let points = 0;
    if (rule.ruleType === 'purchase') {
      // pointsPerUnit is interpreted as points per 1 unit of currency (e.g., per $1)
      points = Math.floor(purchaseAmount * rule.pointsPerUnit * multiplier);
    } else if (rule.ruleType === 'flat') {
      // flat: pointsPerUnit is points per transaction
      points = Math.floor(rule.pointsPerUnit * multiplier);
    } else if (rule.ruleType === 'category') {
      // category rule requires additional category information (not implemented)
      console.log('❌ Category rule type not implemented in earnPoints');
      return res.status(400).json({ message: 'Category-based earning rules are not supported by this endpoint' });
    } else {
      console.log('❌ Unknown rule type:', rule.ruleType);
      return res.status(400).json({ message: `Unknown earning rule type: ${rule.ruleType}` });
    }
    console.log(`✅ Points calculated using rule ${rule.id}: points = ${points} (multiplier ${multiplier})`);

    // Update profile
    profile.totalPoints += points;
    profile.availablePoints += points;
    await profileRepo.save(profile);
    console.log('✅ Profile updated, new total points:', profile.totalPoints);

    // Assign tier
    await assignTier(profile, brandId);
    // Persist any changes made to profile (currentTier)
    await profileRepo.save(profile);
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