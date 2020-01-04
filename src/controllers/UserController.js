const bcrypt = require("bcryptjs");
const Yup = require("yup");
const { Op } = require("sequelize");

const User = require("../models/User");
const Company = require("../models/Company");

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

      await Company.create({
        name: company,
        ownerId: user.id
      });

      Mail.sendWelcomeMsg(email);
    } catch (e) {
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
    phone = phone.replace(/[^a-zA-Z0-9 ]/g, "");
    cpf = cpf.replace(/[^a-zA-Z0-9 ]/g, "");
    cnpj = cnpj.replace(/[^a-zA-Z0-9 ]/g, "");
    date_of_birth = new Date(date_of_birth);

    //OS DADOS RECEBIDOS ESTÃO SENDO TRATADOS PELA BIBLIOTECA "YUP"
    const schema = Yup.object().shape({
      name: Yup.string()
        .min(5)
        .max(255),
      phone: Yup.string()
        .min(11)
        .max(11),
      date_of_birth: Yup.date(),
      cpf: Yup.string()
        .max(11)
        .min(11),
      companyName: Yup.string()
        .min(2)
        .max(255),
      cnpj: Yup.string()
        .min(14)
        .max(14),
      city: Yup.string()
        .min(3)
        .max(255),
      address: Yup.string()
        .min(3)
        .max(255),
      street: Yup.string()
        .min(3)
        .max(255),
      number: Yup.string()
        .min(3)
        .max(255)
    });

    /** VERIFICANDO SE OS DADOS RECEBIDOS SÃO VÁLIDOS */
    const isValid = await schema.isValid({
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
    });

    if (!isValid) {
      return res.status(400).json({ error: "Você enviou dados inválidos" });
    }

    if (userId !== id) {
      return res
        .status(400)
        .json({ error: "Você só pode editar o próprio perfil!" });
    }

    try {
      await User.update(
        { name, email, phone, date_of_birth, cpf },
        { where: { id } }
      );

      await Company.update(
        { companyName, cnpj, city, address, street, number },
        { where: { ownerId: id } }
      );

      return res.status(200).json({
        success: `Os dados foram atualizados com sucesso!`
      });
    } catch (e) {
      return res
        .status(400)
        .json({ error: "Houve um erro ao atualizar suas informações" });
    }
  }
};
