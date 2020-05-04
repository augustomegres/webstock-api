const User = require("../models/User");
const Product = require("../models/Product");
const Provider = require("../models/Providers");
const ProductSold = require("../models/ProductSold");
const { Op, Sequelize } = require("sequelize");

module.exports = {
  async index(req, res) {
    const { userId } = req;
    let {
      enabled,
      page,
      pageSize,
      lowStock,
      categoryId,
      sku,
      name,
    } = req.query;
    if (!page) page = 1;
    if (!pageSize) pageSize = 15;

    //FILTRO DE HABILITADO
    if (enabled == "false" || enabled == "0") {
      enabled = false;
    } else if (enabled == "true" || enabled == "1") {
      enabled = true;
    } else {
      enabled = undefined;
    }

    const loggedUser = await User.findByPk(userId, {
      include: {
        association: "company",
        attributes: ["id", "name", "cnpj"],
      },
      attributes: ["id", "name", "email", "phone"],
    });

    filter = { companyId: loggedUser.company.id };

    //FILTRO PARA RETORNAR APENAS PRODUTOS HABILITADOS OU DESABILITADOS
    if (enabled == true) {
      filter.enabled = true;
    } else if (enabled == false) {
      filter.enabled = false;
    }

    //FILTRO CASO O ESTOQUE SEJA BAIXO
    if (lowStock == "true" || lowStock == "1") {
      filter.quantity = { [Op.lt]: Sequelize.col("minimum") };
    }

    if (sku) {
      filter.sku = { [Op.substring]: sku };
    }

    if (name) {
      filter.name = { [Op.substring]: name };
    }

    const productList = await Product.paginate({
      page,
      paginate: Number(pageSize),
      include: [{ association: "providers" }, { association: "category" }],
      where: filter,
    });

    return res.status(200).json(productList);
  },
  async store(req, res) {
    const { userId } = req;
    let { name, sku, categoryId, price, minimum, provider, enabled } = req.body;

    if (!minimum) {
      minimum = 0;
    }

    if (!enabled) {
      enabled = true;
    }

    if (!name || !price) {
      return res
        .status(400)
        .json({ error: "O preço e nome são obrigatórios!" });
    }

    if (provider) {
      var _provider = await Provider.findByPk(provider);

      if (!_provider) {
        return res.status(400).json({ error: "O fornecedor é inválido" });
      }
    }

    const loggedUser = await User.findByPk(userId, {
      include: {
        association: "company",
        attributes: ["id", "name", "cnpj"],
      },
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires",
        ],
      },
    });

    const company = loggedUser.company;

    try {
      var product = await Product.create({
        companyId: company.id,
        name,
        sku,
        categoryId,
        price,
        minimum,
        enabled,
      });

      await product.addProvider(_provider);

      return res.status(200).json(product);
    } catch (e) {
      await Product.destroy({ where: { id: product.id } });
      return res.status(200).json({ error: "Erro ao cadastrar o produto" });
    }
  },
  async update(req, res) {
    const { userId } = req;
    const {
      name,
      sku,
      categoryId,
      price,
      quantity,
      enabled,
      provider,
    } = req.body;
    let { productId } = req.params;
    productId = Number(productId);

    const loggedUser = await User.findByPk(userId, {
      include: {
        association: "company",
        attributes: ["id", "name", "cnpj"],
      },
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires",
        ],
      },
    });

    const product = await Product.update(
      { name, sku, categoryId, price, quantity, enabled },
      { where: { id: productId, companyId: loggedUser.company.id } }
    );

    if (provider) {
      const _product = await Product.findByPk(productId);
      const _provider = await Provider.findByPk(provider);
      if (!_provider) {
        return res.status(400).json({
          error:
            "O produto foi atualizado, mas o fornecedor informado não foi encontrado",
        });
      }

      await _product.addProvider(_provider);
    }

    return res.status(200).json(product);
  },
  async show(req, res) {
    const { userId } = req;
    let { productId } = req.params;
    productId = Number(productId);

    const loggedUser = await User.findByPk(userId, {
      include: {
        association: "company",
        attributes: ["id", "name", "cnpj"],
      },
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires",
        ],
      },
    });

    const product = await Product.findOne({
      productId,
      where: {
        companyId: loggedUser.company.id,
      },
    });

    return res.status(200).json(product);
  },
  async delete(req, res) {
    const { userId } = req;
    let { productId } = req.params;
    productId = Number(productId);

    const loggedUser = await User.findByPk(userId, {
      include: [{ association: "company" }],
      attributes: {
        exclude: [
          "passwordHash",
          "recoverPasswordToken",
          "recoverPasswordTokenExpires",
        ],
      },
    });

    const product = await Product.findByPk(productId);

    if (!product) {
      res.status(400).json({
        error: "O produto informado não existe em nosso banco de dados",
      });
    }

    if (loggedUser.company.id !== product.companyId) {
      return res
        .status(400)
        .json({ error: "O produto informado não pertence a sua empresa!" });
    }

    const timesItWasSold = await ProductSold.findAndCountAll({
      where: { productId: productId },
    });

    if (timesItWasSold.count > 0) {
      return res.status(400).json({
        error:
          "Você não pode deletar um produto que já foi vendido, caso deseje remove-lo de sua lista, deixe-o desabilitado.",
      });
    }

    try {
      await Product.destroy({ where: { id: productId } });
      return res
        .status(200)
        .json({ success: "O produto informado foi deletado com sucesso!" });
    } catch (e) {
      return res.status(400).json({
        error:
          "Houve um erro inesperado, verifique os dados enviados e tente novamente",
      });
    }
  },
};
