const bcrypt = require("bcryptjs");
const Yup = require("yup");
const { Op } = require("sequelize");
const validations = require("../functions/Eval");
const { cpf: cpfEval } = require("essential-validation");
const User = require("../models/User");
const Company = require("../models/Company");
const Account = require("../models/Account");
const Mail = require("../services/sendgrid");

module.exports = {
  async show(req, res) {
    let { id } = req.params;
    const { user } = req;
    id = Number(id);

    if (!user.isAdmin) {
      if (user !== id) {
        return res.status(400).json({
          error: "Você não pode visualizar um perfil que não é seu",
        });
      }
    }

    if (id === user) {
      return res.status(200).json(user);
    } else {
      return res.json(
        await User.findByPk(id, {
          include: [
            {
              association: "company",
            },
          ],
          attributes: {
            exclude: [
              "passwordHash",
              "recoverPasswordToken",
              "recoverPasswordTokenExpires",
            ],
          },
        })
      );
    }
  },

  async store(req, res) {
    /* ------------------ RECEBENDO TODOS OS DADOS DA APLICAÇÃO ----------------- */

    const { name, email, phone, company, password } = req.body;

    /* ------------------ TRATANDO TODOS OS DADOS DA APLICAÇÃO ------------------ */

    /* ------ OS DADOS RECEBIDOS ESTÃO SENDO TRATADOS PELA BIBLIOTECA "YUP" ----- */

    const schema = Yup.object().shape({
      name: Yup.string().required().min(5).max(255),
      email: Yup.string().email().required(),
      phone: Yup.string().min(10).max(20),
      company: Yup.string().required().min(2).max(255),
      password: Yup.string().required().min(6),
    });

    /* -------------- VERIFICANDO SE OS DADOS RECEBIDOS SÃO VÁLIDOS ------------- */

    const isValid = await schema.isValid({
      name,
      email,
      phone,
      company,
      password,
    });

    /* ------------------------ CASO A VERIFICAÇÃO FALHE ------------------------ */

    if (!isValid) {
      return res.status(400).json({
        error: "Por favor, verifique os dados enviados!",
      });
    }

    /* --------------------- VERIFICANDO SE O USUÁRIO EXISTE -------------------- */

    const userExists = await User.findOne({
      where: {
        [Op.or]: [
          {
            email,
          },
        ],
      },
    });

    /* ----------------------- SE EXISTIR RETORNA UM ERRO ----------------------- */

    if (userExists) {
      return res.status(400).json({
        error: "O email informado ja está cadastrado em nosso banco de dados",
      });
    }

    /* -------------------------- CRIPTOGRAFANDO SENHA -------------------------- */

    const passwordHash = await bcrypt.hash(password, 10);

    /* ------------------- CRIANDO O USUÁRIO NO BANCO DE DADOS ------------------ */

    try {
      var user = await User.create({
        name,
        email,
        phone,
        passwordHash,
        type: "user",
      });

      const newCompany = await Company.create({
        name: company,
        ownerId: user.id,
      });

      await Account.create({
        name: "Caixa",
        accountType: "Caixa",
        main: true,
        companyId: newCompany.id,
      });

      Mail.sendWelcomeMsg(email);
    } catch (e) {
      await User.destroy({
        where: {
          id: user.id,
        },
      });
      return res.status(400).json({
        error: e,
      });
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
      number,
    } = req.body;

    const { user } = req;
    id = Number(id);

    if (user.id !== id) {
      return res.status(400).json({
        error: "Você só pode editar o próprio perfil!",
      });
    }

    /* -------------------------------------------------------------------------- */
    /*                        VALIDANDO OS DADOS DO USUÁRIO                       */
    /* -------------------------------------------------------------------------- */

    /* ---------------------------------- NOME ---------------------------------- */

    if (name) name = name.replace(/\s\s+/g, " "); //ESTE REPLACE REMOVE ESPAÇOS DUPLOS
    if (/[^a-z ãẽĩõũéáíóúçàèìòùâêîôû]/gi.test(name)) {
      return res.status(400).json({
        error: "O nome deve conter apenas letras e espaços",
      });
    }

    /* -------------------------------- TELEFONE -------------------------------- */

    if (phone) phone = phone.replace(/[^0-9]/g, "");

    /* ----------------------------------- CPF ---------------------------------- */

    if (cpf) {
      let validate = cpfEval.cpfWithPunctuation(cpf);
      if (validate.error) return res.status(400).json(validate.error);
    }

    /* --------------------------- DATA DE NASCIMENTO --------------------------- */

    if (date_of_birth) date_of_birth = new Date(date_of_birth);

    /* -------------------------------------------------------------------------- */
    /*                        VALIDANDO OS DADOS DA EMPRESA                       */
    /* -------------------------------------------------------------------------- */

    /* ----------------------------- NOME DA EMPRESA ---------------------------- */

    if (/[^a-z ãẽĩõũéáíóúçàèìòùâêîôû.-_]/gi.test(companyName)) {
      return res.status(400).json({
        error: "O nome da empresa deve conter apenas letras e espaços",
      });
    }
    if (companyName) companyName = companyName.replace(/\s\s+/g, " ");

    /* ---------------------------------- CNPJ ---------------------------------- */

    if (cnpj) {
      let validate = validations.cnpj(cnpj);
      if (validate.error) return res.status(400).json(validate.error);
    }

    /* --------------------------------- CIDADE --------------------------------- */

    if (city) city = city.replace(/\s\s+/g, " ");

    /* -------------------------------- ENDEREÇO -------------------------------- */

    if (address) address = address.replace(/\s\s+/g, " ");

    /* --------------------------------- BAIRRO --------------------------------- */

    if (street) street = street.replace(/\s\s+/g, " ");

    /* --------------------------------- NÚMERO --------------------------------- */

    if (number) number = number.replace(/\s\s+/g, " ");

    try {
      await User.update(
        { name, cpf, phone, date_of_birth },
        {
          where: {
            id,
          },
        }
      );

      await Company.update(
        { name: companyName, cnpj, city, street, address, number },
        {
          where: {
            id: user.company.id,
          },
        }
      );

      return res.status(200).json({
        success: `Os dados foram atualizados com sucesso!`,
      });
    } catch (e) {
      return res.status(400).json({
        error: "Houve um erro ao atualizar suas informações!",
        e: e,
      });
    }
  },
};
