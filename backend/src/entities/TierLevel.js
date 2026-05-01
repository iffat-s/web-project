import { EntitySchema } from "typeorm";

const TierLevel = new EntitySchema({
  name: "TierLevel",
  tableName: "tier_levels",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    name: {
      type: "varchar"
    },
    minPoints: {
      type: "int"
    },
    badgeIcon: {
      type: "varchar",
      nullable: true
    },
    perks: {
      type: "jsonb",
      nullable: true
    }
  },
  relations: {
    brand: {
      target: "Brand",
      type: "many-to-one",
      joinColumn: true,
      inverseSide: "tierLevels"
    },
    userTiers: {
      target: "UserTier",
      type: "one-to-many",
      inverseSide: "tierLevel"
    }
  }
});

export default TierLevel;