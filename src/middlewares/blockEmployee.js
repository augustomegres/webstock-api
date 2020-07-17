require("dotenv").config();
module.exports = (req, res, next) => {
  const { user } = req;
  if (!user.type == "employee") {
    return res.status(400).json({
      error: "Você não tem autorização para realizar esta requisição!",
    });
  }

  return next();
};
