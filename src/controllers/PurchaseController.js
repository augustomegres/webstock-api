const { Op } = require("sequelize");

const User = require("../models/User");
const Provider = require("../models/Providers");
const Purchase = require("../models/Purchase");
const PurchaseInstallments = require("../models/PurchaseInstallments");
const Product = require("../models/Product");

module.exports = {
  async index(req, res) {
    const { userId } = req;
    let {
      min_date_time,
      max_date_time,
      product,
      provider,
      order,
      page,
      pageSize
    } = req.query;

    const loggedUser = await User.findByPk(userId, {
      include: [
        {
          association: "company"
        }
      ]
    });

    let filter = {
      companyId: loggedUser.company.id
    };

    //SE FOR UM NÚMERO
    if (!isNaN(product)) {
      let newProduct = {
        [Op.eq]: product
      };

      filter.productId = newProduct;
    }

    //SE FOR UM NÚMERO
    if (!isNaN(provider)) {
      let newProvider = {
        [Op.eq]: provider
      };

      filter.providerId = newProvider;
    }

    if (min_date_time || max_date_time) {
      let min_date = new Date("1980-01-01");
      let max_date = new Date("2100-01-01");

      filter.date = {
        [Op.and]: {
          [Op.gte]: new Date(`${min_date_time}`) || min_date,
          [Op.lte]: new Date(`${max_date_time}`) || max_date
        }
      };
    }

    if (order) {
      var searchOrder = [];
      searchOrder.push(["id", order]);
    } else {
      var searchOrder = [];
    }

    try {
      var purchases = await Purchase.paginate({
        page: page,
        paginate: Number(pageSize),
        where: filter,
        order: searchOrder,
        include: [
          { association: "product" },
          { association: "provider" },
          { association: "installments" }
        ]
      });

      purchases.docs.map(purchase => {
        let total = 0;
        purchase.installments.map(installment => {
          total += Number(installment.installmentValue);
        });
        purchase.total = total;
        purchase.dataValues.total = total;
      });

      return res.json(purchases);
    } catch (err) {
      return res.status(400).json(err);
    }
  },
  async store(req, res) {
    const { userId } = req;
    let { date, freight, quantity, installments, providerId, total } = req.body;
    const { productId } = req.params;

    date = new Date(date).toISOString();

    if (!installments) {
      return res.status(400).json({
        error: "É necessário enviar as parcelas na requisição!"
      });
    }

    if (!date) {
      return res.status(400).json({
        error: "A data da compra é obrigatória!"
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        error: "A quantidade de produtos deve ser maior que 0!"
      });
    }

    if (!productId) {
      return res.status(400).json({
        error: "É necessário informar um produto!"
      });
    }

    const loggedUser = await User.findByPk(userId, {
      include: [
        {
          association: "company"
        }
      ],
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires"
        ]
      }
    });

    if (!loggedUser) {
      return res.status(400).json({
        error: "Usuário inexistente, erro inesperado!"
      });
    }

    if (providerId) {
      const provider = await Provider.findByPk(providerId, {
        include: [
          {
            association: "products"
          }
        ]
      });

      if (!provider) {
        return res.status(400).json({
          error: "O fornecedor informado não existe!"
        });
      }

      let cont = 0;

      provider.products.map(value => {
        if (value.id == productId) {
          cont++;

          return;
        }
      });

      if (cont === 0) {
        return res.status(400).json({
          error: "O produto informado não pertence a este fornecedor!"
        });
      }
    }

    try {
      var newPurchase = await Purchase.create({
        companyId: loggedUser.company.id,
        providerId,
        productId,
        date,
        freight,
        quantity,
        total
      });

      var initialProduct = await Product.findByPk(productId);

      installments.map(value => {
        value.companyId = loggedUser.company.id;
        value.purchaseId = newPurchase.id;
      });

      await PurchaseInstallments.bulkCreate(installments);

      await Product.update(
        {
          quantity: Number(initialProduct.quantity) + quantity
        },
        {
          where: {
            id: productId
          }
        }
      );

      return res.status(200).json({
        success:
          "Compra realizada com sucesso, os produtos já estão disponíveis para vendas no seu estoque!"
      });
    } catch (e) {
      await Purchase.destroy({
        where: {
          id: newPurchase.id
        }
      });

      return res.status(400).json({
        error:
          "Não foi possível inserir os dados devido a um erro não identificado"
      });
    }
  }
};
