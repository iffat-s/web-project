import { EntitySchema } from "typeorm";

const Campaign = new EntitySchema({
  name: "Campaign",
  tableName: "campaigns",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    name: {
      type: "varchar"
    },
    bonusMultiplier: {
      type: "float",
      default: 1.0
    },
    startDate: {
      type: "timestamp"
    },
    endDate: {
      type: "timestamp"
    },
    isActive: {
      type: "boolean",
      default: true
    }
  },
  relations: {
    brand: {
      target: "Brand",
      type: "many-to-one",
      joinColumn: true,
      inverseSide: "campaigns"
    },
    transactions: {
      target: "Transaction",
      type: "one-to-many",
      inverseSide: "campaign"
    }
  }
});

export default Campaign;