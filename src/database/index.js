const Sequelize = require("sequelize");

const User = require("../models/User");
const Company = require("../models/Company");
const Product = require("../models/Product");
const Sales = require("../models/Sales");
const ProductSold = require("../models/ProductSold");
const Account = require("../models/Account");
const Seller = require("../models/Seller");

var opts = {
  define: {
    timestamps: true,
    //prevent sequelize from pluralizing table names
    freezeTableName: true
  }
};

const connection = new Sequelize(process.env.DATABASE_URL, opts);

User.init(connection);
Company.init(connection);
Product.init(connection);
Sales.init(connection);
ProductSold.init(connection);
Account.init(connection);
Seller.init(connection);

//RELAÇÃO DE USUÁRIO - EMPRESA
User.hasOne(Company, { as: "company", foreignKey: "ownerId" });
Company.belongsTo(User, { as: "users", foreignKey: "ownerId" });

//RELAÇÃO DE EMPRESA - PRODUTO
Company.hasMany(Product, { as: "products", foreignKey: "companyId" });
Product.belongsTo(Company, { as: "company", foreignKey: "companyId" });

//RELAÇÃO DE EMPRESA - CONTA
Account.belongsTo(Company, { as: "accounts", foreignKey: "companyId" });
Company.hasMany(Account, { as: "accounts", foreignKey: "companyId" });

//RELAÇÃO DE VENDA - PRODUTO
Sales.hasMany(ProductSold, { as: "productSold", foreignKey: "sellId" });
ProductSold.belongsTo(Sales, { as: "sale", foreignKey: "sellId" });

//RELAÇÃO DE EMPRESA - VENDEDOR
Company.hasMany(Seller, { as: "sellers", foreignKey: "companyId" });
Seller.belongsTo(Company, { as: "company", foreignKey: "companyId" });

module.exports = connection;
