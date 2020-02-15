const User = require("../models/User");
const Provider = require("../models/Providers");

const { Op } = require("sequelize");

const Validations = require("../functions/Validations");

module.exports = {
  async index(req, res) {
    const { userId } = req;
    let { products, personType } = req.query;

    const user = await User.findByPk(userId, {
      include: [{ association: "company" }],
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires"
        ]
      }
    });

    let includes = [];

    if (products === "true") {
      includes.push({ association: "products" });
    }

    let where = { companyId: user.company.id };

    if (personType) {
      where.personType = { [Op.iLike]: personType };
    }

    const providers = await Provider.findAll({
      where: where,
      include: includes
    });

    return res.status(200).json(providers);
  },
  async show(req, res) {
    const { userId } = req;
    let { id } = req.params;

    const user = await User.findByPk(userId, {
      include: [{ association: "company" }],
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires"
        ]
      }
    });

    const provider = await Provider.findOne({
      where: { id, companyId: user.company.id },
      include: [{ association: "products" }]
    });

    return res.status(400).json(provider);
  },
  async store(req, res) {
    const { userId } = req;
    let {
      name,
      personType,
      companyName,
      cpf,
      rg,
      cnpj,
      stateRegistration,
      municipalRegistration,
      cep,
      address,
      number,
      street,
      city,
      commercialPhone,
      privatePhone,
      email
    } = req.body;

    /**
     * VALIDAÇÕES
     */

    //CPF
    if (cpf) cpf = Validations.cpf(cpf);
    if (cpf) {
      if (cpf.error) return res.status(400).json(cpf);
    }
    //CNPJ
    if (cnpj) cnpj = Validations.cnpj(cnpj);

    if (cnpj) {
      if (cnpj.error) return res.status(400).json(cnpj);
    }

    //RG

    //STATEREGISTRATION

    //MUNICIPALREGISTRATION

    //CEP

    //PHONE

    //EMAIL

    const user = await User.findByPk(userId, {
      include: [{ association: "company" }],
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires"
        ]
      }
    });

    try {
      const newProvider = await Provider.create({
        companyId: user.company.id,
        name,
        personType,
        companyName,
        cpf,
        rg,
        cnpj,
        stateRegistration,
        municipalRegistration,
        cep,
        address,
        number,
        street,
        city,
        commercialPhone,
        privatePhone,
        email
      });
      return res.status(200).json(newProvider);
    } catch (e) {
      return res
        .status(400)
        .json({ error: "Houve um erro no cadastro do fornecedor!" });
    }
  },
  async update(req, res) {
    const { userId } = req;
    const { id } = req.params;
    let {
      name,
      personType,
      companyName,
      cpf,
      rg,
      cnpj,
      stateRegistration,
      municipalRegistration,
      cep,
      address,
      number,
      street,
      city,
      commercialPhone,
      privatePhone,
      email
    } = req.body;

    const user = await User.findByPk(userId, {
      include: [{ association: "company" }],
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires"
        ]
      }
    });

    const provider = await Provider.update(
      {
        name,
        personType,
        companyName,
        cpf,
        rg,
        cnpj,
        stateRegistration,
        municipalRegistration,
        cep,
        address,
        number,
        street,
        city,
        commercialPhone,
        privatePhone,
        email
      },
      {
        where: { companyId: user.company.id, id }
      }
    );

    return res.json(
      await Provider.findOne({ where: { id, companyId: user.company.id } })
    );
  },
  async delete(req, res) {}
};
