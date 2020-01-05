const User = require("../models/User");
const Account = require("../models/Account");
const Yup = require("yup");

module.exports = {
  async store(req, res) {
    const { userId } = req;

    const {
      name,
      value,
      accountType,
      accountBank,
      agencyNumber,
      accountNumber
    } = req.body;

    const schema = Yup.object().shape({
      name: Yup.string()
        .min(3)
        .max(64)
        .required(),
      value: Yup.number(),
      accountType: Yup.string()
        .min(3)
        .max(64)
        .required(),
      accountBank: Yup.string()
        .min(3)
        .max(64),
      accountNumber: Yup.string()
        .min(1)
        .max(64),
      agencyNumber: Yup.string()
        .min(1)
        .max(16)
    });

    const isValid = await schema.isValid({
      name,
      value,
      accountType,
      accountBank,
      accountNumber,
      agencyNumber
    });

    if (!isValid)
      return res
        .status(400)
        .json({ error: "Verifique os dados enviados e tente novamente!" });

    const user = await User.findOne({
      where: { id: userId },
      include: [{ association: "company" }]
    });

    try {
      const newAccount = await Account.create({
        name,
        value,
        accountType,
        accountBank,
        agencyNumber,
        accountNumber,
        companyId: user.company.id
      });
      return res.status(200).json(newAccount);
    } catch (e) {
      return res.status(400).json({
        error: "Não foi possível criar sua conta devido a um erro interno!"
      });
    }
  }
};
