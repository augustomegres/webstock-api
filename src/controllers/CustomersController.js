const User = require("../models/User");
const Company = require("../models/Company");
const Customer = require("../models/Customer");
const { Op } = require("sequelize");

module.exports = {
  async show(req, res) {
    const { user } = req;
    const { id } = req.params;

    const customer = await Customer.findOne({
      where: { id: id, companyId: user.company.id },
    });

    return res.status(200).json(customer);
  },
  async update(req, res) {
    const { user } = req;
    const { id } = req.params;
    let {
      name,
      cpf,
      rg,
      email,
      phone,
      city,
      address,
      number,
      street,
    } = req.body;

    await Customer.update(
      {
        name,
        cpf,
        rg,
        email,
        phone,
        city,
        address,
        number,
        street,
      },
      { where: { id, companyId: user.company.id } }
    )
      .then((response) => {
        return res
          .status(200)
          .json({ success: "Os dados do cliente foram atualizados." });
      })
      .catch((err) => {
        res.status(400).json({
          error: "Houve um erro inesperado ao atualizar os dados.",
          err,
        });
      });
  },
  async index(req, res) {
    const { user } = req;
    let { paginate, page, limit, name } = req.query;

    if (!page) page = 1;
    if (!limit) limit = 12;

    where = { companyId: user.company.id };
    if (name) where.name = { [Op.like]: "%" + name + "%" };

    if (paginate == "true") {
      const customers = await Customer.paginate({
        where,
        include: { association: "company" },

        page: Number(page),
        paginate: Number(limit),
      });

      return res.status(200).json(customers);
    } else {
      const customers = await Customer.findAll({
        where,
        include: { association: "company" },
      });

      return res.status(200).json(customers);
    }
  },
  async store(req, res) {
    const { user } = req;
    const {
      name,
      cpf,
      rg,
      email,
      phone,
      city,
      address,
      number,
      street,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "O nome deve ser informado!" });
    }

    try {
      await Customer.create({
        companyId: user.company.id,
        name,
        cpf,
        rg,
        email,
        phone,
        city,
        address,
        number,
        street,
      });

      return res
        .status(200)
        .json({ success: "Cliente cadastrado com sucesso!" });
    } catch (e) {
      return res
        .status(400)
        .json({ error: "Não foi possível inserir o registro" });
    }
  },
  async delete(req, res) {
    const { user } = req;
    const { id } = req.params;

    try {
      await Customer.destroy({
        where: { id: id, companyId: user.company.id },
      });

      return res.status(200).json({ sucess: "Cliente deletado com sucesso!" });
    } catch {
      return res
        .status(400)
        .json({ error: "Houveu um erro ao tentar deletar este cliente" });
    }
  },
};
