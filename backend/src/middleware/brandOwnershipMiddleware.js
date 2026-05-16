import AppDataSource from "../config/data-source.js";
import Brand from "../entities/Brand.js";

const brandRepo = AppDataSource.getRepository(Brand);

/**
 * Middleware to verify that brand manager owns the brand they're trying to access
 * Allows admins to bypass this check
 */
const brandOwnershipMiddleware = async (req, res, next) => {
  try {
    const { id: brandId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Admins can access any brand
    if (userRole === "admin") {
      return next();
    }

    // Brand managers can only access their own brand
    if (userRole === "brand_manager") {
      const brand = await brandRepo.findOne({
        where: { id: Number(brandId) },
        relations: ["manager"]
      });

      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }

      if (!brand.manager || brand.manager.id !== userId) {
        return res.status(403).json({ 
          message: "You don't have permission to access this brand" 
        });
      }

      return next();
    }

    // Customers cannot manage brands
    return res.status(403).json({ message: "Insufficient permissions" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default brandOwnershipMiddleware;
