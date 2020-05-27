const Category = require("../models/Category");
const User = require("../models/User");

const { Op } = require("sequelize");

module.exports = {
  async show(req, res) {
    const { userId } = req;
    const { id } = req.params;

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: [
          "passwordHash",
          "isAdmin",
          "recoverPasswordToken",
          "recoverPasswordTokenExpires",
        ],
      },
      include: { association: "company" },
    });

    const category = await Category.findOne({
      where: { id, companyId: user.company.id },
    });

    return res.status(200).json(category);
  },
  async index(req, res) {
    const { userId } = req;
    let { page, limit, name } = req.query;

    page = Number(page);
    limit = Number(limit);

    if (!page) {
      page = 1;
    }

    if (!limit) {
      limit = 15;
    }

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: [
          "passwordHash",
          "isAdmin",
          "recoverPasswordToken",
          "recoverPasswordTokenExpires",
        ],
      },
      include: { association: "company" },
    });

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
    const { userId } = req;
    let { name, description, enabled } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ error: "O nome da categoria deve ser informado!" });
    }

    if (description.length > 500) {
      return res
        .status(400)
        .json({ error: "O valor máximo da descrição é de 500 caracteres!" });
    }

    if (
      enabled == 1 ||
      enabled == "1" ||
      enabled == "true" ||
      enabled == undefined ||
      enabled == "" ||
      enabled == true
    ) {
      enabled = true;
    } else if (
      enabled == 0 ||
      enabled == "0" ||
      enabled == "false" ||
      enabled == false
    ) {
      enabled = false;
    }

    if (typeof enabled !== "boolean") {
      return res
        .status(400)
        .json({ error: "A opção de habilitado deve ser um booleano!" });
    }

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: [
          "passwordHash",
          "isAdmin",
          "recoverPasswordToken",
          "recoverPasswordTokenExpires",
        ],
      },
      include: { association: "company" },
    });

    try {
      const category = await Category.create({
        name,
        enabled,
        description,
        companyId: user.company.id,
      });

      return res.json(category);
    } catch (e) {
      return res.json({
        error: "Houve um erro inesperado ao tentar cadastrar a categoria!",
      });
    }
  },
  async update(req, res) {
    const { userId } = req;
    const { id } = req.params;
    let { name, enabled, description } = req.body;

    if ((!name && enabled === undefined) || enabled === "") {
      return res.status(400).json({
        error: "Os dados para atualização não foram enviados",
      });
    }

    if (!name) {
      return res.status(400).json({ error: "O nome não foi informado!" });
    }

    if (!id) {
      return res.status(400).json({
        error: "O id não foi informado!",
      });
    }

    if (enabled == 1 || enabled == "1" || enabled == "true") {
      enabled = true;
    } else if (enabled == 0 || enabled == "0" || enabled == "false") {
      enabled = false;
    }

    if (enabled !== undefined) {
      if (typeof enabled !== "boolean") {
        return res
          .status(400)
          .json({ error: "A opção de habilitado deve ser um booleano!" });
      }
    }

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: [
          "passwordHash",
          "isAdmin",
          "recoverPasswordToken",
          "recoverPasswordTokenExpires",
        ],
      },
      include: { association: "company" },
    });

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
    const { userId } = req;
    const { id } = req.params;

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: [
          "passwordHash",
          "isAdmin",
          "recoverPasswordToken",
          "recoverPasswordTokenExpires",
        ],
      },
      include: { association: "company" },
    });

    const category = await Category.findOne({
      where: { id, companyId: user.company.id },
    });

    if (!category) {
      return res
        .status(400)
        .json({ error: "A categoria informada não existe!" });
    }

    try {
      await Category.destroy({ where: { id, companyId: user.company.id } });

      return res
        .status(200)
        .json({ success: "A categoria foi deletada com sucesso!" });
    } catch (e) {
      return res
        .status(400)
        .json({ error: "Houve um erro ao deletar a categoria!" });
    }
  },
};
