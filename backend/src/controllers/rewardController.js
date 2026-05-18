import AppDataSource from "../config/data-source.js";
import Reward from "../entities/Reward.js";

 
const rewardRepo = AppDataSource.getRepository(Reward);
 
export const getRewardsByBrand = async (req, res) => {
  try {
    const rewards = await rewardRepo.findBy({ brand: { id: Number(req.params.brandId) }, isActive: true });
    res.json(rewards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
export const getRewardById = async (req, res) => {
  try {
    const reward = await rewardRepo.findOneBy({ id: Number(req.params.id) });
    if (!reward) return res.status(404).json({ message: "Reward not found" });
    res.json(reward);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
export const createReward = async (req, res) => {
  try {
    const { title, description, pointsRequired, stock, expiresAt } = req.body;
    const reward = rewardRepo.create({ title, description, pointsRequired, stock, expiresAt, brand: { id: Number(req.params.brandId) } });
    await rewardRepo.save(reward);
    res.status(201).json(reward);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
export const updateReward = async (req, res) => {
  try {
    const reward = await rewardRepo.findOneBy({ id: Number(req.params.id) });
    if (!reward) return res.status(404).json({ message: "Reward not found" });
 
    rewardRepo.merge(reward, req.body);
    await rewardRepo.save(reward);
    res.json(reward);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
export const deleteReward = async (req, res) => {
  try {
    const reward = await rewardRepo.findOneBy({ id: Number(req.params.id) });
    if (!reward) return res.status(404).json({ message: "Reward not found" });
 
    await rewardRepo.remove(reward);
    res.json({ message: "Reward deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};