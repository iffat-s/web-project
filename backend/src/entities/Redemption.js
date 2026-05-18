import { EntitySchema } from "typeorm";

const Redemption = new EntitySchema({
  name: "Redemption",
  tableName: "redemptions",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    pointsSpent: {
      type: "int"
    },
    status: {
      type: "enum",
      enum: ["pending", "approved", "rejected", "fulfilled", "redeemed"],
      default: "pending"
    },
    redeemedAt: {
      type: "timestamp",
      createDate: true
    }
  },
  relations: {
    loyaltyProfile: {
      target: "LoyaltyProfile",
      type: "many-to-one",
      joinColumn: true,
      inverseSide: "redemptions"
    },
    reward: {
      target: "Reward",
      type: "many-to-one",
      joinColumn: true,
      inverseSide: "redemptions"
    }
  }
});

export default Redemption;