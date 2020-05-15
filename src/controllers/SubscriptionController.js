const pagarme = require("pagarme");
const User = require("../models/User");

const { cpf: cpfEval } = require("essential-validation");

module.exports = {
  async index(req, res) {
    const { userId } = req;
    //Guardando o usuário logado
    const loggedUser = await User.findByPk(userId, {
      include: [{ association: "company" }],
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires",
        ],
      },
    });

    pagarme.client
      .connect({ api_key: process.env.PAGARME_KEY })
      .then((client) =>
        client.subscriptions.findTransactions({
          id: loggedUser.subscription_id,
        })
      )
      .then((transaction) => res.json(transaction));
  },
  async show(req, res) {
    const { userId } = req;

    //Guardando o usuário logado
    const loggedUser = await User.findByPk(userId, {
      include: [{ association: "company" }],
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires",
        ],
      },
    });

    pagarme.client
      .connect({ api_key: process.env.PAGARME_KEY })
      .then((client) =>
        client.subscriptions.find({ id: loggedUser.subscription_id })
      )
      .then((subscription) => res.json(subscription));
  },
  async store(req, res) {
    const { userId } = req;
    const {
      card_number,
      card_holder_name,
      card_expiration_date,
      card_cvv,
      payment_method,
      plan_id,

      name,
      cpf,
      date_of_birth,
    } = req.body;

    //Guardando o usuário logado
    const loggedUser = await User.findByPk(userId, {
      include: [{ association: "company" }],
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires",
        ],
      },
    });

    //Atualizando dados do cliente
    if (name ? name.length < 5 : false || cpf ? cpf.length < 14 : false) {
      return { error: "Houve um erro ao atualizar os dados do seu usuário!" };
    }

    if (cpf) {
      let validate = cpfEval.cpfWithPunctuation(cpf);
      if (validate.error) return res.status(400).json(validate.error);
    }

    try {
      await User.update(
        { name, cpf, date_of_birth },
        { where: { id: userId } }
      );
    } catch (e) {
      return { error: "Houve um erro ao atualizar os dados do seu usuário!" };
    }

    //Validando se o cliente tem uma assinatura ativa
    let subscription = await pagarme.client
      .connect({ api_key: process.env.PAGARME_KEY })
      .then((client) =>
        client.subscriptions.find({
          id: loggedUser.subscription_id.toString(),
        })
      )
      .then((subscription, reject) => {
        if (subscription.status != "canceled") {
          return { error: "Você já possui uma assinatura ativa!" };
        }
      });

    if (subscription) {
      if (subscription.error) {
        return res.status(400).json(subscription);
      }
    }

    //SEPARANDO DDD DO CELULAR
    let ddd;
    let number;

    if (loggedUser.phone) {
      ddd = loggedUser.phone.substring(0, 2);
      number = loggedUser.phone.substring(2);
    }

    let customer = {
      external_id: loggedUser.id,
      name: name,
      email: loggedUser.email,
      document_number: cpf,
      birthday: date_of_birth,
      phone: {
        ddd: ddd,
        number: number,
      },
    };

    if (loggedUser.customer_id) customer.id = Number(loggedUser.customer_id);

    pagarme.client
      .connect({ api_key: process.env.PAGARME_KEY })
      .then((client) =>
        client.subscriptions.create({
          plan_id: plan_id,
          card_number,
          card_holder_name,
          card_expiration_date,
          card_cvv,
          payment_method,

          customer: customer,
        })
      )
      .then(async (subscription) => {
        await User.update(
          {
            subscription_id: subscription.id,
            customer_id: subscription.customer.id, //2950363
          },
          { where: { id: loggedUser.id } }
        );

        return res.json(subscription);
      })
      .catch((error) => res.status(400).json(error));
  },
  async update(req, res) {
    const { userId } = req;
    const { plan_id } = req.body;

    //Guardando o usuário logado
    const loggedUser = await User.findByPk(userId, {
      include: [{ association: "company" }],
      attributes: {
        exclude: [
          "passwordHash",
          "passwordRecoverToken",
          "recoverPasswordTokenExpires",
        ],
      },
    });

    pagarme.client
      .connect({ api_key: process.env.PAGARME_KEY })
      .then((client) =>
        client.subscriptions.update({
          id: loggedUser.subscription_id,
          plan_id: plan_id,
        })
      )
      .then((subscription) => res.status(200).json(subscription))
      .catch((error) => res.status(400).json(error));
  },
};
