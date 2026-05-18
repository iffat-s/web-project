// seed.js
import 'dotenv/config';
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
  console.log("✅ DB Connected");

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

  // Clear old data (order matters due to foreign keys)
  await AppDataSource.query(`
    TRUNCATE TABLE 
      redemptions,
      transactions,
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

  console.log("🗑️ Old data cleared");

  // ================= USERS =================
  // 1 Admin, 3 Brand Managers, 5 Customers
  const users = [];
  
  // Create Admin
  const admin = userRepo.create({
    name: "Admin User",
    email: "admin@example.com",
    password: await bcrypt.hash("admin123", 10),
    role: "admin",
  });
  users.push(await userRepo.save(admin));
  console.log("✅ Admin created");

  // Create Brand Managers (3 managers, each will get 1 brand)
  const brandManagers = [];
  const managerNames = ["Nike", "Adidas", "Puma"];
  for (let i = 0; i < 3; i++) {
    const manager = userRepo.create({
      name: `${managerNames[i]} Manager`,
      email: `${managerNames[i].toLowerCase()}@example.com`,
      password: await bcrypt.hash("manager123", 10),
      role: "brand_manager",
    });
    brandManagers.push(await userRepo.save(manager));
    console.log(`✅ ${managerNames[i]} Manager created`);
  }

  // Create Customers (5 customers)
  const customers = [];
  const customerNames = ["John", "Sarah", "Mike", "Emma", "David"];
  for (let i = 0; i < 5; i++) {
    const customer = userRepo.create({
      name: `${customerNames[i]} Customer`,
      email: `${customerNames[i].toLowerCase()}@example.com`,
      password: await bcrypt.hash("customer123", 10),
      role: "customer",
    });
    customers.push(await userRepo.save(customer));
    console.log(`✅ Customer ${customerNames[i]} created`);
  }

  console.log(`\n📊 Total users created: ${users.length + brandManagers.length + customers.length}`);

  // ================= BRANDS (One-to-One with Brand Managers) =================
  const brands = [];
  const brandData = [
    { name: "Nike", logoUrl: "https://example.com/nike-logo.png", manager: brandManagers[0] },
    { name: "Adidas", logoUrl: "https://example.com/adidas-logo.png", manager: brandManagers[1] },
    { name: "Puma", logoUrl: "https://example.com/puma-logo.png", manager: brandManagers[2] },
  ];

  for (const data of brandData) {
    const brand = brandRepo.create({
      name: data.name,
      logoUrl: data.logoUrl,
      manager: data.manager,
      isActive: true,
    });
    brands.push(await brandRepo.save(brand));
    console.log(`✅ Brand ${data.name} created with manager ${data.manager.name}`);
  }

  // ================= LOYALTY PROFILES (For Customers Only) =================
  const profiles = [];
  const tierOptions = ["Bronze", "Silver", "Gold", "Platinum"];
  
  for (let i = 0; i < customers.length; i++) {
    const profile = profileRepo.create({
      user: customers[i],
      totalPoints: Math.floor(Math.random() * 2000),
      availablePoints: Math.floor(Math.random() * 1500),
      currentTier: tierOptions[i % tierOptions.length],
    });
    profiles.push(await profileRepo.save(profile));
    console.log(`✅ Loyalty profile created for ${customers[i].name} (${profile.currentTier} tier)`);
  }

  // ================= TIER LEVELS (Per Brand) =================
  const tiers = [];
  const tierLevels = [
    { name: "Bronze", minPoints: 0, perks: ["Basic support", "Welcome offer"] },
    { name: "Silver", minPoints: 500, perks: ["Priority support", "5% bonus points"] },
    { name: "Gold", minPoints: 1500, perks: ["VIP support", "10% bonus points", "Birthday reward"] },
    { name: "Platinum", minPoints: 3000, perks: ["24/7 support", "20% bonus points", "Free shipping", "Exclusive events"] },
  ];

  for (const brand of brands) {
    for (const tier of tierLevels) {
      const newTier = tierRepo.create({
        name: tier.name,
        minPoints: tier.minPoints,
        perks: tier.perks,
        badgeIcon: `${brand.name}-${tier.name}.png`,
        brand: brand,
      });
      tiers.push(await tierRepo.save(newTier));
    }
    console.log(`✅ Tier levels created for ${brand.name}`);
  }

  // ================= EARNING RULES (Per Brand) =================
  const earningRules = [];
  const ruleTypes = ["purchase", "flat", "category"];
  
  for (const brand of brands) {
    // Create 2 earning rules per brand
    for (let i = 0; i < 2; i++) {
      const rule = ruleRepo.create({
        ruleType: ruleTypes[i % ruleTypes.length],
        pointsPerUnit: i === 0 ? 10 : 5,
        minPurchase: i === 0 ? 100 : 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 86400000), // 1 year
        isActive: true,
        brand: brand,
      });
      earningRules.push(await ruleRepo.save(rule));
    }
    console.log(`✅ Earning rules created for ${brand.name}`);
  }

  // ================= CAMPAIGNS (Per Brand) =================
  const campaigns = [];
  const campaignNames = ["Summer Sale", "Winter Special", "Holiday Bonus", "Weekend Flash"];
  
  for (const brand of brands) {
    for (let i = 0; i < campaignNames.length; i++) {
      const campaign = campaignRepo.create({
        name: `${brand.name} ${campaignNames[i]}`,
        bonusMultiplier: 1.5 + (i * 0.5),
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 86400000), // 30 days
        isActive: true,
        brand: brand,
      });
      campaigns.push(await campaignRepo.save(campaign));
    }
    console.log(`✅ Campaigns created for ${brand.name}`);
  }

  // ================= REWARDS (Per Brand) =================
  const rewards = [];
  const rewardTemplates = [
    { title: "Free Coffee", pointsRequired: 100, description: "Get a free coffee" },
    { title: "$10 Voucher", pointsRequired: 500, description: "$10 store credit" },
    { title: "$25 Voucher", pointsRequired: 1200, description: "$25 store credit" },
    { title: "Free Product", pointsRequired: 2000, description: "Choose any product under $50" },
  ];

  for (const brand of brands) {
    for (const template of rewardTemplates) {
      const reward = rewardRepo.create({
        title: `${brand.name} ${template.title}`,
        description: template.description,
        pointsRequired: template.pointsRequired,
        stock: 50,
        isActive: true,
        expiresAt: new Date(Date.now() + 180 * 86400000), // 6 months
        brand: brand,
      });
      rewards.push(await rewardRepo.save(reward));
    }
    console.log(`✅ Rewards created for ${brand.name}`);
  }

  // ================= USER TIERS (Assign tiers to customers per brand) =================
  for (const profile of profiles) {
    for (const brand of brands) {
      // Assign a random tier for each brand
      const brandTiers = tiers.filter(t => t.brand.id === brand.id);
      const randomTier = brandTiers[Math.floor(Math.random() * brandTiers.length)];
      
      const userTier = userTierRepo.create({
        loyaltyProfile: profile,
        tierLevel: randomTier,
        brand: brand,
        assignedAt: new Date(),
      });
      await userTierRepo.save(userTier);
    }
  }
  console.log(`✅ User tiers assigned`);

  // ================= TRANSACTIONS =================
  const transactionTypes = ["earn", "redeem", "adjust"];
  
  for (let i = 0; i < 30; i++) {
    const profile = profiles[i % profiles.length];
    const brand = brands[i % brands.length];
    const type = transactionTypes[i % transactionTypes.length];
    const points = type === "earn" ? Math.floor(Math.random() * 500) + 50 : Math.floor(Math.random() * 200) + 20;
    
    const transaction = transactionRepo.create({
      type: type,
      points: type === "earn" ? points : -points,
      purchaseAmount: type === "earn" ? points * 10 : null,
      referenceNo: `TXN${Date.now()}${i}`,
      createdAt: new Date(Date.now() - i * 86400000), // Spread over last i days
      loyaltyProfile: profile,
      brand: brand,
      campaign: campaigns[i % campaigns.length],
    });
    await transactionRepo.save(transaction);
  }
  console.log(`✅ Transactions created`);

  // ================= REDEMPTIONS =================
  for (let i = 0; i < 20; i++) {
    const profile = profiles[i % profiles.length];
    const reward = rewards[i % rewards.length];
    const statuses = ["pending", "approved", "fulfilled", "rejected"];
    
    const redemption = redemptionRepo.create({
      pointsSpent: reward.pointsRequired,
      status: statuses[i % statuses.length],
      redeemedAt: new Date(Date.now() - i * 86400000),
      loyaltyProfile: profile,
      reward: reward,
    });
    await redemptionRepo.save(redemption);
  }
  console.log(`✅ Redemptions created`);

  console.log("\n🎉 SEEDING COMPLETED SUCCESSFULLY!");
  console.log("\n📝 TEST CREDENTIALS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("ADMIN ACCOUNTS:");
  console.log("  Admin:       admin@example.com / admin123");
  console.log("\nBRAND MANAGER ACCOUNTS (Each manages ONE brand):");
  console.log("  Nike:        nike@example.com / manager123");
  console.log("  Adidas:      adidas@example.com / manager123");
  console.log("  Puma:        puma@example.com / manager123");
  console.log("\nCUSTOMER ACCOUNTS:");
  console.log("  John:        john@example.com / customer123");
  console.log("  Sarah:       sarah@example.com / customer123");
  console.log("  Mike:        mike@example.com / customer123");
  console.log("  Emma:        emma@example.com / customer123");
  console.log("  David:       david@example.com / customer123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n🔗 BRAND ASSIGNMENTS (One-to-One):");
  for (const brand of brands) {
    console.log(`  • ${brand.manager.name} → manages → ${brand.name}`);
  }
  console.log("\n✨ Database is ready to use!");

  process.exit(0);
}

seed().catch(error => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});