import { EntitySchema } from "typeorm";

const Transaction = new EntitySchema({
  name: "Transaction",
  tableName: "transactions",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    type: {
      type: "enum",
      enum: ["earn", "redeem", "adjust", "expire"]
    },
    points: {
      type: "int"
    },
    purchaseAmount: {
      type: "float",
      nullable: true
    },
    referenceNo: {
      type: "varchar",
      nullable: true
    },
    createdAt: {
      type: "timestamp",
      createDate: true
    }
  },
  relations: {
    loyaltyProfile: {
      target: "LoyaltyProfile",
      type: "many-to-one",
      joinColumn: true,
      inverseSide: "transactions"
    },
    brand: {
      target: "Brand",
      type: "many-to-one",
      joinColumn: true,
      inverseSide: "transactions"
    },
    campaign: {
      target: "Campaign",
      type: "many-to-one",
      joinColumn: true,
      nullable: true,
      inverseSide: "transactions"
    }
  }
});

export default Transaction;