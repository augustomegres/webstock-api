const User = require("../models/User");
const Product = require("../models/Product");
const Provider = require("../models/Providers");
const ProductSold = require("../models/ProductSold");
const { Op, Sequelize } = require("sequelize");

module.exports = {
  async index(req, res) {
    const { user } = req;
    let {
      enabled,
      paginate,
      page,
      pageSize,
      minimum,
      categoryId,
      providerId,
      sku,
      name,
    } = req.query;
    if (!page) page = 1;
    if (!pageSize) pageSize = 12;

    /* -------------------------------------------------------------------------- */
    /*                                   FILTROS                                  */
    /* -------------------------------------------------------------------------- */

    filter = { companyId: user.company.id };

    /* ---------------------- FILTRO DE PRODUTO HABILITADO ---------------------- */

    if (enabled != "true" && enabled != "false") {
      return res.status(400).json({
        error: "O filtro enabled deve ser true ou false",
        info: { provided: enabled },
      });
    }

    /* -------------------- FILTRO CASO O ESTOQUE SEJA BAIXO -------------------- */

    if (minimum == "true") {
      filter.quantity = { [Op.lt]: Sequelize.col("minimum") };
    }

    /* ----------------------------- FILTROS DE NOME ---------------------------- */

    if (sku) {
      filter.sku = { [Op.substring]: sku };
    }

    if (name) {
      filter.name = { [Op.substring]: name };
    }

    /* -------------------------- FILTRO DE FORNECEDOR -------------------------- */

    providerWhere = {};
    if (providerId) {
      providerWhere.id = providerId;
    }

    /* -------------------------------------------------------------------------- */
    /*                            REQUISITANDO PRODUTOS                           */
    /* -------------------------------------------------------------------------- */

    switch (paginate) {
      case "true":
        Product.paginate({
          page,
          paginate: Number(pageSize),
          include: [
            { association: "providers", where: providerWhere },
            { association: "category" },
          ],
          where: filter,
        }).then((e) => {
          res.status(200).json(e);
        });
        break;

      default:
        Product.findAll({
          include: [
            { association: "providers", where: providerWhere },
            { association: "category" },
          ],
          where: filter,
        }).then((e) => {
          res.status(200).json(e);
        });

        break;
    }
  },
  async store(req, res) {
    const { user } = req;
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

    const company = user.company;

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
    const { user } = req;
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

    const product = await Product.update(
      { name, sku, categoryId, price, quantity, enabled },
      { where: { id: productId, companyId: user.company.id } }
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
    const { user } = req;
    let { productId } = req.params;
    productId = Number(productId);

    const product = await Product.findOne({
      productId,
      where: {
        companyId: user.company.id,
      },
    });

    return res.status(200).json(product);
  },
  async delete(req, res) {
    const { user } = req;
    let { productId } = req.params;
    productId = Number(productId);

    const product = await Product.findByPk(productId);

    if (!product) {
      res.status(400).json({
        error: "O produto informado não existe em nosso banco de dados",
      });
    }

    if (user.company.id !== product.companyId) {
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
