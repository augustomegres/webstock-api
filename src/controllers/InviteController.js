const Company = require("../models/Company");
const CompanyInvite = require("../models/CompanyInvite");
const { Op } = require("sequelize");

module.exports = {
  async index(req, res) {
    const { user } = req;
    const { status } = req.query;

    const where = { guestId: user.id };

    if (status) {
      where.status = { [Op.eq]: status };
    }

    const invites = await CompanyInvite.findAll({
      where: where,
      include: [
        { association: "company" },
        {
          association: "user",
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

    return res.json(invites);
  },
  async store(req, res) {
    const { user } = req;
    const { inviteId } = req.params;
    const { accept } = req.body;

    /* -------------------------------------------------------------------------- */
    /*                              ACESSANDO CONVITE                             */
    /* -------------------------------------------------------------------------- */

    const invite = await CompanyInvite.findOne({
      where: {
        id: { [Op.eq]: inviteId },
        status: { [Op.eq]: "pending" },
        guestId: { [Op.eq]: user.id },
      },
    });

    if (!invite) {
      return res.status(400).json({ error: "O convite não existe." });
    }

    /* -------------------------------------------------------------------------- */
    /*                             PROCURANDO EMPRESA                             */
    /* -------------------------------------------------------------------------- */

    const company = await Company.findOne({
      where: { id: { [Op.eq]: invite.companyId }, enabled: true },
    });

    if (!company) {
      return res.status(400).json({
        error: "A empresa que você está tentando acessar não existe.",
      });
    }

    switch (accept) {
      /* -------------------------------------------------------------------------- */
      /*                                 CASO ACEITO                                */
      /* -------------------------------------------------------------------------- */

      case true:
        try {
          await CompanyInvite.update(
            { status: "accepted" },
            { where: { id: inviteId } }
          );

          await company.addMember(user);

          return res
            .status(200)
            .json({ success: "Convite aceito com sucesso!" });
        } catch (e) {
          await CompanyInvite.update(
            { status: "pending" },
            { where: { id: inviteId } }
          );

          return res.status(400).json({
            success: "Houve um erro ao aceitar este convite",
            info: e,
          });
        }

      /* -------------------------------------------------------------------------- */
      /*                                CASO RECUSADO                               */
      /* -------------------------------------------------------------------------- */

      case false:
        try {
          await CompanyInvite.update(
            { status: "rejected" },
            { where: { id: inviteId } }
          );
        } catch (e) {
          return res.status(400).json({
            success: "Houve um erro ao aceitar este convite",
            info: e,
          });
        }
    }
  },
};
