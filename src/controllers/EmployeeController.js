const Company = require("../models/Company");

module.exports = {
  async store(req, res) {
    const { userId } = req;

    let company = await Company.findOne({ where: { ownerId: userId } });

    await company.addEmployee();

    return res.status(200).json(company);
  },
};
