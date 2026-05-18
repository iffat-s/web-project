import AppDataSource from "../config/data-source.js";
import LoyaltyProfile from "../entities/LoyaltyProfile.js";
import TierLevel from "../entities/TierLevel.js";
import { In } from "typeorm";

const profileRepo = AppDataSource.getRepository(LoyaltyProfile);
const tierRepo = AppDataSource.getRepository(TierLevel);
 
export const getMyProfile = async (req, res) => {
  try {
    const profile = await profileRepo.findOne({
      where: { user: { id: req.user.id } },
      relations: ["user", "userTiers", "userTiers.tierLevel"]
    });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    // Compute tier progression based on TierLevel thresholds.
    // Prefer TierLevel rows for brands the profile has interacted with (transactions or userTiers),
    // to avoid cross-brand tiers affecting unrelated users.

    // Reload profile with transactions relation to discover involved brands
    const fullProfile = await profileRepo.findOne({
      where: { id: profile.id },
      relations: ["transactions", "transactions.brand", "userTiers", "userTiers.tierLevel"]
    });

    const brandIds = new Set();
    (fullProfile.transactions || []).forEach(tx => { if (tx.brand && tx.brand.id) brandIds.add(tx.brand.id); });
    (fullProfile.userTiers || []).forEach(ut => { if (ut.brand && ut.brand.id) brandIds.add(ut.brand.id); });

    let allTiers = [];
    if (brandIds.size > 0) {
      allTiers = await tierRepo.find({ where: { brand: { id: In([...brandIds]) } } });
    }
    // If no brand-specific tiers found, fall back to all tiers
    if (!allTiers || allTiers.length === 0) {
      allTiers = await tierRepo.find();
    }

    // normalize to unique tiers by name with minPoints (take lowest minPoints per name)
    const unique = {};
    allTiers.forEach((t) => {
      if (!t || !t.name) return;
      if (!unique[t.name] || unique[t.name].minPoints > t.minPoints) unique[t.name] = { name: t.name, minPoints: t.minPoints };
    });

    // Ensure default canonical tiers are always present as fallbacks
    const defaults = [
      { name: 'Bronze', minPoints: 0 },
      { name: 'Silver', minPoints: 5000 },
      { name: 'Gold', minPoints: 7000 },
      { name: 'Platinum', minPoints: 10000 },
    ];
    defaults.forEach(d => {
      if (!unique[d.name] || unique[d.name].minPoints > d.minPoints) unique[d.name] = { name: d.name, minPoints: d.minPoints };
    });

    let sorted = Object.values(unique).sort((a, b) => a.minPoints - b.minPoints);

    // If no TierLevel rows exist, fall back to the app's default thresholds
    if (!sorted || sorted.length === 0) {
      sorted = [
        { name: 'Bronze', minPoints: 0 },
        { name: 'Silver', minPoints: 5000 },
        { name: 'Gold', minPoints: 7000 },
        { name: 'Platinum', minPoints: 10000 },
      ];
    }

    // Determine a reliable current tier.
    // Priority: userTiers (if present) > derive from totalPoints using thresholds > profile.currentTier
    let computedCurrent = profile.currentTier;
    let currentTierMin = 0;
    if (profile.userTiers && profile.userTiers.length > 0) {
      // find the userTier with the highest minPoints
      const achieved = profile.userTiers
        .map((ut) => ut.tierLevel)
        .filter(Boolean)
        .sort((a, b) => b.minPoints - a.minPoints)[0];
      if (achieved) {
        computedCurrent = achieved.name;
        currentTierMin = achieved.minPoints || 0;
      }
    }

    if (!computedCurrent) {
      // No userTiers recorded; derive current tier from totalPoints
      const earned = sorted
        .filter((t) => profile.totalPoints >= t.minPoints)
        .sort((a, b) => b.minPoints - a.minPoints)[0];
      if (earned) {
        computedCurrent = earned.name;
        currentTierMin = earned.minPoints || 0;
      } else {
        computedCurrent = 'Bronze';
        currentTierMin = 0;
      }
    }

    const currentIndex = sorted.findIndex((t) => t.name === computedCurrent);
    const next = sorted[currentIndex + 1] || null;
    const next2 = sorted[currentIndex + 2] || null;

    const tierProgress = [];
    if (next) {
      tierProgress.push({ name: next.name, minPoints: next.minPoints, pointsToReach: Math.max(0, next.minPoints - profile.totalPoints) });
    }
    if (next2) {
      tierProgress.push({ name: next2.name, minPoints: next2.minPoints, pointsToReach: Math.max(0, next2.minPoints - profile.totalPoints) });
    }

    // Return profile with computed current tier and helpful tier metadata
    res.json({ ...profile, currentTier: computedCurrent, currentTierMin, tierThresholds: sorted, tierProgress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await profileRepo.find({ relations: ["user"] });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
export const getProfileById = async (req, res) => {
  try {
    const profile = await profileRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["user", "userTiers", "userTiers.tierLevel"]
    });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};