const User = require("../models/User");
const Provider = require("../models/Providers");

const { Op } = require("sequelize");

const Validations = require("../functions/Eval");

module.exports = {
  async index(req, res) {
    const { user } = req;
    let { products, personType, pageSize, page, paginate } = req.query;

    let includes = [];

    if (products === "true") {
      includes.push({ association: "products" });
    }

    let where = { companyId: user.company.id };

    if (personType) {
      where.personType = { [Op.iLike]: personType };
    }

    switch (paginate) {
      case "true":
        await Provider.paginate({
          where: where,
          paginate: Number(pageSize),
          page: Number(page),
          include: includes,
        })
          .then((providers) => {
            return res.status(200).json(providers);
          })
          .catch((error) => {
            return res.status(400).json({
              error: "Houve um erro ao requisitar os fornecedores",
              info: error,
            });
          });
        break;

      default:
        await Provider.findAll({
          where: where,
          include: includes,
        })
          .then((providers) => {
            return res.status(200).json(providers);
          })
          .catch((error) => {
            return res.status(400).json({
              error: "Houve um erro ao requisitar os fornecedores",
              info: error,
            });
          });
        break;
    }
  },
  async show(req, res) {
    const { user } = req;
    let { id } = req.params;

    const provider = await Provider.findOne({
      where: { id, companyId: user.company.id },
      include: [{ association: "products" }],
    });

    return res.status(400).json(provider);
  },
  async store(req, res) {
    const { user } = req;
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
      email,
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
        email,
      });
      return res.status(200).json(newProvider);
    } catch (e) {
      return res
        .status(400)
        .json({ error: "Houve um erro no cadastro do fornecedor!" });
    }
  },
  async update(req, res) {
    const { user } = req;
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
      email,
    } = req.body;

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
        email,
      },
      {
        where: { companyId: user.company.id, id },
      }
    );

    return res.json(
      await Provider.findOne({ where: { id, companyId: user.company.id } })
    );
  },
  async delete(req, res) {},
};
