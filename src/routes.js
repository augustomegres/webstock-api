const express = require("express");
const authMiddleware = require("./middlewares/authMiddleware");

const UserController = require("./controllers/UserController");
const ProductController = require("./controllers/ProductController");
const SalesController = require("./controllers/SalesController");
const AuthController = require("./controllers/AuthController");
const LoggedController = require("./controllers/LoggedUserController");
const PasswordRecoverController = require("./controllers/PasswordRecoverController");
const AccountController = require("./controllers/AccountController");
const SellerController = require("./controllers/SellerController");
const CostumerController = require("./controllers/CostumerController");

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

/** VENDAS */
routes.get("/sales", authMiddleware, SalesController.index);
routes.post("/sales", authMiddleware, SalesController.store);
routes.delete("/sales/:id", authMiddleware, SalesController.delete);

/** VENDEDORES */
routes.get("/sellers", authMiddleware, SellerController.index);
routes.post("/sellers", authMiddleware, SellerController.store);

/** CLIENTES */
routes.get("/costumer", authMiddleware, CostumerController.index);
routes.post("/costumer", authMiddleware, CostumerController.store);
routes.delete("/costumer/:id", authMiddleware, CostumerController.delete);

/** CONTAS */
routes.get("/accounts", authMiddleware, AccountController.index);
routes.get("/accounts/:id", authMiddleware, AccountController.show);
routes.post("/accounts", authMiddleware, AccountController.store);
routes.delete("/accounts/:id", authMiddleware, AccountController.delete);

/** AUTENTICAÇÃO */
routes.post("/authenticate", AuthController.authenticate);

/** USUARIO LOGADO */
routes.get("/loggedUser", authMiddleware, LoggedController.show);

/** RECUPERAÇÃO DE SENHA */
routes.post("/password-recover", PasswordRecoverController.store);
routes.post("/password-update", PasswordRecoverController.update);

module.exports = routes;
