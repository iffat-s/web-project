import AppDataSource from "../config/data-source.js";
import Brand from "../entities/Brand.js";
import User from "../entities/User.js";

const brandRepo = AppDataSource.getRepository(Brand);
const userRepo = AppDataSource.getRepository(User);

/**
 * Get all brands
 * - Admins see all brands
 * - Brand managers see only their own brand
 */
export const getAllBrands = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    let query = brandRepo.createQueryBuilder("brand")
      .leftJoinAndSelect("brand.manager", "manager");

    // Brand managers only see their own brand
    if (role === "brand_manager") {
      query = query.where("brand.managerId = :userId", { userId });
    }

    const brands = await query.getMany();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get brand by ID
 */
export const getBrandById = async (req, res) => {
  try {
    const brand = await brandRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["manager", "tierLevels", "earningRules", "campaigns"]
    });
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get brand manager's assigned brand
 */
export const getMyBrand = async (req, res) => {
  try {
    const userId = req.user.id;

    const brand = await brandRepo.findOne({
      where: { managerId: userId },
      relations: ["manager", "tierLevels", "earningRules", "campaigns", "rewards"]
    });

    if (!brand) {
      return res.status(404).json({ message: "No brand assigned to your account" });
    }

    res.json(brand);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get brand managers without assigned brands (admin only)
 */
export const getUnassignedBrandManagers = async (req, res) => {
  try {
    // Get all brand managers
    const allManagers = await userRepo.find({
      where: { role: "brand_manager" }
    });

    // Get managers who already have brands assigned
    const assignedManagers = await brandRepo.find({
      where: { managerId: undefined },
      relations: ["manager"]
    });

    const assignedManagerIds = assignedManagers
      .filter(brand => brand.manager)
      .map(brand => brand.manager.id);

    // Filter to only unassigned managers
    const unassignedManagers = allManagers.filter(
      manager => !assignedManagerIds.includes(manager.id)
    );

    // Sanitize password and refresh token
    const sanitized = unassignedManagers.map(({ password, refreshToken, ...user }) => user);

    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Create brand (admin can optionally assign manager)
 */
export const createBrand = async (req, res) => {
  try {
    const { name, logoUrl, managerId } = req.body;

    // If managerId is provided, validate that manager exists and is unassigned
    if (managerId) {
      const manager = await userRepo.findOne({
        where: { id: managerId, role: "brand_manager" }
      });

      if (!manager) {
        return res.status(400).json({ message: "Invalid or non-existent brand manager" });
      }

      // Check if manager already has a brand
      const existingBrand = await brandRepo.findOneBy({ managerId });
      if (existingBrand) {
        return res.status(400).json({ 
          message: "This brand manager already has a brand assigned" 
        });
      }
    }

    const brand = brandRepo.create({
      name,
      logoUrl,
      ...(managerId && { managerId })
    });

    const saved = await brandRepo.save(brand);

    // Return with manager relation populated
    const result = await brandRepo.findOne({
      where: { id: saved.id },
      relations: ["manager"]
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Assign brand manager to brand (admin only)
 */
export const assignBrandManager = async (req, res) => {
  try {
    const { managerId } = req.body;
    const brandId = Number(req.params.id);

    // Validate brand exists
    const brand = await brandRepo.findOne({
      where: { id: brandId },
      relations: ["manager"]
    });

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // Validate manager exists and is brand_manager role
    if (managerId) {
      const manager = await userRepo.findOne({
        where: { id: managerId, role: "brand_manager" }
      });

      if (!manager) {
        return res.status(400).json({ message: "Invalid or non-existent brand manager" });
      }

      // Check if manager already has a different brand
      const existingBrand = await brandRepo.findOne({
        where: { managerId }
      });

      if (existingBrand && existingBrand.id !== brandId) {
        return res.status(400).json({ 
          message: "This brand manager already has a brand assigned" 
        });
      }
    }

    if (managerId) {
      brand.managerId = managerId;
    } else {
      // explicitly clear relation and FK to ensure TypeORM persists null
      brand.manager = null;
      brand.managerId = null;
    }
    await brandRepo.save(brand);

    const result = await brandRepo.findOne({
      where: { id: brandId },
      relations: ["manager"]
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update brand
 */
export const updateBrand = async (req, res) => {
  try {
    const brandId = Number(req.params.id);
    const { name, logoUrl, isActive } = req.body;

    const brand = await brandRepo.findOne({
      where: { id: brandId },
      relations: ["manager"]
    });

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // Don't allow updating managerId through this endpoint
    if (name) brand.name = name;
    if (logoUrl !== undefined) brand.logoUrl = logoUrl;
    if (isActive !== undefined) brand.isActive = isActive;

    await brandRepo.save(brand);
    res.json(brand);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete brand
 */
export const deleteBrand = async (req, res) => {
  try {
    const brandId = Number(req.params.id);
    const brand = await brandRepo.findOneBy({ id: brandId });

    if (!brand) return res.status(404).json({ message: "Brand not found" });

    await brandRepo.remove(brand);
    res.json({ message: "Brand deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};