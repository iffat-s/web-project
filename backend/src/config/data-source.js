import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

import User from "../entities/User.js";
import Tier from "../entities/Tier.js";
import Transaction from "../entities/Transaction.js";
import Reward from "../entities/Reward.js";
import Redemption from "../entities/Redemption.js";
import Badge from "../entities/Badge.js";


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
  entities: [User, Tier, Transaction, Reward, Redemption, Badge]
  

});

export default AppDataSource;
