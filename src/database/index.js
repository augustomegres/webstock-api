const Sequelize = require("sequelize");

const User = require("../models/User");
const Company = require("../models/Company");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const ProductSold = require("../models/ProductSold");
const Account = require("../models/Account");
const Seller = require("../models/Seller");
const Customer = require("../models/Customer");
const Installments = require("../models/Installments");
const Providers = require("../models/Providers");

var opts = {
  define: {
    timestamps: true,
    //prevent sequelize from pluralizing table names
    freezeTableName: true
  }
};

const connection = new Sequelize(
  "postgres://qzwkwommienvgr:7db54b9a3c6659bf674b31b8e96408695f5a284fbacf3f79eb5094b4b2e182a2@ec2-50-16-197-244.compute-1.amazonaws.com:5432/d2qthv55qidkfs?ssl=on",
  opts
);

User.init(connection);
Company.init(connection);
Product.init(connection);
Sale.init(connection);
ProductSold.init(connection);
Account.init(connection);
Seller.init(connection);
Customer.init(connection);
Installments.init(connection);
Providers.init(connection);

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
ProductSold.belongsTo(Sale, { as: "sales", foreignKey: "sellId" });
Sale.hasMany(ProductSold, { as: "productSold", foreignKey: "sellId" });

//RELAÇÃO DE VENDA - VENDEDOR
Sale.belongsTo(Seller, { as: "saleOwner", foreignKey: "seller" });

//RELAÇÃO DE VENDA - CLIENTE
Sale.belongsTo(Customer, { as: "customers", foreignKey: "customer" });
Customer.hasMany(Sale, { as: "sales", foreignKey: "customer" });

//RELAÇÃO DE EMPRESA - VENDEDOR
Seller.belongsTo(Company, { as: "company", foreignKey: "companyId" });
Company.hasMany(Seller, { as: "sellers", foreignKey: "companyId" });

//RELAÇÃO DE PARCELA - VENDA
Installments.belongsTo(Sale, { as: "sales", foreignKey: "saleId" });
Sale.hasMany(Installments, { as: "installments", foreignKey: "saleId" });

//RELAÇÃO DE PARCELA - EMPRESA
Installments.belongsTo(Company, { as: "company", foreignKey: "companyId" });
Company.hasMany(Installments, { as: "installments", foreignKey: "companyId" });

//RELAÇÃO DE CLIENTE - EMPRESA
Customer.belongsTo(Company, { as: "company", foreignKey: "companyId" });
Company.hasMany(Customer, { as: "customers", foreignKey: "companyId" });

//RELAÇÃO DE FORNECEDOR - EMPRESA
Providers.belongsTo(Company, { as: "company", foreignKey: "companyId" });
Company.hasMany(Providers, { as: "providers", foreignKey: "companyId" });

//RELAÇÃO DE FORNECEDOR - PRODUTOS
Product.hasOne(Providers, { as: "providers", foreignKey: "providerIds" });
Providers.hasMany(Product, { as: "products", foreignKey: "productIds" });

module.exports = connection;
