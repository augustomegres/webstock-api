const Category = require("../models/Category");
const User = require("../models/User");

const { Op } = require("sequelize");
const { Sequelize } = require("sequelize");

module.exports = {
  async show(req, res) {
    const { user } = req;
    const { id, companyId } = req.params;

    const category = await Category.findOne({
      where: { id, companyId: companyId },
    });

    if (!category) {
      return res.status(400).json({ error: "Esta categoria não existe!" });
    }

    return res.status(200).json(category);
  },
  async index(req, res) {
    const { user } = req;
    const { companyId } = req.params;
    let { page, pageSize, name, order, columnToSort } = req.query;

    page = Number(page);
    pageSize = Number(pageSize);
    if (!pageSize) pageSize = 12;
    if (!page) page = 1;

    page--;

    if (columnToSort && order) {
      order = [[columnToSort, order]];
    } else {
      order = null;
    }

    const where = { companyId: { [Op.eq]: companyId } };

    if (name) {
      where.name = { [Op.substring]: name };
    }

    const offset = Number(page) * Number(pageSize);
    const limit = Number(pageSize);

    await Category.findAndCountAll({
      offset,
      limit,
      order,
      where,
    })
      .then((categories) => {
        let data = {};
        data.docs = categories.rows;

        data.total = categories.count;
        data.pages = Math.ceil(categories.count / limit);

        return res.status(200).json(data);
      })
      .catch((error) => {
        return res.status(400).json({
          error: "Houve um erro ao requisitar as categorias.",
          info: error,
        });
      });
  },
  async store(req, res) {
    const { user } = req;
    const { companyId } = req.params;
    let { name, description, enabled } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ error: "O nome da categoria deve ser informado!" });
    }

    if (description && description.length > 500) {
      return res
        .status(400)
        .json({ error: "O valor máximo da descrição é de 500 caracteres!" });
    }

    try {
      const category = await Category.create({
        name,
        enabled,
        description,
        companyId: companyId,
      });

      return res.json(category);
    } catch (e) {
      return res.status(400).json({
        error: "Houve um erro inesperado ao tentar cadastrar a categoria!",
        e,
      });
    }
  },
  async update(req, res) {
    const { user } = req;
    const { id, companyId } = req.params;
    let { name, enabled, description } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "O id não foi informado!",
      });
    }

    const category = await Category.findOne({
      where: { id, companyId: companyId },
    });

    if (!category) {
      return res
        .status(400)
        .json({ error: "A categoria informada não existe!" });
    }

    try {
      await Category.update({ name, enabled, description }, { where: { id } });
      return res
        .status(200)
        .json({ success: "Categoria atualizada com sucesso!" });
    } catch (e) {
      return res
        .status(400)
        .json({ error: "Houve um erro ao atualizar a categoria!" });
    }
  },
  async delete(req, res) {
    const { user } = req;
    const { id, companyId } = req.params;

    const category = await Category.findOne({
      where: { id, companyId: companyId },
      include: [{ association: "products" }],
    });

    if (!category) {
      return res
        .status(400)
        .json({ error: "A categoria informada não existe!" });
    }

    let category_products = category.products;

    if (category_products.length) {
      return res
        .status(400)
        .json({ error: "Esta categoria contém produtos cadastrados!" });
    }

    await Category.destroy({ where: { id, companyId: companyId } })
      .then(() => {
        return res
          .status(200)
          .json({ success: "A categoria foi deletada com sucesso!" });
      })
      .catch(() => {
        return res
          .status(400)
          .json({ error: "Houve um erro ao deletar a categoria!" });
      });
  },
};
