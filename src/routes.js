const express = require("express");
const authMiddleware = require("./app/middlewares/authMiddleware");

const UserController = require("./app/controllers/UserController");
const AuthController = require("./app/controllers/AuthController");

const routes = express.Router();

routes.get("/user/:id", authMiddleware, UserController.show);
routes.put("/user/:id", authMiddleware, UserController.update);
routes.post("/users", UserController.store);

routes.post("/authenticate", AuthController.authenticate);

module.exports = routes;
