const Company = require("../models/Company");
const CompanyInvite = require("../models/CompanyInvite");
const User = require("../models/User");
const { Op } = require("sequelize");

module.exports = {
  async index(req, res) {},
  async store(req, res) {
    const { user } = req;
    const { email } = req.body;
    const { companyId } = req.params;

    /* -------------------------------------------------------------------------- */
    /*                        VERIFICANDO USUÁRIO CONVIDADO                       */
    /* -------------------------------------------------------------------------- */

    const guest = await User.findOne({
      where: { email: email },
      include: [
        { association: "companies", include: [{ association: "members" }] },
      ],
    });

    if (!guest) {
      return res.status(400).json({
        error:
          "O email que você tentou requisitar não é cadastrado em nossa plataforma.",
      });
    }

    /* -------------------------------------------------------------------------- */
    /*                             VERIFICANDO EMPRESA                            */
    /* -------------------------------------------------------------------------- */

    const company = await Company.findOne({
      where: { id: companyId },
      include: [{ association: "members" }],
    });

    if (!company) {
      return res.status(400).json({
        error:
          "A empresa que você está tentando cadastrar o usuário não existe.",
      });
    }

    if (user.id != company.ownerId) {
      return res.status(400).json({
        error: "Somente o proprietário da empresa pode convidar novos membros.",
      });
    }

    let error = false;
    company.members.map((member) => {
      if (member.id == guest.id) {
        error = true;
      }
    });

    if (error) {
      return res.status(400).json({
        error: "Este usuário já pertence a esta empresa.",
      });
    }

    /* -------------------------------------------------------------------------- */
    /*                             VERIFICANDO CONVITE                            */
    /* -------------------------------------------------------------------------- */

    let InviteExists = await CompanyInvite.findOne({
      where: {
        guestId: guest.id,
        companyId: companyId,
        status: { [Op.eq]: "pending" },
      },
    });
    if (InviteExists) {
      return res.status(400).json({
        error: "Este usuário já tem um convite pendente.",
      });
    }

    await CompanyInvite.create({
      guestId: guest.id,
      companyId: companyId,
    })
      .then((response) => {
        return res.status(200).json({
          success: "O usuário foi convidado com sucesso.",
        });
      })
      .catch((error) => {
        return res.status(400).json({
          success: "Houve um erro ao tentar convidar o usuário.",
        });
      });
  },
};
