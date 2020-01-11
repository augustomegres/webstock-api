const User = require("../models/User");

module.exports = {
  async show(req, res) {
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

    user.passwordHash = undefined;

    return res.status(200).json(user);
  }
};
