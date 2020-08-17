const Product = require("../models/Product");
const Provider = require("../models/Providers");
const ProductProviders = require("../models/ProductProviders");
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
      columnToSort,
      order,
    } = req.query;
    const { companyId } = req.params;

    if (!page) page = 1;
    page--;

    if (!pageSize) pageSize = 12;
    if (pageSize > 100) {
      return res
        .status(400)
        .json({ error: "O tamanho máximo da página é de 100 documentos." });
    }

    /* -------------------------------------------------------------------------- */
    /*                                  ORDENAÇÃO                                 */
    /* -------------------------------------------------------------------------- */

    if (columnToSort && order) {
      if (columnToSort == "category") {
        order = [["category", "name", order]];
      } else {
        order = [[columnToSort, order]];
      }
    } else {
      order = null;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   FILTROS                                  */
    /* -------------------------------------------------------------------------- */

    filter = { companyId: { [Op.eq]: companyId } };

    /* ---------------------- FILTRO DE PRODUTO HABILITADO ---------------------- */

    if (enabled == "true") {
      filter.enabled = { [Op.eq]: true };
    }

    /* -------------------- FILTRO CASO O ESTOQUE SEJA BAIXO -------------------- */

    if (minimum == "true") {
      filter.quantity = { [Op.lte]: Sequelize.col("minimum") };
    }

    /* ----------------------------- FILTROS DE NOME ---------------------------- */

    if (sku) {
      filter.sku = { [Op.substring]: sku };
    }

    if (name) {
      filter.name = { [Op.substring]: name };
    }

    /* -------------------------- FILTRO DE FORNECEDOR -------------------------- */

    let providerWhere;
    if (providerId) {
      providerWhere = {};
      providerWhere.id = { [Op.eq]: providerId };
    }

    /* --------------------------- FILTRO DE CATEGORIA -------------------------- */

    if (categoryId) {
      filter.categoryId = { [Op.eq]: categoryId };
    }

    /* -------------------------------------------------------------------------- */
    /*                            REQUISITANDO PRODUTOS                           */
    /* -------------------------------------------------------------------------- */

    const offset = Number(page) * Number(pageSize);
    const limit = Number(pageSize);

    switch (paginate) {
      case "true":
        Product.findAndCountAll({
          limit,
          offset,
          order,
          where: filter,
          include: [
            { association: "category" },
            { association: "providers", where: providerWhere },
          ],
        })
          .then((e) => {
            let data = {};
            data.docs = e.rows;

            data.total = e.count;
            data.pages = Math.ceil(e.count / limit);
            res.status(200).json(data);
          })
          .catch((e) => {
            res.status(400).json(e);
          });
        break;

      default:
        Product.findAll({
          order,
          include: [
            { association: "category" },
            { association: "providers", where: providerWhere },
          ],
          where: filter,
        })
          .then((e) => {
            res.status(200).json(e);
          })
          .catch((e) => {
            res.status(400).json(e);
          });

        break;
    }
  },
  async store(req, res) {
    const { user } = req;
    let {
      name,
      sku,
      categoryId,
      price,
      quantity,
      minimum,
      provider,
      enabled,
    } = req.body;

    const { companyId } = req.params;

    if (!minimum) {
      minimum = 0;
    }

    if (!quantity) {
      quantity = 0;
    }

    if (!enabled) {
      enabled = true;
    }

    if (!name || !price) {
      return res
        .status(400)
        .json({ error: "O preço e nome são obrigatórios!" });
    }

    let providersId = [];

    provider.map((provider) => {
      providersId.push(provider.id);
    });

    let _provider = [];
    _provider = await Provider.findAll({
      where: { id: providersId, companyId: companyId },
    });

    if (_provider.length != provider.length) {
      return res.status(400).json({ error: "O fornecedor é inválido" });
    }

    try {
      var product = await Product.create({
        companyId: companyId,
        name,
        sku,
        categoryId,
        price,
        minimum,
        quantity,
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
      minimum,
      provider,
    } = req.body;
    const { companyId } = req.params;

    let providersId = [];

    provider.map((provider) => {
      providersId.push(provider.id);
    });

    let _provider = [];
    _provider = await Provider.findAll({
      where: { id: providersId, companyId: companyId },
    });

    if (_provider.length != provider.length) {
      return res.status(400).json({ error: "O fornecedor é inválido" });
    }

    let { productId } = req.params;

    productId = Number(productId);

    try {
      await Product.update(
        { name, sku, categoryId, price, quantity, minimum, enabled },
        { where: { id: productId, companyId: companyId } }
      );

      let product = await Product.findOne({ where: { id: productId } });

      await ProductProviders.destroy({ where: { productId: productId } });
      product.addProvider(_provider);

      return res.status(200).json(product);
    } catch (e) {
      return res.status(400).json({ error: "Erro", info: e });
    }
  },
  async show(req, res) {
    const { user } = req;
    const { productId, companyId } = req.params;
    let { providers, category } = req.query;

    let associations = [];

    if (providers) {
      associations.push({ association: "providers" });
    }

    if (category) {
      associations.push({ association: "category" });
    }

    await Product.findOne({
      include: associations,
      where: {
        id: productId,
        companyId: companyId,
      },
    })
      .then((product) => {
        if (!product) {
          throw { message: "Produto não encontrado." };
        }
        return res.status(200).json(product);
      })
      .catch((e) => {
        return res.status(400).json({
          error: "Não foi possível requisitar o produto solicitado.",
          info: e.message,
        });
      });
  },
  async delete(req, res) {
    const { productId } = req.params;
    const { companyId } = req.params;

    let product = await Product.findOne({
      where: { id: { [Op.eq]: productId }, companyId: { [Op.eq]: companyId } },
    });

    if (!product) {
      return res.status(400).json({ error: "O produto informado é inválido" });
    }

    if (!product.enabled) {
      return res.status(400).json({ error: "O produto informado é inválido" });
    }

    await Product.update(
      { enabled: false },
      {
        where: { id: { [Op.eq]: productId } },
        companyId: { [Op.eq]: companyId },
      }
    )
      .then((product) => {
        return res.status(200).json({ success: "O produto foi removido." });
      })
      .catch((error) => {
        return res
          .status(400)
          .json({ success: "Houve um erro ao remover o produto." });
      });
  },
};
