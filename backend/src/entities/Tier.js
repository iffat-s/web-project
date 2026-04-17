import { EntitySchema } from "typeorm";

const Tier = new EntitySchema({
  name: "Tier",
  tableName: "tiers",
  columns: {
    id: 
    {  primary: true,
         type: "int", 
         generated: true 
    },
    name: 
    { 
        type: "varchar"
     }, 
    minPoints: { 
        type: "int" 
    },
    multiplier: { 
        type: "float", default: 1.0 
    }
  },
  relations: {
    users: {
      target: "User",
      type: "one-to-many",
      inverseSide: "tier"
    }
  }
});

export default Tier;