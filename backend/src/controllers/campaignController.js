import AppDataSource from "../config/data-source.js";
import Campaign from "../entities/Campaign.js";


const campaignRepo = AppDataSource.getRepository(Campaign);

export const getCampaignsByBrand = async (req, res) => {
  try {
    const campaigns = await campaignRepo.findBy({ brand: { id: Number(req.params.brandId) } });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const { name, bonusMultiplier, startDate, endDate } = req.body;
    const campaign = campaignRepo.create({ name, bonusMultiplier, startDate, endDate, brand: { id: Number(req.params.brandId) } });
    await campaignRepo.save(campaign);
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const campaign = await campaignRepo.findOneBy({ id: Number(req.params.id) });
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    campaignRepo.merge(campaign, req.body);
    await campaignRepo.save(campaign);
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleCampaign = async (req, res) => {
  try {
    const campaign = await campaignRepo.findOneBy({ id: Number(req.params.id) });
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    campaign.isActive = !campaign.isActive;
    await campaignRepo.save(campaign);
    res.json({ isActive: campaign.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await campaignRepo.findOneBy({ id: Number(req.params.id) });
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    await campaignRepo.remove(campaign);
    res.json({ message: "Campaign deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};