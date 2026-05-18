import AppDataSource from "../src/config/data-source.js";
import User from "../src/entities/User.js";
import LoyaltyProfile from "../src/entities/LoyaltyProfile.js";
import TierLevel from "../src/entities/TierLevel.js";
import { In } from "typeorm";

async function run() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const profileRepo = AppDataSource.getRepository(LoyaltyProfile);
  const tierRepo = AppDataSource.getRepository(TierLevel);

  const user = await userRepo.findOneBy({ email: 'customer30@example.com' });
  if (!user) { console.log('User not found'); process.exit(1); }

  const profile = await profileRepo.findOne({ where: { user: { id: user.id } }, relations: ['transactions', 'transactions.brand', 'userTiers', 'userTiers.tierLevel'] });
  console.log('Profile id:', profile.id, 'totalPoints:', profile.totalPoints);
  console.log('Transactions brands:', (profile.transactions||[]).map(t=> t.brand ? t.brand.name : null));

  const brandIds = new Set();
  (profile.transactions || []).forEach(tx => { if (tx.brand && tx.brand.id) brandIds.add(tx.brand.id); });
  (profile.userTiers || []).forEach(ut => { if (ut.brand && ut.brand.id) brandIds.add(ut.brand.id); });
  console.log('Brand IDs:', Array.from(brandIds));

  let allTiers = [];
  if (brandIds.size > 0) {
    allTiers = await tierRepo.find({ where: { brand: { id: In([...brandIds]) } } });
  }
  if (!allTiers || allTiers.length === 0) allTiers = await tierRepo.find();

  console.log('Tiers considered:', allTiers.map(t=> ({name: t.name, minPoints: t.minPoints, brand: t.brand ? t.brand.name : null}))); 

  const unique = {};
  allTiers.forEach((t) => {
    if (!t || !t.name) return;
    if (!unique[t.name] || unique[t.name].minPoints > t.minPoints) unique[t.name] = { name: t.name, minPoints: t.minPoints };
  });
  // Ensure defaults are present
  const defaults = [
    { name: 'Bronze', minPoints: 0 },
    { name: 'Silver', minPoints: 5000 },
    { name: 'Gold', minPoints: 7000 },
    { name: 'Platinum', minPoints: 10000 },
  ];
  defaults.forEach(d => { if (!unique[d.name] || unique[d.name].minPoints > d.minPoints) unique[d.name] = { name: d.name, minPoints: d.minPoints }; });

  const sorted = Object.values(unique).sort((a,b)=> a.minPoints - b.minPoints);
  console.log('Sorted thresholds:', sorted);

  const earned = sorted.filter(t=> profile.totalPoints >= t.minPoints).sort((a,b)=> b.minPoints - a.minPoints)[0];
  const computedCurrent = earned ? earned.name : 'Bronze';
  console.log('Computed current:', computedCurrent);
  const currentIndex = sorted.findIndex(t => t.name === computedCurrent);
  const next = sorted[currentIndex + 1] || null;
  console.log('Next tier selected:', next);

  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
