import { EntitySchema } from "typeorm";

const UserTier = new EntitySchema({
  name: "UserTier",
  tableName: "user_tiers",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    assignedAt: {
      type: "timestamp",
      createDate: true
    }
  },
  relations: {
    loyaltyProfile: {
      target: "LoyaltyProfile",
      type: "many-to-one",
      joinColumn: true,
      inverseSide: "userTiers"
    },
    tierLevel: {
      target: "TierLevel",
      type: "many-to-one",
      joinColumn: true,
      inverseSide: "userTiers"
    },
    brand: {
      target: "Brand",
      type: "many-to-one",
      joinColumn: true
    }
  }
});

export default UserTier;