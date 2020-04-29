const Category = require("../models/Category");
const User = require("../models/User");

module.exports = {
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
    let { name, enabled } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ error: "O nome da categoria deve ser informado!" });
    }

    if (enabled == 1 || enabled == "1" || enabled == "true") {
      enabled = true;
    } else if (enabled == 0 || enabled == "0" || enabled == "false") {
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
        companyId: user.company.id,
      });

      return res.json(category);
    } catch (e) {
      return res.json({
        error: "Houve um erro inesperado ao tentar cadastrar a categoria!",
      });
    }
  },
};
