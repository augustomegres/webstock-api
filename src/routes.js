const express = require("express");
const authMiddleware = require("./middlewares/authMiddleware");

const UserController = require("./controllers/UserController");
const ProductController = require("./controllers/ProductController");
const SalesController = require("./controllers/SalesController");
const AuthController = require("./controllers/AuthController");
const LoggedController = require("./controllers/LoggedUserController");

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

/** VENDAS */
routes.get("/sales", authMiddleware, SalesController.index);
routes.post("/sales", authMiddleware, SalesController.store);

/** AUTENTICAÇÃO */
routes.post("/authenticate", AuthController.authenticate);

/** LOGGEDUSER */
routes.get("/loggedUser", authMiddleware, LoggedController.show);

module.exports = routes;
