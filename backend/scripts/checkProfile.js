import AppDataSource from "../src/config/data-source.js";
import User from "../src/entities/User.js";
import LoyaltyProfile from "../src/entities/LoyaltyProfile.js";
import TierLevel from "../src/entities/TierLevel.js";

async function run() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const profileRepo = AppDataSource.getRepository(LoyaltyProfile);
  const tierRepo = AppDataSource.getRepository(TierLevel);

  const user = await userRepo.findOneBy({ email: 'customer1@example.com' });
  if (!user) { console.log('User not found'); process.exit(1); }
  const profile = await profileRepo.findOne({ where: { user: { id: user.id } }, relations: ['userTiers', 'userTiers.tierLevel'] });
  console.log('Profile currentTier (DB):', profile.currentTier);
  console.log('UserTiers:');
  (profile.userTiers || []).forEach(ut => console.log('-', ut.tierLevel.name, ut.tierLevel.minPoints));

  const allTiers = await tierRepo.find();
  const unique = {};
  allTiers.forEach(t => { if (!unique[t.name] || unique[t.name].minPoints > t.minPoints) unique[t.name] = { name: t.name, minPoints: t.minPoints }; });
  const sorted = Object.values(unique).sort((a,b) => a.minPoints - b.minPoints);

  let computedCurrent = profile.currentTier;
  if (profile.userTiers && profile.userTiers.length > 0) {
    const achieved = profile.userTiers.map(ut => ut.tierLevel).filter(Boolean).sort((a,b)=> b.minPoints - a.minPoints)[0];
    if (achieved) computedCurrent = achieved.name;
  }
  console.log('Computed current tier:', computedCurrent);

  const currentIndex = sorted.findIndex(t => t.name === computedCurrent);
  const next = sorted[currentIndex + 1] || null;
  console.log('Next tier:', next ? next.name : null, next ? next.minPoints : null);

  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
