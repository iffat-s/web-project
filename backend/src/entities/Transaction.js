import { EntitySchema } from "typeorm";

const Transaction = new EntitySchema({
  name: "Transaction",
  tableName: "transactions",
  columns: {
    id: 
    { 
        primary: true, 
        type: "int", 
        generated: true 
    },
    amount: { 
        type: "int" 
    },
    type: { 
      type: "enum", 
      enum: ["EARNED", "REDEEMED"] 
    },
    description: { 
        type: "varchar" 
    },
    createdAt: {
         type: "timestamp", 
         createDate: true
        }
  },
  relations: {
    user: {
      target: "User",
      type: "many-to-one",
      joinColumn: true,
      inverseSide: "transactions"
    }
  }
});

export default Transaction;