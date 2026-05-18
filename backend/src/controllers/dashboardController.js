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
      relations: ["user", "userTiers", "userTiers.tierLevel"],
      order: { totalPoints: "DESC" },
      take: 5
    });

    // Compute currentTier for each top customer (persist if changed)
    const tierRepo = AppDataSource.getRepository("TierLevel");
    let allTiers = await tierRepo.find();
    const unique = {};
    (allTiers || []).forEach(t => { if (t && t.name) { if (!unique[t.name] || unique[t.name].minPoints > t.minPoints) unique[t.name] = { name: t.name, minPoints: t.minPoints }; }});
    const defaults = [{ name: 'Bronze', minPoints: 0 },{ name: 'Silver', minPoints: 5000 },{ name: 'Gold', minPoints: 7000 },{ name: 'Platinum', minPoints: 10000 }];
    defaults.forEach(d => { if (!unique[d.name] || unique[d.name].minPoints > d.minPoints) unique[d.name] = { name: d.name, minPoints: d.minPoints }; });
    const sorted = Object.values(unique).sort((a,b)=> a.minPoints - b.minPoints);

    const mapped = [];
    for (const profile of topCustomers) {
      let computedCurrent = profile.currentTier;
      if (profile.userTiers && profile.userTiers.length > 0) {
        const achieved = profile.userTiers.map(ut => ut.tierLevel).filter(Boolean).sort((a,b) => b.minPoints - a.minPoints)[0];
        if (achieved) computedCurrent = achieved.name;
      }
      if (!computedCurrent) {
        const earned = sorted.filter(t => profile.totalPoints >= t.minPoints).sort((a,b) => b.minPoints - a.minPoints)[0];
        computedCurrent = earned ? earned.name : 'Bronze';
      }

      if (profile.currentTier !== computedCurrent) {
        try { profile.currentTier = computedCurrent; await profileRepo.save(profile); } catch (err) { console.error('persist tier failed', err.message); }
      }
      mapped.push({ ...profile, currentTier: computedCurrent });
    }

    res.json({ totalCustomers, totalTransactions, totalRedemptions, topCustomers: mapped });
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