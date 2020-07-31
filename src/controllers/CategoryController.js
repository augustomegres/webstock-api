const Category = require("../models/Category");
const User = require("../models/User");

const { Op } = require("sequelize");

module.exports = {
  async show(req, res) {
    const { user } = req;
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id, companyId: user.company.id },
    });

    if (!category) {
      return res.status(400).json({ error: "Esta categoria não existe!" });
    }

    return res.status(200).json(category);
  },
  async index(req, res) {
    const { user } = req;
    let { page, limit, name } = req.query;

    page = Number(page);
    limit = Number(limit);

    if (!page) {
      page = 1;
    }

    if (!limit) {
      limit = 15;
    }

    const where = { companyId: { [Op.eq]: user.company.id } };

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }

    const categories = await Category.paginate({
      page,
      paginate: limit,
      where,
    });

    categories.page = 1;

    return res.json(categories);
  },
  async store(req, res) {
    const { user } = req;
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
        companyId: user.company.id,
      });

      return res.json(category);
    } catch (e) {
      return res.status(400).json({
        error: "Houve um erro inesperado ao tentar cadastrar a categoria!", e
      });
    }
  },
  async update(req, res) {
    const { user } = req;
    const { id } = req.params;
    let { name, enabled, description } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "O id não foi informado!",
      });
    }

    const category = await Category.findOne({
      where: { id, companyId: user.company.id },
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
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id, companyId: user.company.id },
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

    await Category.destroy({ where: { id, companyId: user.company.id } })
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
