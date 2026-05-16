// 
import AppDataSource from "../config/data-source.js";

import User from "../entities/User.js";
import Brand from "../entities/Brand.js";
import LoyaltyProfile from "../entities/LoyaltyProfile.js";
import TierLevel from "../entities/TierLevel.js";
import EarningRule from "../entities/EarningRule.js";
import Reward from "../entities/Reward.js";
import Campaign from "../entities/Campaign.js";
import Transaction from "../entities/Transaction.js";
import Redemption from "../entities/Redemption.js";
import UserTier from "../entities/UserTier.js";

import bcrypt from "bcrypt";

async function seed() {
  await AppDataSource.initialize();
  console.log("DB Connected");

  // Repos
  const userRepo = AppDataSource.getRepository(User);
  const brandRepo = AppDataSource.getRepository(Brand);
  const profileRepo = AppDataSource.getRepository(LoyaltyProfile);
  const tierRepo = AppDataSource.getRepository(TierLevel);
  const ruleRepo = AppDataSource.getRepository(EarningRule);
  const rewardRepo = AppDataSource.getRepository(Reward);
  const campaignRepo = AppDataSource.getRepository(Campaign);
  const transactionRepo = AppDataSource.getRepository(Transaction);
  const redemptionRepo = AppDataSource.getRepository(Redemption);
  const userTierRepo = AppDataSource.getRepository(UserTier);

  // Clear old data (optional but useful)
  // Order matters because of foreign keys
  await AppDataSource.query(`
    TRUNCATE TABLE 
      transactions,
      redemptions,
      user_tiers,
      rewards,
      campaigns,
      earning_rules,
      tier_levels,
      loyalty_profiles,
      brands,
      users
    RESTART IDENTITY CASCADE;
  `);

  console.log("Old data cleared");

  // ================= USERS =================
  const users = [];

  for (let i = 1; i <= 10; i++) {
    const role =
      i === 1 ? "admin" : i <= 4 ? "brand_manager" : "customer";

    const user = userRepo.create({
      name: `User ${i}`,
      email: `user${i}@test.com`,
      password: await bcrypt.hash("123456", 10),
      role,
    });

    users.push(await userRepo.save(user));
  }

  console.log("Users created");

  // ================= LOYALTY PROFILES =================
  const customers = users.filter((u) => u.role === "customer");

  const profiles = [];
  for (let i = 0; i < customers.length; i++) {
    const profile = profileRepo.create({
      user: customers[i],
      totalPoints: Math.floor(Math.random() * 1000),
      availablePoints: Math.floor(Math.random() * 500),
      currentTier: "Bronze",
    });

    profiles.push(await profileRepo.save(profile));
  }

  console.log("Profiles created");

  // ================= BRANDS =================
  const managers = users.filter((u) => u.role === "brand_manager");

  const brands = [];
  for (let i = 0; i < 10; i++) {
    const brand = brandRepo.create({
      name: `Brand ${i + 1}`,
      logoUrl: "",
      manager: managers[i % managers.length],
    });

    brands.push(await brandRepo.save(brand));
  }

  console.log("Brands created");

  // ================= TIERS =================
  const tiers = [];

  for (let i = 0; i < 10; i++) {
    const tier = tierRepo.create({
      name: ["Bronze", "Silver", "Gold", "Platinum"][i % 4],
      minPoints: i * 100,
      brand: brands[i % brands.length],
    });

    tiers.push(await tierRepo.save(tier));
  }

  console.log("Tiers created");

  // ================= EARNING RULES =================
  for (let i = 0; i < 10; i++) {
    await ruleRepo.save(
      ruleRepo.create({
        ruleType: "purchase",
        pointsPerUnit: 1 + i,
        minPurchase: 100,
        brand: brands[i % brands.length],
      })
    );
  }

  console.log("Rules created");

  // ================= CAMPAIGNS =================
  const campaigns = [];

  for (let i = 0; i < 10; i++) {
    const campaign = campaignRepo.create({
      name: `Campaign ${i + 1}`,
      bonusMultiplier: 1.5,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 86400000),
      brand: brands[i % brands.length],
    });

    campaigns.push(await campaignRepo.save(campaign));
  }

  console.log("Campaigns created");

  // ================= REWARDS =================
  const rewards = [];

  for (let i = 0; i < 10; i++) {
    const reward = rewardRepo.create({
      title: `Reward ${i + 1}`,
      description: "Sample reward",
      pointsRequired: 100 + i * 50,
      stock: 10,
      brand: brands[i % brands.length],
    });

    rewards.push(await rewardRepo.save(reward));
  }

  console.log("Rewards created");

  // ================= USER TIERS =================
  for (let i = 0; i < profiles.length; i++) {
    await userTierRepo.save(
      userTierRepo.create({
        loyaltyProfile: profiles[i],
        tierLevel: tiers[i % tiers.length],
        brand: brands[i % brands.length],
      })
    );
  }

  console.log("User tiers created");

  // ================= TRANSACTIONS =================
  const transactions = [];

  for (let i = 0; i < 10; i++) {
    const transaction = transactionRepo.create({
      type: i % 2 === 0 ? "earn" : "redeem",
      points: 100,
      purchaseAmount: 500,
      referenceNo: `REF${i}`,
      loyaltyProfile: profiles[i % profiles.length],
      brand: brands[i % brands.length],
      campaign: campaigns[i % campaigns.length],
    });

    transactions.push(await transactionRepo.save(transaction));
  }

  console.log("Transactions created");

  // ================= REDEMPTIONS =================
  for (let i = 0; i < 10; i++) {
    await redemptionRepo.save(
      redemptionRepo.create({
        pointsSpent: 100,
        loyaltyProfile: profiles[i % profiles.length],
        reward: rewards[i % rewards.length],
      })
    );
  }

  console.log("Redemptions created");

  console.log("🎉 SEEDING DONE!");
  process.exit();
}

seed();