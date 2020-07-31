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
      min_date_time,
      max_date_time,
      product,
      provider,
      columnToSort,
      order,
      page,
      pageSize,
    } = req.query;

    let filter = {
      companyId: user.company.id,
    };

    //SE FOR UM NÚMERO
    if (!isNaN(product)) {
      let newProduct = {
        [Op.eq]: product,
      };

      filter.productId = newProduct;
    }

    //SE FOR UM NÚMERO
    if (!isNaN(provider)) {
      let newProvider = {
        [Op.eq]: provider,
      };

      filter.providerId = newProvider;
    }

    if (min || max) {
      let min_val = 0;
      let max_val = 9999999999;
      filter.price = {
        [Op.and]: {
          [Op.gte]: Number(min) || min_val,
          [Op.lte]: Number(max) || max_val,
        },
      };
    }

    if (min_date_time || max_date_time) {
      filter.date = {
        [Op.and]: {
          [Op.gte]: min_date_time || "1970-01-01",
          [Op.lte]: max_date_time || "2100-01-01",
        },
      };
    }

    /* -------------------------------------------------------------------------- */
    /*                               ORDEM DE FILTRO                              */
    /* -------------------------------------------------------------------------- */

    if (columnToSort && order) {
      order = [[columnToSort, order]];
    } else {
      order = null;
    }

    try {
      var purchases = await Purchase.paginate({
        page: page,
        paginate: Number(pageSize),
        where: filter,
        order,
        include: [
          {
            association: "products",
          },
          {
            association: "provider",
          },
          {
            association: "installments",
          },
        ],
      });

      //CONTAGEM DE DADOS
      //ULTIMO MES
      let date = new Date();
      date.setDate(date.getDate() - 30);

      var last30days = await Purchase.count({
        where: { companyId: user.company.id, date: { [Op.gte]: date } },
      });

      purchases.lastMonth = last30days;

      //ULTIMO ANO
      date = new Date();
      date.setDate(date.getDate() - 365);

      var last365days = await Purchase.count({
        where: { companyId: user.company.id, date: { [Op.gte]: date } },
      });

      purchases.lastYear = last365days;

      //DESDE O INICIO
      var allTime = await Purchase.count({
        where: { companyId: user.company.id },
      });

      purchases.allTime = allTime;

      purchases.docs.map((purchase) => {
        let total = 0;
        purchase.installments.map((installment) => {
          total += Number(installment.installmentValue);
        });
        purchase.total = total;
        purchase.dataValues.total = total;
      });
    } catch (err) {
      return res.status(400).json(err);
    }

    return res.json(purchases);
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
