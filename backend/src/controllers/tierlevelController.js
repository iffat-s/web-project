import AppDataSource from "../config/data-source.js";
import TierLevel from "../entities/TierLevel.js";

const tierRepo = AppDataSource.getRepository(TierLevel);
 
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