const Company = require("../models/Company");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const {
  validateEmail,
  validateName,
  validateDate,
} = require("../functions/validations");

module.exports = {
  async index(req, res) {
    const { user } = req;

    let company = await Company.findOne({
      where: { id: user.company.id },
      include: [
        {
          association: "employee",
          attributes: {
            exclude: [
              "passwordHash",
              "recoverPasswordToken",
              "recoverPasswordTokenExpires",
            ],
          },
        },
      ],
    });

    return res.json(company);
  },
  async store(req, res) {
    const { user } = req;
    const { name, email, cpf, date_of_birth, phone, password } = req.body;
    let errors = [];
    let validate = null;

    /* -------------------------------------------------------------------------- */
    /*                        VALIDANDO OS DADOS RECEBIDOS                        */
    /* -------------------------------------------------------------------------- */

    /* ---------------------------------- NOME ---------------------------------- */

    validate = validateName(name);
    if (validate.error) {
      errors.push(validate);
    }

    /* ---------------------------------- EMAIL --------------------------------- */

    validate = validateEmail(email);
    if (validate.error) {
      errors.push(validate);
    }

    let emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ error: "O email ja está cadastrado!" });
    }

    /* --------------------------- DATA DE NASCIMENTO --------------------------- */

    validate = validateDate(date_of_birth, false);
    if (validate.error) {
      errors.push(validate);
    }

    if (errors.length) {
      return res.status(400).json({
        error: "Houveram erros no processamento da requisição",
        errors,
      });
    }

    /* ---------------------------- ENCRIPTANDO SENHA --------------------------- */

    let passwordHash = await bcrypt.hash(password, 10);

    /* ------------ VERIFICANDO SE O USUÁRIO LOGADO É DONO DA EMPRESA ----------- */

    let company = await Company.findOne({ where: { ownerId: user.id } });
    if (!company) {
      return res.status(400).json({
        error: "Apenas donos de empresas podem adicionar novos funcionários.",
      });
    }

    /* -------------------------------------------------------------------------- */
    /*                 CRIANDO E ADICIONANDO FUNCIONÁRIO A EMPRESA                */
    /* -------------------------------------------------------------------------- */

    User.create({
      name,
      email,
      cpf,
      date_of_birth,
      phone,
      passwordHash,
      type: "employee",
    })
      .then((newEmployee) => {
        company.addEmployee(newEmployee);
      })
      .then(() => {
        return res
          .status(200)
          .json({ success: "Funcionário cadastrado com sucesso!" });
      })
      .catch((e) => {
        return res.status(400).json(e);
      });
  },
  async delete(req, res) {
    const { user } = req;
    const { id } = req.params;

    if (user.id !== user.company.ownerId) {
      return res
        .status(400)
        .json({ error: "Você não é o proprietário dessa empresa." });
    }

    /* ----------------- REQUISITANDO INFORMAÇÕES DO FUNCIONÁRIO ---------------- */

    const employee = await User.findOne({
      where: { id },
      include: { association: "employee_company" },
    });

    /* ----------------------- VERIFICANDO SE É UM USUÁRIO ---------------------- */

    if (employee.type == "user") {
      return res
        .status(400)
        .json({ error: "Você não pode deletar um usuário." });
    }

    /* --------- VERIFICANDO O FUNCIONÁRIO PERTENCE A EMPRESA DO USUÁRIO -------- */

    if (employee.employee_company[0].id != user.company.id) {
      return res
        .status(400)
        .json({ error: "Este funcionário não pertence a sua empresa." });
    }

    /* -------------------------------------------------------------------------- */
    /*                            ATUALIZANDO O USUÁRIO                           */
    /* -------------------------------------------------------------------------- */

    await User.update({ enabled: false }, { where: { id } })
      .then((info) => {
        return res
          .status(200)
          .json({ success: "O usuário foi removido com sucesso.", info: info });
      })
      .catch((error) => {
        return res
          .status(400)
          .json({ error: "Houve um erro ao remover o usuário..", info: error });
      });
  },
};
