import AppDataSource from "../config/data-source.js";
import TierLevel from "../entities/TierLevel.js";
import LoyaltyProfile from "../entities/LoyaltyProfile.js";
import UserTier from "../entities/UserTier.js";

const tierRepo = AppDataSource.getRepository(TierLevel);
const profileRepo = AppDataSource.getRepository(LoyaltyProfile);
const userTierRepo = AppDataSource.getRepository(UserTier);
 
export const getTiersByBrand = async (req, res) => {
  try {
    const tiers = await tierRepo.findBy({ brand: { id: Number(req.params.brandId) } });
    res.json(tiers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
export const createTier = async (req, res) => {
  try {
    const { name, minPoints, badgeIcon, perks } = req.body;
    const tier = tierRepo.create({ name, minPoints, badgeIcon, perks, brand: { id: Number(req.params.brandId) } });
    await tierRepo.save(tier);
    // After creating a new tier, assign it to eligible loyalty profiles for this brand
    try {
      const brandId = Number(req.params.brandId);
      // load profiles with userTiers relation
      const profiles = await profileRepo.find({ relations: ['userTiers', 'userTiers.tierLevel', 'userTiers.brand'] });
      for (const profile of profiles) {
        if (profile.totalPoints >= tier.minPoints) {
          // find existing userTier for this brand
          const existing = (profile.userTiers || []).find(ut => ut.brand && ut.brand.id === brandId);
          if (existing) {
            // if the new tier is higher than existing, update
            if ((existing.tierLevel?.minPoints || 0) < tier.minPoints) {
              existing.tierLevel = tier;
              await userTierRepo.save(existing);
              // update cached profile.currentTier if this is the highest achieved
              if (!profile.currentTier || profile.totalPoints >= tier.minPoints) {
                profile.currentTier = tier.name;
                await profileRepo.save(profile);
              }
            }
          } else {
            // create a new userTier record
            const ut = userTierRepo.create({ loyaltyProfile: profile, tierLevel: tier, brand: { id: brandId }, assignedAt: new Date() });
            await userTierRepo.save(ut);
            if (!profile.currentTier || profile.totalPoints >= tier.minPoints) {
              profile.currentTier = tier.name;
              await profileRepo.save(profile);
            }
          }
        }
      }
    } catch (innerErr) {
      // don't fail the request if the post-processing has issues; log and continue
      console.error('Error assigning new tier to profiles:', innerErr);
    }

    res.status(201).json(tier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
export const updateTier = async (req, res) => {
  try {
    const tier = await tierRepo.findOneBy({ id: Number(req.params.id) });
    if (!tier) return res.status(404).json({ message: "Tier not found" });
 
    tierRepo.merge(tier, req.body);
    await tierRepo.save(tier);
    res.json(tier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
export const deleteTier = async (req, res) => {
  try {
    const tier = await tierRepo.findOneBy({ id: Number(req.params.id) });
    if (!tier) return res.status(404).json({ message: "Tier not found" });
 
    await tierRepo.remove(tier);
    res.json({ message: "Tier deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};