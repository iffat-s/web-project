import AppDataSource from "../config/data-source.js";
import Brand from "../entities/Brand.js";

const brandRepo = AppDataSource.getRepository(Brand);

export const getAllBrands = async (req, res) => {
  try {
    const brands = await brandRepo.find({ relations: ["manager"] });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

export const createBrand = async (req, res) => {
  try {
    const { name, logoUrl } = req.body;
    const brand = brandRepo.create({ name, logoUrl, manager: { id: req.user.id } });
    await brandRepo.save(brand);
    res.status(201).json(brand);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const brand = await brandRepo.findOneBy({ id: Number(req.params.id) });
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    brandRepo.merge(brand, req.body);
    await brandRepo.save(brand);
    res.json(brand);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const brand = await brandRepo.findOneBy({ id: Number(req.params.id) });
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    await brandRepo.remove(brand);
    res.json({ message: "Brand deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};