const User = require("../models/User");
const crypto = require("crypto");
const mail = require("../services/sendgrid");
const Yup = require("yup");
const bcrypt = require("bcryptjs");

module.exports = {
  async store(req, res) {
    const { email } = req.body;

    //O módulo yup cria uma verificação para saber se o email é válido
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required()
    });

    const isValid = await schema.isValid({
      email
    });

    if (!isValid) {
      return res
        .status(400)
        .json({ error: "Você deve informar um email válido!" });
    }

    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res
        .status(400)
        .json({ error: "O email informado não está cadastrado!" });
    }

    const now = new Date();
    now.setHours(now.getHours() + 1);

    const token = crypto.randomBytes(20).toString("hex");

    await User.update(
      {
        recoverPasswordToken: token,
        recoverPasswordTokenExpires: now
      },
      { where: { email: email } }
    );

    mail.sendRecoverEmail(email, token);

    return res
      .status(200)
      .json({ success: "O email de recuperação foi enviado!" });
  },
  async update(req, res) {
    const { token } = req.query;
    const { password } = req.body;

    const schema = Yup.object().shape({
      password: Yup.string()
        .required()
        .min(6)
    });

    const isValid = await schema.isValid({
      password
    });

    if (!isValid) {
      return res
        .status(400)
        .json({ error: "A senha deve conter no mínimo 6 dígitos" });
    }

    const now = new Date();

    const user = await User.findOne({ where: { recoverPasswordToken: token } });

    if (!user) {
      return res.status(400).json({ error: "Seu token é inválido!" });
    }

    if (user.recoverPasswordTokenExpires < now) {
      return res.status(400).json({ error: "Seu token expirou!" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.update({ passwordHash }, { where: { id: user.id } })
      .then(() => {
        return res
          .status(200)
          .json({ success: "Senha atualizada com sucesso!" });
      })
      .catch(err => {
        return res
          .status(400)
          .json({ error: "Houve um erro ao atualizar a sua senha." });
      });
  }
};
