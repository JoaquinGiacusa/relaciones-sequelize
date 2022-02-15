import { Model, DataTypes } from "sequelize";
import { sequelize } from "./connection";

export class User extends Model {}
User.init(
  {
    fullName: DataTypes.STRING,
    birthday: DataTypes.DATE,
    email: DataTypes.STRING,
  },
  { sequelize, modelName: "user" }
);
