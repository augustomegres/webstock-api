const { Op } = require("sequelize");

const Provider = require("../models/Providers");
const Purchase = require("../models/Purchase");
const Installments = require("../models/OutflowInstallments");
const PurchasedProducts = require("../models/PurchasedProducts");
const Product = require("../models/Product");

module.exports = {
  async index(req, res) {
    const { user } = req;
    let {
      min,
      max,
      initialDate,
      finalDate,
      productId,
      providerId,
      id,
      columnToSort,
      order,
      paginate,
      page,
      pageSize,
    } = req.query;

    if (!paginate) {
      paginate = "true";
    }

    /* ---------------------------- TAMANHO DA PÁGINA --------------------------- */

    if (!pageSize) {
      pageSize = 15;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   FILTROS                                  */
    /* -------------------------------------------------------------------------- */

    let filter = {
      companyId: user.company.id,
    };

    /* ----------------------------------- ID ----------------------------------- */

    if (id) {
      let newId = { [Op.eq]: id };
      filter.id = newId;
    }

    /* ------------------------------- FORNECEDOR ------------------------------- */

    if (providerId) {
      filter.providerId = providerId;
    }

    /* --------------------------------- PRODUTO -------------------------------- */

    let productWhere = {};

    if (productId) {
      productWhere = { productId: { [Op.eq]: productId } };
    }

    /* ---------------------------------- VALOR --------------------------------- */

    if (min || max) {
      filter.total = {
        [Op.and]: {
          [Op.gte]: Number(min),
          [Op.lte]: Number(max),
        },
      };
    }

    /* ---------------------------------- DATA ---------------------------------- */

    if (initialDate || finalDate) {
      initialDate = new Date(initialDate || "01-01-1970").setHours(0, 0, 0, 0);
      finalDate = new Date(finalDate || "01-01-2999").setHours(23, 59, 59, 999);

      filter.date = {
        [Op.and]: {
          [Op.gte]: initialDate,
          [Op.lte]: finalDate,
        },
      };
    }

    /* -------------------------------------------------------------------------- */
    /*                                  ORDENAÇÃO                                 */
    /* -------------------------------------------------------------------------- */

    if (columnToSort && order) {
      order = [
        [columnToSort, order],
        ["installments", "installmentNumber", "ASC"],
      ];
    } else {
      order = null;
    }

    switch (paginate) {
      case "true":
        let purchases = await Purchase.paginate({
          page,
          order,
          paginate: Number(pageSize),
          where: { ...filter },
          include: [
            { association: "installments" },
            { association: "provider" },
            { association: "buyer" },
            { association: "products", where: productWhere },
          ],
        }).catch((error) => {
          return res
            .status(400)
            .json({ error: "Houve um erro na sua requisição", info: error });
        });

        return res.json(purchases);
        break;
      default:
        await Purchase.findAll({
          where: filter,
          order,
          include: [
            { association: "installments" },
            { association: "provider" },
            { association: "buyer" },
            { association: "products", where: productWhere },
          ],
        })
          .then((purchases) => {
            return res.json(purchases);
          })
          .catch((error) => {
            return res
              .status(400)
              .json({ error: "Houve um erro na sua requisição", info: error });
          });
        break;
    }
  },
  async store(req, res) {
    const { date, providerId, freight, products, installments } = req.body;

    const { user } = req;

    /* -------------------------------------------------------------------------- */
    /*                                VERIFICAÇÕES                                */
    /* -------------------------------------------------------------------------- */

    //Verificando se o fornecedor pertence a empresa
    if (providerId) {
      const _providers = await Provider.findByPk(providerId);
      if (_providers.companyId !== user.company.id) {
        return res.status(400).json({
          error: "O fornecedor informado não pertence a sua empresa!",
        });
      }
    }

    /* ----------- SE NÃO HOUVER O VALOR DO FRETE, ELE SERA IGUAL A 0 ----------- */

    let total = freight ? Number(freight) : 0;

    let productIdList = [];

    products.map((product) => {
      /* ------------------- CALCULANDO VALOR TOTAL DOS PRODUTOS ------------------ */

      total = total + product.quantity * product.unityPrice;

      /* ------------------------ INSERINDO IDS EM UM ARRAY ----------------------- */

      productIdList.push(product.productId);
    });

    /* -------------------- REMOVENDO IDS DUPLICADOS NO ARRAY ------------------- */

    productIdList = [...new Set(productIdList)];

    const notUserCompanyProduct = await Product.findAll({
      where: {
        id: productIdList,
        companyId: { [Op.ne]: user.company.id },
      },
    });

    if (notUserCompanyProduct.length) {
      return res.status(400).json({
        error:
          "Você está tentando cadastrar um produto que não pertence a sua empresa!",
      });
    }

    let productsExists = await Product.findAll({
      where: {
        id: productIdList,
      },
    });

    if (productsExists.length !== productIdList.length) {
      return res.status(400).json({
        error: "Um ou mais dos produtos que você tentou cadastrar não existem",
      });
    }

    const stockAdd = {};
    products.map((product) => {
      if (!stockAdd[product.productId]) {
        stockAdd[product.productId] = 0;
      }
      stockAdd[product.productId] =
        stockAdd[product.productId] + product.quantity;
    });

    /* -------------------------------------------------------------------------- */
    /*                      CRIANDO A VENDA NO BANCO DE DADOS                     */
    /* -------------------------------------------------------------------------- */

    try {
      var purchase = await Purchase.create({
        companyId: user.company.id,
        date,
        buyerId: user.id,
        providerId,
        freight,
        total,
      });

      products.map((product) => {
        product.purchaseId = purchase.id;
      });

      /* ----------------------- INSERINDO PRODUTOS COMPRADOS ---------------------- */

      await PurchasedProducts.bulkCreate(products);
      for (var id in stockAdd) {
        productsExists.map((product, index) => {
          if (product.id == id) {
            quantity = Number(productsExists[index].quantity);
            quantity += stockAdd[id];
            productsExists[index].quantity = quantity;
          }
        });
      }

      /* ------------------- INSERINDO O ID DA VENDA NA PARCELA ------------------- */

      installments.map((installment) => {
        installment.purchaseId = purchase.id;
        installment.companyId = user.company.id;
      });

      /* ------------------- CRIANDO PARCELAS NO BANCO DE DADOS ------------------- */

      await Installments.bulkCreate(JSON.parse(JSON.stringify(installments)));

      /* ---------------- ATUALIZANDO OS PRODUTOS NO BANCO DE DADOS --------------- */

      await Product.bulkCreate(JSON.parse(JSON.stringify(productsExists)), {
        updateOnDuplicate: ["quantity"],
      });
    } catch (e) {
      await Purchase.destroy({ where: { id: purchase.id } });
      return res.status(400).json({
        error: "Houve um erro ao tentar inserir o registro!",
        detail: e,
      });
    }

    return res.status(200).json({ success: "Venda concluída com sucesso!" });
  },
};
