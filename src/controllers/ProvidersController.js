const User = require("../models/User");
const Provider = require("../models/Providers");

const Validations = require("../functions/Validations");

module.exports = {
  async index(req, res) {
    const { userId } = req;

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

    const providers = await Provider.findAll({
      where: { companyId: user.company.id },
      include: [{ association: "products" }]
    });

    return res.status(200).json(providers);
  },
  async show(req, res) {},
  async store(req, res) {
    const { userId } = req;
    let {
      //companyId,
      //productIds,
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
    if (cpf.error) return res.status(400).json(cpf);

    //CNPJ
    if (cnpj) cnpj = Validations.cnpj(cnpj);
    if (cnpj.error) return res.status(400).json(cnpj);

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
        productIds: [],
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

    const prod = [1, 2];

    const provider = await Provider.update(
      { productIds: prod },
      {
        where: { companyId: user.company.id, id }
      }
    );

    return res.json(provider);
  },
  async delete(req, res) {}
};
