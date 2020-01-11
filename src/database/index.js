const Sequelize = require("sequelize");

const User = require("../models/User");
const Company = require("../models/Company");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const ProductSold = require("../models/ProductSold");
const Account = require("../models/Account");
const Seller = require("../models/Seller");
const Costumer = require("../models/Costumer");
const Installments = require("../models/Installments");

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
Sale.init(connection);
ProductSold.init(connection);
Account.init(connection);
Seller.init(connection);
Costumer.init(connection);
Installments.init(connection);

//RELAÇÃO DE USUÁRIO - EMPRESA
User.hasOne(Company, { as: "company", foreignKey: "ownerId" });
Company.belongsTo(User, { as: "users", foreignKey: "ownerId" });

//RELAÇÃO DE EMPRESA - PRODUTO
Company.hasMany(Product, { as: "products", foreignKey: "companyId" });
Product.belongsTo(Company, { as: "company", foreignKey: "companyId" });

//RELAÇÃO DE EMPRESA - CONTA
Account.belongsTo(Company, { as: "company", foreignKey: "companyId" });
Company.hasMany(Account, { as: "accounts", foreignKey: "companyId" });

//RELAÇÃO DE VENDA - PRODUTO
Sale.hasMany(ProductSold, { as: "productSold", foreignKey: "sellId" });
ProductSold.belongsTo(Sale, { as: "sales", foreignKey: "sellId" });

//RELAÇÃO DE VENDA - PRODUTO
Sale.belongsTo(Seller, { as: "saleOwner", foreignKey: "seller" });

//RELAÇÃO DE EMPRESA - VENDEDOR
Seller.belongsTo(Company, { as: "company", foreignKey: "companyId" });
Company.hasMany(Seller, { as: "sellers", foreignKey: "companyId" });

//RELAÇÃO DE PARCELA - VENDA
Installments.belongsTo(Sale, { as: "sales", foreignKey: "saleId" });
Sale.hasMany(Sale, { as: "sales", foreignKey: "saleId" });

//RELAÇÃO DE CLIENTE - EMPRESA
Costumer.belongsTo(Company, { as: "costumer", foreignKey: "costumers" });
Company.hasMany(Costumer, { as: "costumer", foreignKey: "costumers" });

module.exports = connection;
