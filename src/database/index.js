const Sequelize = require("sequelize");

const sequelizePaginate = require("sequelize-paginate");

const User = require("../models/User");
const Company = require("../models/Company");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Sale = require("../models/Sale");
const ProductSold = require("../models/ProductSold");
const Account = require("../models/Account");
const Seller = require("../models/Seller");
const Customer = require("../models/Customer");
const SaleInstallments = require("../models/InflowInstallments");
const Providers = require("../models/Providers");
const Purchase = require("../models/Purchase");
const OutflowInstallmentsController = require("../models/OutflowInstallments");

var opts = {
  define: {
    timestamps: true,
    freezeTableName: true,
  },
  logging: false,
};

const connection = new Sequelize(process.env.DATABASE_URL, opts);

User.init(connection);
Company.init(connection);
Product.init(connection);
Category.init(connection);
Sale.init(connection);
ProductSold.init(connection);
Account.init(connection);
Seller.init(connection);
Customer.init(connection);
SaleInstallments.init(connection);
Providers.init(connection);
Purchase.init(connection);
OutflowInstallmentsController.init(connection);

sequelizePaginate.paginate(Sale);
sequelizePaginate.paginate(Purchase);
sequelizePaginate.paginate(OutflowInstallmentsController);
sequelizePaginate.paginate(Product);
sequelizePaginate.paginate(Category);

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
SaleInstallments.belongsTo(Sale, { as: "sales", foreignKey: "saleId" });
Sale.hasMany(SaleInstallments, { as: "installments", foreignKey: "saleId" });

//RELAÇÃO DE PARCELA - EMPRESA
SaleInstallments.belongsTo(Company, { as: "company", foreignKey: "companyId" });
Company.hasMany(SaleInstallments, {
  as: "installments",
  foreignKey: "companyId",
});

//RELAÇÃO DE CLIENTE - EMPRESA
Customer.belongsTo(Company, { as: "company", foreignKey: "companyId" });
Company.hasMany(Customer, { as: "customers", foreignKey: "companyId" });

//RELAÇÃO DE FORNECEDOR - EMPRESA
Providers.belongsTo(Company, { as: "company", foreignKey: "companyId" });
Company.hasMany(Providers, { as: "providers", foreignKey: "companyId" });

//RELAÇÃO DE FORNECEDOR - PRODUTOS
Product.belongsToMany(Providers, {
  as: "providers",
  foreignKey: "productId",
  through: "products_providers",
});

Providers.belongsToMany(Product, {
  as: "products",
  foreignKey: "providerId",
  through: "products_providers",
});

//RELAÇÃO DE PRODUTO - CATEGORIA
Product.belongsTo(Category, { as: "category", foreignKey: "categoryId" });
Category.hasMany(Product, { as: "products", foreignKey: "id" });

//RELAÇÃO DE COMPRA - FORNECEDOR
Purchase.belongsTo(Company, { as: "company", foreignKey: "companyId" });

//RELAÇÃO DE COMPRA - PRODUTO
Purchase.belongsTo(Product, { as: "products", foreignKey: "productId" });

//RELAÇÃO DE COMPRA - FORNECEDOR
Purchase.belongsTo(Providers, { as: "provider", foreignKey: "providerId" });

//RELAÇÃO DE COMPRA - FORNECEDOR
Purchase.hasMany(OutflowInstallmentsController, {
  as: "installments",
  foreignKey: "purchaseId",
});

//RELAÇÃO DE COMPRA - PARCELAS
OutflowInstallmentsController.belongsTo(Purchase, {
  as: "installments",
  foreignKey: "purchaseId",
});

//RELAÇÃO DE COMPRA - PARCELAS
OutflowInstallmentsController.belongsTo(Company, {
  as: "purchasesInstallments",
  foreignKey: "companyId",
});

module.exports = connection;
