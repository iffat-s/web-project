import { EntitySchema } from "typeorm";

const Redemption = new EntitySchema({
  name: "Redemption",
  tableName: "redemptions",
  columns: {
    id: 
    { 
        primary: true, 
        type: "int", 
        generated: true 
    },
    status: 
    { 
        type: "varchar", 
        default: "pending" 
    },
    redeemedAt:
    { 
        type: "timestamp", 
        createDate: true }
  },
  relations: {
    user: {
      target: "User",
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