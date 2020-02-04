const { Op } = require("sequelize");

const User = require("../models/User");
const Product = require("../models/Product");
const Sales = require("../models/Sale");
const ProductSold = require("../models/ProductSold");
const Customer = require("../models/Customer");
const Installments = require("../models/Installments");
const Seller = require("../models/Seller");

module.exports = {
  async index(req, res) {
    const { userId } = req;
    const { min, max, min_date_time, max_date_time } = req.query;

    const loggedUser = await User.findByPk(userId, {
      include: [{ association: "company" }]
    });

    try {
      var sales = await Sales.findAll({
        include: [
          { association: "customers" },
          { association: "productSold" },
          { association: "saleOwner" },
          { association: "installments" }
        ],
        where: {
          companyId: loggedUser.company.id,
          total: {
            [Op.and]: {
              [Op.gte]: min ? min : 0,
              [Op.lte]: max ? max : 99999999999999
            }
          },
          date: {
            [Op.and]: {
              [Op.gte]: min_date_time
                ? new Date(`${min_date_time}`)
                : new Date("1980-01-01"),
              [Op.lte]: max_date_time
                ? new Date(`${max_date_time}`)
                : new Date("2100-01-01")
            }
          }
        }
      });
    } catch (err) {
      return res.status(400).json(err);
    }

    return res.json(sales);
  },
  async store(req, res) {
    const {
      date,
      seller,
      customer,
      freight,
      products,
      installments
    } = req.body;
    const { userId } = req;

    /**
     * VERIFICAÇÕES
     */

    //Guardando o usuário logado
    const loggedUser = await User.findByPk(userId, {
      include: [{ association: "company" }],
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires"
        ]
      }
    });

    //Verificando se o cliente pertence a empresa
    if (customer) {
      const _customers = await Customer.findByPk(customer);
      if (_customers.companyId !== loggedUser.company.id) {
        return res
          .status(400)
          .json({ error: "O cliente informado não pertence a sua empresa!" });
      }
    }

    //Verficando se o vendedor pertence a empresa
    if (!seller) {
      return res
        .status(400)
        .json({ error: "É necessário informar o vendedor!" });
    }

    const _seller = await Seller.findByPk(seller);

    if (!_seller) {
      return res.status(400).json({ error: "O vendedor não existe" });
    }

    if (_seller.companyId !== loggedUser.company.id) {
      return res
        .status(400)
        .json({ error: "O vendedor não pertence a esta empresa!" });
    }

    //SE NÃO HOUVER O VALOR DO FRETE, ELE SERA IGUAL A 0
    let total = freight ? freight : 0;

    let productIdList = [];

    products.map(product => {
      //Calcula o valor total dos produtos
      total = total + product.quantity * product.unityPrice;

      //Insere todos os ids dentro de um array
      productIdList.push(product.productId);
    });

    // Remove ids duplicados dentro do array
    productIdList = [...new Set(productIdList)];

    const notUserCompanyProduct = await Product.findAll({
      where: {
        id: productIdList,
        companyId: { [Op.ne]: loggedUser.company.id }
      }
    });

    if (notUserCompanyProduct.length) {
      return res.status(400).json({
        error:
          "Você está tentando cadastrar um produto que não pertence a sua empresa!"
      });
    }

    let productsExists = await Product.findAll({
      where: {
        id: productIdList
      }
    });

    if (productsExists.length !== productIdList.length) {
      return res.status(400).json({
        error: "Um ou mais dos produtos que você tentou cadastrar não existem"
      });
    }

    const stockRemove = {};
    products.map(product => {
      if (!stockRemove[product.productId]) {
        stockRemove[product.productId] = 0;
      }
      stockRemove[product.productId] =
        stockRemove[product.productId] + product.quantity;
    });

    var err = [];
    productsExists.map((product, index) => {
      if (stockRemove[product.id] > product.quantity) {
        err.push({
          error: `Você não tem estoque o suficiente do produto "${product.name}"`,
          requested: stockRemove[product.id],
          inStock: product.quantity
        });
      }
    });

    if (err.length > 0) {
      return res.status(400).json(err);
    }

    /** Criação da venda no banco de dados */
    try {
      var sale = await Sales.create({
        companyId: loggedUser.company.id,
        date,
        seller,
        customer,
        freight,
        total
      });

      products.map(product => {
        product.sellId = sale.id;
        product.unityPrice = product.unityPrice.toFixed(2);
      });

      //Inserindo produtos vendidos
      await ProductSold.bulkCreate(products);
      for (var id in stockRemove) {
        productsExists.map((product, index) => {
          if (product.id == id) {
            productsExists[index].quantity -= stockRemove[id];
          }
        });
      }

      //Atualizando os produtos no banco de dados
      await Product.bulkCreate(JSON.parse(JSON.stringify(productsExists)), {
        updateOnDuplicate: ["quantity"]
      });

      //Inserindo o id da venda dentro da parcela
      installments.map(installment => {
        installment.saleId = sale.id;
        installment.companyId = loggedUser.company.id;
      });

      //Criando as parcelas no banco de dados
      await Installments.bulkCreate(JSON.parse(JSON.stringify(installments)));
    } catch (e) {
      await Sales.destroy({ where: { id: sale.id } });
      return res.status(400).json({
        error: "Houve um erro ao tentar inserir o registro!",
        detail: e
      });
    }

    return res.status(200).json({ success: "Venda concluída com sucesso!" });
  },
  async delete(req, res) {
    const { userId } = req;
    const { id } = req.params;

    const user = await User.findByPk(userId, {
      include: [{ association: "company" }],
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires"
        ]
      }
    });

    const sale = await Sales.destroy({
      where: { [Op.and]: { id: id, companyId: user.company.id } }
    });

    if (sale === 1) {
      return res.status(200).json({ success: "Venda deletada com sucesso!" });
    }
    if (sale === 0)
      return res.status(400).json({ error: "Esta venda não existe!" });
  }
};
