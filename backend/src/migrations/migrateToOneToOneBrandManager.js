/**
 * Migration script to handle one-to-one Brand-BrandManager relationship
 * 
 * This script should be run after updating entities and before deploying
 * It handles:
 * 1. Detecting brand managers with multiple brands
 * 2. Keeping only the most recent brand for each manager
 * 3. Verifying UNIQUE constraint on managerId
 * 
 * Run: node src/migrations/migrateToOneToOneBrandManager.js
 */

import AppDataSource from "../config/data-source.js";
import Brand from "../entities/Brand.js";
import User from "../entities/User.js";

async function migrate() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const brandRepo = AppDataSource.getRepository(Brand);
    const userRepo = AppDataSource.getRepository(User);

    console.log("🔄 Starting migration to one-to-one Brand-Manager relationship...\n");

    // Step 1: Get all brands with managers
    const brandsWithManagers = await brandRepo.find({
      where: { managerId: undefined },
      relations: ["manager"],
      order: { createdAt: "ASC" }
    });

    console.log(`📊 Found ${brandsWithManagers.length} total brands\n`);

    // Step 2: Group brands by manager
    const brandsByManager = {};
    brandsWithManagers.forEach(brand => {
      if (brand.manager) {
        if (!brandsByManager[brand.manager.id]) {
          brandsByManager[brand.manager.id] = [];
        }
        brandsByManager[brand.manager.id].push(brand);
      }
    });

    // Step 3: Identify conflicts (managers with multiple brands)
    const conflicts = Object.entries(brandsByManager).filter(([_, brands]) => brands.length > 1);

    if (conflicts.length > 0) {
      console.log(`⚠️  Found ${conflicts.length} brand managers with multiple brands:\n`);

      for (const [managerId, brands] of conflicts) {
        const manager = await userRepo.findOneBy({ id: Number(managerId) });
        console.log(`  Manager: ${manager.name} (ID: ${managerId})`);
        console.log(`  Brands: ${brands.map(b => `${b.name} (ID: ${b.id}, Created: ${b.createdAt})`).join(", ")}`);
        console.log(`  Action: Keeping "${brands[brands.length - 1].name}" (most recent)\n`);

        // Unassign all but the last brand
        for (let i = 0; i < brands.length - 1; i++) {
          brands[i].managerId = null;
          await brandRepo.save(brands[i]);
          console.log(`    ✓ Unassigned: ${brands[i].name}`);
        }
      }
    } else {
      console.log("✅ No conflicts found - all brand managers have at most one brand\n");
    }

    // Step 4: Verify the migration
    const verifyBrands = await brandRepo.find({
      relations: ["manager"]
    });

    const managerBrandCount = {};
    verifyBrands.forEach(brand => {
      if (brand.manager) {
        managerBrandCount[brand.manager.id] = (managerBrandCount[brand.manager.id] || 0) + 1;
      }
    });

    const violations = Object.entries(managerBrandCount).filter(([_, count]) => count > 1);

    if (violations.length > 0) {
      console.log(`❌ Migration failed: Found violations:\n`);
      violations.forEach(([managerId, count]) => {
        console.log(`  Manager ${managerId} has ${count} brands (should be 1)`);
      });
      process.exit(1);
    }

    console.log("✅ Migration completed successfully!\n");
    console.log("📋 Summary:");
    console.log(`  • Total brands: ${verifyBrands.length}`);
    console.log(`  • Brands with managers: ${verifyBrands.filter(b => b.manager).length}`);
    console.log(`  • Unassigned brands: ${verifyBrands.filter(b => !b.manager).length}`);
    console.log(`  • One-to-one relationship: ✅ Verified\n`);

    console.log("🚀 Ready for deployment!");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run migration
migrate();
