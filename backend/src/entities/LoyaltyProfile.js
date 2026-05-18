import { EntitySchema } from "typeorm";

const LoyaltyProfile = new EntitySchema({
  name: "LoyaltyProfile",
  tableName: "loyalty_profiles",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    totalPoints: {
      type: "int",
      default: 0
    },
    availablePoints: {
      type: "int",
      default: 0
    },
    currentTier: {
      type: "varchar",
      nullable: true
    },
    joinedAt: {
      type: "timestamp",
      createDate: true
    }
  },
  relations: {
    user: {
      target: "User",
      type: "one-to-one",
      joinColumn: true,
      inverseSide: "loyaltyProfile"
    },
    transactions: {
      target: "Transaction",
      type: "one-to-many",
      inverseSide: "loyaltyProfile"
    },
    redemptions: {
      target: "Redemption",
      type: "one-to-many",
      inverseSide: "loyaltyProfile"
    },
    userTiers: {
      target: "UserTier",
      type: "one-to-many",
      inverseSide: "loyaltyProfile"
    }
  }
});

export default LoyaltyProfile;