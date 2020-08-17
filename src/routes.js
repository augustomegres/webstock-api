const express = require("express");
const authMiddleware = require("./middlewares/authMiddleware");
const memberVerify = require("./middlewares/memberVerify");

const User = require("./models/User");

const UserController = require("./controllers/UserController");
const CompanyController = require("./controllers/CompanyController");
const CompanyInviteController = require("./controllers/CompanyInviteController");
const InviteController = require("./controllers/InviteController");
const ProductController = require("./controllers/ProductController");
const CategoryController = require("./controllers/CategoryController");
const SalesController = require("./controllers/SalesController");
const AuthController = require("./controllers/AuthController");
const LoggedController = require("./controllers/LoggedUserController");
const PasswordRecoverController = require("./controllers/PasswordRecoverController");
const AccountController = require("./controllers/AccountController");
const CustomersController = require("./controllers/CustomersController");
const InflowInstallmentsController = require("./controllers/InflowInstallmentsController");
const ProviderController = require("./controllers/ProvidersController");
const PurchaseController = require("./controllers/PurchaseController");
const OutflowInstallmentsController = require("./controllers/OutflowInstallmentsController");
const SubscriptionController = require("./controllers/SubscriptionController");
const NotificationController = require("./controllers/NotificationController");
const EmployeeController = require("./controllers/EmployeeController");

const routes = express.Router();

routes.get("/", async (req, res) => {
  await User.count()
    .then(() => {
      return res.json({
        api_name: "webstock",
        api_version: "0.1",
        db_connected: true,
      });
    })
    .catch(() => {
      return res.json({
        api_name: "webstock",
        api_version: "0.1",
        db_connected: true,
      });
    });
});
/* -------------------------------------------------------------------------- */
/*                                  USUÁRIOS                                  */
/* -------------------------------------------------------------------------- */
routes.get("/user/:id", authMiddleware, UserController.show);
routes.put("/user/:id", authMiddleware, UserController.update);
routes.post("/users", UserController.store);

/* -------------------------------------------------------------------------- */
/*                                FUNCIONÁRIOS                                */
/* -------------------------------------------------------------------------- */
routes.get(
  "/:companyId/employee",
  authMiddleware,
  memberVerify,
  EmployeeController.index
);
routes.post(
  "/:companyId/employee",
  authMiddleware,
  memberVerify,
  EmployeeController.store
);
routes.delete(
  "/:companyId/employee/:id",
  authMiddleware,
  memberVerify,
  EmployeeController.delete
);

/* -------------------------------------------------------------------------- */
/*                                  PRODUTOS                                  */
/* -------------------------------------------------------------------------- */
routes.get(
  "/:companyId/product/:productId",
  authMiddleware,
  memberVerify,
  ProductController.show
);
routes.get(
  "/:companyId/product",
  authMiddleware,
  memberVerify,
  ProductController.index
);
routes.post(
  "/:companyId/product",
  authMiddleware,
  memberVerify,
  ProductController.store
);
routes.put(
  "/:companyId/product/:productId",
  authMiddleware,
  memberVerify,
  ProductController.update
);
routes.delete(
  "/:companyId/product/:productId",
  authMiddleware,
  memberVerify,
  ProductController.delete
);

/* -------------------------------------------------------------------------- */
/*                                 CATEGORIAS                                 */
/* -------------------------------------------------------------------------- */
routes.post(
  "/:companyId/category",
  authMiddleware,
  memberVerify,
  CategoryController.store
);
routes.get(
  "/:companyId/category",
  authMiddleware,
  memberVerify,
  CategoryController.index
);
routes.get(
  "/:companyId/category/:id",
  authMiddleware,
  memberVerify,
  CategoryController.show
);
routes.put(
  "/:companyId/category/:id",
  authMiddleware,
  memberVerify,
  CategoryController.update
);
routes.delete(
  "/:companyId/category/:id",
  authMiddleware,
  memberVerify,
  CategoryController.delete
);

/* -------------------------------------------------------------------------- */
/*                                   VENDAS                                   */
/* -------------------------------------------------------------------------- */
routes.get(
  "/:companyId/sales",
  authMiddleware,
  memberVerify,
  SalesController.index
);
routes.post(
  "/:companyId/sales",
  authMiddleware,
  memberVerify,
  SalesController.store
);
routes.delete(
  "/:companyId/sales/:id",
  authMiddleware,
  memberVerify,
  SalesController.delete
);

/* -------------------------------------------------------------------------- */
/*                                  CLIENTES                                  */
/* -------------------------------------------------------------------------- */
routes.get(
  "/:companyId/customer",
  authMiddleware,
  memberVerify,
  CustomersController.index
);
routes.get(
  "/:companyId/customer/:id",
  authMiddleware,
  memberVerify,
  CustomersController.show
);
routes.put(
  "/:companyId/customer/:id",
  authMiddleware,
  memberVerify,
  CustomersController.update
);
routes.post(
  "/:companyId/customer",
  authMiddleware,
  memberVerify,
  CustomersController.store
);
routes.delete(
  "/:companyId/customer/:id",
  authMiddleware,
  memberVerify,
  CustomersController.delete
);

