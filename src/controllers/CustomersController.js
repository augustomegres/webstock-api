const Customer = require("../models/Customer");
const { Op } = require("sequelize");

module.exports = {
  async show(req, res) {
    const { user } = req;
    const { id, companyId } = req.params;

    const customer = await Customer.findOne({
      where: { id: id, companyId: companyId },
    });

    return res.status(200).json(customer);
  },
  async index(req, res) {
    const { companyId } = req.params;
    let { paginate, page, pageSize, name, columnToSort, order } = req.query;

    if (!page) page = 1;
    page--;

    if (!pageSize) pageSize = 12;
    if (pageSize > 100) {
      return res
        .status(400)
        .json({ error: "O tamanho máximo da página é de 100 documentos." });
    }

    if (!paginate) {
      paginate = "true";
    }

    if (columnToSort && order) {
      order = [[columnToSort, order]];
    } else {
      order = null;
    }

    where = { companyId: companyId };
    if (name) where.name = { [Op.substring]: name };

    const offset = Number(page) * Number(pageSize);
    const limit = Number(pageSize);

    if (paginate == "true") {
      await Customer.findAndCountAll({
        limit,
        offset,
        where,
        include: { association: "company" },
        order,
      }).then((customers) => {
        let data = {};
        data.docs = customers.rows;

        data.total = customers.count;
        data.pages = Math.ceil(customers.count / limit);

        return res.status(200).json(data);
      });
    } else {
      await Customer.findAll({
        where,
        order,
        include: { association: "company" },
      }).then((customers) => {
        return res.status(200).json(customers);
      });
    }
  },
  async store(req, res) {
    const { user } = req;
    const {
      name,
      cpf,
      rg,
      email,
      phone,
      city,
      address,
      number,
      street,
    } = req.body;
    const { companyId } = req.params;

    if (!name) {
      return res.status(400).json({ error: "O nome deve ser informado!" });
    }

    try {
      await Customer.create({
        companyId: companyId,
        name,
        cpf,
        rg,
        email,
        phone,
        city,
        address,
        number,
        street,
      });

      return res
        .status(200)
        .json({ success: "Cliente cadastrado com sucesso!" });
    } catch (e) {
      return res
        .status(400)
        .json({ error: "Não foi possível inserir o registro" });
    }
  },
  async update(req, res) {
    const { user } = req;
    const { id, companyId } = req.params;
    let {
      name,
      cpf,
      rg,
      email,
      phone,
      city,
      address,
      number,
      street,
    } = req.body;

    await Customer.update(
      {
        name,
        cpf,
        rg,
        email,
        phone,
        city,
        address,
        number,
        street,
      },
      { where: { id, companyId: companyId } }
    )
      .then((response) => {
        if (response == 0) {
          return res
            .status(400)
            .json({ error: "O cliente informado não foi encontrado." });
        }

        return res
          .status(200)
          .json({ success: "Os dados do cliente foram atualizados." });
      })
      .catch((err) => {
        res.status(400).json({
          error: "Houve um erro inesperado ao atualizar os dados.",
          err,
        });
      });
  },
  async delete(req, res) {
    const { user } = req;
    const { id, companyId } = req.params;

    try {
      await Customer.destroy({
        where: { id: id, companyId: companyId },
      });

      return res.status(200).json({ sucess: "Cliente deletado com sucesso!" });
    } catch {
      return res
        .status(400)
        .json({ error: "Houveu um erro ao tentar deletar este cliente" });
    }
  },
};
