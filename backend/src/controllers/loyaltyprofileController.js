import AppDataSource from "../config/data-source.js";
import LoyaltyProfile from "../entities/LoyaltyProfile.js";

const profileRepo = AppDataSource.getRepository(LoyaltyProfile);
 
export const getMyProfile = async (req, res) => {
  try {
    const profile = await profileRepo.findOne({
      where: { user: { id: req.user.id } },
      relations: ["user", "userTiers", "userTiers.tierLevel"]
    });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await profileRepo.find({ relations: ["user"] });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
export const getProfileById = async (req, res) => {
  try {
    const profile = await profileRepo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["user", "userTiers", "userTiers.tierLevel"]
    });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};