/* -------------------------------------------------------------------------- */
/*                                   CONTAS                                   */
/* -------------------------------------------------------------------------- */
routes.get(
  "/:companyId/accounts",
  authMiddleware,
  memberVerify,
  AccountController.index
);
routes.get(
  "/:companyId/accounts/:id",
  authMiddleware,
  memberVerify,
  AccountController.show
);
routes.post(
  "/:companyId/accounts",
  authMiddleware,
  memberVerify,
  AccountController.store
);
routes.delete(
  "/:companyId/accounts/:id",
  authMiddleware,
  memberVerify,
  AccountController.delete
);
routes.put(
  "/:companyId/accounts/:id",
  authMiddleware,
  memberVerify,
  AccountController.update
);

/* -------------------------------------------------------------------------- */
/*                                FORNECEDORES                                */
/* -------------------------------------------------------------------------- */
routes.get(
  "/:companyId/providers",
  authMiddleware,
  memberVerify,
  ProviderController.index
);
routes.get(
  "/:companyId/providers/:id",
  authMiddleware,
  memberVerify,
  ProviderController.show
);
routes.post(
  "/:companyId/providers",
  authMiddleware,
  memberVerify,
  ProviderController.store
);
routes.put(
  "/:companyId/providers/:id",
  authMiddleware,
  memberVerify,
  ProviderController.update
);
routes.delete(
  "/:companyId/providers/:id",
  authMiddleware,
  memberVerify,
  ProviderController.delete
);

/* -------------------------------------------------------------------------- */
/*                                   COMPRAS                                  */
/* -------------------------------------------------------------------------- */
routes.post(
  "/:companyId/purchase",
  authMiddleware,
  memberVerify,
  PurchaseController.store
);
routes.get(
  "/:companyId/purchase",
  authMiddleware,
  memberVerify,
  PurchaseController.index
);

/* -------------------------------------------------------------------------- */
/*                             PARCELAS DE ENTRADA                            */
/* -------------------------------------------------------------------------- */

routes.get(
  "/:companyId/inflowInstallment/:id",
  authMiddleware,
  memberVerify,
  InflowInstallmentsController.show
);
routes.get(
  "/:companyId/inflowInstallment",
  authMiddleware,
  memberVerify,
  InflowInstallmentsController.index
);
routes.put(
  "/:companyId/inflowInstallment/:id",
  authMiddleware,
  memberVerify,
  InflowInstallmentsController.update
);
routes.post(
  "/:companyId/inflowInstallment",
  authMiddleware,
  memberVerify,
  InflowInstallmentsController.store
);

/* -------------------------------------------------------------------------- */
/*                              PARCELAS DE SAIDA                             */
/* -------------------------------------------------------------------------- */
routes.get(
  "/:companyId/outflowInstallment/:id",
  authMiddleware,
  memberVerify,
  OutflowInstallmentsController.show
);
routes.get(
  "/:companyId/outflowInstallment",
  authMiddleware,
  memberVerify,
  OutflowInstallmentsController.index
);
routes.post(
  "/:companyId/outflowInstallment",
  authMiddleware,
  memberVerify,
  OutflowInstallmentsController.store
);
routes.put(
  "/:companyId/outflowInstallment/:id",
  authMiddleware,
  memberVerify,
  OutflowInstallmentsController.update
);

/* -------------------------------------------------------------------------- */
/*                                AUTENTICAÇÃO                                */
/* -------------------------------------------------------------------------- */
routes.post("/authenticate", AuthController.authenticate);

/* -------------------------------------------------------------------------- */
/*                               USUÁRIO LOGADO                               */
/* -------------------------------------------------------------------------- */
routes.get("/loggedUser", authMiddleware, LoggedController.show);

/* -------------------------------------------------------------------------- */
/*                              RECUPERAÇÃO SENHA                             */
/* -------------------------------------------------------------------------- */
routes.post("/password-recover", PasswordRecoverController.store);
routes.post("/password-update", PasswordRecoverController.update);

/* -------------------------------------------------------------------------- */
/*                                  INSCRIÇÃO                                 */
/* -------------------------------------------------------------------------- */
routes.get("/subscription", authMiddleware, SubscriptionController.show);
routes.get("/subscriptions", authMiddleware, SubscriptionController.index);
routes.post("/subscription", authMiddleware, SubscriptionController.store);
routes.put("/subscription", authMiddleware, SubscriptionController.update);

/* -------------------------------------------------------------------------- */
/*                                  EMPRESAS                                  */
/* -------------------------------------------------------------------------- */

routes.get("/company", authMiddleware, CompanyController.index);
routes.post("/company", authMiddleware, CompanyController.store);
routes.put("/company/:companyId", authMiddleware, CompanyController.update);
routes.delete("/company/:companyId", authMiddleware, CompanyController.delete);

/* -------------------------------------------------------------------------- */
/*                           CONVITES PARA EMPRESAS                           */
/* -------------------------------------------------------------------------- */

routes.post(
  "/company/invite/:companyId",
  authMiddleware,
  CompanyInviteController.store
);

/* -------------------------------------------------------------------------- */
/*                                  CONVITES                                  */
/* -------------------------------------------------------------------------- */

routes.get("/invite", authMiddleware, InviteController.index);
routes.post("/invite/:inviteId", authMiddleware, InviteController.store);

/* -------------------------------------------------------------------------- */
/*                                NOTIFICAÇÕES                                */
/* -------------------------------------------------------------------------- */

routes.get(
  "/:companyId/notify",
  authMiddleware,
  memberVerify,
  NotificationController.show
);

module.exports = routes;
