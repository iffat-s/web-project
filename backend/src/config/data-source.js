import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

import User from "../entities/User.js";
import Transaction from "../entities/Transaction.js";
import Reward from "../entities/Reward.js";
import Redemption from "../entities/Redemption.js";
import Brand from "../entities/Brand.js";
import LoyaltyProfile from "../entities/LoyaltyProfile.js";
import EarningRule from "../entities/EarningRule.js";
import Campaign from "../entities/Campaign.js";
import UserTier from "../entities/UserTier.js";
import TierLevel from "../entities/TierLevel.js";


dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [
    User,
    LoyaltyProfile,
    Brand,
    TierLevel,
    EarningRule,
    Reward,
    Campaign,
    Transaction,
    Redemption,
    UserTier
  ]  

});

export default AppDataSource;
