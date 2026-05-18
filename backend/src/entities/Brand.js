import { EntitySchema } from "typeorm";

const Brand = new EntitySchema({
  name: "Brand",
  tableName: "brands",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    name: {
      type: "varchar"
    },
    logoUrl: {
      type: "varchar",
      nullable: true
    },
    managerId: {
      type: "int",
      nullable: true,
      unique: true
    },
    isActive: {
      type: "boolean",
      default: true
    },
    createdAt: {
      type: "timestamp",
      createDate: true
    }
  },
  relations: {
    manager: {
      target: "User",
      type: "one-to-one",
      joinColumn: { name: "managerId" },
      inverseSide: "brand"
    },
    tierLevels: {
      target: "TierLevel",
      type: "one-to-many",
      inverseSide: "brand"
    },
    earningRules: {
      target: "EarningRule",
      type: "one-to-many",
      inverseSide: "brand"
    },
    rewards: {
      target: "Reward",
      type: "one-to-many",
      inverseSide: "brand"
    },
    campaigns: {
      target: "Campaign",
      type: "one-to-many",
      inverseSide: "brand"
    },
    transactions: {
      target: "Transaction",
      type: "one-to-many",
      inverseSide: "brand"
    }
  }
});

export default Brand;