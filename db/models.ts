import { User } from "./user";
import { Product } from "./product";
import { Auth } from "./auth";

// ejemplo de módulo que importa a todos los modelos
// y los vincula

User.hasMany(Product);
Product.belongsTo(User);

export { User, Product, Auth };
