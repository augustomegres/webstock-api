const Company = require("../models/Company");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const {
  validateEmail,
  validateName,
  validateDate,
} = require("../functions/validations");

module.exports = {
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

    /* ------------ VERIFICANDO SE O USUARIO LOGADO É DONO DA EMPRESA ----------- */

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
};
