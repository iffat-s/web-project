import { EntitySchema } from "typeorm";

const Reward = new EntitySchema({
  name: "Reward",
  tableName: "rewards",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    title: {
      type: "varchar"
    },
    description: {
      type: "varchar",
      nullable: true
    },
    pointsRequired: {
      type: "int"
    },
    stock: {
      type: "int",
      default: 0
    },
    isActive: {
      type: "boolean",
      default: true
    },
    expiresAt: {
      type: "timestamp",
      nullable: true
    }
  },
  relations: {
    brand: {
      target: "Brand",
      type: "many-to-one",
      joinColumn: true,
      inverseSide: "rewards"
    },
    redemptions: {
      target: "Redemption",
      type: "one-to-many",
      inverseSide: "reward"
    }
  }
});

export default Reward;