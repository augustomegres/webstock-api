const Sequelize = require("sequelize");
const dbConfig = require("../config/database");

const User = require("../models/User");
const Company = require("../models/Company");
const Product = require("../models/Product");

const connection = new Sequelize(process.env.DATABASE_URL, dbConfig);

User.init(connection);
Company.init(connection);
Product.init(connection);

User.hasOne(Company, { as: "company", foreignKey: "ownerId" });
Company.belongsTo(User, { as: "users", foreignKey: "ownerId" });

Company.hasMany(Product, { as: "products", foreignKey: "companyId" });
Product.belongsTo(Company, { as: "products", foreignKey: "companyId" });

module.exports = connection;
