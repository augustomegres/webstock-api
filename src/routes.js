const express = require("express");
const authMiddleware = require("./middlewares/authMiddleware");

const UserController = require("./controllers/UserController");
const ProductController = require("./controllers/ProductController");
const CategoryController = require("./controllers/CategoryController");
const SalesController = require("./controllers/SalesController");
const AuthController = require("./controllers/AuthController");
const LoggedController = require("./controllers/LoggedUserController");
const PasswordRecoverController = require("./controllers/PasswordRecoverController");
const AccountController = require("./controllers/AccountController");
const SellerController = require("./controllers/SellerController");
const CustomersController = require("./controllers/CustomersController");
const InstallmentController = require("./controllers/InstallmentController");
const ProviderController = require("./controllers/ProvidersController");
const PurchasingController = require("./controllers/PurchasingController");
const PurchaseInstallments = require("./controllers/PurchaseInstallments");

const routes = express.Router();

/** USUÁRIOS */
routes.get("/user/:id", authMiddleware, UserController.show);
routes.put("/user/:id", authMiddleware, UserController.update);
routes.post("/users", UserController.store);

/** PRODUTOS */
routes.get("/product/:productId", authMiddleware, ProductController.show);
routes.get("/products", authMiddleware, ProductController.index);
routes.post("/product", authMiddleware, ProductController.store);
routes.put("/product/:productId", authMiddleware, ProductController.update);
routes.delete("/product/:productId", authMiddleware, ProductController.delete);

/** CATEGORIAS */
routes.post("/category", authMiddleware, CategoryController.store);
routes.get("/category", authMiddleware, CategoryController.index);
routes.get("/category/:id", authMiddleware, CategoryController.show);
routes.put("/category/:id", authMiddleware, CategoryController.update);
routes.delete("/category/:id", authMiddleware, CategoryController.delete);

/** VENDAS */
routes.get("/sales", authMiddleware, SalesController.index);
routes.post("/sales", authMiddleware, SalesController.store);
routes.delete("/sales/:id", authMiddleware, SalesController.delete);

/** PARCELAS */
routes.get(
  "/saleInstallments/:sellId",
  authMiddleware,
  InstallmentController.show
);
routes.get("/saleInstallments", authMiddleware, InstallmentController.index);
routes.put(
  "/saleInstallments/:id",
  authMiddleware,
  InstallmentController.update
);

/** VENDEDORES */
routes.get("/sellers", authMiddleware, SellerController.index);
routes.post("/sellers", authMiddleware, SellerController.store);

/** CLIENTES */
routes.get("/customer", authMiddleware, CustomersController.index);
routes.post("/customer", authMiddleware, CustomersController.store);
routes.delete("/customer/:id", authMiddleware, CustomersController.delete);

/** CONTAS */
routes.get("/accounts", authMiddleware, AccountController.index);
routes.get("/accounts/:id", authMiddleware, AccountController.show);
routes.post("/accounts", authMiddleware, AccountController.store);
routes.delete("/accounts/:id", authMiddleware, AccountController.delete);
routes.put("/accounts/:id", authMiddleware, AccountController.update);

/** FORNECEDORES */
routes.get("/providers", authMiddleware, ProviderController.index);
routes.get("/providers/:id", authMiddleware, ProviderController.show);
routes.post("/providers", authMiddleware, ProviderController.store);
routes.put("/providers/:id", authMiddleware, ProviderController.update);
routes.delete("/providers/:id", authMiddleware, ProviderController.delete);

/** COMPRAS */
routes.post(
  "/purchasing/:productId",
  authMiddleware,
  PurchasingController.store
);
routes.get("/purchases", authMiddleware, PurchasingController.index);

/** PARCELAS DE COMPRAS */
routes.get("/purchaseInstallments", authMiddleware, PurchaseInstallments.index);
routes.put(
  "/purchaseInstallments/:id",
  authMiddleware,
  PurchaseInstallments.update
);

/** AUTENTICAÇÃO */
routes.post("/authenticate", AuthController.authenticate);

/** USUARIO LOGADO */
routes.get("/loggedUser", authMiddleware, LoggedController.show);

/** RECUPERAÇÃO DE SENHA */
routes.post("/password-recover", PasswordRecoverController.store);
routes.post("/password-update", PasswordRecoverController.update);

module.exports = routes;
