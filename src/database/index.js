const { Sequelize } = require("sequelize");

const sequelizePaginate = require("sequelize-paginate");

const User = require("../models/User");
const Company = require("../models/Company");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Sale = require("../models/Sale");
const ProductSold = require("../models/ProductSold");
const PurchasedProducts = require("../models/PurchasedProducts");
const Account = require("../models/Account");
const Customer = require("../models/Customer");
const SaleInstallments = require("../models/InflowInstallments");
const Providers = require("../models/Providers");
const Purchase = require("../models/Purchase");
const OutflowInstallments = require("../models/OutflowInstallments");
const InflowInstallments = require("../models/InflowInstallments");
const ProductProviders = require("../models/ProductProviders");

const connection = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    dialect: "mysql",
    host: process.env.DB_HOST,
    dialectOptions: {
      socketPath: process.env.DB_PATH,
    },
    logging: false,
    define: {
      timestamps: true,
      freezeTableName: true,
    },
  }
);

User.init(connection);
Company.init(connection);
Product.init(connection);
Category.init(connection);
Sale.init(connection);
ProductSold.init(connection);
PurchasedProducts.init(connection);
ProductProviders.init(connection);
Account.init(connection);
Customer.init(connection);
SaleInstallments.init(connection);
Providers.init(connection);
Purchase.init(connection);
OutflowInstallments.init(connection);

sequelizePaginate.paginate(Sale);
sequelizePaginate.paginate(Purchase);
sequelizePaginate.paginate(InflowInstallments);
sequelizePaginate.paginate(OutflowInstallments);
sequelizePaginate.paginate(Product);
sequelizePaginate.paginate(Category);
sequelizePaginate.paginate(Customer);
sequelizePaginate.paginate(Providers);

/* -------------------------------------------------------------------------- */
/*                             RELAÇÕES DE USUÁRIO                            */
/* -------------------------------------------------------------------------- */

User.hasOne(Company, { as: "company", foreignKey: "ownerId" });
User.belongsToMany(Company, {
  as: "employee_company",
  foreignKey: "userId",
  through: "company_employee",
});
User.belongsTo(Sale, { as: "seller", foreignKey: "id" });

/* -------------------------------------------------------------------------- */
/*                             RELAÇÕES DE EMPRESA                            */
/* -------------------------------------------------------------------------- */

Company.belongsTo(User, { as: "users", foreignKey: "ownerId" });
Company.hasMany(Product, { as: "products", foreignKey: "companyId" });
Company.hasMany(Account, { as: "accounts", foreignKey: "companyId" });
Company.hasMany(SaleInstallments, {
  as: "installments",
  foreignKey: "companyId",
});
Company.hasMany(Customer, { as: "customers", foreignKey: "companyId" });
Company.hasMany(Providers, { as: "providers", foreignKey: "companyId" });
Company.belongsToMany(User, {
  as: "employee",
  foreignKey: "companyId",
  through: "company_employee",
});

/* -------------------------------------------------------------------------- */
/*                             RELAÇÕES DE CONTAS                             */
/* -------------------------------------------------------------------------- */

Account.belongsTo(Company, { as: "company", foreignKey: "companyId" });

/* -------------------------------------------------------------------------- */
/*                            RELAÇÕES DE PRODUTOS                            */
/* -------------------------------------------------------------------------- */

Product.belongsTo(Company, { as: "company", foreignKey: "companyId" });
Product.belongsToMany(Providers, {
  as: "providers",
  foreignKey: "productId",
  through: "products_providers",
});
Product.belongsTo(Category, { as: "category", foreignKey: "categoryId" });
Product.belongsToMany(Sale, {
  as: "sales",
  foreignKey: "productId",
  through: "product_sold",
});

/* -------------------------------------------------------------------------- */
/*                        RELAÇÕES DE PRODUTOS VENDIDOS                       */
/* -------------------------------------------------------------------------- */

ProductSold.belongsTo(Sale, { as: "sales", foreignKey: "saleId" });

/* -------------------------------------------------------------------------- */
/*                             RELAÇÕES DE VENDAS                             */
/* -------------------------------------------------------------------------- */

Sale.hasMany(ProductSold, { as: "productSold", foreignKey: "saleId" });
Sale.belongsTo(User, { as: "saleOwner", foreignKey: "sellerId" });
Sale.belongsTo(Customer, { as: "customers", foreignKey: "customerId" });
Sale.hasMany(SaleInstallments, { as: "installments", foreignKey: "saleId" });

/* -------------------------------------------------------------------------- */
/*                       RELAÇÕES DE PRODUTOS COMPRADOS                       */
/* -------------------------------------------------------------------------- */

PurchasedProducts.belongsTo(Purchase, {
  as: "purchases",
  foreignKey: "purchaseId",
});

/* -------------------------------------------------------------------------- */
/*                             RELAÇÕES DE COMPRAS                            */
/* -------------------------------------------------------------------------- */

Purchase.belongsTo(Company, { as: "company", foreignKey: "companyId" });
Purchase.hasMany(PurchasedProducts, {
  as: "products",
  foreignKey: "purchaseId",
});
Purchase.belongsTo(User, { as: "buyer", foreignKey: "buyerId" });
Purchase.belongsTo(Providers, { as: "provider", foreignKey: "providerId" });
Purchase.hasMany(OutflowInstallments, {
  as: "installments",
  foreignKey: "purchaseId",
});

/* -------------------------------------------------------------------------- */
/*                            RELAÇÕES DE CLIENTES                            */
/* -------------------------------------------------------------------------- */

Customer.hasMany(Sale, { as: "sales", foreignKey: "customerId" });
Customer.belongsTo(Company, { as: "company", foreignKey: "companyId" });

/* -------------------------------------------------------------------------- */
/*                            RELAÇÕES DE PARCELAS                            */
/* -------------------------------------------------------------------------- */

SaleInstallments.belongsTo(Sale, { as: "sales", foreignKey: "saleId" });
SaleInstallments.belongsTo(Company, { as: "company", foreignKey: "companyId" });

/* -------------------------------------------------------------------------- */
/*                           RELAÇÃO DE FORNECEDORES                          */
/* -------------------------------------------------------------------------- */

Providers.belongsTo(Company, { as: "company", foreignKey: "companyId" });
Providers.belongsToMany(Product, {
  as: "products",
  foreignKey: "providerId",
  through: "products_providers",
});

/* -------------------------------------------------------------------------- */
/*                           RELAÇÕES DE CATEGORIAS                           */
/* -------------------------------------------------------------------------- */

Category.hasMany(Product, {
  as: "products",
  foreignKey: "categoryId",
});

/* -------------------------------------------------------------------------- */
/*                        RELAÇÕES DE PARCELAS DE SAÍDA                       */
/* -------------------------------------------------------------------------- */

OutflowInstallments.belongsTo(Purchase, {
  as: "installments",
  foreignKey: "purchaseId",
});
OutflowInstallments.belongsTo(Company, {
  as: "purchasesInstallments",
  foreignKey: "companyId",
});

module.exports = connection;
