const Sequelize = require("sequelize");

const User = require("../models/User");
const Company = require("../models/Company");
const Product = require("../models/Product");
const Sales = require("../models/Sales");
const ProductSold = require("../models/ProductSold");

const connection = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    dialect: "postgres",
    define: {
      timestamps: true,
      freezeTableName: true
    }
  }
);

User.init(connection);
Company.init(connection);
Product.init(connection);
Sales.init(connection);
ProductSold.init(connection);

User.hasOne(Company, { as: "company", foreignKey: "ownerId" });
Company.belongsTo(User, { as: "users", foreignKey: "ownerId" });

Company.hasMany(Product, { as: "products", foreignKey: "companyId" });
Product.belongsTo(Company, { as: "company", foreignKey: "companyId" });

Sales.hasMany(ProductSold, {
  as: "productSold",
  foreignKey: "sellId"
});
ProductSold.belongsTo(Sales, { as: "sale", foreignKey: "sellId" });

module.exports = connection;
