import { EntitySchema } from "typeorm";

const EarningRule = new EntitySchema({
  name: "EarningRule",
  tableName: "earning_rules",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    ruleType: {
      type: "enum",
      enum: ["purchase", "flat", "category"],
      default: "purchase"
    },
    pointsPerUnit: {
      type: "float"
    },
    minPurchase: {
      type: "float",
      default: 0
    },
    startDate: {
      type: "timestamp",
      nullable: true
    },
    endDate: {
      type: "timestamp",
      nullable: true
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
      inverseSide: "earningRules"
    }
  }
});

export default EarningRule;