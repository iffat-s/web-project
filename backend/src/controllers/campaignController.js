// import AppDataSource from "../config/data-source.js";
// import Campaign from "../entities/Campaign.js";


// const campaignRepo = AppDataSource.getRepository(Campaign);

// export const getCampaignsByBrand = async (req, res) => {
//   try {
//     const campaigns = await campaignRepo.findBy({ brand: { id: Number(req.params.brandId) } });
//     res.json(campaigns);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const createCampaign = async (req, res) => {
//   try {
//     const { name, bonusMultiplier, startDate, endDate } = req.body;
//     const campaign = campaignRepo.create({ name, bonusMultiplier, startDate, endDate, brand: { id: Number(req.params.brandId) } });
//     await campaignRepo.save(campaign);
//     res.status(201).json(campaign);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const updateCampaign = async (req, res) => {
//   try {
//     const campaign = await campaignRepo.findOneBy({ id: Number(req.params.id) });
//     if (!campaign) return res.status(404).json({ message: "Campaign not found" });

//     campaignRepo.merge(campaign, req.body);
//     await campaignRepo.save(campaign);
//     res.json(campaign);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const toggleCampaign = async (req, res) => {
//   try {
//     const campaign = await campaignRepo.findOneBy({ id: Number(req.params.id) });
//     if (!campaign) return res.status(404).json({ message: "Campaign not found" });

//     campaign.isActive = !campaign.isActive;
//     await campaignRepo.save(campaign);
//     res.json({ isActive: campaign.isActive });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const deleteCampaign = async (req, res) => {
//   try {
//     const campaign = await campaignRepo.findOneBy({ id: Number(req.params.id) });
//     if (!campaign) return res.status(404).json({ message: "Campaign not found" });

//     await campaignRepo.remove(campaign);
//     res.json({ message: "Campaign deleted" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
import AppDataSource from "../config/data-source.js";
import Campaign from "../entities/Campaign.js";
import Brand from "../entities/Brand.js";

const campaignRepo = AppDataSource.getRepository(Campaign);
const brandRepo = AppDataSource.getRepository(Brand);

export const getCampaignsByBrand = async (req, res) => {
  try {
    const brandId = Number(req.params.brandId);
    
    // Check if brand exists
    const brand = await brandRepo.findOne({ 
      where: { id: brandId },
      relations: ["manager"]
    });
    
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    
    // Brand manager can only access their own brand
    if (req.user.role === 'brand_manager' && brand.manager.id !== req.user.id) {
      return res.status(403).json({ message: "You don't have access to this brand's campaigns" });
    }
    
    const campaigns = await campaignRepo.find({
      where: { brand: { id: brandId } }
    });
    
    res.json(campaigns);
  } catch (err) {
    console.error('Error in getCampaignsByBrand:', err);
    res.status(500).json({ message: err.message });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const brandId = Number(req.params.brandId);
    const { name, bonusMultiplier, startDate, endDate } = req.body;
    
    // Verify brand exists and check permissions
    const brand = await brandRepo.findOne({ 
      where: { id: brandId },
      relations: ["manager"]
    });
    
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    
    // Brand manager can only create campaigns for their own brand
    if (req.user.role === 'brand_manager' && brand.manager.id !== req.user.id) {
      return res.status(403).json({ message: "You don't own this brand" });
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    
    if (start > end) {
      return res.status(400).json({ message: "Start date must be before end date" });
    }
    
    const campaign = campaignRepo.create({ 
      name, 
      bonusMultiplier: bonusMultiplier || 1.0, 
      startDate: start,
      endDate: end,
      isActive: true,
      brand: { id: brandId } 
    });
    
    await campaignRepo.save(campaign);
    res.status(201).json(campaign);
  } catch (err) {
    console.error('Error in createCampaign:', err);
    res.status(500).json({ message: err.message });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const campaignId = Number(req.params.id);
    const brandId = Number(req.params.brandId);
    
    const campaign = await campaignRepo.findOne({
      where: { id: campaignId, brand: { id: brandId } },
      relations: ["brand", "brand.manager"]
    });
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    // Brand manager can only update their own brand's campaigns
    if (req.user.role === 'brand_manager' && campaign.brand.manager.id !== req.user.id) {
      return res.status(403).json({ message: "You don't own this campaign" });
    }
    
    // Don't allow updating brandId
    delete req.body.brandId;
    
    campaignRepo.merge(campaign, req.body);
    await campaignRepo.save(campaign);
    res.json(campaign);
  } catch (err) {
    console.error('Error in updateCampaign:', err);
    res.status(500).json({ message: err.message });
  }
};

export const toggleCampaign = async (req, res) => {
  try {
    const campaignId = Number(req.params.id);
    const brandId = Number(req.params.brandId);
    
    const campaign = await campaignRepo.findOne({
      where: { id: campaignId, brand: { id: brandId } },
      relations: ["brand", "brand.manager"]
    });
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    // Brand manager can only toggle their own brand's campaigns
    if (req.user.role === 'brand_manager' && campaign.brand.manager.id !== req.user.id) {
      return res.status(403).json({ message: "You don't own this campaign" });
    }
    
    campaign.isActive = !campaign.isActive;
    await campaignRepo.save(campaign);
    res.json({ isActive: campaign.isActive });
  } catch (err) {
    console.error('Error in toggleCampaign:', err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const campaignId = Number(req.params.id);
    const brandId = Number(req.params.brandId);
    
    // Only admin can delete campaigns
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only admin can delete campaigns" });
    }
    
    const campaign = await campaignRepo.findOne({
      where: { id: campaignId, brand: { id: brandId } }
    });
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    await campaignRepo.remove(campaign);
    res.json({ message: "Campaign deleted successfully" });
  } catch (err) {
    console.error('Error in deleteCampaign:', err);
    res.status(500).json({ message: err.message });
  }
};