const bcrypt = require("bcryptjs");
const Yup = require("yup");
const { Op } = require("sequelize");

const User = require("../models/User");
const Company = require("../models/Company");
const Account = require("../models/Account");

const Mail = require("../services/sendgrid");

module.exports = {
  async show(req, res) {
    let { id } = req.params;
    const { userId } = req;
    id = Number(id);

    const user = await User.findByPk(userId, {
      include: [{ association: "company" }]
    });

    if (!user.isAdmin) {
      if (userId !== id) {
        return res.status(400).json({
          error: "Você não pode visualizar um perfil que não é seu"
        });
      }
    }

    if (id === userId) {
      return res.status(200).json(user);
    } else {
      return res.json(
        await User.findByPk(id, { include: [{ association: "company" }] })
      );
    }
  },

  async store(req, res) {
    /** RECEBENDO TODOS OS DADOS DA APLICAÇÃO */
    const { name, email, phone, company, password } = req.body;

    /** TRATANDO TODOS OS DADOS DA APLICAÇÃO */
    //OS DADOS RECEBIDOS ESTÃO SENDO TRATADOS PELA BIBLIOTECA "YUP"
    const schema = Yup.object().shape({
      name: Yup.string()
        .required()
        .min(5)
        .max(255),
      email: Yup.string()
        .email()
        .required(),
      phone: Yup.string()
        .min(10)
        .max(20),
      company: Yup.string()
        .required()
        .min(2)
        .max(255),
      password: Yup.string()
        .required()
        .min(6)
    });

    /** VERIFICANDO SE OS DADOS RECEBIDOS SÃO VÁLIDOS */
    const isValid = await schema.isValid({
      name,
      email,
      phone,
      company,
      password
    });

    /** CASO A VERIFICAÇÃO FALHE */
    if (!isValid) {
      return res
        .status(400)
        .json({ error: "Por favor, verifique os dados enviados!" });
    }

    /** VERIFICANDO SE O USUÁRIO EXISTE */
    const userExists = await User.findOne({
      where: {
        [Op.or]: [{ email }]
      }
    });

    /** SE EXISTIR RETORNA UM ERRO */
    if (userExists) {
      return res.status(400).json({
        error: "O email informado ja está cadastrado em nosso banco de dados"
      });
    }

    /** CRIPTOGRAFANDO SENHA */
    const passwordHash = await bcrypt.hash(password, 10);

    /** CRIANDO O USUARIO NO BANCO DE DADOS */
    try {
      var user = await User.create({
        name,
        email,
        phone,
        passwordHash
      });

      const newCompany = await Company.create({
        name: company,
        ownerId: user.id
      });

      await Account.create({
        name: "Dinheiro em caixa",
        accountType: "Caixa",
        companyId: newCompany.id
      });

      Mail.sendWelcomeMsg(email);
    } catch (e) {
      await User.destroy({ where: { id: id } });
      return res.status(400).json({ error: e });
    }
    return res.status(200).json(user);
  },

  async update(req, res) {
    let { id } = req.params;
    let {
      name,
      phone,
      date_of_birth,
      cpf,
      companyName,
      cnpj,
      city,
      address,
      street,
      number
    } = req.body;

    const { userId } = req;
    id = Number(id);

    if (userId !== id) {
      return res
        .status(400)
        .json({ error: "Você só pode editar o próprio perfil!" });
    }

    if (phone) phone = phone.replace(/[^0-9]/g, "");
    if (cpf) cpf = cpf.replace(/[^0-9]/g, "");
    if (cnpj) cnpj = cnpj.replace(/[^0-9]/g, "");
    if (date_of_birth) date_of_birth = new Date(date_of_birth);
    if (/[^a-z éáíóúçàèìòùâêîôû]/gi.test(name)) {
      return res
        .status(400)
        .json({ error: "O nome deve conter apenas letras e espaços" });
    }

    if (/[^a-z éáíóúçàèìòùâêîôû.-_]/gi.test(companyName)) {
      return res.status(400).json({
        error: "O nome da empresa deve conter apenas letras e espaços"
      });
    }

    //VALIDAÇÕES
    const schema = Yup.object().shape({
      name: Yup.string()
        .min(5)
        .max(255),
      phone: Yup.string()
        .min(10)
        .max(11),
      companyName: Yup.string()
        .min(2)
        .max(255),
      cpf: Yup.string().length(11),
      date_of_birth: Yup.date(),
      cnpj: Yup.string().length(14),
      city: Yup.string()
        .min(2)
        .max(100),
      address: Yup.string()
        .min(2)
        .max(255),
      street: Yup.string()
        .min(2)
        .max(255),
      number: Yup.string()
        .min(1)
        .max(24)
    });

    /** VERIFICANDO SE OS DADOS RECEBIDOS SÃO VÁLIDOS */
    const isValid = await schema.isValid({
      name,
      phone,
      companyName,
      cpf,
      date_of_birth,
      cnpj,
      city,
      address,
      street,
      number
    });

    if (!isValid) {
      return res.status(400).json({
        error: "Houve um erro nos dados enviados, verifique e tente novamente"
      });
    }

    //VALIDANDO DADOS DE USUARIO
    if (name || phone || date_of_birth || cpf) {
      var user = {};

      if (name) user.name = name.replace(/\s\s+/g, " "); //ESTE REPLACE REMOVE ESPAÇOS DUPLOS
      if (phone) user.phone = phone;
      if (date_of_birth) user.date_of_birth = date_of_birth;
      if (cpf) user.cpf = cpf;
    }

    //VALIDANDO DADOS DE EMPRESA
    if (companyName || cnpj || city || address || street || number) {
      var company = {};

      if (cnpj) company.cnpj = cnpj;
      if (companyName) company.name = companyName.replace(/\s\s+/g, " ");
      if (city) company.city = city.replace(/\s\s+/g, " "); //ESTE REPLACE REMOVE ESPAÇOS DUPLOS
      if (address) company.address = address.replace(/\s\s+/g, " ");
      if (street) company.street = street.replace(/\s\s+/g, " ");
      if (number) company.number = number.replace(/\s\s+/g, " ");
    }

    try {
      if (user) {
        await User.update(user, { where: { id } });
      }

      if (company) {
        await Company.update(company, { where: { ownerId: id } });
      }

      return res.status(200).json({
        success: `Os dados foram atualizados com sucesso!`
      });
    } catch (e) {
      return res.status(400).json({
        error: "Houve um erro ao atualizar suas informações!",
        e: e
      });
    }
  }
};
