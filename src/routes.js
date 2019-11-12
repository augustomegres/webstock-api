const express = require("express");
const authMiddleware = require("./middlewares/authMiddleware");

const UserController = require("./controllers/UserController");
const AuthController = require("./controllers/AuthController");

const routes = express.Router();

routes.get("/user/:id", authMiddleware, UserController.show);
routes.put("/user/:id", authMiddleware, UserController.update);
routes.post("/users", UserController.store);

routes.post("/authenticate", AuthController.authenticate);

module.exports = routes;
