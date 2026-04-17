import AppDataSource from "../config/data-source.js";
// Note: Ensure your data-source.js has synchronize: true for this to work!

async function seedDatabase() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected for seeding");

    const userRepository = AppDataSource.getRepository("User");
    const tierRepository = AppDataSource.getRepository("Tier");
    const badgeRepository = AppDataSource.getRepository("Badge");
    const rewardRepository = AppDataSource.getRepository("Reward");

    // -----------------------------
    // 1. Seed Tiers (The Rules)
    // -----------------------------
    const tiers = [
      { name: "Bronze", minPoints: 0, multiplier: 1.0 },
      { name: "Silver", minPoints: 1000, multiplier: 1.5 },
      { name: "Gold", minPoints: 5000, multiplier: 2.0 }
    ];

    for (const t of tiers) {
      const exists = await tierRepository.findOneBy({ name: t.name });
      if (!exists) {
        await tierRepository.save(tierRepository.create(t));
        console.log(`Inserted Tier: ${t.name}`);
      }
    }

    // -----------------------------
    // 2. Seed Admin User
    // -----------------------------
    const adminEmail = "admin@loyalty.com";
    const existingAdmin = await userRepository.findOneBy({ email: adminEmail });

    if (!existingAdmin) {
      // Get the Bronze tier to assign to the admin by default
      const bronzeTier = await tierRepository.findOneBy({ name: "Bronze" });
      
      const adminUser = userRepository.create({
        name: "System Admin",
        email: adminEmail,
        password: "hashed_password_here", 
        role: "admin",
        currentBalance: 0,
        lifetimePoints: 0,
        tier: bronzeTier
      });
      await userRepository.save(adminUser);
      console.log(`Inserted Admin: ${adminEmail}`);
    }

    // -----------------------------
    // 3. Seed Initial Rewards (Catalog)
    // -----------------------------
    const rewards = [
      { name: "Free Coffee", pointCost: 200, stock: 50 },
      { name: "10% Discount Voucher", pointCost: 500, stock: 100 },
      { name: "Brand Hoodie", pointCost: 2000, stock: 10 }
    ];

    for (const r of rewards) {
      const exists = await rewardRepository.findOneBy({ name: r.name });
      if (!exists) {
        await rewardRepository.save(rewardRepository.create(r));
        console.log(`Inserted Reward: ${r.name}`);
      }
    }

    // -----------------------------
    // 4. Seed Initial Badges
    // -----------------------------
    const badges = [
      { name: "Early Bird", description: "Joined in the first month", iconUrl: "early-bird.png" },
      { name: "Big Spender", description: "Made a purchase over $100", iconUrl: "rich.png" }
    ];

    for (const b of badges) {
      const exists = await badgeRepository.findOneBy({ name: b.name });
      if (!exists) {
        await badgeRepository.save(badgeRepository.create(b));
        console.log(`Inserted Badge: ${b.name}`);
      }
    }

    console.log("Seeding completed successfully");
    await AppDataSource.destroy();
    
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

seedDatabase();