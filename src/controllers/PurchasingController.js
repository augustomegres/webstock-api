const { Op } = require("sequelize");

const User = require("../models/User");
const Provider = require("../models/Providers");
const Purchase = require("../models/Purchase");
const OutflowInstallmentsController = require("../models/OutflowInstallments");
const Product = require("../models/Product");
const Account = require("../models/Account");

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
    const { user } = req;
    let {
      date,
      freight,
      quantity,
      installments,
      providerId,
      accountId,
    } = req.body;
    const { productId } = req.params;

    quantity = Number(quantity);

    date = new Date(date).toISOString();

    if (!installments) {
      return res.status(400).json({
        error: "É necessário enviar as parcelas na requisição!",
      });
    }

    if (!date) {
      return res.status(400).json({
        error: "A data da compra é obrigatória!",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        error: "A quantidade de produtos deve ser maior que 0!",
      });
    }

    if (!productId) {
      return res.status(400).json({
        error: "É necessário informar um produto!",
      });
    }

    if (!user) {
      return res.status(400).json({
        error: "Usuário inexistente, erro inesperado!",
      });
    }

    if (providerId) {
      const provider = await Provider.findByPk(providerId, {
        include: [
          {
            association: "products",
          },
        ],
      });

      if (!provider) {
        return res.status(400).json({
          error: "O fornecedor informado não existe!",
        });
      }

      let cont = 0;
      provider.products.map((value) => {
        if (value.id == productId) {
          cont++;
          return;
        }
      });

      if (cont === 0) {
        return res.status(400).json({
          error: "O produto informado não pertence a este fornecedor!",
        });
      }
    }

    /* -------------------------------------------------------------------------- */
    /*                        FAZENDO VERIFICAÇÃO DE CONTA                        */
    /* -------------------------------------------------------------------------- */

    if (!accountId) {
      return res.status(400).json({
        error: "É necessário informar a conta!",
      });
    } else {
      const account = await Account.findOne({
        where: { id: accountId, companyId: user.company.id },
      });

      if (!account) {
        return res
          .status(400)
          .json({ error: "A conta informada não pode ser identificada!" });
      }
    }

    /* -------------------------------------------------------------------------- */
    /*                           CADASTRANDO UMA COMPRA                           */
    /* -------------------------------------------------------------------------- */

    try {
      var newPurchase = await Purchase.create({
        companyId: user.company.id,
        providerId,
        productId,
        accountId,
        date,
        freight,
        quantity,
      });

      var initialProduct = await Product.findByPk(productId);

      installments.map((value) => {
        value.accountId = accountId;
        value.companyId = user.company.id;
        value.purchaseId = newPurchase.id;
      });

      await OutflowInstallmentsController.bulkCreate(installments);

      await Product.update(
        {
          quantity: Number(initialProduct.quantity) + quantity,
        },
        {
          where: {
            id: productId,
          },
        }
      );

      return res.status(200).json({
        success:
          "Compra realizada com sucesso, os produtos já estão disponíveis para vendas no seu estoque!",
      });
    } catch (e) {
      await Purchase.destroy({
        where: {
          id: newPurchase.id,
        },
      });

      return res.status(400).json({
        error:
          "Não foi possível inserir os dados devido a um erro não identificado",
      });
    }
  },
};
