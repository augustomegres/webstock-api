const User = require("../models/User");
const Company = require("../models/Company");
const Customer = require("../models/Customer");

module.exports = {
  async index(req, res) {
    const { userId } = req;

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: [
          "passwordHash",
          "isAdmin",
          "recoverPasswordToken",
          "recoverPasswordTokenExpires"
        ]
      },
      include: { association: "company" }
    });

    const company = await Company.findByPk(user.company.id, {
      include: { association: "customers" }
    });

    return res.status(200).json(company);
  },
  async store(req, res) {
    const { userId } = req;
    const {
      name,
      cpf,
      rg,
      email,
      phone,
      city,
      address,
      number,
      street
    } = req.body;

    const user = await User.findByPk(userId, {
      attributes: {
        exclude: [
          "passwordHash",
          "isAdmin",
          "recoverPasswordToken",
          "recoverPasswordTokenExpires"
        ]
      },
      include: { association: "company" }
    });

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
        street
      });

      return res
        .status(400)
        .json({ success: "Cliente cadastrado com sucesso!" });
    } catch (e) {
      return res
        .status(400)
        .json({ error: "Não foi possível inserir o registro" });
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
          "recoverPasswordTokenExpires"
        ]
      },
      include: { association: "company" }
    });

    try {
      await Customer.destroy({
        where: { id: id, companyId: user.company.id }
      });

      return res.status(200).json({ sucess: "Cliente deletado com sucesso!" });
    } catch {
      return res
        .status(400)
        .json({ error: "Houveu um erro ao tentar deletar este cliente" });
    }
  }
};