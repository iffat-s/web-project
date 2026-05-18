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
      type: "varchar"
    },
    role: {
      type: "enum",
      enum: ["admin", "brand_manager", "customer"],
      default: "customer"
    },
    phone: {
      type: "varchar",
      nullable: true
    },
    refreshToken: {
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
      type: "one-to-one",
      inverseSide: "user"
    },
    brand: {
      target: "Brand",
      type: "one-to-one",
      inverseSide: "manager",
      nullable: true
    }
  }
});

export default User;