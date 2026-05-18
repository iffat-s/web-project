import AppDataSource from "../config/data-source.js";
import EarningRule from "../entities/EarningRule.js";

const ruleRepo = AppDataSource.getRepository(EarningRule);
 
export const getRulesByBrand = async (req, res) => {
  try {
    const rules = await ruleRepo.findBy({ brand: { id: Number(req.params.brandId) } });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
export const createRule = async (req, res) => {
  try {
    const { ruleType, pointsPerUnit, minPurchase, startDate, endDate } = req.body;
    const rule = ruleRepo.create({ ruleType, pointsPerUnit, minPurchase, startDate, endDate, brand: { id: Number(req.params.brandId) } });
    await ruleRepo.save(rule);
    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
export const updateRule = async (req, res) => {
  try {
    const rule = await ruleRepo.findOneBy({ id: Number(req.params.id) });
    if (!rule) return res.status(404).json({ message: "Rule not found" });
 
    ruleRepo.merge(rule, req.body);
    await ruleRepo.save(rule);
    res.json(rule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
export const deleteRule = async (req, res) => {
  try {
    const rule = await ruleRepo.findOneBy({ id: Number(req.params.id) });
    if (!rule) return res.status(404).json({ message: "Rule not found" });
 
    await ruleRepo.remove(rule);
    res.json({ message: "Rule deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};