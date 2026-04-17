import { EntitySchema } from "typeorm";

const Badge = new EntitySchema({
  name: "Badge",
  tableName: "badges",
  columns: {
    id: { 
        primary: true, 
        type: "int", 
        generated: true 
    },
    name: { 
        type: "varchar"
     }, 
    description: { 
        type: "varchar" 
    },
    iconUrl: { 
        type: "varchar" 
    } // e.g., "star-medal.png"
  },
  relations: {
    users: {
      target: "User",
      type: "many-to-many",
      inverseSide: "badges"
    }
  }
});

export default Badge;