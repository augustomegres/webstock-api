const bcrypt = require("bcryptjs");
const Yup = require("yup");
const { Op } = require("sequelize");

const User = require("../models/User");
const Company = require("../models/Company");

const Mail = require("../services/email");

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
    const {
      name,
      email,
      cpf,
      phone,
      company,
      cnpj,
      password,
      confirmPassword
    } = req.body;

    /** TRATANDO TODOS OS DADOS DA APLICAÇÃO */
    //OS DADOS RECEBIDOS ESTÃO SENDO TRATADOS PELA BIBLIOTECA "YUP"
    const schema = Yup.object().shape({
      name: Yup.string()
        .required()
        .min(5)
        .max(80),
      email: Yup.string()
        .email()
        .required(),
      cpf: Yup.string()
        .required()
        .length(14),
      phone: Yup.string()
        .required()
        .min(10)
        .max(20),
      company: Yup.string()
        .required()
        .min(2)
        .max(80),
      cnpj: Yup.string().length(18),
      password: Yup.string()
        .required()
        .min(6),
      confirmPassword: Yup.string().when("password", (password, field) =>
        password ? field.required().oneOf([Yup.ref("password")]) : field
      )
    });

    /** VERIFICANDO SE OS DADOS RECEBIDOS SÃO VÁLIDOS */
    const isValid = await schema.isValid({
      name,
      email,
      cpf,
      phone,
      company,
      password,
      confirmPassword
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
        [Op.or]: [{ email }, { cpf }]
      }
    });

    /** SE EXISTIR RETORNA UM ERRO */
    if (userExists) {
      if (userExists.email === email) {
        return res.status(400).json({
          error: "O email informado ja está cadastrado em nosso banco de dados"
        });
      }

      if (userExists.cpf === cpf) {
        return res.status(400).json({
          error: "O cpf informado ja está cadastrado em nosso banco de dados"
        });
      }
    }

    /** CRIPTOGRAFANDO SENHA */
    const passwordHash = await bcrypt.hash(password, 10);

    /** CRIANDO O USUARIO NO BANCO DE DADOS */
    try {
      var user = await User.create({
        name,
        email,
        cpf,
        phone,
        passwordHash
      });

      await Company.create({
        name: company,
        cnpj,
        ownerId: user.id
      });

      Mail.sendWelcomeMsg(email);

      /** VERIFICANDO SE O USUARIO IRÁ CADASTRAR A EMPRESA */
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    return res.status(200).json(user);
  },

  async update(req, res) {
    let { id } = req.params;
    const { name, email, phone } = req.body;
    const { userId } = req;
    id = Number(id);

    if (userId !== id) {
      return res
        .status(400)
        .json({ error: "Você só pode editar o próprio perfil!" });
    }

    await User.update({ name, email, phone }, { where: { id } });

    return res.status(200).json({
      success: `O usuário com o id ${id} foi atualizado com sucesso!`,
      name,
      email,
      phone
    });
  }
};
