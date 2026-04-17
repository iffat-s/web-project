import { EntitySchema } from "typeorm";

const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    name: {
      type: "varchar"
    },
    email: {
      type: "varchar",
      unique: true
    },
    password: {
      type: "varchar",
      select: false // Don't return password by default
    },
    role: {
      type: "enum", 
      enum: ["customer", "admin","manager"], 
      default: "customer"
    },
    totalPoints: { 
      type: "int", 
      default: 0 
    },
    lifetimePoints: { 
      type: "int", 
      default: 0 
    }
  },
  relations: {
    tier: {
      target: "Tier",
      type: "many-to-one",
      joinColumn: true,
      inverseSide: "users"
    },
    transactions: {
      target: "Transaction",
      type: "one-to-many",
      inverseSide: "user"
    },
    redemptions: {
      target: "Redemption",
      type: "one-to-many",
      inverseSide: "user"
    },
   badges: {
        target: "Badge",
        type: "many-to-many",
        joinTable: true, 
        inverseSide: "users"
      }

    }
    
  
});

export default User;

