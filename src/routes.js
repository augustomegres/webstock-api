const express = require("express");
const authMiddleware = require("./middlewares/authMiddleware");

const UserController = require("./controllers/UserController");
const ProductController = require("./controllers/ProductController");
const AuthController = require("./controllers/AuthController");

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

/** AUTENTICAÇÃO */
routes.post("/authenticate", AuthController.authenticate);

module.exports = routes;
