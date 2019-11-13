const User = require("../models/User");
const Product = require("../models/Product");

module.exports = {
  async index(req, res) {
    const { userId } = req;

    const loggedUser = await User.findByPk(userId, {
      include: {
        association: "company",
        attributes: ["id", "name", "cnpj"]
      },
      attributes: ["id", "name", "email", "phone"]
    });

    const productList = await Product.findAll({
      where: {
        companyId: loggedUser.company.id
      }
    });

    return res.status(200).json(productList);
  },

  async store(req, res) {
    const { userId } = req;
    const { name, sku, type, price, quantity } = req.body;

    const loggedUser = await User.findByPk(userId, {
      include: {
        association: "company",
        attributes: ["id", "name", "cnpj"]
      },
      attributes: ["id", "name", "email", "phone"]
    });

    const company = loggedUser.company;

    const product = await Product.create({
      companyId: company.id,
      name,
      sku,
      type,
      price,
      quantity
    });
    return res.status(200).json(product);
  },
  async update(req, res) {
    const { userId } = req;
    const { name, sku, type, price, quantity } = req.body;
    let { productId } = req.params;
    productId = Number(productId);

    const loggedUser = await User.findByPk(userId, {
      include: {
        association: "company",
        attributes: ["id", "name", "cnpj"]
      },
      attributes: ["id", "name", "email", "phone"]
    });

    const product = await Product.update(
      {
        name,
        sku,
        type,
        price,
        quantity
      },
      {
        where: {
          id: productId,
          companyId: loggedUser.company.id
        }
      }
    );

    return res.status(200).json(product);
  },
  async show(req, res) {
    const { userId } = req;
    let { productId } = req.params;
    productId = Number(productId);

    const loggedUser = await User.findByPk(userId, {
      include: {
        association: "company",
        attributes: ["id", "name", "cnpj"]
      },
      attributes: ["id", "name", "email", "phone"]
    });

    const product = await Product.findOne({
      productId,
      where: {
        companyId: loggedUser.company.id
      }
    });

    return res.status(200).json(product);
  }
};
