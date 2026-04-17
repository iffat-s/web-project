import { EntitySchema } from "typeorm";

const Reward = new EntitySchema({
  name: "Reward",
  tableName: "rewards",
  columns: {
    id: 
    { 
        primary: true,
         type: "int", 
         generated: true 
        },
    name:  { 
        type: "varchar" 
 },
    pointCost: { 
        type: "int" 
    },
    stock: { 
        type: "int", default: 0 
    }
  },
  relations: {
    redemptions: {
      target: "Redemption",
      type: "one-to-many",
      inverseSide: "reward"
    }
  }
});

export default Reward;